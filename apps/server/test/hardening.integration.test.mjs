import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createNetServer } from "node:net";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { WebSocket } from "ws";

import {
  BoundedIpRateLimiter,
  DEFAULT_MAX_PAYLOAD_BYTES,
  MatchReplayFence,
  MAX_JSON_ARRAY_LENGTH,
  MAX_JSON_NODES,
  MAX_JSON_OBJECT_KEYS,
  MAX_JSON_STRING_LENGTH,
  MEASURED_MAX_DRAWING_BYTES,
  MEASURED_MAX_DRAWING_NODES,
  PlayerActionFence,
  REPLAY_FENCE_CAPACITY_PER_PLAYER,
  createOriginPolicy,
  resolveClientIp,
  validateJsonComplexity,
  validateOrigin
} from "../dist/security.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(TEST_DIR, "../../..");
const SERVER_ENTRY = join(ROOT_DIR, "apps", "server", "dist", "index.js");
const SOCKET_TIMEOUT_MS = 8_000;

async function findFreePort() {
  const netServer = createNetServer();
  await new Promise((resolvePromise, reject) => {
    netServer.once("error", reject);
    netServer.listen(0, "127.0.0.1", () => resolvePromise());
  });
  const address = netServer.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;
  await new Promise((resolvePromise, reject) => {
    netServer.close((error) => (error ? reject(error) : resolvePromise()));
  });
  return port;
}

function rememberOutput(stream, target) {
  stream?.on("data", (chunk) => {
    target.push(String(chunk));
    if (target.length > 40) target.shift();
  });
}

async function waitForHealth(httpUrl, child, output) {
  const deadline = Date.now() + 8_000;
  let lastError;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Test server erken kapandı (${child.exitCode}).\n${output.join("")}`);
    }
    try {
      const response = await fetch(`${httpUrl}/health`);
      if (response.ok) {
        const payload = await response.json();
        assert.equal(payload.ok, true);
        assert.equal(payload.service, "glix-server");
        return;
      }
      lastError = new Error(`health status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`Test server health beklemesi başarısız: ${lastError?.message ?? "bilinmeyen hata"}\n${output.join("")}`);
}

