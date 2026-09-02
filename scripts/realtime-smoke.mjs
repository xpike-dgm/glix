import assert from "node:assert/strict";
import { WebSocket } from "ws";

const httpUrl = process.env.GLIX_SMOKE_HTTP_URL ?? "http://127.0.0.1:8787";
const wsUrl = process.env.GLIX_SMOKE_WS_URL ?? "ws://127.0.0.1:8787/ws";
const timeoutMs = 5_000;

class SmokeClient {
  #socket;
  #messages = [];
  #waiters = [];

  constructor() {
    this.#socket = new WebSocket(wsUrl);
    this.#socket.on("message", (data) => {
      let message;

      try {
        message = JSON.parse(data.toString());
      } catch {
        return;
      }

      const waiterIndex = this.#waiters.findIndex((waiter) => waiter.predicate(message));

      if (waiterIndex >= 0) {
        const waiter = this.#waiters.splice(waiterIndex, 1)[0];
        waiter.resolve(message);
      } else {
        this.#messages.push(message);
      }
    });
  }

  async open() {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("WebSocket açılışı zaman aşımına uğradı.")), timeoutMs);
      this.#socket.once("open", () => {
        clearTimeout(timer);
        resolve();
      });
      this.#socket.once("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  send(message) {
    this.#socket.send(JSON.stringify(message));
  }

  async waitFor(predicate, label) {
    const existingIndex = this.#messages.findIndex(predicate);

    if (existingIndex >= 0) {
      return this.#messages.splice(existingIndex, 1)[0];
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#waiters = this.#waiters.filter((waiter) => waiter.timer !== timer);
        reject(new Error(`${label} beklenirken zaman aşımı oluştu.`));
      }, timeoutMs);

      this.#waiters.push({
        predicate,
        resolve: (message) => {
          clearTimeout(timer);
          resolve(message);
        },
        reject,
        timer
      });
    });
  }

  close() {
    this.#socket.close();
  }
}

async function main() {
  const healthResponse = await fetch(`${httpUrl}/health`);
  assert.equal(healthResponse.ok, true, `Health endpoint ${healthResponse.status} döndürdü.`);
  const health = await healthResponse.json();
  assert.equal(health.ok, true);
  assert.equal(health.service, "glix-server");

  const host = new SmokeClient();
  const guest = new SmokeClient();

  try {
    await Promise.all([host.open(), guest.open()]);
    host.send({ type: "client:hello", clientVersion: "smoke" });
    guest.send({ type: "client:hello", clientVersion: "smoke" });
    await Promise.all([
      host.waitFor((message) => message.type === "server:ready", "host hazır mesajı"),
      guest.waitFor((message) => message.type === "server:ready", "guest hazır mesajı")
    ]);

    host.send({ type: "client:room:create", nickname: "Smoke Host" });
    const hostRoom = await host.waitFor((message) => message.type === "server:room-state", "oda oluşturma");
    const roomCode = hostRoom.state.roomCode;
    assert.equal(hostRoom.state.players.length, 1);

    guest.send({ type: "client:room:join", roomCode, nickname: "Smoke Guest" });
    await Promise.all([
      host.waitFor((message) => message.type === "server:room-state" && message.state.players.length === 2, "host ikinci oyuncu"),
      guest.waitFor((message) => message.type === "server:room-state" && message.state.players.length === 2, "guest oda senkronu")
    ]);

    host.send({
      type: "client:room:update-games",
      selectionMode: "manual",
      selectedGameIds: ["butona-bas"],
      randomGameCount: 1
    });
    await Promise.all([
      host.waitFor((message) => message.type === "server:room-state" && message.state.selectedGameIds.length === 1, "host oyun seçimi"),
      guest.waitFor((message) => message.type === "server:room-state" && message.state.selectedGameIds.length === 1, "guest oyun seçimi")
    ]);

    host.send({ type: "client:room:start" });
    const [hostMatch, guestMatch] = await Promise.all([
      host.waitFor((message) => message.type === "server:match-state", "host maç başlatma"),
      guest.waitFor((message) => message.type === "server:match-state", "guest maç başlatma")
    ]);

    assert.equal(hostMatch.state.currentGameId, "butona-bas");
    assert.equal(guestMatch.state.currentGameId, "butona-bas");
    assert.equal(hostMatch.state.phase, "tutorial");
    assert.equal(guestMatch.state.phase, "tutorial");
    assert.equal(hostMatch.state.gameState.gameId, "butona-bas");
    assert.equal(guestMatch.state.gameState.gameId, "butona-bas");

    console.log(JSON.stringify({
      ok: true,
      health: { version: health.version, activeRooms: health.activeRooms },
      roomCode,
      game: hostMatch.state.currentGameId,
      phase: hostMatch.state.phase
    }));
  } finally {
    host.close();
    guest.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
