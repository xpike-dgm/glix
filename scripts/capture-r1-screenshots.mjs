import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_DIR = path.resolve(__dirname, "../apps/client");
const DIST_DIR = path.resolve(__dirname, "../apps/client/dist-qa");
const OUT_DIR = path.resolve(__dirname, "../docs/screenshots/r1-mobile");

console.log("Building isolated QA preview bundle (vite.config.qa.ts)...");
execSync("npx vite build --config vite.config.qa.ts", { cwd: CLIENT_DIR, stdio: "inherit" });

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Browser executable
const BROWSER_PATHS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
];

const browserExe = BROWSER_PATHS.find((p) => fs.existsSync(p));
if (!browserExe) {
  console.error("No compatible browser found.");
  process.exit(1);
}
console.log(`Using browser: ${browserExe}`);

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json"
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];
  let filePath = path.join(DIST_DIR, urlPath === "/" ? "dev-r1.html" : urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, "dev-r1.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  } catch (err) {
    res.writeHead(500);
    res.end(String(err));
  }
});

const PORT = 49879;

server.listen(PORT, "127.0.0.1", async () => {
  console.log(`Preview server listening at http://127.0.0.1:${PORT}`);

  const captureTasks = [
    // HomeScreen across standard mobile viewports
    { name: "home-360x800.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=home`, width: 360, height: 800 },
    { name: "home-390x844.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=home`, width: 390, height: 844 },
    { name: "home-412x915.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=home`, width: 412, height: 915 },

    // RoomEntryScreen (Oda Kur & Odaya Katıl)
    { name: "room-create-390x844.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=entry-create`, width: 390, height: 844 },
    { name: "room-join-390x844.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=entry-join`, width: 390, height: 844 },

    // LobbyScreen (2 players, 8 players, accordion open)
    { name: "lobby-2players-390x844.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=lobby&density=normal`, width: 390, height: 844 },
    { name: "lobby-8players-390x844.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=lobby&density=8players`, width: 390, height: 844 },
    { name: "lobby-accordion-open-390x844.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=lobby&accordion=open`, width: 390, height: 844 },

    // BriefingScreen
    { name: "briefing-390x844.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=briefing`, width: 390, height: 844 },

    // ResultOverlay
    { name: "result-390x844.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=result`, width: 390, height: 844 },

    // Landscape view
    { name: "landscape-briefing-844x390.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=briefing`, width: 844, height: 390 },
    { name: "landscape-home-844x390.png", url: `http://127.0.0.1:${PORT}/dev-r1.html?view=home`, width: 844, height: 390 }
  ];

  let success = 0;
  for (const task of captureTasks) {
    const outPath = path.join(OUT_DIR, task.name);
    const taskTempDir = fs.mkdtempSync(path.join(os.tmpdir(), "glix-r1-"));
    const args = [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      `--user-data-dir=${taskTempDir}`,
      `--screenshot=${outPath}`,
      `--window-size=${task.width},${task.height}`,
      "--hide-scrollbars",
      task.url
    ];

    try {
      await new Promise((resolve) => {
        execFile(browserExe, args, { timeout: 15000 }, () => {
          resolve();
        });
      });

      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
        console.log(`✓ Captured ${task.name} (${task.width}x${task.height}) -> ${fs.statSync(outPath).size} bytes`);
        success++;
      } else {
        console.warn(`✗ Empty or failed file for ${task.name}`);
      }
    } catch (e) {
      console.error(`✗ Failed ${task.name}: ${e.message}`);
    } finally {
      try {
        fs.rmSync(taskTempDir, { recursive: true, force: true });
      } catch {}
    }
  }

  console.log(`\nScreenshot summary: ${success}/${captureTasks.length} captured.`);
  server.close(() => {
    process.exit(success === captureTasks.length ? 0 : 1);
  });
});