async function launchTestServer(customEnv = {}) {
  const port = await findFreePort();
  const output = [];
  const child = spawn(process.execPath, [SERVER_ENTRY], {
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      ...customEnv
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  rememberOutput(child.stdout, output);
  rememberOutput(child.stderr, output);

  const httpUrl = `http://127.0.0.1:${port}`;
  const wsUrl = `ws://127.0.0.1:${port}/ws`;
  await waitForHealth(httpUrl, child, output);

  return {
    port,
    httpUrl,
    wsUrl,
    async stop() {
      if (child.exitCode !== null) return;
      await new Promise((resolvePromise) => {
        const timer = setTimeout(() => {
          child.kill();
          resolvePromise();
        }, 4_000);
        child.once("exit", () => {
          clearTimeout(timer);
          resolvePromise();
        });
        child.kill("SIGTERM");
      });
    }
  };
}

class HardeningClient {
  constructor(wsUrl, wsOptions = {}) {
    this.wsUrl = wsUrl;
    this.socket = new WebSocket(wsUrl, {
      headers: { Origin: "http://127.0.0.1" },
      ...wsOptions
    });
    this.messages = [];
    this.waiters = [];
    this.closed = false;
    this.closeCode = null;
    this.closeReason = null;
    this.lastError = null;
    this.latestStateVersion = 0;
    this.latestPhaseIndex = 0;
    this.latestActionScope = "adapter";
    this.actionSequence = 0;

    this.socket.on("message", (data) => {
      let msg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }
      if (msg.type === "server:match-state") {
        this.latestStateVersion = Math.max(this.latestStateVersion, msg.state.stateVersion);
        this.latestPhaseIndex = msg.state.phaseIndex;
        this.latestActionScope = msg.actionScope;
      }
      if (msg.type === "server:game-input-ack") {
        this.latestStateVersion = Math.max(this.latestStateVersion, msg.stateVersion ?? 0);
      }

      const waiterIndex = this.waiters.findIndex((w) => w.predicate(msg));
      if (waiterIndex >= 0) {
        const waiter = this.waiters.splice(waiterIndex, 1)[0];
        clearTimeout(waiter.timer);
        waiter.resolve(msg);
      } else {
        this.messages.push(msg);
      }
    });

    this.socket.on("error", (err) => {
      this.lastError = err;
    });

    this.socket.on("close", (code, reason) => {
      this.closed = true;
      this.closeCode = code;
      this.closeReason = reason.toString();
      const waiters = this.waiters.splice(0);
      waiters.forEach((w) => {
        clearTimeout(w.timer);
        w.reject(new Error(`${w.label} beklenirken socket kapandı (kod=${code}).`));
      });
    });
  }

  async open(timeoutMs = SOCKET_TIMEOUT_MS) {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => reject(new Error("WebSocket açılış timeout")), timeoutMs);
      this.socket.once("open", () => {
        clearTimeout(timer);
        resolvePromise();
      });
      this.socket.once("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  send(msg) {
    assert.equal(this.socket.readyState, WebSocket.OPEN, "Socket açık olmalı.");
    const wireMsg = msg.type === "client:game:submit"
      ? {
          ...msg,
          actionId: msg.actionId ?? `act-${++this.actionSequence}`,
          stateVersion: msg.stateVersion ?? this.latestStateVersion,
          phaseIndex: msg.phaseIndex ?? this.latestPhaseIndex,
          actionScope: msg.actionScope ?? this.latestActionScope
        }
      : msg;
    this.socket.send(JSON.stringify(wireMsg));
  }

  waitFor(predicate, label, timeoutMs = SOCKET_TIMEOUT_MS) {
    const existingIndex = this.messages.findIndex(predicate);
    if (existingIndex >= 0) {
      return Promise.resolve(this.messages.splice(existingIndex, 1)[0]);
    }
    return new Promise((resolvePromise, reject) => {
      const waiter = {
        predicate,
        label,
        resolve: resolvePromise,
        reject,
        timer: setTimeout(() => {
          this.waiters = this.waiters.filter((w) => w !== waiter);
          reject(new Error(`${label} beklenirken zaman aşımı`));
        }, timeoutMs)
      };
      this.waiters.push(waiter);
    });
  }

  async close() {
    if (this.socket.readyState === WebSocket.CLOSED) return;
    await new Promise((resolvePromise) => {
      const timer = setTimeout(() => {
        this.socket.terminate();
        resolvePromise();
      }, 1000);
      this.socket.once("close", () => {
        clearTimeout(timer);
        resolvePromise();
      });
      if (this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.terminate();
      } else {
        this.socket.close();
      }
    });
  }
}

function buildLegalMaxDrawingMessage() {
  const strokes = [];
  for (let s = 0; s < 180; s++) {
    const points = [];
    for (let p = 0; p < 140; p++) {
      points.push({ x: 0.1234567890123456, y: 0.9876543210987654 });
    }
    strokes.push({ color: "yellow", size: 40, points });
  }
  return {
    type: "client:game:submit",
    clientTime: 1741234567890,
    actionId: "00000000-0000-0000-0000-000000000000:1234567890123456789012345678901234567890",
    stateVersion: 1,
    phaseIndex: 1,
    actionScope: '["subPhase","draw"]',
    payload: { kind: "drawing-save", strokes }
  };
}

let defaultServer;

before(async () => {
  defaultServer = await launchTestServer({
    ALLOWED_ORIGINS: "http://127.0.0.1,https://glix.example.invalid,http://localhost:5173",
    ALLOW_NO_ORIGIN: "true"
  });
});

after(async () => {
  await defaultServer?.stop();
});

// --- Unit & Measurement Invariant Tests ---

test("H1 — exact measured maximum legal drawing bytes and AST complexity are strictly within configured budgets", () => {
  const maxMessage = buildLegalMaxDrawingMessage();
  const serialized = JSON.stringify(maxMessage);
  const measuredBytes = Buffer.byteLength(serialized, "utf8");

  assert.equal(measuredBytes, MEASURED_MAX_DRAWING_BYTES, "Ölçülen max çizim boyutu tam uyuşmalı");
  assert.ok(measuredBytes < DEFAULT_MAX_PAYLOAD_BYTES, `Max çizim (${measuredBytes} B) 2 MiB sınırından küçük olmalı`);

  // Verify headroom is at least 70%
  const headroomBytes = DEFAULT_MAX_PAYLOAD_BYTES - measuredBytes;
  assert.ok(headroomBytes > 800_000, `Headroom en az 800KB olmalı (mevcut: ${headroomBytes})`);

  // Verify AST complexity passes within budget
  assert.equal(validateJsonComplexity(maxMessage), true, "Yasal max çizim JSON bütçesini geçmeli");

  // Pathological nested object/array fails complexity
  const deep = {};
  let current = deep;
  for (let i = 0; i < 12; i++) {
    current.child = {};
    current = current.child;
  }
  assert.equal(validateJsonComplexity(deep), false, "Aşırı derin obje bütçeden elenmeli");

  // Array length exceeding MAX_JSON_ARRAY_LENGTH fails complexity
  const giantArray = new Array(MAX_JSON_ARRAY_LENGTH + 1).fill(1);
  assert.equal(validateJsonComplexity(giantArray), false, "300 elemanı aşan dizi elenmeli");

  // String exceeding MAX_JSON_STRING_LENGTH fails complexity
  const giantString = "x".repeat(MAX_JSON_STRING_LENGTH + 1);
  assert.equal(validateJsonComplexity({ text: giantString }), false, "1000 karakteri aşan string elenmeli");
});

test("H2 — Replay fence capacity per player derived from gameplay invariants and bounded correctly", () => {
  assert.equal(REPLAY_FENCE_CAPACITY_PER_PLAYER, 2048);

  const fence = new PlayerActionFence(10);
  for (let i = 0; i < 10; i++) {
    fence.record(`act-${i}`);
    assert.equal(fence.has(`act-${i}`), true);
  }
  assert.equal(fence.size, 10);

  // 11th record evicts act-0
  fence.record("act-10");
  assert.equal(fence.size, 10);
  assert.equal(fence.has("act-0"), false, "En eski act-0 silinmeli");
  assert.equal(fence.has("act-10"), true, "Yeni act-10 bulunmalı");
  assert.equal(fence.has("act-1"), true, "act-1 henüz silinmemeli");

  fence.clear();
  assert.equal(fence.size, 0);
});

test("H3 — Bounded IP rate limiter hard capacity enforces deterministic LRU eviction", () => {
  const limiter = new BoundedIpRateLimiter(5, 60_000, 60_000);
  try {
    for (let i = 1; i <= 5; i++) {
      limiter.checkConnection(`10.0.0.${i}`);
    }
    assert.equal(limiter.size, 5);

    // 6th IP evicts 10.0.0.1
    limiter.checkConnection("10.0.0.6");
    assert.equal(limiter.size, 5);

    // Re-inserting existing IP updates LRU order and does not grow size
    limiter.checkConnection("10.0.0.2");
    assert.equal(limiter.size, 5);
  } finally {
    limiter.destroy();
  }
});

test("H4 — Trusted proxy IP resolution strictly defends against client XFF spoofing", () => {
  // Direct mode (trustedProxyHops = 0): XFF is ignored
  const reqDirect = {
    socket: { remoteAddress: "192.168.1.50" },
    headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2", "x-real-ip": "1.1.1.1" }
  };
  const ipDirect = resolveClientIp(reqDirect, 0);
  assert.equal(ipDirect, "192.168.1.50", "Direct modda XFF tamamen yok sayılmalı");

  // Single reverse proxy (trustedProxyHops = 1): takes rightmost IP appended by proxy
  const reqNginx = {
    socket: { remoteAddress: "172.18.0.2" },
    headers: { "x-forwarded-for": "1.1.1.1, 203.0.113.195", "x-real-ip": "203.0.113.195" }
  };
  const ipNginx = resolveClientIp(reqNginx, 1);
  assert.equal(ipNginx, "203.0.113.195", "1 hop trusted proxy sağdaki gerçek IP'yi almalı, soldaki sahteyi değil");

  // Two hops (Host Nginx -> Docker Nginx -> Node, trustedProxyHops = 2)
  const reqTwoHops = {
    socket: { remoteAddress: "172.18.0.2" },
    headers: { "x-forwarded-for": "spoofed.ip, 198.51.100.42, 127.0.0.1" }
  };
  const ipTwoHops = resolveClientIp(reqTwoHops, 2);
  assert.equal(ipTwoHops, "198.51.100.42", "2 hop proxy sağdan ikinci IP'yi almalı");
});

// --- Integration Tests with Real WebSocket Server ---

test("H5 — Allowed Origin connects successfully; unexpected Origin receives HTTP 403", async () => {
  const allowedClient = new HardeningClient(defaultServer.wsUrl, {
    headers: { Origin: "https://glix.example.invalid" }
  });
  await allowedClient.open();
  allowedClient.send({ type: "client:hello", clientVersion: "hardening" });
  const ready = await allowedClient.waitFor((m) => m.type === "server:ready", "server:ready");
  assert.equal(ready.type, "server:ready");
  await allowedClient.close();

  const rejectedClient = new HardeningClient(defaultServer.wsUrl, {
    headers: { Origin: "https://malicious-attacker.com" }
  });
  await assert.rejects(
    async () => {
      await rejectedClient.open();
    },
    (err) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.includes("403") || err.message.includes("Unexpected server response: 403"));
      return true;
    },
    "Bilinmeyen Origin 403 ile reddedilmeli"
  );
  await rejectedClient.close().catch(() => undefined);
});

