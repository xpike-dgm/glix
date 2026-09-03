import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createNetServer } from "node:net";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { WebSocket } from "ws";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(TEST_DIR, "../../..");
const SERVER_ENTRY = join(ROOT_DIR, "apps", "server", "dist", "index.js");
const SOCKET_TIMEOUT_MS = 8_000;

async function findFreePort() {
  const server = createNetServer();
  await new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolvePromise());
  });

  const address = server.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;
  await new Promise((resolvePromise, reject) => {
    server.close((error) => (error ? reject(error) : resolvePromise()));
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
      lastError = new Error(`health ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 50));
  }

  throw new Error(`Test server health beklemesi başarısız: ${lastError?.message ?? "bilinmeyen hata"}\n${output.join("")}`);
}

async function launchServer() {
  const port = await findFreePort();
  const output = [];
  const child = spawn(process.execPath, [SERVER_ENTRY], {
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  rememberOutput(child.stdout, output);
  rememberOutput(child.stderr, output);

  const httpUrl = `http://127.0.0.1:${port}`;
  const wsUrl = `ws://127.0.0.1:${port}/ws`;
  await waitForHealth(httpUrl, child, output);

  return {
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

class TestClient {
  constructor(wsUrl) {
    this.socket = new WebSocket(wsUrl);
    this.messages = [];
    this.waiters = [];
    this.socket.on("message", (data) => {
      let message;
      try {
        message = JSON.parse(data.toString());
      } catch {
        return;
      }

      const waiterIndex = this.waiters.findIndex((waiter) => waiter.predicate(message));
      if (waiterIndex >= 0) {
        const waiter = this.waiters.splice(waiterIndex, 1)[0];
        clearTimeout(waiter.timer);
        waiter.resolve(message);
      } else {
        this.messages.push(message);
      }
    });
    this.socket.on("error", (error) => {
      this.lastError = error;
    });
    this.socket.on("close", () => {
      this.closed = true;
      const waiters = this.waiters.splice(0);
      waiters.forEach((waiter) => {
        clearTimeout(waiter.timer);
        waiter.reject(new Error(`${waiter.label} beklenirken bağlantı kapandı.`));
      });
    });
  }

  async open() {
    if (this.socket.readyState === WebSocket.OPEN) return;

    await new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => reject(new Error("WebSocket açılışı zaman aşımına uğradı.")), SOCKET_TIMEOUT_MS);
      const onOpen = () => {
        clearTimeout(timer);
        resolvePromise();
      };
      const onError = (error) => {
        clearTimeout(timer);
        reject(error);
      };
      this.socket.once("open", onOpen);
      this.socket.once("error", onError);
    });
  }

  send(message) {
    assert.equal(this.socket.readyState, WebSocket.OPEN, "Test client WebSocket açık olmalı.");
    this.socket.send(JSON.stringify(message));
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
          this.waiters = this.waiters.filter((candidate) => candidate !== waiter);
          reject(new Error(`${label} beklenirken zaman aşımı oluştu.`));
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
      }, 1_000);
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

let server;

before(async () => {
  server = await launchServer();
});

after(async () => {
  await server?.stop();
});

async function connectClient() {
  const client = new TestClient(server.wsUrl);
  await client.open();
  client.send({ type: "client:hello", clientVersion: "stage11-test" });
  await client.waitFor((message) => message.type === "server:ready", "server:ready");
  return client;
}

async function createRoom(client, nickname) {
  client.send({ type: "client:room:create", nickname });
  const session = await client.waitFor((message) => message.type === "server:session", "oda session");
  const roomState = await client.waitFor((message) => message.type === "server:room-state", "oda oluşturma state");
  return { ...session, state: roomState.state };
}

async function joinRoom(client, roomCode, nickname, resumeToken) {
  client.send({
    type: "client:room:join",
    roomCode,
    nickname,
    ...(resumeToken ? { resumeToken } : {})
  });
  const session = await client.waitFor((message) => message.type === "server:session", "join session");
  const stateMessage = await client.waitFor(
    (message) => message.type === "server:room-state" || message.type === "server:match-state",
    "join state"
  );
  return {
    ...session,
    state: stateMessage.state,
    message: stateMessage,
    canManageGames: stateMessage.canManageGames,
    canManageMatch: stateMessage.canManageMatch
  };
}

async function createRoomWithPlayers(count) {
  const host = await connectClient();
  const hostSession = await createRoom(host, "Host");
  const players = [{ client: host, ...hostSession }];

  for (let index = 1; index < count; index += 1) {
    const client = await connectClient();
    const joined = await joinRoom(client, hostSession.roomCode, `Oyuncu ${index}`);
    players.push({ client, ...joined });
    await host.waitFor(
      (message) => message.type === "server:room-state" && message.state.players.length === index + 1,
      `host ${index + 1}. oyuncu state`
    );
  }

  return { host, roomCode: hostSession.roomCode, players };
}

function playerById(state, playerId) {
  return state.players.find((player) => player.id === playerId);
}

function assertUniquePlayerIds(state) {
  const ids = state.players.map((player) => player.id);
  assert.equal(new Set(ids).size, ids.length, "Room roster'ında duplicate player olmamalı.");
}

function matchStateAt(index, phase) {
  return (message) =>
    message.type === "server:match-state" &&
    message.state.currentGameIndex === index &&
    (phase === undefined || message.state.phase === phase);
}

async function waitMatch(client, predicate, label, timeoutMs = SOCKET_TIMEOUT_MS) {
  return client.waitFor(
    (message) => message.type === "server:match-state" && predicate(message),
    label,
    timeoutMs
  );
}

async function configureManualRoute(host, gameIds) {
  host.send({
    type: "client:room:update-games",
    selectionMode: "manual",
    selectedGameIds: gameIds,
    randomGameCount: 1
  });
  return host.waitFor(
    (message) =>
      message.type === "server:room-state" &&
      message.state.selectionMode === "manual" &&
      message.state.selectedGameIds.length === gameIds.length,
    "manuel oyun rotası"
  );
}

async function startAndEnterPlaying(players, gameIndex = 0) {
  const host = players[0].client;
  host.send({ type: "client:room:start" });
  await waitMatch(host, (message) => message.state.currentGameIndex === gameIndex && message.state.phase === "tutorial", "tutorial");
  await waitMatch(host, (message) => message.state.currentGameIndex === gameIndex && message.state.phase === "preparing", "preparing", 12_000);

  players.forEach(({ client }) => client.send({ type: "client:game:ready" }));
  await Promise.all(
    players.map(({ client }) =>
      waitMatch(client, (message) => message.state.currentGameIndex === gameIndex && message.state.phase === "playing", `oyuncu ${gameIndex} playing`, 8_000)
    )
  );
}

function sendOverloadClicks(client, count) {
  for (let index = 0; index < count; index += 1) {
    client.send({
      type: "client:game:submit",
      payload: { kind: "overload-click" },
      clientTime: Date.now()
    });
  }
}

function sendMatchingGridSelections(clients, cell = 0) {
  clients.forEach((client) => {
    client.send({
      type: "client:game:submit",
      payload: { kind: "grid-cell", cell },
      clientTime: Date.now()
    });
  });
}

async function closeAll(clients) {
  await Promise.all(clients.filter(Boolean).map((client) => client.close().catch(() => undefined)));
}

test("R1/R2/R4/R5 — transition participant snapshotı, identity ve current-game reconnect state'i korunur", { timeout: 120_000 }, async () => {
  const room = await createRoomWithPlayers(3);
  const host = room.host;
  const guest = room.players[1].client;
  const originalC = room.players[2].client;
  const cId = room.players[2].playerId;
  const cToken = room.players[2].reconnectToken;
  const clients = [host, guest, originalC];
  let currentReconnect;
  let gameTwoReconnect;
  let gameThreeReconnect;

  try {
    await configureManualRoute(host, ["asiri-yukleme", "gizli-kareler", "kor-bomba"]);
    await startAndEnterPlaying(room.players);

    originalC.send({
      type: "client:game:submit",
      payload: { kind: "overload-click" },
      clientTime: Date.now()
    });
    await originalC.waitFor(
      (message) => message.type === "server:game-input-ack" && message.accepted === true,
      "current-game C input ack"
    );

    await originalC.close();
    const disconnectedCurrent = await waitMatch(
      host,
      (message) => playerById(message.state, cId)?.connected === false,
      "current game disconnect state"
    );
    assert.equal(disconnectedCurrent.state.players.length, 3);

    currentReconnect = await connectClient();
    clients.push(currentReconnect);
    const resumedCurrent = await joinRoom(currentReconnect, room.roomCode, "C yeniden", cToken);
    assert.equal(resumedCurrent.playerId, cId, "Current-game reconnect yeni player oluşturmamalı.");
    assert.equal(resumedCurrent.roomCode, room.roomCode);
    assert.equal(resumedCurrent.reconnectToken, cToken);

    const currentMatch = resumedCurrent.message;
    assert.equal(currentMatch.type, "server:match-state");
    assert.equal(currentMatch.state.currentGameIndex, 0);
    assert.equal(currentMatch.state.phase, "playing");
    assert.equal(currentMatch.ownGameState?.clickCount, 1);
    assert.equal(currentMatch.ownInputCount, 1);
    assert.equal(currentMatch.ownHasSubmitted, true);
    assert.equal(playerById(currentMatch.state, cId)?.currentGameParticipant, true);
    assertUniquePlayerIds(currentMatch.state);
    assert.equal(currentMatch.state.players.length, 3);

    await currentReconnect.close();
    const disconnectedAtBoundary = await waitMatch(
      host,
      (message) => playerById(message.state, cId)?.connected === false,
      "boundary disconnect state"
    );
    assert.equal(disconnectedAtBoundary.state.players.length, 3);

    // C's one click makes the post-resolution score deterministic: A has 99
    // clicks and ranks first, C has one click and ranks second (+1).
    sendOverloadClicks(host, 99);
    const firstResults = await waitMatch(
      host,
      (message) =>
        message.state.currentGameIndex === 0 &&
        message.state.phase === "results" &&
        playerById(message.state, cId)?.score === 1,
      "first game result and score continuity",
      12_000
    );
    assert.equal(playerById(firstResults.state, cId)?.connected, false);
    assert.equal(playerById(firstResults.state, cId)?.currentGameParticipant, true);

    const gameTwoTutorial = await waitMatch(
      host,
      (message) => message.state.currentGameIndex === 1 && message.state.phase === "tutorial",
      "next game tutorial",
      16_000
    );
    assert.equal(playerById(gameTwoTutorial.state, cId)?.connected, false);
    assert.equal(playerById(gameTwoTutorial.state, cId)?.currentGameParticipant, false);
    assert.equal(playerById(gameTwoTutorial.state, room.players[0].playerId)?.currentGameParticipant, true);
    assert.equal(playerById(gameTwoTutorial.state, room.players[1].playerId)?.currentGameParticipant, true);
    assertUniquePlayerIds(gameTwoTutorial.state);

    gameTwoReconnect = await connectClient();
    clients.push(gameTwoReconnect);
    const resumedGameTwo = await joinRoom(gameTwoReconnect, room.roomCode, "C geç katıldı", cToken);
    assert.equal(resumedGameTwo.playerId, cId);
    assert.equal(resumedGameTwo.roomCode, room.roomCode);
    assert.equal(resumedGameTwo.reconnectToken, cToken);

    const spectatorTutorial = resumedGameTwo.message;
    assert.equal(spectatorTutorial.type, "server:match-state");
    assert.equal(spectatorTutorial.state.currentGameIndex, 1);
    assert.equal(spectatorTutorial.state.phase, "tutorial");
    assert.equal(playerById(spectatorTutorial.state, cId)?.currentGameParticipant, false);
    assert.equal(playerById(spectatorTutorial.state, room.players[0].playerId)?.currentGameParticipant, true);
    assert.equal(playerById(spectatorTutorial.state, room.players[1].playerId)?.currentGameParticipant, true);
    assert.equal(spectatorTutorial.ownGameState, null);
    assert.equal(spectatorTutorial.ownInputCount, 0);
    assert.equal(spectatorTutorial.ownHasSubmitted, false);
    assert.equal(playerById(spectatorTutorial.state, cId)?.score, 1, "Score room member üzerinde korunmalı.");
    assertUniquePlayerIds(spectatorTutorial.state);

    await waitMatch(host, (message) => message.state.currentGameIndex === 1 && message.state.phase === "preparing", "second game preparing", 12_000);
    host.send({ type: "client:game:ready" });
    guest.send({ type: "client:game:ready" });
    await waitMatch(host, (message) => message.state.currentGameIndex === 1 && message.state.phase === "playing", "second game playing", 12_000);
    gameTwoReconnect.send({ type: "client:game:ready" });
    const spectatorReady = await gameTwoReconnect.waitFor(
      (message) => message.type === "server:error" && message.code === "spectator",
      "spectator ready rejection"
    );
    assert.equal(spectatorReady.code, "spectator");

    gameTwoReconnect.send({
      type: "client:game:submit",
      payload: { kind: "overload-click" },
      clientTime: Date.now()
    });
    const spectatorInput = await gameTwoReconnect.waitFor(
      (message) => message.type === "server:game-input-ack",
      "spectator input rejection"
    );
    assert.deepEqual(
      { accepted: spectatorInput.accepted, reason: spectatorInput.reason },
      { accepted: false, reason: "spectator" }
    );

    await gameTwoReconnect.close();
    sendMatchingGridSelections([host, guest]);
    await waitMatch(
      host,
      (message) => message.state.currentGameIndex === 2 && message.state.phase === "tutorial",
      "third game after spectator exclusion",
      20_000
    );

    gameThreeReconnect = await connectClient();
    clients.push(gameThreeReconnect);
    const resumedGameThree = await joinRoom(gameThreeReconnect, room.roomCode, "C üçüncü oyun", cToken);
    assert.equal(resumedGameThree.playerId, cId);
    const lateSpectator = resumedGameThree.message;
    assert.equal(lateSpectator.type, "server:match-state");
    assert.equal(lateSpectator.state.currentGameIndex, 2);
    assert.equal(lateSpectator.state.phase, "tutorial");
    assert.equal(playerById(lateSpectator.state, cId)?.currentGameParticipant, false);
    assert.equal(lateSpectator.ownGameState, null);
    assert.equal(lateSpectator.ownInputCount, 0);
    assert.equal(lateSpectator.ownHasSubmitted, false);
    assert.equal(playerById(lateSpectator.state, cId)?.score, 1);

    gameThreeReconnect.send({
      type: "client:game:submit",
      payload: { kind: "overload-click" },
      clientTime: Date.now()
    });
    const lateInput = await gameThreeReconnect.waitFor(
      (message) => message.type === "server:game-input-ack",
      "third game spectator input rejection"
    );
    assert.deepEqual(
      { accepted: lateInput.accepted, reason: lateInput.reason },
      { accepted: false, reason: "spectator" }
    );
  } finally {
    await closeAll(clients);
  }
});

test("R3 — random oyun üst sınırı room member değil connected oyuncu sayısını kullanır", async () => {
  const room = await createRoomWithPlayers(3);
  const third = room.players[2].client;

  try {
    await third.close();
    const lobbyAfterDisconnect = await room.host.waitFor(
      (message) =>
        message.type === "server:room-state" &&
        message.state.players.length === 3 &&
        message.state.players.filter((player) => player.connected).length === 2,
      "3 member / 2 connected lobby state"
    );
    assert.equal(lobbyAfterDisconnect.state.players.length, 3);

    room.host.send({
      type: "client:room:update-games",
      selectionMode: "random",
      selectedGameIds: [],
      randomGameCount: 14
    });
    const rejected = await room.host.waitFor(
      (message) => message.type === "server:error" && message.code === "invalid_random_count",
      "connected random maximum rejection"
    );
    assert.match(rejected.message, /13/);

    room.host.send({
      type: "client:room:update-games",
      selectionMode: "random",
      selectedGameIds: [],
      randomGameCount: 13
    });
    const accepted = await room.host.waitFor(
      (message) => message.type === "server:room-state" && message.state.randomGameCount === 13,
      "connected random maximum acceptance"
    );
    assert.equal(accepted.state.players.length, 3);
  } finally {
    await closeAll(room.players.map(({ client }) => client));
  }
});

test("Stage 11.3A — grace-disconnected oyuncu hedef olarak kabul edilmez", { timeout: 60_000 }, async () => {
  const room = await createRoomWithPlayers(3);
  const host = room.host;
  const disconnected = room.players[2].client;
  const disconnectedId = room.players[2].playerId;

  try {
    await configureManualRoute(host, ["rusvet-darbe"]);
    await startAndEnterPlaying(room.players);

    await disconnected.close();
    const roster = await waitMatch(
      host,
      (message) => playerById(message.state, disconnectedId)?.connected === false,
      "target disconnect state"
    );
    assert.equal(playerById(roster.state, disconnectedId)?.currentGameParticipant, true);

    host.send({
      type: "client:game:submit",
      payload: { kind: "president-vote", targetPlayerId: disconnectedId },
      clientTime: Date.now()
    });
    const rejected = await host.waitFor(
      (message) => message.type === "server:game-input-ack" && message.accepted === false,
      "disconnected target rejection"
    );
    assert.deepEqual(
      { accepted: rejected.accepted, reason: rejected.reason },
      { accepted: false, reason: "invalid_game_input" }
    );
  } finally {
    await closeAll(room.players.map(({ client }) => client));
  }
});

test("Stage 11.3A — sayısal mini oyunlarda ilk kabul edilen seçim kazanır", { timeout: 60_000 }, async () => {
  const room = await createRoomWithPlayers(3);
  const host = room.host;

  try {
    await configureManualRoute(host, ["acgozluluk-limiti"]);
    await startAndEnterPlaying(room.players);

    host.send({
      type: "client:game:submit",
      payload: { kind: "limit-value", value: 1 },
      clientTime: Date.now()
    });
    const firstAck = await host.waitFor(
      (message) => message.type === "server:game-input-ack" && message.accepted === true,
      "first numeric input ack"
    );
    assert.equal(firstAck.accepted, true);

    host.send({
      type: "client:game:submit",
      payload: { kind: "limit-value", value: 3 },
      clientTime: Date.now()
    });
    const duplicateAck = await host.waitFor(
      (message) => message.type === "server:game-input-ack" && message.accepted === false,
      "numeric duplicate ack"
    );
    assert.deepEqual(
      { accepted: duplicateAck.accepted, reason: duplicateAck.reason },
      { accepted: false, reason: "input_duplicate" }
    );

    const results = await waitMatch(
      host,
      (message) => message.state.phase === "results" && message.state.gameState.choices?.some((choice) => choice.playerId === room.players[0].playerId && choice.value === 1),
      "first numeric value in results",
      25_000
    );
    assert.equal(results.state.gameState.choices.find((choice) => choice.playerId === room.players[0].playerId)?.value, 1);
  } finally {
    await closeAll(room.players.map(({ client }) => client));
  }
});

test("R6 — host migration eski host reconnect edince ownership'i geri almaz", async () => {
  const room = await createRoomWithPlayers(3);
  const hostId = room.players[0].playerId;
  const guest = room.players[1].client;
  const oldHost = room.players[0].client;
  const token = room.players[0].reconnectToken;
  let resumedHost;

  try {
    await oldHost.close();
    const migrated = await guest.waitFor(
      (message) =>
        message.type === "server:room-state" &&
        message.state.hostPlayerId === room.players[1].playerId &&
        playerById(message.state, hostId)?.connected === false,
      "host migration"
    );
    assert.equal(migrated.state.players.length, 3);
    assertUniquePlayerIds(migrated.state);

    resumedHost = await connectClient();
    const resumed = await joinRoom(resumedHost, room.roomCode, "Eski host", token);
    assert.equal(resumed.playerId, hostId);
    assert.equal(resumed.roomCode, room.roomCode);
    assert.equal(resumed.reconnectToken, token);
    assert.equal(resumed.state.hostPlayerId, room.players[1].playerId);
    assert.equal(resumed.canManageGames, false);
    assertUniquePlayerIds(resumed.state);

    resumedHost.send({
      type: "client:room:update-games",
      selectionMode: "manual",
      selectedGameIds: ["butona-bas"],
      randomGameCount: 1
    });
    const rejected = await resumedHost.waitFor(
      (message) => message.type === "server:error" && message.code === "not_host",
      "reconnected old host management rejection"
    );
    assert.equal(rejected.code, "not_host");
  } finally {
    await closeAll([oldHost, guest, room.players[2].client, resumedHost]);
  }
});

test("R6 — duplicate socket açılışı eski close event'i yeni bağlantıyı offline işaretlemez", async () => {
  const room = await createRoomWithPlayers(2);
  const host = room.host;
  const guest = room.players[1].client;
  const hostToken = room.players[0].reconnectToken;
  let duplicate;

  try {
    duplicate = await connectClient();
    const resumed = await joinRoom(duplicate, room.roomCode, "Host duplicate", hostToken);
    assert.equal(resumed.playerId, room.players[0].playerId);
    assert.equal(resumed.canManageGames, true);

    const guestAfterReplacement = await guest.waitFor(
      (message) =>
        message.type === "server:room-state" &&
        message.state.players.length === 2 &&
        playerById(message.state, room.players[0].playerId)?.connected === true,
      "new socket connected after old close"
    );
    assert.equal(guestAfterReplacement.state.hostPlayerId, room.players[0].playerId);
    assertUniquePlayerIds(guestAfterReplacement.state);

    duplicate.send({
      type: "client:room:update-games",
      selectionMode: "manual",
      selectedGameIds: ["butona-bas"],
      randomGameCount: 1
    });
    const managed = await duplicate.waitFor(
      (message) => message.type === "server:room-state" && message.state.selectedGameIds[0] === "butona-bas",
      "replacement socket host authority"
    );
    assert.equal(managed.canManageGames, true);
  } finally {
    await closeAll([host, guest, duplicate]);
  }
});

test("R1/R2 — iki oyunculu maçta disconnect sonrası uyumsuz next game başlatılmaz", { timeout: 60_000 }, async () => {
  const room = await createRoomWithPlayers(2);
  const host = room.host;
  const guest = room.players[1].client;

  try {
    await configureManualRoute(host, ["asiri-yukleme", "gizli-kareler"]);
    await startAndEnterPlaying(room.players);
    await guest.close();
    const disconnected = await waitMatch(
      host,
      (message) => playerById(message.state, room.players[1].playerId)?.connected === false,
      "two-player disconnect"
    );
    assert.equal(disconnected.state.players.length, 2);

    sendOverloadClicks(host, 100);
    const finished = await waitMatch(
      host,
      (message) => message.state.currentGameIndex === 0 && message.state.phase === "finished",
      "invalid next game route finish",
      20_000
    );
    assert.equal(finished.state.currentGameIndex, 0);
    assert.equal(finished.state.currentGameId, "asiri-yukleme");
    assert.equal(playerById(finished.state, room.players[1].playerId)?.connected, false);
  } finally {
    await closeAll([host, guest]);
  }
});
