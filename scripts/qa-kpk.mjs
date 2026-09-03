import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { WebSocket } from "ws";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const QA_OUTPUT_DIR = "C:\\Users\\Xpike\\Desktop\\glix-stage-11-5-qa";

if (!fs.existsSync(QA_OUTPUT_DIR)) {
  fs.mkdirSync(QA_OUTPUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CdpSession {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.consoleErrors = [];
    this.networkErrors = [];

    this.ws.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method === "Runtime.consoleAPICalled") {
        if (msg.params.type === "error") {
          this.consoleErrors.push(msg.params.args.map((a) => a.value || a.description).join(" "));
        }
      } else if (msg.method === "Network.responseReceived") {
        const { response } = msg.params;
        if (response.status >= 400) {
          this.networkErrors.push(`${response.status} ${response.url}`);
        }
      }
    });
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.once("open", resolve);
      this.ws.once("error", reject);
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }

  async setViewport(width, height, isLandscape = true) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: {
        angle: isLandscape ? 90 : 0,
        type: isLandscape ? "landscapePrimary" : "portraitPrimary"
      }
    });
    await this.send("Emulation.setVisibleSize", { width, height });
  }

  async captureScreenshot(filename) {
    const res = await this.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false
    });
    const buffer = Buffer.from(res.data, "base64");
    const filePath = path.join(QA_OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`[QA SCREENSHOT SAVED] ${filePath}`);
    return filePath;
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  console.log("=== GLIX Stage 11.5 KPK Real Browser QA Starting ===");

  // 1. Launch Server
  console.log("Starting server process...");
  const serverProc = spawn("node", ["apps/server/dist/index.js"], {
    env: { ...process.env, HOST: "127.0.0.1", PORT: "8787" },
    stdio: "inherit"
  });

  // 2. Launch Vite
  console.log("Starting Vite client...");
  const clientProc = spawn("npm", ["run", "dev", "--workspace", "@glix/client", "--", "--port", "5173", "--host", "127.0.0.1"], {
    env: { ...process.env, VITE_WS_URL: "ws://127.0.0.1:8787/ws" },
    shell: true,
    stdio: "pipe"
  });

  // 3. Launch Chrome Headless
  console.log("Launching Headless Chrome...");
  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--window-size=1280,800"
  ]);

  let guests = [];
  const cleanup = () => {
    console.log("Shutting down processes...");
    for (const g of guests) {
      try { g.close(); } catch {}
    }
    try { chromeProc.kill(); } catch {}
    try { clientProc.kill(); } catch {}
    try { serverProc.kill(); } catch {}
  };

  process.on("SIGINT", () => { cleanup(); process.exit(); });
  process.on("exit", cleanup);

  await sleep(4000);

  // Verify server health
  const healthRes = await fetch("http://127.0.0.1:8787/health");
  const health = await healthRes.json();
  console.log("Server Health:", health);

  // Create Chrome target
  const newTabRes = await fetch("http://127.0.0.1:9222/json/new?http://127.0.0.1:5173", { method: "PUT" });
  const tab = await newTabRes.json();
  console.log("Browser Target Tab ID:", tab.id);

  const cdp = new CdpSession(tab.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");

  await sleep(2500);

  // Click "ODA KUR"
  console.log("Clicking ODA KUR button on Home...");
  await cdp.evaluate(`
    (() => {
      const btn = document.querySelector('.glix-home-cta-primary');
      if (btn) btn.click();
    })()
  `);
  await sleep(1000);

  // Enter nickname & submit
  console.log("Entering host nickname and submitting...");
  await cdp.evaluate(`
    (() => {
      const input = document.querySelector('input');
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, 'ConsoleCmdr');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      setTimeout(() => {
        const btn = document.querySelector('.form-submit');
        if (btn) btn.click();
      }, 300);
    })()
  `);
  await sleep(2000);

  // Get Room Code
  const roomCode = await cdp.evaluate(`
    (() => {
      const el = document.querySelector('.room-code');
      return el ? el.textContent.trim() : null;
    })()
  `);
  console.log("Room Created:", roomCode);

  if (!roomCode) {
    const pageText = await cdp.evaluate(`document.body.innerText`);
    console.log("Page content when looking for room code:", pageText);
    throw new Error("Failed to get room code!");
  }

  // Connect 7 bot players to build 8-player lobby
  console.log("Connecting 7 bot players for 8-player roster...");
  const botNames = ["PulseCyan", "HeartPink", "BoltGold", "BarsLime", "WaveViolet", "HazardOrange", "GemEmerald"];
  for (let i = 0; i < 7; i++) {
    const ws = new WebSocket("ws://127.0.0.1:8787/ws");
    await new Promise((res) => ws.once("open", res));
    ws.send(JSON.stringify({ type: "client:hello", clientVersion: "0.7.0" }));
    await sleep(60);
    ws.send(JSON.stringify({ type: "client:room:join", roomCode, nickname: botNames[i] }));
    guests.push(ws);
    await sleep(60);
  }
  await sleep(1200);

  // Configure single game: KPK via window.__glixSend
  console.log("Configuring game roster: Kontrol Paneli Kaosu via socket...");
  await cdp.evaluate(`
    (() => {
      if (window.__glixSend) {
        window.__glixSend({
          type: "client:room:update-games",
          selectionMode: "manual",
          selectedGameIds: ["kontrol-paneli-kaosu"],
          randomGameCount: 1
        });
      }
    })()
  `);
  await sleep(1000);

  // Start the match
  console.log("Starting match from host...");
  await cdp.evaluate(`
    (() => {
      if (window.__glixSend) {
        window.__glixSend({
          type: "client:room:start"
        });
      }
    })()
  `);
  await sleep(2500);

  // Wait for tutorial -> preparing -> playing
  console.log("Waiting for game to enter playing phase...");
  for (let attempt = 0; attempt < 35; attempt++) {
    const currentPhase = await cdp.evaluate(`
      (() => {
        const vp = document.querySelector('.glix-game-viewport');
        if (!vp) return 'unknown';
        if (vp.className.includes('glix-phase-playing')) return 'playing';
        if (vp.className.includes('glix-phase-preparing')) return 'preparing';
        if (vp.className.includes('glix-phase-tutorial')) return 'tutorial';
        return 'other';
      })()
    `);
    console.log(`Phase [${attempt}]:`, currentPhase);

    if (currentPhase === "preparing") {
      // Click ready button on host
      await cdp.evaluate(`
        (() => {
          const btn = document.querySelector('.kpk-ready-button, .glix-ready-button');
          if (btn) btn.click();
        })()
      `);
      // Bots send ready
      for (const g of guests) {
        g.send(JSON.stringify({ type: "client:match:ready" }));
      }
    }

    if (currentPhase === "playing") {
      console.log("PLAYING PHASE REACHED!");
      break;
    }
    await sleep(1000);
  }

  await sleep(2000);

  // --- SCREENSHOT 1: KPK Playing — 844×390 ---
  console.log("Capturing 1: KPK playing (844x390 landscape)...");
  await cdp.setViewport(844, 390, true);
  await sleep(1000);
  const path1 = await cdp.captureScreenshot("kpk-playing-844x390.png");

  // --- SCREENSHOT 2: KPK Playing — 667×375 ---
  console.log("Capturing 2: KPK playing (667x375 landscape)...");
  await cdp.setViewport(667, 375, true);
  await sleep(1000);
  const path2 = await cdp.captureScreenshot("kpk-playing-667x375.png");

  // --- SCREENSHOT 3: KPK Portrait Rotate Gate — 390×844 ---
  console.log("Capturing 3: KPK portrait rotate gate (390x844 portrait)...");
  await cdp.setViewport(390, 844, false);
  await sleep(1000);
  const path3 = await cdp.captureScreenshot("kpk-portrait-rotate-390x844.png");

  // Switch back to 844x390 landscape
  await cdp.setViewport(844, 390, true);
  await sleep(800);

  // --- SCREENSHOT 6: KPK with 8 Player HUD/pips — 844×390 ---
  console.log("Capturing 6: KPK with 8 player HUD/pips (844x390)...");
  const path6 = await cdp.captureScreenshot("kpk-8players-844x390.png");

  // Perform interactive cut on cable 2 (YEŞİL)
  console.log("Performing cable cut on console (Wire 2)...");
  await cdp.evaluate(`
    (() => {
      const wires = Array.from(document.querySelectorAll('.kpk-wire-button'));
      if (wires.length >= 2) {
        wires[1].click();
      }
    })()
  `);
  await sleep(800);

  // Also have bot players cut cables so round resolves cleanly
  console.log("Bot players submitting cable cuts...");
  const sampleColors = ["mavi", "yeşil", "kırmızı", "sarı"];
  for (let i = 0; i < guests.length; i++) {
    guests[i].send(JSON.stringify({
      type: "client:match:action",
      action: { kind: "panel-cut", color: sampleColors[i % 4] }
    }));
  }

  // Wait for results phase
  console.log("Waiting for results phase...");
  for (let attempt = 0; attempt < 50; attempt++) {
    const isResult = await cdp.evaluate(`
      (() => {
        const vp = document.querySelector('.glix-game-viewport');
        return vp?.className.includes('glix-phase-results') || Boolean(document.querySelector('.glix-result-overlay'));
      })()
    `);
    if (isResult) {
      console.log("Results phase active!");
      break;
    }
    await sleep(1000);
  }

  await sleep(1500);

  // --- SCREENSHOT 4: KPK Result — 844×390 ---
  console.log("Capturing 4: KPK result (844x390)...");
  const path4 = await cdp.captureScreenshot("kpk-result-844x390.png");

  // --- SCREENSHOT 5: KPK Spectator View — 844×390 ---
  console.log("Opening spectator tab for 844x390...");
  const specTabRes = await fetch("http://127.0.0.1:9222/json/new?http://127.0.0.1:5173", { method: "PUT" });
  const specTab = await specTabRes.json();
  const specCdp = new CdpSession(specTab.webSocketDebuggerUrl);
  await specCdp.open();
  await specCdp.send("Page.enable");
  await specCdp.send("Runtime.enable");
  await specCdp.setViewport(844, 390, true);
  await sleep(2000);

  // Join match as spectator
  console.log("Joining room as spectator in tab 2...");
  await specCdp.evaluate(`
    (() => {
      const btn = document.querySelector('.glix-home-cta-secondary');
      if (btn) btn.click();
    })()
  `);
  await sleep(1000);

  await specCdp.evaluate(`
    ((code) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      const codeInput = document.querySelector('.room-code-input');
      if (codeInput) {
        setter.call(codeInput, code);
        codeInput.dispatchEvent(new Event('input', { bubbles: true }));
        codeInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputs = Array.from(document.querySelectorAll('input'));
      const nickInput = inputs.find(i => !i.className.includes('room-code-input'));
      if (nickInput) {
        setter.call(nickInput, 'SpectatorBob');
        nickInput.dispatchEvent(new Event('input', { bubbles: true }));
        nickInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      setTimeout(() => {
        const btn = document.querySelector('.form-submit');
        if (btn) btn.click();
      }, 300);
    })('${roomCode}')
  `);
  await sleep(3000);

  console.log("Capturing 5: KPK spectator view (844x390)...");
  const path5 = await specCdp.captureScreenshot("kpk-spectator-844x390.png");
  specCdp.close();

  // Check scroll metrics at 844x390
  const metrics = await cdp.evaluate(`
    (() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        hasVerticalScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight
      };
    })()
  `);
  console.log("Viewport Scroll Metrics:", metrics);

  console.log("Console Errors recorded:", cdp.consoleErrors);
  console.log("Network Errors (4xx/5xx):", cdp.networkErrors);

  cdp.close();
  cleanup();

  console.log("\n=======================================================");
  console.log("QA SCREENSHOTS GENERATED SUCCESSFULLY:");
  console.log("1. KPK playing — 844×390:", path1);
  console.log("2. KPK playing — 667×375:", path2);
  console.log("3. KPK portrait rotate gate — 390×844:", path3);
  console.log("4. KPK result — 844×390:", path4);
  console.log("5. KPK spectator — 844×390:", path5);
  console.log("6. KPK 8 players — 844×390:", path6);
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("QA script error:", err);
  process.exit(1);
});