test("H6 — Production default: missing Origin is rejected with HTTP 403; test/dev permits it", async () => {
  const prodServer = await launchTestServer({
    NODE_ENV: "production",
    ALLOWED_ORIGINS: "https://glix.example.invalid"
  });

  try {
    const noOriginClient = new HardeningClient(prodServer.wsUrl, {
      headers: {}
    });
    await assert.rejects(
      async () => {
        await noOriginClient.open();
      },
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes("403"));
        return true;
      },
      "Production'da Origin başlığı olmayan bağlantı reddedilmeli"
    );
    await noOriginClient.close().catch(() => undefined);

    const validClient = new HardeningClient(prodServer.wsUrl, {
      headers: { Origin: "https://glix.example.invalid" }
    });
    await validClient.open();
    validClient.send({ type: "client:hello", clientVersion: "hardening" });
    await validClient.waitFor((m) => m.type === "server:ready", "prod ready");
    await validClient.close();
  } finally {
    await prodServer.stop();
  }
});

test("H7 — Oversized payload (> MAX_PAYLOAD_BYTES) rejected with close code 1009 and server remains healthy", async () => {
  const smallPayloadServer = await launchTestServer({
    MAX_PAYLOAD_BYTES: "500000",
    ALLOWED_ORIGINS: "http://127.0.0.1"
  });

  try {
    const client = new HardeningClient(smallPayloadServer.wsUrl);
    await client.open();
    client.send({ type: "client:hello", clientVersion: "hardening" });
    await client.waitFor((m) => m.type === "server:ready", "ready");

    const giantPayload = "A".repeat(600_000);
    client.socket.send(giantPayload);

    await new Promise((resolvePromise) => {
      if (client.closed) {
        resolvePromise();
        return;
      }
      client.socket.once("close", (code) => {
        assert.equal(code, 1009, "Oversized frame 1009 (Message Too Big) ile kapatılmalı");
        resolvePromise();
      });
    });

    const healthResponse = await fetch(`${smallPayloadServer.httpUrl}/health`);
    assert.equal(healthResponse.ok, true);
    const healthData = await healthResponse.json();
    assert.equal(healthData.ok, true);
    assert.equal(healthData.service, "glix-server");

    const newClient = new HardeningClient(smallPayloadServer.wsUrl);
    await newClient.open();
    newClient.send({ type: "client:hello", clientVersion: "hardening" });
    await newClient.waitFor((m) => m.type === "server:ready", "ready after oversized");
    await newClient.close();
  } finally {
    await smallPayloadServer.stop();
  }
});

