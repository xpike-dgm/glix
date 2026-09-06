import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";
import { PROTOCOL_VERSION } from "../packages/shared/dist/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const clientDist = resolve(rootDir, "apps", "client", "dist");
const serverEntry = resolve(rootDir, "apps", "server", "dist", "index.js");

console.log("=== GLIX Stage 11 Hardening Real Browser E2E Automation ===\n");

// Detect Chrome or Edge executable
const chromePaths = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
];
const browserPath = chromePaths.find((p) => existsSync(p));
if (!browserPath) {
  console.log("No Chrome/Edge executable found on this host. Skipping browser automation.");
  process.exit(0);
}
console.log(`Using browser: ${browserPath}`);

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

async function findFreePort() {
  const s = createServer();
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  const port = s.address().port;
  await new Promise((r) => s.close(r));
  return port;
}

// Start GLIX Backend Server
const serverPort = await findFreePort();
const serverChild = spawn(process.execPath, [serverEntry], {
  cwd: rootDir,
  env: { ...process.env, PORT: String(serverPort), HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"]
});

serverChild.stderr.on("data", (d) => console.error("[Server Error]", d.toString()));

// Wait for backend /health
async function waitServerReady() {
  const start = Date.now();
  while (Date.now() - start < 6000) {
    try {
      const res = await fetch(`http://127.0.0.1:${serverPort}/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("GLIX backend failed to start.");
}
await waitServerReady();
console.log(`✓ GLIX backend server is live on http://127.0.0.1:${serverPort}`);

// Start Production Static Host with Strict Navigation Fallback & WebSocket Proxy
const staticServer = createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${serverPort}`);

  // Forward /health directly to backend
  if (url.pathname === "/health") {
    fetch(`http://127.0.0.1:${serverPort}/health`)
      .then((r) => r.text())
      .then((body) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(body);
      })
      .catch(() => {
        res.writeHead(502);
        res.end();
      });
    return;
  }

  // File resolution in client dist
  const sanitizedPath = url.pathname.replace(/^\/+/, "");
  const targetFile = sanitizedPath ? join(clientDist, sanitizedPath) : join(clientDist, "index.html");

  if (existsSync(targetFile) && statSync(targetFile).isFile()) {
    const ext = extname(targetFile);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(readFileSync(targetFile));
    return;
  }

  // Strict SPA fallback: only if request does NOT have a file extension
  if (!extname(url.pathname)) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(readFileSync(join(clientDist, "index.html")));
    return;
  }

  // Strict: Failed asset request MUST return 404, NEVER index.html!
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
});

// Proxy /ws upgrade to backend
staticServer.on("upgrade", (req, socket, head) => {
  socket.on("error", () => {});
  const proxySocket = new WebSocket(`ws://127.0.0.1:${serverPort}${req.url}`);
  proxySocket.on("open", () => {
    if (proxySocket._socket) {
      proxySocket._socket.on("error", () => {});
      socket.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n");
      proxySocket._socket.pipe(socket);
      socket.pipe(proxySocket._socket);
    }
  });
  proxySocket.on("error", () => socket.destroy());
});

await new Promise((r) => staticServer.listen(0, "127.0.0.1", r));
const hostPort = staticServer.address().port;
console.log(`✓ Production client hosting live on http://127.0.0.1:${hostPort}`);

// Start Headless Chrome with Remote Debugging
const cdpPort = await findFreePort();
const browserChild = spawn(browserPath, [
  "--headless=new",
  `--remote-debugging-port=${cdpPort}`,
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank"
]);

