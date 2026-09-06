import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, "../apps/client/dist");
const OUT_DIR = path.resolve(__dirname, "../docs/screenshots/stage11d");

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
  console.error("No compatible browser (Edge / Chrome) found for screenshot capture.");
  process.exit(1);
}
console.log(`Using browser: ${browserExe}`);

// Simple static HTTP server for apps/client/dist
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
  let filePath = path.join(DIST_DIR, urlPath === "/" ? "index.html" : urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, "index.html");
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

const PORT = 49876;

server.listen(PORT, "127.0.0.1", async () => {
  console.log(`Static preview server listening at http://127.0.0.1:${PORT}`);

  const captureTasks = [
    // Yazı Yaz
    { name: "yazi-yaz-write-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=yazi-yaz&subPhase=write`, width: 390, height: 844 },
    { name: "yazi-yaz-discussion-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=yazi-yaz&subPhase=discussion`, width: 390, height: 844 },
    { name: "yazi-yaz-guess-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=yazi-yaz&subPhase=guess`, width: 390, height: 844 },
    { name: "yazi-yaz-results-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=yazi-yaz&subPhase=results`, width: 390, height: 844 },
    { name: "yazi-yaz-write-320x700.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=yazi-yaz&subPhase=write`, width: 320, height: 700 },
    { name: "yazi-yaz-write-390x520.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=yazi-yaz&subPhase=write`, width: 390, height: 520 },
    { name: "yazi-yaz-landscape-844x390.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=yazi-yaz&subPhase=write`, width: 844, height: 390 },

    // Sözlük Blöfü
    { name: "sozluk-blofu-write-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=sozluk-blofu&subPhase=write`, width: 390, height: 844 },
    { name: "sozluk-blofu-choose-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=sozluk-blofu&subPhase=choose`, width: 390, height: 844 },
    { name: "sozluk-blofu-results-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=sozluk-blofu&subPhase=results`, width: 390, height: 844 },
    { name: "sozluk-blofu-choose-320x700.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=sozluk-blofu&subPhase=choose`, width: 320, height: 700 },
    { name: "sozluk-blofu-write-390x520.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=sozluk-blofu&subPhase=write`, width: 390, height: 520 },

    // Çağrışım Ağı
    { name: "cagrisim-agi-answer-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=cagrisim-agi&subPhase=answer`, width: 390, height: 844 },
    { name: "cagrisim-agi-results-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=cagrisim-agi&subPhase=results`, width: 390, height: 844 },
    { name: "cagrisim-agi-answer-320x700.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=cagrisim-agi&subPhase=answer`, width: 320, height: 700 },
    { name: "cagrisim-agi-answer-390x520.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=cagrisim-agi&subPhase=answer`, width: 390, height: 520 },

    // Rüşvet ve Darbe
    { name: "rusvet-darbe-election-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=rusvet-darbe&subPhase=election`, width: 390, height: 844 },
    { name: "rusvet-darbe-distribution-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=rusvet-darbe&subPhase=distribution`, width: 390, height: 844 },
    { name: "rusvet-darbe-results-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=rusvet-darbe&subPhase=results`, width: 390, height: 844 },
    { name: "rusvet-darbe-distribution-320x700.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=rusvet-darbe&subPhase=distribution`, width: 320, height: 700 },
    { name: "rusvet-darbe-distribution-390x520.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=rusvet-darbe&subPhase=distribution`, width: 390, height: 520 },

    // Karalama Defteri
    { name: "karalama-defteri-draw-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=karalama-defteri&subPhase=draw`, width: 390, height: 844 },
    { name: "karalama-defteri-vote-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=karalama-defteri&subPhase=vote`, width: 390, height: 844 },
    { name: "karalama-defteri-results-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=karalama-defteri&subPhase=results`, width: 390, height: 844 },
    { name: "karalama-defteri-draw-320x700.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=karalama-defteri&subPhase=draw`, width: 320, height: 700 },
    { name: "karalama-defteri-draw-390x520.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=karalama-defteri&subPhase=draw`, width: 390, height: 520 },
    { name: "karalama-defteri-landscape-844x390.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=karalama-defteri&subPhase=draw`, width: 844, height: 390 },

    // İttifak
    { name: "ittifak-bargain-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=ittifak&subPhase=bargain`, width: 390, height: 844 },
    { name: "ittifak-vote-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=ittifak&subPhase=vote`, width: 390, height: 844 },
    { name: "ittifak-results-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=ittifak&subPhase=results`, width: 390, height: 844 },
    { name: "ittifak-bargain-320x700.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=ittifak&subPhase=bargain`, width: 320, height: 700 },
    { name: "ittifak-vote-390x520.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=ittifak&subPhase=vote`, width: 390, height: 520 },

    // Special states: Spectator, 8-Player Density, Action Accepted, Action Pending, Action Rejected (Negative ACK)
    { name: "spectator-mode-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=karalama-defteri&subPhase=draw&spectator=1`, width: 390, height: 844 },
    { name: "density-8players-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=rusvet-darbe&subPhase=election&density=8`, width: 390, height: 844 },
    { name: "action-accepted-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=yazi-yaz&subPhase=write&state=accepted`, width: 390, height: 844 },
    { name: "action-pending-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=yazi-yaz&subPhase=write&state=pending`, width: 390, height: 844 },
    { name: "action-rejected-390x844.png", url: `http://127.0.0.1:${PORT}/dev-stage11d.html?game=yazi-yaz&subPhase=guess&state=rejected`, width: 390, height: 844 }
  ];

  let successCount = 0;
  for (const task of captureTasks) {
    const destPath = path.resolve(OUT_DIR, task.name);

    const taskTempDir = fs.mkdtempSync(path.join(os.tmpdir(), "glix-edge-"));
    const args = [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      `--user-data-dir=${taskTempDir}`,
      `--screenshot=${destPath}`,
      `--window-size=${task.width},${task.height}`,
      "--hide-scrollbars",
      task.url
    ];

    try {
      await new Promise((resolve, reject) => {
        execFile(browserExe, args, { timeout: 15_000 }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
        console.log(`[CAPTURED] ${task.name} (${task.width}x${task.height}) -> ${fs.statSync(destPath).size} bytes`);
        successCount++;
      } else {
        console.warn(`[WARN] Failed or empty capture: ${task.name}`);
      }
    } catch (err) {
      console.error(`[ERROR] Failed to capture ${task.name}:`, err.message);
    } finally {
      try {
        fs.rmSync(taskTempDir, { recursive: true, force: true });
      } catch {}
    }
  }

  console.log(`Completed: ${successCount} / ${captureTasks.length} screenshots saved to ${OUT_DIR}`);
  server.close(() => {
    process.exit(successCount === captureTasks.length ? 0 : 1);
  });
});