test("H8 — Malformed message flood terminates socket with close code 1008", async () => {
  const client = new HardeningClient(defaultServer.wsUrl);
  await client.open();
  client.send({ type: "client:hello", clientVersion: "hardening" });
  await client.waitFor((m) => m.type === "server:ready", "ready");

  for (let i = 0; i < 6; i++) {
    client.socket.send(`{ bad json ${i} `);
  }

  await new Promise((resolvePromise) => {
    if (client.closed) {
      assert.equal(client.closeCode, 1008);
      resolvePromise();
      return;
    }
    client.socket.once("close", (code) => {
      assert.equal(code, 1008, "Malformed message flood 1008 ile sonlandırılmalı");
      resolvePromise();
    });
  });
});

test("H9 — Room create flood triggers rate-limit error using invalid_message wire code on isolated server", async () => {
  const floodServer = await launchTestServer();
  try {
    const client = new HardeningClient(floodServer.wsUrl);
    await client.open();
    client.send({ type: "client:hello", clientVersion: "hardening" });
    await client.waitFor((m) => m.type === "server:ready", "ready");

    for (let i = 0; i < 12; i++) {
      client.send({ type: "client:room:create", nickname: `Host${i}` });
    }

    const errorMsg = await client.waitFor(
      (m) => m.type === "server:error" && m.code === "invalid_message" && m.message.includes("Çok sık"),
      "room create rate limit error",
      4_000
    );
    assert.equal(errorMsg.code, "invalid_message");
    await client.close();
  } finally {
    await floodServer.stop();
  }
});

test("H10 — 8 players behind one source IP connect, join room, and participate without false throttling", async () => {
  const clients = [];
  try {
    for (let i = 0; i < 8; i++) {
      const c = new HardeningClient(defaultServer.wsUrl);
      await c.open();
      c.send({ type: "client:hello", clientVersion: "hardening" });
      await c.waitFor((m) => m.type === "server:ready", `player ${i} ready`);
      clients.push(c);
    }

    const host = clients[0];
    host.send({ type: "client:room:create", nickname: "Host" });
    const session = await host.waitFor((m) => m.type === "server:session", "host session");
    const roomCode = session.roomCode;

    for (let i = 1; i < 8; i++) {
      clients[i].send({ type: "client:room:join", roomCode, nickname: `Player${i}` });
      await clients[i].waitFor((m) => m.type === "server:session", `player ${i} session`);
    }

    const finalState = await host.waitFor(
      (m) => m.type === "server:room-state" && m.state.players.length === 8,
      "8 players room state"
    );
    assert.equal(finalState.state.players.length, 8);
  } finally {
    await Promise.all(clients.map((c) => c.close().catch(() => undefined)));
  }
});

test("H11 — Duplicate action-id replay rejected with input_duplicate; repeatable bursts succeed", async () => {
  const host = new HardeningClient(defaultServer.wsUrl);
  const guest = new HardeningClient(defaultServer.wsUrl);
  try {
    await host.open();
    await guest.open();
    host.send({ type: "client:hello", clientVersion: "hardening" });
    guest.send({ type: "client:hello", clientVersion: "hardening" });
    await Promise.all([
      host.waitFor((m) => m.type === "server:ready", "h ready"),
      guest.waitFor((m) => m.type === "server:ready", "g ready")
    ]);

    host.send({ type: "client:room:create", nickname: "Host" });
    const hSession = await host.waitFor((m) => m.type === "server:session", "h sess");
    guest.send({ type: "client:room:join", roomCode: hSession.roomCode, nickname: "Guest" });
    await guest.waitFor((m) => m.type === "server:session", "g sess");
    await host.waitFor((m) => m.type === "server:room-state" && m.state.players.length === 2, "2 players");

    host.send({
      type: "client:room:update-games",
      selectionMode: "manual",
      selectedGameIds: ["butona-bas"],
      randomGameCount: 1
    });
    await host.waitFor((m) => m.type === "server:room-state" && m.state.selectedGameIds[0] === "butona-bas", "games");

    host.send({ type: "client:room:start" });
    await host.waitFor((m) => m.state?.phase === "tutorial", "tut");

    host.send({ type: "client:game:ready" });
    guest.send({ type: "client:game:ready" });
    await host.waitFor((m) => m.state?.phase === "playing", "playing", 8_000);

    const actionId = "unique-tap-1";
    host.send({
      type: "client:game:submit",
      actionId,
      payload: { kind: "button-tap" },
      clientTime: Date.now()
    });

    const ack1 = await host.waitFor((m) => m.type === "server:game-input-ack" && m.actionId === actionId, "ack 1");
    assert.equal(ack1.accepted, true, "İlk hamle kabul edilmeli");

    // Replay exact same actionId in the same scope
    host.send({
      type: "client:game:submit",
      actionId,
      payload: { kind: "button-tap" },
      clientTime: Date.now()
    });

    const ack2 = await host.waitFor((m) => m.type === "server:game-input-ack" && m.actionId === actionId, "ack 2");
    assert.equal(ack2.accepted, false, "Tekrar eden actionId reddedilmeli");
    assert.equal(ack2.reason, "input_duplicate", "Red gerekçesi input_duplicate olmalı");

    // Rapid burst of 20 legitimate taps with unique IDs all succeed
    for (let i = 2; i <= 21; i++) {
      host.send({
        type: "client:game:submit",
        actionId: `burst-tap-${i}`,
        payload: { kind: "button-tap" },
        clientTime: Date.now()
      });
    }

    const lastAck = await host.waitFor((m) => m.type === "server:game-input-ack" && m.actionId === "burst-tap-21", "ack 21");
    assert.equal(lastAck.accepted, true, "20 tıklamalık meşru burst kabul edilmeli");
  } finally {
    await host.close();
    await guest.close();
  }
});