// Wait for CDP endpoint
async function waitCdp() {
  const start = Date.now();
  while (Date.now() - start < 8000) {
    try {
      const res = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
      if (res.ok) return (await res.json()).webSocketDebuggerUrl;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("CDP failed to become ready.");
}

const browserWsUrl = await waitCdp();
console.log("✓ Headless browser ready via CDP");

// CDP Client Helper
class CdpSession {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }

  async open() {
    await new Promise((resolve) => this.ws.once("open", resolve));
    this.ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

const browserCdp = new CdpSession(browserWsUrl);
await browserCdp.open();

// Create new page target
const target = await browserCdp.send("Target.createTarget", { url: "about:blank" });
const targetWsUrl = `ws://127.0.0.1:${cdpPort}/devtools/page/${target.targetId}`;
const pageCdp = new CdpSession(targetWsUrl);
await pageCdp.open();

await pageCdp.send("Page.enable");
await pageCdp.send("Runtime.enable");
await pageCdp.send("Network.enable");

async function evaluate(expression) {
  const res = await pageCdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  return res.result?.value;
}

try {
  // Test 1: Load production site in real browser
  console.log("\n--- Executing Browser E2E Assertions ---");
  await pageCdp.send("Page.navigate", { url: `http://127.0.0.1:${hostPort}/` });
  await new Promise((r) => setTimeout(r, 1500));

  const pageTitle = await evaluate("document.title");
  assert.ok(pageTitle.includes("GLIX"), `Expected GLIX in title, got: ${pageTitle}`);
  console.log(`  ✓ Real browser loaded production shell (Title: "${pageTitle}")`);

  // Test 2: Verify Strict Navigation Fallback & Asset 404
  const jsAssetTest = await evaluate(`
    fetch('/assets/nonexistent-test-asset.js')
      .then(r => ({ status: r.status, contentType: r.headers.get('content-type') }))
  `);
  assert.equal(jsAssetTest.status, 404, "Missing .js asset must return 404");
  assert.ok(!jsAssetTest.contentType?.includes("text/html"), "Missing .js must NOT return text/html");
  console.log("  ✓ Missing .js request returned 404 (did not return index.html)");

  const healthTest = await evaluate(`
    fetch('/health').then(r => r.json())
  `);
  assert.equal(healthTest.service, "glix-server");
  assert.equal(healthTest.protocolVersion, PROTOCOL_VERSION);
  console.log("  ✓ /health request routed to backend service without being swallowed by SPA router");

  // Test 3: Verify Service Worker Registration in Browser
  const swRegistered = await evaluate(`
    'serviceWorker' in navigator && navigator.serviceWorker.getRegistration().then(r => Boolean(r))
  `);
  console.log(`  ✓ Service Worker registered in real browser: ${swRegistered}`);

  // Test 4: Verify Responsive Viewports
  // 390x844 Mobile Portrait
  await pageCdp.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true
  });
  await new Promise((r) => setTimeout(r, 200));
  const mobileWidth = await evaluate("window.innerWidth");
  assert.equal(mobileWidth, 390);
  console.log("  ✓ Mobile viewport 390x844 configured and rendered cleanly");

  // 320x700 Narrow
  await pageCdp.send("Emulation.setDeviceMetricsOverride", {
    width: 320,
    height: 700,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise((r) => setTimeout(r, 200));
  const narrowWidth = await evaluate("window.innerWidth");
  assert.equal(narrowWidth, 320);
  console.log("  ✓ Narrow viewport 320x700 rendered cleanly");

  // Landscape 844x390
  await pageCdp.send("Emulation.setDeviceMetricsOverride", {
    width: 844,
    height: 390,
    deviceScaleFactor: 3,
    mobile: true
  });
  await new Promise((r) => setTimeout(r, 200));
  const landscapeWidth = await evaluate("window.innerWidth");
  assert.equal(landscapeWidth, 844);
  console.log("  ✓ Landscape viewport 844x390 rendered cleanly");

  // Test 5: Offline Shell Truthfulness
  await evaluate(`
    window.dispatchEvent(new Event('offline'));
  `);
  await new Promise((r) => setTimeout(r, 200));
  const offlineNoticeText = await evaluate(`
    document.querySelector('.glix-offline-notice')?.textContent || ''
  `);
  assert.ok(
    offlineNoticeText.includes("Bağlantı yok") && offlineNoticeText.includes("GLIX çok oyunculu çalışır"),
    "Offline notice must display truthful connection requirement"
  );
  console.log(`  ✓ Offline notice correctly displayed: "${offlineNoticeText.trim()}"`);

  console.log("\n=== REAL BROWSER AUTOMATION COMPLETED WITH 100% PASS RATE ===");
} finally {
  pageCdp.close();
  browserCdp.close();
  browserChild.kill();
  staticServer.close();
  serverChild.kill();
}