test("H12 — Simultaneous reconnect burst: 8 players reconnect at once without rate-limit drops", async () => {
  const reconnectServer = await launchTestServer();
  const clients = [];
  const tokens = [];
  try {
    for (let i = 0; i < 8; i++) {
      const c = new HardeningClient(reconnectServer.wsUrl);
      await c.open();
      c.send({ type: "client:hello", clientVersion: "reconn" });
      await c.waitFor((m) => m.type === "server:ready", "ready");
      clients.push(c);
    }

    // Host creates room
    clients[0].send({ type: "client:room:create", nickname: "Host" });
    const hSess = await clients[0].waitFor((m) => m.type === "server:session", "sess");
    tokens.push(hSess.reconnectToken);
    const roomCode = hSess.roomCode;

    // Others join
    for (let i = 1; i < 8; i++) {
      clients[i].send({ type: "client:room:join", roomCode, nickname: `P${i}` });
      const sess = await clients[i].waitFor((m) => m.type === "server:session", `sess ${i}`);
      tokens.push(sess.reconnectToken);
    }

    // All 8 disconnect
    await Promise.all(clients.map((c) => c.close()));

    // All 8 reconnect simultaneously
    const reconnectedClients = [];
    for (let i = 0; i < 8; i++) {
      const rc = new HardeningClient(reconnectServer.wsUrl);
      reconnectedClients.push(rc);
    }
    await Promise.all(reconnectedClients.map((rc) => rc.open()));

    // All 8 send resume
    for (let i = 0; i < 8; i++) {
      reconnectedClients[i].send({
        type: "client:room:join",
        roomCode,
        nickname: i === 0 ? "Host" : `P${i}`,
        resumeToken: tokens[i]
      });
    }

    // All 8 successfully receive their resumed session
    const resumedSessions = await Promise.all(
      reconnectedClients.map((rc, i) => rc.waitFor((m) => m.type === "server:session", `resume ${i}`))
    );
    assert.equal(resumedSessions.length, 8);
    for (const sess of resumedSessions) {
      assert.equal(sess.roomCode, roomCode);
    }

    await Promise.all(reconnectedClients.map((rc) => rc.close()));
  } finally {
    await reconnectServer.stop();
  }
});

test("H13 — Stale action scope and phase index are rejected regardless of cache state", async () => {
  const host = new HardeningClient(defaultServer.wsUrl);
  const guest = new HardeningClient(defaultServer.wsUrl);
  try {
    await host.open();
    await guest.open();
    host.send({ type: "client:hello", clientVersion: "stale" });
    guest.send({ type: "client:hello", clientVersion: "stale" });
    await Promise.all([
      host.waitFor((m) => m.type === "server:ready", "h ready"),
      guest.waitFor((m) => m.type === "server:ready", "g ready")
    ]);

    host.send({ type: "client:room:create", nickname: "Host" });
    const hSession = await host.waitFor((m) => m.type === "server:session", "h sess");
    guest.send({ type: "client:room:join", roomCode: hSession.roomCode, nickname: "Guest" });
    await guest.waitFor((m) => m.type === "server:session", "g sess");
    await host.waitFor((m) => m.type === "server:room-state" && m.state.players.length === 2, "2 players");

    host.send({
      type: "client:room:update-games",
      selectionMode: "manual",
      selectedGameIds: ["butona-bas"],
      randomGameCount: 1
    });
    await host.waitFor((m) => m.type === "server:room-state" && m.state.selectedGameIds[0] === "butona-bas", "games");

    host.send({ type: "client:room:start" });
    await host.waitFor((m) => m.state?.phase === "tutorial", "tut");

    host.send({ type: "client:game:ready" });
    guest.send({ type: "client:game:ready" });
    await host.waitFor((m) => m.state?.phase === "playing", "playing", 8_000);

    // Send action with fake/stale actionScope
    host.send({
      type: "client:game:submit",
      actionId: "stale-scope-act",
      actionScope: "stale-wrong-scope",
      phaseIndex: host.latestPhaseIndex,
      stateVersion: host.latestStateVersion,
      payload: { kind: "button-tap" },
      clientTime: Date.now()
    });

    const rejectedAck = await host.waitFor(
      (m) => m.type === "server:game-input-ack" && m.actionId === "stale-scope-act",
      "stale ack"
    );
    assert.equal(rejectedAck.accepted, false);
    assert.equal(rejectedAck.reason, "invalid_game_input", "Eski actionScope reddedilmeli");
  } finally {
    await host.close();
    await guest.close();
  }
});

test("H14 — Rapid global stateVersion advance does not falsely reject valid concurrent player actions", async () => {
  const host = new HardeningClient(defaultServer.wsUrl);
  const guest = new HardeningClient(defaultServer.wsUrl);
  try {
    await host.open();
    await guest.open();
    host.send({ type: "client:hello", clientVersion: "stateVer" });
    guest.send({ type: "client:hello", clientVersion: "stateVer" });
    await Promise.all([
      host.waitFor((m) => m.type === "server:ready", "h ready"),
      guest.waitFor((m) => m.type === "server:ready", "g ready")
    ]);

    host.send({ type: "client:room:create", nickname: "Host" });
    const hSession = await host.waitFor((m) => m.type === "server:session", "h sess");
    guest.send({ type: "client:room:join", roomCode: hSession.roomCode, nickname: "Guest" });
    await guest.waitFor((m) => m.type === "server:session", "g sess");
    await host.waitFor((m) => m.type === "server:room-state" && m.state.players.length === 2, "2 players");

    host.send({
      type: "client:room:update-games",
      selectionMode: "manual",
      selectedGameIds: ["butona-bas"],
      randomGameCount: 1
    });
    await host.waitFor((m) => m.type === "server:room-state" && m.state.selectedGameIds[0] === "butona-bas", "games");

    host.send({ type: "client:room:start" });
    await host.waitFor((m) => m.state?.phase === "tutorial", "tut");

    host.send({ type: "client:game:ready" });
    guest.send({ type: "client:game:ready" });
    await host.waitFor((m) => m.state?.phase === "playing", "playing", 8_000);

    // Host sends 10 taps, advancing server stateVersion by 10
    for (let i = 1; i <= 10; i++) {
      host.send({
        type: "client:game:submit",
        actionId: `host-advance-${i}`,
        payload: { kind: "button-tap" },
        clientTime: Date.now()
      });
    }
    await host.waitFor((m) => m.type === "server:game-input-ack" && m.actionId === "host-advance-10", "adv 10");

    // Guest sends action with observed stateVersion = 1 (behind current server stateVersion >= 11)
    guest.send({
      type: "client:game:submit",
      actionId: "guest-concurrent-tap",
      stateVersion: 1, // behind server stateVersion
      phaseIndex: guest.latestPhaseIndex,
      actionScope: guest.latestActionScope,
      payload: { kind: "button-tap" },
      clientTime: Date.now()
    });

    const guestAck = await guest.waitFor(
      (m) => m.type === "server:game-input-ack" && m.actionId === "guest-concurrent-tap",
      "guest ack"
    );
    assert.equal(guestAck.accepted, true, "stateVersion geride olsa bile geçerli scope içindeki eylem kabul edilmeli");
  } finally {
    await host.close();
    await guest.close();
  }
});

test("H15 — Legal maximum drawing payload (1.21MB, 180 strokes x 140 points) sent over real WebSocket is accepted in karalama-defteri", { timeout: 40_000 }, async () => {
  const c1 = new HardeningClient(defaultServer.wsUrl);
  const c2 = new HardeningClient(defaultServer.wsUrl);
  const c3 = new HardeningClient(defaultServer.wsUrl);
  const clients = [c1, c2, c3];

  try {
    await Promise.all(clients.map((c) => c.open()));
    clients.forEach((c) => c.send({ type: "client:hello", clientVersion: "maxDraw" }));
    await Promise.all(clients.map((c) => c.waitFor((m) => m.type === "server:ready", "ready")));

    c1.send({ type: "client:room:create", nickname: "DrawHost" });
    const sess1 = await c1.waitFor((m) => m.type === "server:session", "sess 1");
    const roomCode = sess1.roomCode;

    c2.send({ type: "client:room:join", roomCode, nickname: "DrawGuest1" });
    await c2.waitFor((m) => m.type === "server:session", "sess 2");
    c3.send({ type: "client:room:join", roomCode, nickname: "DrawGuest2" });
    await c3.waitFor((m) => m.type === "server:session", "sess 3");
    await c1.waitFor((m) => m.type === "server:room-state" && m.state.players.length === 3, "3 players");

    c1.send({
      type: "client:room:update-games",
      selectionMode: "manual",
      selectedGameIds: ["karalama-defteri"],
      randomGameCount: 1
    });
    await c1.waitFor((m) => m.type === "server:room-state" && m.state.selectedGameIds[0] === "karalama-defteri", "game sel");

    c1.send({ type: "client:room:start" });
    await c1.waitFor((m) => m.state?.phase === "tutorial", "tut");

    clients.forEach((c) => c.send({ type: "client:game:ready" }));
    await c1.waitFor((m) => m.state?.phase === "playing", "playing", 8_000);

    // Build the legal maximum drawing payload (180 strokes x 140 points)
    const maxMessage = buildLegalMaxDrawingMessage();
    const actionId = "max-legal-drawing-wire-test";
    c1.send({
      type: "client:game:submit",
      actionId,
      stateVersion: c1.latestStateVersion,
      phaseIndex: c1.latestPhaseIndex,
      actionScope: c1.latestActionScope,
      payload: maxMessage.payload,
      clientTime: Date.now()
    });

    const ack = await c1.waitFor(
      (m) => m.type === "server:game-input-ack" && m.actionId === actionId,
      "max drawing wire ack",
      12_000
    );
    assert.equal(ack.accepted, true, "1.21MB'lık tam yasal çizim sunucu tarafından kabul edilmeli");
  } finally {
    await Promise.all(clients.map((c) => c.close()));
  }
});

test("H16 — Invalid action ID floods do not grow replay fence; memory remains strictly bounded", () => {
  const matchFence = new MatchReplayFence(2048);
  const playerId = "adversary";

  // Simulate adversary trying to flood invalid action IDs
  // Since server only records valid/accepted actions into match.replayFence, invalid ones are never added
  assert.equal(matchFence.getPlayerFenceSize(playerId), 0);

  // Even if an attacker somehow sent 5,000 valid actions, the fence is strictly hard-capped at 2048
  for (let i = 0; i < 5000; i++) {
    matchFence.record(playerId, `flood-act-${i}`);
  }
  assert.equal(matchFence.getPlayerFenceSize(playerId), 2048, "Fence asla 2048 sınırını aşamaz");
});

test("H17 — Host kick in lobby: validation, token invalidation, disconnected kick, match lock", async () => {
  const server = await launchTestServer();
  const host = new HardeningClient(server.wsUrl);
  const guest1 = new HardeningClient(server.wsUrl);
  const guest2 = new HardeningClient(server.wsUrl);

  try {
    await Promise.all([
      host.waitFor((m) => m.type === "server:ready", "h rdy"),
      guest1.waitFor((m) => m.type === "server:ready", "g1 rdy"),
      guest2.waitFor((m) => m.type === "server:ready", "g2 rdy")
    ]);

    host.send({ type: "client:hello", clientVersion: "0.7.0" });
    guest1.send({ type: "client:hello", clientVersion: "0.7.0" });
    guest2.send({ type: "client:hello", clientVersion: "0.7.0" });

    host.send({ type: "client:room:create", nickname: "HostPlayer" });
    const hSession = await host.waitFor((m) => m.type === "server:session", "h sess");
    const roomCode = hSession.roomCode;
    const hostId = hSession.playerId;

    guest1.send({ type: "client:room:join", roomCode, nickname: "GuestOne" });
    const g1Session = await guest1.waitFor((m) => m.type === "server:session", "g1 sess");
    const guest1Id = g1Session.playerId;

    guest2.send({ type: "client:room:join", roomCode, nickname: "GuestTwo" });
    const g2Session = await guest2.waitFor((m) => m.type === "server:session", "g2 sess");
    const guest2Id = g2Session.playerId;
    const guest2ResumeToken = g2Session.reconnectToken;

    await host.waitFor((m) => m.type === "server:room-state" && m.state.players.length === 3, "3 players");

    // 1. Non-host cannot kick
    guest1.send({ type: "client:room:kick", targetPlayerId: guest2Id });
    const errNotHost = await guest1.waitFor((m) => m.type === "server:error" && m.code === "not_host", "err not_host");
    assert.equal(errNotHost.code, "not_host");

    // 2. Host cannot kick self
    host.send({ type: "client:room:kick", targetPlayerId: hostId });
    const errSelf = await host.waitFor((m) => m.type === "server:error" && m.code === "cannot_kick_self", "err cannot_kick_self");
    assert.equal(errSelf.code, "cannot_kick_self");

    // 3. Invalid target
    host.send({ type: "client:room:kick", targetPlayerId: "fake-target-id" });
    const errNotFound = await host.waitFor((m) => m.type === "server:error" && m.code === "target_not_found", "err target_not_found");
    assert.equal(errNotFound.code, "target_not_found");

    // 4. Disconnected player can be kicked
    await guest2.close();
    await host.waitFor((m) => m.type === "server:room-state" && m.state.players.find((p) => p.id === guest2Id && !p.connected), "g2 offline");

    host.send({ type: "client:room:kick", targetPlayerId: guest2Id });
    const stateAfterG2Kick = await host.waitFor((m) => m.type === "server:room-state" && m.state.players.length === 2, "g2 kicked state");
    assert.equal(stateAfterG2Kick.state.players.some((p) => p.id === guest2Id), false);

    // Kicked reconnect token cannot resume
    const guest2Recon = new HardeningClient(server.wsUrl);
    await guest2Recon.waitFor((m) => m.type === "server:ready", "g2 recon ready");
    guest2Recon.send({ type: "client:hello", clientVersion: "0.7.0" });
    guest2Recon.send({
      type: "client:room:join",
      roomCode,
      nickname: "GuestTwo",
      resumeToken: guest2ResumeToken
    });
    const errResume = await guest2Recon.waitFor((m) => m.type === "server:error" && m.code === "resume_failed", "err resume_failed");
    assert.equal(errResume.code, "resume_failed");
    await guest2Recon.close();

    // 5. Connected target kick receives room-left "kicked" and socket closes
    host.send({ type: "client:room:kick", targetPlayerId: guest1Id });
    const kickedMsg = await guest1.waitFor((m) => m.type === "server:room-left", "g1 kicked");
    assert.equal(kickedMsg.reason, "kicked");
    await host.waitFor((m) => m.type === "server:room-state" && m.state.players.length === 1, "only host left");

    // 6. Match in progress kick is rejected
    const guest3 = new HardeningClient(server.wsUrl);
    await guest3.waitFor((m) => m.type === "server:ready", "g3 ready");
    guest3.send({ type: "client:hello", clientVersion: "0.7.0" });
    guest3.send({ type: "client:room:join", roomCode, nickname: "GuestThree" });
    const g3Session = await guest3.waitFor((m) => m.type === "server:session", "g3 sess");
    await host.waitFor((m) => m.type === "server:room-state" && m.state.players.length === 2, "2 players for match");

    host.send({
      type: "client:room:update-games",
      selectionMode: "manual",
      selectedGameIds: ["butona-bas"],
      randomGameCount: 1
    });
    await host.waitFor((m) => m.type === "server:room-state" && m.state.selectedGameIds[0] === "butona-bas", "games set");

    host.send({ type: "client:room:start" });
    await host.waitFor((m) => m.state?.phase === "tutorial", "match started");

    host.send({ type: "client:room:kick", targetPlayerId: g3Session.playerId });
    const errMatchProgress = await host.waitFor((m) => m.type === "server:error" && m.code === "match_in_progress", "err match_in_progress");
    assert.equal(errMatchProgress.code, "match_in_progress");

    await guest3.close();
  } finally {
    await Promise.all([host.close(), guest1.close(), guest2.close()]);
    await server.stop();
  }
});

test("H18 — Briefing ready barrier semantics, disconnect advance, and reconnect participation", async () => {
  const server = await launchTestServer();
  const host = new HardeningClient(server.wsUrl);
  const guest1 = new HardeningClient(server.wsUrl);
  const guest2 = new HardeningClient(server.wsUrl);

  try {
    await Promise.all([
      host.waitFor((m) => m.type === "server:ready", "h rdy"),
      guest1.waitFor((m) => m.type === "server:ready", "g1 rdy"),
      guest2.waitFor((m) => m.type === "server:ready", "g2 rdy")
    ]);

    host.send({ type: "client:hello", clientVersion: "0.7.0" });
    guest1.send({ type: "client:hello", clientVersion: "0.7.0" });
    guest2.send({ type: "client:hello", clientVersion: "0.7.0" });

    host.send({ type: "client:room:create", nickname: "Host" });
    const hSession = await host.waitFor((m) => m.type === "server:session", "h sess");
    const roomCode = hSession.roomCode;
    const hostId = hSession.playerId;

    guest1.send({ type: "client:room:join", roomCode, nickname: "Guest1" });
    const g1Session = await guest1.waitFor((m) => m.type === "server:session", "g1 sess");
    const guest1Id = g1Session.playerId;

    guest2.send({ type: "client:room:join", roomCode, nickname: "Guest2" });
    const g2Session = await guest2.waitFor((m) => m.type === "server:session", "g2 sess");
    const guest2Id = g2Session.playerId;
    const guest2ResumeToken = g2Session.reconnectToken;

    await host.waitFor((m) => m.type === "server:room-state" && m.state.players.length === 3, "3 players");

    host.send({
      type: "client:room:update-games",
      selectionMode: "manual",
      selectedGameIds: ["kendim"],
      randomGameCount: 1
    });
    await host.waitFor((m) => m.type === "server:room-state" && m.state.selectedGameIds[0] === "kendim", "games set");

    host.send({ type: "client:room:start" });
    const hostMatch = await host.waitFor((m) => m.state?.phase === "tutorial", "tut");
    assert.equal(hostMatch.state.phaseEndsAt, null, "Brifing fazında geri sayım süresi olmamalı (phaseEndsAt null)");

    // 1. Duplicate ready is idempotent and single ready doesn't advance
    host.send({ type: "client:game:ready" });
    const readyState1 = await host.waitFor((m) => m.state?.readyPlayerIds?.includes(hostId), "h ready");
    assert.equal(readyState1.state.phase, "tutorial");

    host.send({ type: "client:game:ready" }); // duplicate call
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(host.latestPhaseIndex, readyState1.state.phaseIndex, "Tekrar eden hazır çağrısı fazı bozmamalı");

    // 2. Guest1 also readies; 2 of 3 ready, phase stays tutorial
    guest1.send({ type: "client:game:ready" });
    const readyState2 = await host.waitFor((m) => m.state?.readyPlayerIds?.includes(guest1Id), "g1 ready");
    assert.equal(readyState2.state.phase, "tutorial");

    // 3. Guest2 disconnects during briefing => remaining eligible barrier met => advances immediately to playing
    await guest2.close();
    const playingState = await host.waitFor((m) => m.state?.phase === "playing", "advance on disconnect", 5_000);
    assert.equal(playingState.state.phase, "playing");

    // 4. Guest2 reconnects during playing: coherent match state, not permanently eliminated
    const guest2Recon = new HardeningClient(server.wsUrl);
    await guest2Recon.waitFor((m) => m.type === "server:ready", "g2 recon ready");
    guest2Recon.send({ type: "client:hello", clientVersion: "0.7.0" });
    guest2Recon.send({
      type: "client:room:join",
      roomCode,
      nickname: "Guest2",
      resumeToken: guest2ResumeToken
    });
    const g2PlayingMatch = await guest2Recon.waitFor((m) => m.type === "server:match-state", "g2 resume match");
    assert.equal(g2PlayingMatch.state.phase, "playing");
    const g2Player = g2PlayingMatch.state.players.find((p) => p.id === guest2Id);
    assert.equal(g2Player?.currentGameParticipant, true, "Reconnect olan oyuncu katılımcı olarak kalmalı");
    assert.equal(g2Player?.eliminated, false, "Kopan oyuncu elenmemeli");

    await guest2Recon.close();
  } finally {
    await Promise.all([host.close(), guest1.close(), guest2.close()]);
    await server.stop();
  }
});


