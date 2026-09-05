import { randomBytes, randomInt, randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import process from "node:process";
import { WebSocket, WebSocketServer, type RawData } from "ws";
import {
  DEFAULT_RANDOM_GAME_COUNT,
  DEFAULT_SERVER_PORT,
  DEFAULT_WS_PATH,
  GAME_CATALOG,
  MAX_NICKNAME_LENGTH,
  MAX_PLAYERS,
  MIN_NICKNAME_LENGTH,
  MIN_PLAYERS,
  PROTOCOL_VERSION,
  ROOM_CODE_LENGTH,
  ROOM_EMPTY_GRACE_MS,
  createMiniGameRegistry,
  getAvailableGames,
  getConnectedPlayerCount,
  deriveSubmissionStatus,
  deriveActionScope,
  extractGameTargets,
  areExtractedTargetsEligible,
  type ClientMessage,
  type GameId,
  type GameSelectionMode,
  type JsonValue,
  type LobbyState,
  type MatchState,
  type ServerErrorCode,
  type ServerMessage,
  type InputRejectionReason,
  MiniGameEngine,
  createStage6GameAdapter,
  isStage6Game,
  type Stage6GameAdapter,
  type Stage6InputRejection,
  createStage7GameAdapter,
  isStage7Game,
  type Stage7GameAdapter,
  type Stage7InputRejection,
  createStage8GameAdapter,
  isStage8Game,
  type Stage8GameAdapter,
  type Stage8InputRejection,
  createStage9GameAdapter,
  isStage9Game,
  type Stage9GameAdapter,
  type Stage9InputRejection
} from "@glix/shared";

const host = process.env.HOST?.trim() || "0.0.0.0";
const serverStartedAt = Date.now();
const HEARTBEAT_INTERVAL_MS = 30_000;
const SHUTDOWN_TIMEOUT_MS = 10_000;

function parsePort(rawPort: string | undefined): number {
  const normalizedPort = rawPort?.trim();

  if (!normalizedPort) {
    return DEFAULT_SERVER_PORT;
  }

  if (!/^\d+$/.test(normalizedPort)) {
    throw new Error("PORT yalnızca 1 ile 65535 arasında bir tam sayı olmalı.");
  }

  const parsedPort = Number(normalizedPort);

  if (!Number.isSafeInteger(parsedPort) || parsedPort < 1 || parsedPort > 65_535) {
    throw new Error("PORT yalnızca 1 ile 65535 arasında bir tam sayı olmalı.");
  }

  return parsedPort;
}

const port = parsePort(process.env.PORT);
const serverVersion = "0.7.0";
const roomCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const miniGameRegistry = createMiniGameRegistry(GAME_CATALOG);

interface PlayerRecord {
  readonly id: string;
  readonly nickname: string;
  readonly reconnectToken: string;
  readonly joinedAt: number;
  score: number;
  connected: boolean;
  socket: WebSocket | null;
  disconnectTimer: NodeJS.Timeout | undefined;
}

interface MatchRecord {
  readonly id: string;
  readonly gameIds: GameId[];
  currentGameIndex: number;
  engine: MiniGameEngine;
  adapter: Stage6GameAdapter | Stage7GameAdapter | Stage8GameAdapter | Stage9GameAdapter | null;
  readonly miniGameScores: Map<string, number>;
  resultsApplied: boolean;
  stateVersion: number;
  readonly processedActionIds: Set<string>;
}

interface RoomRecord {
  readonly code: string;
  readonly createdAt: number;
  readonly players: Map<string, PlayerRecord>;
  hostPlayerId: string;
  selectionMode: GameSelectionMode;
  selectedGameIds: GameId[];
  randomGameCount: number;
  match: MatchRecord | null;
  idleTimer: NodeJS.Timeout | undefined;
}

interface SocketContext {
  playerId: string | undefined;
  roomCode: string | undefined;
  clientVersion: string | undefined;
}

interface SessionIndexEntry {
  readonly roomCode: string;
  readonly playerId: string;
}

const rooms = new Map<string, RoomRecord>();
const sessionIndex = new Map<string, SessionIndexEntry>();
const socketContexts = new WeakMap<WebSocket, SocketContext>();
const socketHeartbeat = new WeakMap<WebSocket, boolean>();
let isShuttingDown = false;
let shutdownTimer: NodeJS.Timeout | undefined;

function createSocketContext(): SocketContext {
  return {
    playerId: undefined,
    roomCode: undefined,
    clientVersion: undefined
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isJsonValue(value: unknown, depth = 0): value is JsonValue {
  if (depth > 8 || value === null) {
    return value === null;
  }

  if (
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    return typeof value !== "number" || Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item, depth + 1));
  }

  if (isRecord(value)) {
    return Object.values(value).every((item) => isJsonValue(item, depth + 1));
  }

  return false;
}

function isGameSelectionMode(value: unknown): value is GameSelectionMode {
  return value === "manual" || value === "random";
}

function isGameId(value: unknown): value is GameId {
  return typeof value === "string" && GAME_CATALOG.some((game) => game.id === value);
}

/**
 * Returns target ids carried by a game input, or null for inputs with no
 * target semantics. The adapter remains the final rule authority (for
 * self-targeting, role-specific and phase-specific constraints); this gate
 * only enforces the shared live-roster invariant at the server boundary.
 */
function submittedTargetsAreLive(room: RoomRecord, match: MatchRecord, payload: JsonValue | null): boolean {
  const extraction = extractGameTargets(match.gameIds[match.currentGameIndex]!, payload);
  const currentParticipants = new Set(match.engine.playerIds);
  return areExtractedTargetsEligible(extraction, [...room.players.values()].map((player) => ({
    id: player.id,
    connected: player.connected,
    currentGameParticipant: currentParticipants.has(player.id),
    eliminated: match.engine.isEliminated(player.id)
  })));
}

function sendJson(socket: WebSocket, message: ServerMessage): void {
  if (socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify(message));
    } catch (error) {
      console.warn("[glix-server] WebSocket gönderim hatası:", error);
      socket.terminate();
    }
  }
}

function sendError(socket: WebSocket, code: ServerErrorCode, message: string): void {
  sendJson(socket, { type: "server:error", code, message });
}

function writeJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function connectedPlayerCount(): number {
  let count = 0;

  for (const room of rooms.values()) {
    count += getConnectedPlayerCount([...room.players.values()]);
  }

  return count;
}

function getConnectedPlayerIds(room: RoomRecord): string[] {
  return [...room.players.values()]
    .filter((player) => player.connected)
    .map((player) => player.id);
}

function activeMatchCount(): number {
  let count = 0;

  for (const room of rooms.values()) {
    if (room.match) {
      count += 1;
    }
  }

  return count;
}

function handleHttp(request: IncomingMessage, response: ServerResponse): void {
  const requestUrl = new URL(
    request.url ?? "/",
    "http://" + (request.headers.host ?? "localhost")
  );

  if (requestUrl.pathname === "/health") {
    const ready = !isShuttingDown;

    writeJson(response, ready ? 200 : 503, {
      ok: ready,
      status: ready ? "ready" : "draining",
      service: "glix-server",
      version: serverVersion,
      protocolVersion: PROTOCOL_VERSION,
      activeRooms: rooms.size,
      activeMatches: activeMatchCount(),
      connectedPlayers: connectedPlayerCount(),
      activeConnections: websocketServer.clients.size,
      uptimeSeconds: Math.floor(process.uptime()),
      startedAt: new Date(serverStartedAt).toISOString(),
      heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (requestUrl.pathname === "/") {
    writeJson(response, 200, {
      service: "glix-server",
      status: "ready",
      websocket: DEFAULT_WS_PATH,
      version: serverVersion
    });
    return;
  }

  writeJson(response, 404, { ok: false, message: "Bulunamadı" });
}

function parseClientMessage(raw: string): ClientMessage | null {
  try {
    const value: unknown = JSON.parse(raw);

    if (!isRecord(value) || typeof value.type !== "string") {
      return null;
    }

    if (value.type === "client:hello" && typeof value.clientVersion === "string") {
      return { type: "client:hello", clientVersion: value.clientVersion };
    }

    if (
      value.type === "client:ping" &&
      typeof value.clientTime === "number" &&
      Number.isFinite(value.clientTime)
    ) {
      return { type: "client:ping", clientTime: value.clientTime };
    }

    if (value.type === "client:room:create" && typeof value.nickname === "string") {
      return { type: "client:room:create", nickname: value.nickname };
    }

    if (
      value.type === "client:room:join" &&
      typeof value.roomCode === "string" &&
      typeof value.nickname === "string" &&
      (value.resumeToken === undefined || typeof value.resumeToken === "string")
    ) {
      return {
        type: "client:room:join",
        roomCode: value.roomCode,
        nickname: value.nickname,
        ...(value.resumeToken === undefined ? {} : { resumeToken: value.resumeToken })
      };
    }

    if (
      value.type === "client:room:update-games" &&
      isGameSelectionMode(value.selectionMode) &&
      Array.isArray(value.selectedGameIds) &&
      value.selectedGameIds.every((gameId) => typeof gameId === "string") &&
      typeof value.randomGameCount === "number" &&
      Number.isFinite(value.randomGameCount)
    ) {
      return {
        type: "client:room:update-games",
        selectionMode: value.selectionMode,
        selectedGameIds: value.selectedGameIds as GameId[],
        randomGameCount: value.randomGameCount
      };
    }

    if (value.type === "client:room:start") {
      return { type: "client:room:start" };
    }

    if (value.type === "client:game:ready") {
      return { type: "client:game:ready" };
    }

    if (
      value.type === "client:game:submit" &&
      typeof value.clientTime === "number" &&
      Number.isFinite(value.clientTime) &&
      typeof value.actionId === "string" && value.actionId.length > 0 && value.actionId.length <= 80 &&
      typeof value.stateVersion === "number" && Number.isSafeInteger(value.stateVersion) && value.stateVersion >= 0 &&
      typeof value.phaseIndex === "number" && Number.isSafeInteger(value.phaseIndex) && value.phaseIndex >= 0 &&
      typeof value.actionScope === "string" && value.actionScope.length <= 240 &&
      "payload" in value &&
      isJsonValue(value.payload)
    ) {
      return {
        type: "client:game:submit",
        payload: value.payload,
        clientTime: value.clientTime,
        actionId: value.actionId,
        stateVersion: value.stateVersion,
        phaseIndex: value.phaseIndex,
        actionScope: value.actionScope
      };
    }

    if (value.type === "client:match:return-lobby") {
      return { type: "client:match:return-lobby" };
    }

    if (value.type === "client:room:leave") {
      return { type: "client:room:leave" };
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeNickname(
  value: string
): { value: string } | { code: "nickname_required" | "nickname_too_long"; message: string } {
  const nickname = value.trim().replace(/\s+/g, " ");

  if (nickname.length < MIN_NICKNAME_LENGTH) {
    return { code: "nickname_required", message: "Bir takma ad yazmalısın." };
  }

  if (nickname.length > MAX_NICKNAME_LENGTH) {
    return {
      code: "nickname_too_long",
      message: "Takma ad en fazla " + MAX_NICKNAME_LENGTH + " karakter olabilir."
    };
  }

  return { value: nickname };
}

function normalizeRoomCode(value: string): string | null {
  const roomCode = value.trim().toUpperCase();

  if (!new RegExp("^[A-Z0-9]{" + ROOM_CODE_LENGTH + "}$").test(roomCode)) {
    return null;
  }

  return roomCode;
}

function createRoomCode(): string {
  for (;;) {
    let roomCode = "";

    for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
      roomCode += roomCodeAlphabet[randomInt(roomCodeAlphabet.length)];
    }

    if (!rooms.has(roomCode)) {
      return roomCode;
    }
  }
}

function createPlayer(nickname: string): PlayerRecord {
  const reconnectToken = randomBytes(24).toString("base64url");

  return {
    id: randomUUID(),
    nickname,
    reconnectToken,
    joinedAt: Date.now(),
    score: 0,
    connected: false,
    socket: null,
    disconnectTimer: undefined
  };
}

function createRoom(player: PlayerRecord): RoomRecord {
  const room: RoomRecord = {
    code: createRoomCode(),
    createdAt: Date.now(),
    players: new Map([[player.id, player]]),
    hostPlayerId: player.id,
    selectionMode: "manual",
    selectedGameIds: GAME_CATALOG.map((game) => game.id),
    randomGameCount: DEFAULT_RANDOM_GAME_COUNT,
    match: null,
    idleTimer: undefined
  };

  rooms.set(room.code, room);
  sessionIndex.set(player.reconnectToken, { roomCode: room.code, playerId: player.id });
  return room;
}

function toLobbyState(room: RoomRecord): LobbyState {
  const players = [...room.players.values()]
    .sort((left, right) => left.joinedAt - right.joinedAt)
    .map((player) => ({
      id: player.id,
      nickname: player.nickname,
      score: player.score,
      connected: player.connected
    }));

  return {
    roomCode: room.code,
    hostPlayerId: room.hostPlayerId,
    players,
    selectedGameIds: [...room.selectedGameIds],
    selectionMode: room.selectionMode,
    randomGameCount: room.randomGameCount,
    phase: "lobby"
  };
}

function broadcastRoomState(room: RoomRecord): void {
  const state = toLobbyState(room);

  for (const player of room.players.values()) {
    if (!player.socket || !player.connected) {
      continue;
    }

    sendJson(player.socket, {
      type: "server:room-state",
      state,
      selfPlayerId: player.id,
      canManageGames: room.hostPlayerId === player.id
    });
  }
}

/**
 * Keeps the generic phase motor and a real mini-game adapter on the same
 * server clock. The adapter owns game rules inside `playing`; the phase motor
 * still owns tutorial, preparation, results and transition.
 */
function synchronizeMatchRuntime(room: RoomRecord, match: MatchRecord, now: number): boolean {
  let changed = false;
  const adapter = match.adapter;

  const adapterBeforeRoster = adapter ? JSON.stringify(adapter.getPublicState(now)) : null;
  adapter?.setConnectedPlayerIds?.(getConnectedPlayerIds(room), now);
  if (adapter && adapterBeforeRoster !== JSON.stringify(adapter.getPublicState(now))) changed = true;

  const phaseBefore = match.engine.snapshot(now);

  if (adapter && phaseBefore.phase === "playing") {
    if (!adapter.isStarted) {
      adapter.start(phaseBefore.phaseStartedAt);
      changed = true;
    }

    changed ||= adapter.advance(now);

    adapter.eliminatedPlayerIds.forEach((playerId) => {
      if (!match.engine.isEliminated(playerId)) {
        changed = match.engine.eliminatePlayer(playerId) || changed;
      }
    });

    if (adapter.isFinished && match.engine.currentPhaseDefinition?.advance === "manual") {
      match.engine.advanceManually(now);
      changed = true;
    }
  }

  const afterFirstAdvance = match.engine.advance(now);
  changed ||= phaseBefore.phaseIndex !== afterFirstAdvance.phaseIndex;

  if (adapter && afterFirstAdvance.phase === "playing" && !adapter.isStarted) {
    adapter.start(afterFirstAdvance.phaseStartedAt);
    changed = true;
    changed ||= adapter.advance(now);

    adapter.eliminatedPlayerIds.forEach((playerId) => {
      if (!match.engine.isEliminated(playerId)) {
        changed = match.engine.eliminatePlayer(playerId) || changed;
      }
    });

    if (adapter.isFinished && match.engine.currentPhaseDefinition?.advance === "manual") {
      match.engine.advanceManually(now);
      changed = true;
    }
  }

  return changed;
}

function getMatchSnapshot(room: RoomRecord, match: MatchRecord, now: number) {
  if (synchronizeMatchRuntime(room, match, now)) match.stateVersion += 1;
  const snapshot = match.engine.snapshot(now);
  const currentParticipantIds = new Set(match.engine.playerIds);
  const players = [...room.players.values()]
    .sort((left, right) => left.joinedAt - right.joinedAt)
    .map((player) => ({
      id: player.id,
      nickname: player.nickname,
      score: player.score,
      miniGameScore: match.miniGameScores.get(player.id) ?? 0,
      connected: player.connected,
      currentGameParticipant: currentParticipantIds.has(player.id),
      eliminated: snapshot.eliminatedPlayerIds.includes(player.id)
    }));

  const state: MatchState = {
    matchId: match.id,
    gameIds: [...match.gameIds],
    currentGameIndex: match.currentGameIndex,
    currentGameId: match.gameIds[match.currentGameIndex]!,
    phase: snapshot.phase,
    phaseIndex: snapshot.phaseIndex,
    phaseStartedAt: snapshot.phaseStartedAt,
    phaseEndsAt: snapshot.phaseEndsAt,
    serverNow: now,
    stateVersion: match.stateVersion,
    inputCount: snapshot.inputCount,
    readyPlayerIds: snapshot.readyPlayerIds,
    eliminatedPlayerIds: snapshot.eliminatedPlayerIds,
    gameState: (match.adapter?.getPublicState(now) ?? {
      gameId: match.gameIds[match.currentGameIndex]!,
      kind: "demo",
      phase: snapshot.phase,
      finished: snapshot.phase === "finished"
    }) as JsonValue,
    players
  };

  return { state, snapshot };
}

function sendMatchStateToPlayer(
  room: RoomRecord,
  match: MatchRecord,
  player: PlayerRecord,
  now: number
): void {
  if (!player.socket || !player.connected) {
    return;
  }

  const { state } = getMatchSnapshot(room, match, now);
  const currentGameParticipant = match.engine.playerIds.includes(player.id);
  const ownInputCount = currentGameParticipant
    ? match.engine.getVisibleInputs(player.id).length
    : 0;
  const ownGameState = currentGameParticipant
    ? match.adapter?.getOwnState(player.id, now) ?? null
    : null;
  const submissionStatus = deriveSubmissionStatus(match.gameIds[match.currentGameIndex]!, ownGameState as JsonValue | null, state.gameState, state.phase === "playing");
  const actionScope = deriveActionScope(match.gameIds[match.currentGameIndex]!, state.gameState);

  sendJson(player.socket, {
    type: "server:match-state",
    state,
    selfPlayerId: player.id,
    canManageMatch: room.hostPlayerId === player.id,
    ownInputCount,
    ownHasSubmitted: ownInputCount > 0,
    submissionStatus,
    actionScope,
    ownGameState: ownGameState as JsonValue | null
  });
}

function broadcastMatchState(room: RoomRecord, now = Date.now()): void {
  if (!room.match) {
    return;
  }

  for (const player of room.players.values()) {
    sendMatchStateToPlayer(room, room.match, player, now);
  }
}

function broadcastRoomSnapshot(room: RoomRecord): void {
  if (room.match) {
    broadcastMatchState(room);
    return;
  }

  broadcastRoomState(room);
}

function clearRoomIdleTimer(room: RoomRecord): void {
  if (room.idleTimer) {
    clearTimeout(room.idleTimer);
    room.idleTimer = undefined;
  }
}

function scheduleRoomCleanup(room: RoomRecord): void {
  clearRoomIdleTimer(room);

  if ([...room.players.values()].some((player) => player.connected)) {
    return;
  }

  room.idleTimer = setTimeout(() => {
    room.idleTimer = undefined;

    if (![...room.players.values()].some((player) => player.connected)) {
      deleteRoom(room);
    }
  }, ROOM_EMPTY_GRACE_MS);
}

function deleteRoom(room: RoomRecord): void {
  if (!rooms.has(room.code)) {
    return;
  }

  clearRoomIdleTimer(room);
  rooms.delete(room.code);
  room.match = null;

  for (const player of room.players.values()) {
    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      player.disconnectTimer = undefined;
    }

    sessionIndex.delete(player.reconnectToken);

    if (player.socket && player.connected) {
      sendJson(player.socket, {
        type: "server:room-left",
        roomCode: room.code,
        reason: "closed"
      });
      player.socket.close(1000, "Oda kapandı");
    }
  }
}

function chooseHost(room: RoomRecord): string | null {
  const connectedPlayer = [...room.players.values()]
    .filter((player) => player.connected)
    .sort((left, right) => left.joinedAt - right.joinedAt)[0];

  if (connectedPlayer) {
    return connectedPlayer.id;
  }

  const waitingPlayer = [...room.players.values()].sort(
    (left, right) => left.joinedAt - right.joinedAt
  )[0];

  return waitingPlayer?.id ?? null;
}

function removePlayer(room: RoomRecord, playerId: string): void {
  const player = room.players.get(playerId);

  if (!player) {
    return;
  }

  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
    player.disconnectTimer = undefined;
  }

  if (room.match) {
    room.match.engine.eliminatePlayer(playerId);
    room.match.adapter?.removePlayer(playerId);
    room.match.miniGameScores.delete(playerId);
    room.match.stateVersion += 1;
  }

  sessionIndex.delete(player.reconnectToken);
  room.players.delete(playerId);

  if (room.players.size === 0) {
    deleteRoom(room);
    return;
  }

  if (room.hostPlayerId === playerId) {
    room.hostPlayerId = chooseHost(room) ?? room.hostPlayerId;
  }

  broadcastRoomSnapshot(room);
  scheduleRoomCleanup(room);
}

function attachSocket(room: RoomRecord, player: PlayerRecord, socket: WebSocket): void {
  const wasConnected = player.connected;
  if (player.socket && player.socket !== socket) {
    const oldContext = socketContexts.get(player.socket);

    if (oldContext) {
      oldContext.playerId = undefined;
      oldContext.roomCode = undefined;
    }

    player.socket.close(4001, "Yeni bağlantı açıldı");
  }

  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
    player.disconnectTimer = undefined;
  }

  player.connected = true;
  player.socket = socket;
  clearRoomIdleTimer(room);

  const context = socketContexts.get(socket) ?? createSocketContext();
  context.playerId = player.id;
  context.roomCode = room.code;
  socketContexts.set(socket, context);
  if (room.match && !wasConnected) {
    synchronizeMatchRuntime(room, room.match, Date.now());
    room.match.stateVersion += 1;
  }
}

function sendSessionAndState(room: RoomRecord, player: PlayerRecord, socket: WebSocket): void {
  attachSocket(room, player, socket);

  sendJson(socket, {
    type: "server:session",
    playerId: player.id,
    reconnectToken: player.reconnectToken,
    roomCode: room.code
  });

  if (room.match) {
    broadcastMatchState(room);
  } else {
    broadcastRoomState(room);
  }
}

function schedulePlayerRemoval(room: RoomRecord, player: PlayerRecord): void {
  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
  }

  player.disconnectTimer = setTimeout(() => {
    player.disconnectTimer = undefined;

    if (!player.connected) {
      removePlayer(room, player.id);
    }
  }, ROOM_EMPTY_GRACE_MS);
}

function handleSocketClose(socket: WebSocket): void {
  const context = socketContexts.get(socket);

  if (!context?.roomCode || !context.playerId) {
    return;
  }

  const room = rooms.get(context.roomCode);
  const player = room?.players.get(context.playerId);

  if (!room || !player || player.socket !== socket) {
    return;
  }

  player.connected = false;
  player.socket = null;

  if (room.hostPlayerId === player.id) {
    const nextHost = chooseHost(room);

    if (nextHost) {
      room.hostPlayerId = nextHost;
    }
  }

  if (room.match) {
    synchronizeMatchRuntime(room, room.match, Date.now());
    room.match.stateVersion += 1;
  }

  broadcastRoomSnapshot(room);
  schedulePlayerRemoval(room, player);
  scheduleRoomCleanup(room);
}

function validateAndApplyGameSelection(
  room: RoomRecord,
  message: Extract<ClientMessage, { type: "client:room:update-games" }>,
  socket: WebSocket
): boolean {
  if (room.match) {
    sendError(socket, "match_in_progress", "Maç başladıktan sonra oyun rotası değiştirilemez.");
    return false;
  }

  if (!Number.isInteger(message.randomGameCount)) {
    sendError(socket, "invalid_random_count", "Rastgele oyun sayısı tam sayı olmalı.");
    return false;
  }

  const connectedPlayerIds = getConnectedPlayerIds(room);
  const maximumGameCount =
    message.selectionMode === "random"
      ? getAvailableGames(connectedPlayerIds.length).length
      : GAME_CATALOG.length;

  if (message.randomGameCount < 1 || message.randomGameCount > maximumGameCount) {
    const availableCount = maximumGameCount;
    sendError(
      socket,
      "invalid_random_count",
      "Bu oyuncu sayısında rastgele oyun sayısı 1 ile " + availableCount + " arasında olmalı."
    );
    return false;
  }

  const uniqueGameIds = [...new Set(message.selectedGameIds)];

  if (
    uniqueGameIds.length !== message.selectedGameIds.length ||
    uniqueGameIds.length > GAME_CATALOG.length ||
    uniqueGameIds.some((gameId) => !isGameId(gameId))
  ) {
    sendError(socket, "invalid_game_selection", "Oyun listesinde geçersiz veya tekrar eden oyun var.");
    return false;
  }

  if (message.selectionMode === "manual" && uniqueGameIds.length === 0) {
    sendError(socket, "invalid_game_selection", "Manuel seçimde en az bir mini oyun seçmelisin.");
    return false;
  }

  room.selectionMode = message.selectionMode;
  room.selectedGameIds = message.selectionMode === "manual" ? uniqueGameIds : [];
  room.randomGameCount = message.randomGameCount;
  broadcastRoomState(room);
  return true;
}

function sendRoomRequiredError(socket: WebSocket): void {
  sendError(socket, "room_required", "Önce bir odaya katılmalısın.");
}

function handleCreateRoom(socket: WebSocket, nicknameInput: string): void {
  const context = socketContexts.get(socket) ?? createSocketContext();

  if (context.playerId) {
    sendError(socket, "already_in_room", "Zaten bir odadasın. Önce odadan çıkmalısın.");
    return;
  }

  const nickname = normalizeNickname(nicknameInput);

  if ("code" in nickname) {
    sendError(socket, nickname.code, nickname.message);
    return;
  }

  const player = createPlayer(nickname.value);
  const room = createRoom(player);
  sendSessionAndState(room, player, socket);
}

function handleJoinRoom(
  socket: WebSocket,
  roomCodeInput: string,
  nicknameInput: string,
  resumeToken?: string
): void {
  const context = socketContexts.get(socket) ?? createSocketContext();

  if (context.playerId) {
    sendError(socket, "already_in_room", "Zaten bir odadasın. Önce odadan çıkmalısın.");
    return;
  }

  const roomCode = normalizeRoomCode(roomCodeInput);

  if (!roomCode) {
    sendError(socket, "room_code_invalid", "Oda kodu " + ROOM_CODE_LENGTH + " karakter olmalı.");
    return;
  }

  const room = rooms.get(roomCode);

  if (!room) {
    sendError(socket, "room_not_found", "Bu kodla açık bir oda bulunamadı.");
    return;
  }

  if (resumeToken) {
    const session = sessionIndex.get(resumeToken);
    const player =
      session && session.roomCode === roomCode ? room.players.get(session.playerId) : undefined;

    if (!session || !player) {
      sendError(socket, "resume_failed", "Oturum yeniden bulunamadı; odaya yeni oyuncu olarak katılabilirsin.");
      return;
    }

    sendSessionAndState(room, player, socket);
    return;
  }

  if (room.match) {
    sendError(socket, "match_in_progress", "Bu odada maç başladı; yeni oyuncu katılamaz.");
    return;
  }

  const nickname = normalizeNickname(nicknameInput);

  if ("code" in nickname) {
    sendError(socket, nickname.code, nickname.message);
    return;
  }

  if (room.players.size >= MAX_PLAYERS) {
    sendError(socket, "room_full", "Bu oda en fazla " + MAX_PLAYERS + " oyuncu alabilir.");
    return;
  }

  const player = createPlayer(nickname.value);
  room.players.set(player.id, player);
  sessionIndex.set(player.reconnectToken, { roomCode: room.code, playerId: player.id });

  if (!room.players.get(room.hostPlayerId)?.connected) {
    room.hostPlayerId = player.id;
  }

  sendSessionAndState(room, player, socket);
}

function handleLeaveRoom(socket: WebSocket): void {
  const context = socketContexts.get(socket);

  if (!context?.roomCode || !context.playerId) {
    sendRoomRequiredError(socket);
    return;
  }

  const room = rooms.get(context.roomCode);
  const player = room?.players.get(context.playerId);

  if (!room || !player) {
    context.playerId = undefined;
    context.roomCode = undefined;
    sendRoomRequiredError(socket);
    return;
  }

  const roomCode = room.code;
  context.playerId = undefined;
  context.roomCode = undefined;
  player.connected = false;
  player.socket = null;

  sendJson(socket, { type: "server:room-left", roomCode, reason: "left" });
  removePlayer(room, player.id);
}

type MatchSelectionResult =
  | { readonly gameIds: readonly GameId[] }
  | { readonly code: "invalid_game_selection" | "not_enough_players"; readonly message: string };

function resolveMatchGameIds(room: RoomRecord): MatchSelectionResult {
  const connectedPlayerIds = getConnectedPlayerIds(room);
  const availableGames = getAvailableGames(connectedPlayerIds.length);

  if (connectedPlayerIds.length < MIN_PLAYERS) {
    return {
      code: "not_enough_players",
      message: "Maçı başlatmak için en az " + MIN_PLAYERS + " bağlı oyuncu gerekli."
    };
  }

  if (room.selectionMode === "manual") {
    if (room.selectedGameIds.length === 0) {
      return {
        code: "invalid_game_selection",
        message: "Manuel seçimde en az bir mini oyun seçmelisin."
      };
    }

    const unavailable = room.selectedGameIds
      .map((gameId) => miniGameRegistry.get(gameId)?.game)
      .filter((game) => game && !availableGames.some((available) => available.id === game.id));

    if (unavailable.length > 0) {
      return {
        code: "invalid_game_selection",
        message: "Seçili oyunlardan bazıları mevcut oyuncu sayısı için uygun değil."
      };
    }

    return { gameIds: [...room.selectedGameIds] };
  }

  if (room.randomGameCount > availableGames.length) {
    return {
      code: "invalid_game_selection",
      message: "Bu oyuncu sayısıyla en fazla " + availableGames.length + " rastgele oyun seçilebilir."
    };
  }

  const pool = availableGames.map((game) => game.id as GameId);
  const gameIds: GameId[] = [];

  while (gameIds.length < room.randomGameCount && pool.length > 0) {
    const index = randomInt(pool.length);
    gameIds.push(pool.splice(index, 1)[0]!);
  }

  return { gameIds };
}

function createGameAdapter(
  gameId: GameId,
  playerIds: readonly string[]
): MatchRecord["adapter"] {
  return isStage6Game(gameId)
    ? createStage6GameAdapter(gameId, playerIds)
    : isStage7Game(gameId)
      ? createStage7GameAdapter(gameId, playerIds)
      : isStage8Game(gameId)
        ? createStage8GameAdapter(gameId, playerIds)
        : isStage9Game(gameId)
          ? createStage9GameAdapter(gameId, playerIds)
          : null;
}

function createMatch(room: RoomRecord, gameIds: readonly GameId[]): MatchRecord {
  const playerIds = getConnectedPlayerIds(room);
  const firstDefinition = miniGameRegistry.get(gameIds[0]!);

  if (!firstDefinition) {
    throw new Error("İlk mini oyun tanımı bulunamadı.");
  }

  const firstGameId = gameIds[0]!;
  const adapter = createGameAdapter(firstGameId, playerIds);

  return {
    id: randomUUID(),
    gameIds: [...gameIds],
    currentGameIndex: 0,
    engine: new MiniGameEngine(firstDefinition, playerIds, Date.now()),
    adapter,
    miniGameScores: new Map(),
    resultsApplied: false,
    stateVersion: 1,
    processedActionIds: new Set()
  };
}

function isPastResults(match: MatchRecord): boolean {
  const resultsIndex = match.engine.definition.phases.findIndex((phase) => phase.id === "results");
  return resultsIndex >= 0 && match.engine.snapshot(Date.now()).phaseIndex >= resultsIndex;
}

function applyMatchResult(room: RoomRecord, match: MatchRecord): boolean {
  if (match.resultsApplied || !isPastResults(match)) {
    return false;
  }

  if (match.adapter) {
    if (!match.adapter.isFinished) {
      return false;
    }

    for (const player of room.players.values()) {
      match.miniGameScores.set(player.id, match.adapter.getMiniGameScores().get(player.id) ?? 0);
    }

    for (const delta of match.adapter.getScoreDeltas()) {
      const player = room.players.get(delta.playerId);
      if (player) {
        player.score += delta.points;
      }
    }

    match.resultsApplied = true;
    return true;
  }

  const inputCounts = new Map<string, number>();

  for (const input of match.engine.getAllInputs()) {
    if (!input.empty) {
      inputCounts.set(input.playerId, (inputCounts.get(input.playerId) ?? 0) + 1);
    }
  }

  for (const player of room.players.values()) {
    const miniGameScore = inputCounts.get(player.id) ?? 0;
    match.miniGameScores.set(player.id, miniGameScore);

    // Unimplemented catalog games still use the motor probe scorer until their
    // own adapter is added in a later stage.
    player.score += miniGameScore;
  }

  match.resultsApplied = true;
  match.stateVersion += 1;
  return true;
}

function startNextGame(room: RoomRecord, match: MatchRecord, now: number): boolean {
  if (!match.engine.isFinished || match.currentGameIndex >= match.gameIds.length - 1) {
    return false;
  }

  const playerIds = getConnectedPlayerIds(room);
  let nextGameIndex = match.currentGameIndex + 1;

  while (nextGameIndex < match.gameIds.length) {
    const nextGameId = match.gameIds[nextGameIndex]!;
    const definition = miniGameRegistry.get(nextGameId);

    if (!definition) {
      throw new Error("Sıradaki mini oyun tanımı bulunamadı.");
    }

    if (
      playerIds.length < definition.game.minPlayers ||
      playerIds.length > definition.game.maxPlayers
    ) {
      nextGameIndex += 1;
      continue;
    }

    match.currentGameIndex = nextGameIndex;
    match.engine = new MiniGameEngine(definition, playerIds, now);
    match.adapter = createGameAdapter(nextGameId, playerIds);
    match.miniGameScores.clear();
    match.resultsApplied = false;
    return true;
  }

  // The current engine is already finished. Trim the unplayable tail so the
  // route stays on the last valid game without constructing an invalid one or
  // retrying the same transition on every ticker pass.
  match.gameIds.splice(match.currentGameIndex + 1);
  return true;
}

function advanceMatches(): void {
  const now = Date.now();

  for (const room of rooms.values()) {
    const match = room.match;

    if (!match) {
      continue;
    }

    let changed = synchronizeMatchRuntime(room, match, now);
    const scoreApplied = applyMatchResult(room, match);
    changed ||= scoreApplied;

    if (startNextGame(room, match, now)) {
      changed = true;
    }

    if (changed) {
      match.stateVersion += 1;
      broadcastMatchState(room, now);
    }
  }
}

function handleStartMatch(socket: WebSocket): void {
  const context = socketContexts.get(socket);

  if (!context?.roomCode || !context.playerId) {
    sendRoomRequiredError(socket);
    return;
  }

  const room = rooms.get(context.roomCode);

  if (!room) {
    sendRoomRequiredError(socket);
    return;
  }

  if (room.match) {
    sendError(socket, "match_in_progress", "Bu odada zaten devam eden bir maç var.");
    return;
  }

  if (room.hostPlayerId !== context.playerId) {
    sendError(socket, "not_host_to_start", "Maçı yalnızca oda yöneticisi başlatabilir.");
    return;
  }

  const selection = resolveMatchGameIds(room);

  if ("code" in selection) {
    sendError(socket, selection.code, selection.message);
    return;
  }

  room.match = createMatch(room, selection.gameIds);
  broadcastMatchState(room);
}

function handleGameReady(socket: WebSocket): void {
  const context = socketContexts.get(socket);

  if (!context?.roomCode || !context.playerId) {
    sendRoomRequiredError(socket);
    return;
  }

  const room = rooms.get(context.roomCode);
  const match = room?.match;

  if (!room || !match) {
    sendError(socket, "match_not_started", "Henüz aktif bir mini oyun yok.");
    return;
  }

  if (
    !match.engine.playerIds.includes(context.playerId) ||
    match.engine.isEliminated(context.playerId)
  ) {
    sendError(socket, "spectator", "Bu oyunda izleyicisin; hazır bildirimi gönderemezsin.");
    return;
  }

  if (!match.engine.markReady(context.playerId, Date.now())) {
    sendError(socket, "input_phase_locked", "Hazır bildirimi yalnızca hazırlanma aşamasında alınır.");
    return;
  }

  match.stateVersion += 1;
  broadcastMatchState(room);
}

function inputRejectionCode(
  reason: InputRejectionReason
): NonNullable<Extract<ServerMessage, { type: "server:game-input-ack" }>["reason"]> {
  switch (reason) {
    case "phase-locked":
      return "input_phase_locked";
    case "late":
      return "input_late";
    case "duplicate":
      return "input_duplicate";
    case "input-disabled":
      return "input_disabled";
    case "empty-not-allowed":
      return "input_empty_not_allowed";
    case "spectator":
      return "spectator";
    case "unknown-player":
      return "invalid_game_input";
  }
}

function stage6InputRejectionCode(
  reason: Stage6InputRejection
): NonNullable<Extract<ServerMessage, { type: "server:game-input-ack" }>['reason']> {
  switch (reason) {
    case "phase-locked":
      return "input_phase_locked";
    case "late":
      return "input_late";
    case "duplicate":
      return "input_duplicate";
    case "spectator":
      return "spectator";
    case "invalid":
      return "invalid_game_input";
  }
}

function stage7InputRejectionCode(
  reason: Stage7InputRejection
): NonNullable<Extract<ServerMessage, { type: "server:game-input-ack" }>["reason"]> {
  switch (reason) {
    case "phase-locked":
      return "input_phase_locked";
    case "late":
      return "input_late";
    case "duplicate":
      return "input_duplicate";
    case "spectator":
      return "spectator";
    case "invalid":
      return "invalid_game_input";
  }
}

function stage8InputRejectionCode(
  reason: Stage8InputRejection
): NonNullable<Extract<ServerMessage, { type: "server:game-input-ack" }>["reason"]> {
  switch (reason) {
    case "phase-locked":
      return "input_phase_locked";
    case "late":
      return "input_late";
    case "duplicate":
      return "input_duplicate";
    case "spectator":
      return "spectator";
    case "invalid":
      return "invalid_game_input";
  }
}

function stage9InputRejectionCode(
  reason: Stage9InputRejection
): NonNullable<Extract<ServerMessage, { type: "server:game-input-ack" }>['reason']> {
  switch (reason) {
    case "phase-locked":
      return "input_phase_locked";
    case "late":
      return "input_late";
    case "duplicate":
      return "input_duplicate";
    case "spectator":
      return "spectator";
    case "invalid":
      return "invalid_game_input";
  }
}

function handleGameSubmit(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "client:game:submit" }>
): void {
  const context = socketContexts.get(socket);
  const now = Date.now();

  if (!context?.roomCode || !context.playerId) {
    sendRoomRequiredError(socket);
    return;
  }

  const room = rooms.get(context.roomCode);
  const match = room?.match;
  let publishRuntimeTransition = false;
  const reject = (reason: NonNullable<Extract<ServerMessage, { type: "server:game-input-ack" }>["reason"]>): void => {
    sendJson(socket, { type: "server:game-input-ack", accepted: false, serverTime: now, actionId: message.actionId, stateVersion: match?.stateVersion ?? 0, reason });
    if (publishRuntimeTransition && room && match) broadcastMatchState(room, now);
  };

  if (!room || !match) {
    reject("invalid_game_input");
    sendError(socket, "match_not_started", "Henüz aktif bir mini oyun yok.");
    return;
  }

  if (
    !match.engine.playerIds.includes(context.playerId) ||
    match.engine.isEliminated(context.playerId)
  ) {
    reject("spectator");
    return;
  }

  publishRuntimeTransition = synchronizeMatchRuntime(room, match, now);
  if (publishRuntimeTransition) match.stateVersion += 1;

  const currentGameState = match.adapter?.getPublicState(now) as unknown as JsonValue | null;
  if (message.stateVersion > match.stateVersion || message.phaseIndex !== match.engine.snapshot(now).phaseIndex || message.actionScope !== deriveActionScope(match.gameIds[match.currentGameIndex]!, currentGameState)) {
    reject("invalid_game_input");
    return;
  }

  const actionFenceKey = `${context.playerId}:${message.actionId}`;
  if (match.processedActionIds.has(actionFenceKey)) {
    reject("input_duplicate");
    return;
  }
  match.processedActionIds.add(actionFenceKey);

  if (!submittedTargetsAreLive(room, match, message.payload)) {
    reject("invalid_game_input");
    return;
  }

  const prepared = match.engine.prepareInput(context.playerId, message.payload, now, message.clientTime);
  if (!prepared.accepted) {
    reject(inputRejectionCode(prepared.reason));
    return;
  }

  if (match.adapter) {
    const adapterResult = match.adapter.submit(context.playerId, message.payload, now);

    if (!adapterResult.accepted) {
      reject(isStage6Game(match.adapter.gameId)
          ? stage6InputRejectionCode(adapterResult.reason)
          : isStage7Game(match.adapter.gameId)
            ? stage7InputRejectionCode(adapterResult.reason)
            : isStage8Game(match.adapter.gameId)
              ? stage8InputRejectionCode(adapterResult.reason)
              : stage9InputRejectionCode(adapterResult.reason));
      return;
    }
  }

  const record = match.engine.commitPreparedInput(prepared.prepared);

  match.stateVersion += 1;
  synchronizeMatchRuntime(room, match, now);
  applyMatchResult(room, match);
  sendJson(socket, {
    type: "server:game-input-ack",
    accepted: true,
    serverTime: now,
    actionId: message.actionId,
    stateVersion: match.stateVersion,
    inputSequence: record.sequence
  });
  broadcastMatchState(room, now);
}

function handleReturnToLobby(socket: WebSocket): void {
  const context = socketContexts.get(socket);

  if (!context?.roomCode || !context.playerId) {
    sendRoomRequiredError(socket);
    return;
  }

  const room = rooms.get(context.roomCode);

  if (!room?.match) {
    sendError(socket, "match_not_started", "Aktif veya tamamlanmış bir maç yok.");
    return;
  }

  if (room.hostPlayerId !== context.playerId) {
    sendError(socket, "not_host_to_start", "Lobiye yalnızca oda yöneticisi döndürebilir.");
    return;
  }

  if (!room.match.engine.isFinished) {
    sendError(socket, "match_in_progress", "Maç bitmeden lobiye dönülemez.");
    return;
  }

  room.match = null;

  for (const player of room.players.values()) {
    player.score = 0;
  }

  broadcastRoomState(room);
}

function handleMessage(socket: WebSocket, message: ClientMessage): void {
  if (message.type === "client:hello") {
    const context = socketContexts.get(socket) ?? createSocketContext();
    context.clientVersion = message.clientVersion;
    socketContexts.set(socket, context);
    return;
  }

  if (message.type === "client:ping") {
    sendJson(socket, {
      type: "server:pong",
      clientTime: message.clientTime,
      serverTime: Date.now()
    });
    return;
  }

  if (message.type === "client:room:create") {
    handleCreateRoom(socket, message.nickname);
    return;
  }

  if (message.type === "client:room:join") {
    handleJoinRoom(socket, message.roomCode, message.nickname, message.resumeToken);
    return;
  }

  if (message.type === "client:room:update-games") {
    const context = socketContexts.get(socket);

    if (!context?.roomCode || !context.playerId) {
      sendRoomRequiredError(socket);
      return;
    }

    const room = rooms.get(context.roomCode);

    if (!room) {
      sendRoomRequiredError(socket);
      return;
    }

    if (room.hostPlayerId !== context.playerId) {
      sendError(socket, "not_host", "Mini oyun listesini yalnızca oda yöneticisi değiştirebilir.");
      return;
    }

    validateAndApplyGameSelection(room, message, socket);
    return;
  }

  if (message.type === "client:room:start") {
    handleStartMatch(socket);
    return;
  }

  if (message.type === "client:game:ready") {
    handleGameReady(socket);
    return;
  }

  if (message.type === "client:game:submit") {
    handleGameSubmit(socket, message);
    return;
  }

  if (message.type === "client:match:return-lobby") {
    handleReturnToLobby(socket);
    return;
  }

  if (message.type === "client:room:leave") {
    handleLeaveRoom(socket);
    return;
  }

  sendError(socket, "unsupported_message", "Bu mesaj türü henüz desteklenmiyor.");
}

function checkWebSocketHeartbeats(): void {
  if (isShuttingDown) {
    return;
  }

  for (const socket of websocketServer.clients) {
    if (socket.readyState !== WebSocket.OPEN) {
      continue;
    }

    if (socketHeartbeat.get(socket) === false) {
      console.warn("[glix-server] WebSocket heartbeat yanıtı alınamadı, soket sonlandırılıyor.");
      socket.terminate();
      continue;
    }

    socketHeartbeat.set(socket, false);

    try {
      socket.ping();
    } catch (error) {
      console.warn("[glix-server] WebSocket ping hatası:", error);
      socket.terminate();
    }
  }
}

function closeSocketForShutdown(socket: WebSocket): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.close(1001, "Sunucu kapatılıyor");
  } else if (socket.readyState === WebSocket.CONNECTING) {
    socket.terminate();
  }
}

const httpServer = createServer(handleHttp);
const websocketServer = new WebSocketServer({ server: httpServer, path: DEFAULT_WS_PATH });
const matchTicker = setInterval(advanceMatches, 100);
const heartbeatTimer = setInterval(checkWebSocketHeartbeats, HEARTBEAT_INTERVAL_MS);

matchTicker.unref();
heartbeatTimer.unref();

websocketServer.on("connection", (socket) => {
  socketContexts.set(socket, createSocketContext());
  socketHeartbeat.set(socket, true);

  if (isShuttingDown) {
    closeSocketForShutdown(socket);
    return;
  }

  sendJson(socket, {
    type: "server:ready",
    serverVersion,
    protocolVersion: PROTOCOL_VERSION
  });

  socket.on("message", (data: RawData) => {
    if (isShuttingDown) {
      closeSocketForShutdown(socket);
      return;
    }

    const message = parseClientMessage(data.toString());

    if (!message) {
      sendError(socket, "invalid_message", "Geçersiz mesaj biçimi.");
      return;
    }

    handleMessage(socket, message);
  });

  socket.on("pong", () => socketHeartbeat.set(socket, true));

  socket.on("error", (error) => {
    console.warn("[glix-server] WebSocket bağlantı hatası:", error);

    if (socket.readyState !== WebSocket.CLOSED) {
      socket.terminate();
    }
  });

  socket.on("close", () => {
    socketHeartbeat.delete(socket);
    handleSocketClose(socket);
  });
});

httpServer.listen(port, host, () => {
  console.log("[glix-server] http://127.0.0.1:" + port);
  console.log("[glix-server] ws://127.0.0.1:" + port + DEFAULT_WS_PATH);
});

function finishShutdown(exitCode: number): void {
  if (shutdownTimer) {
    clearTimeout(shutdownTimer);
    shutdownTimer = undefined;
  }

  process.exit(exitCode);
}

function shutdown(signal: string): void {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log("[glix-server] " + signal + " alındı, kapatılıyor.");
  clearInterval(matchTicker);
  clearInterval(heartbeatTimer);

  for (const room of rooms.values()) {
    deleteRoom(room);
  }

  for (const socket of websocketServer.clients) {
    closeSocketForShutdown(socket);
  }

  let websocketClosed = false;
  let httpClosed = false;

  const maybeFinish = (): void => {
    if (websocketClosed && httpClosed) {
      finishShutdown(0);
    }
  };

  shutdownTimer = setTimeout(() => {
    console.warn("[glix-server] Kapanış süresi aşıldı, açık soketler sonlandırılıyor.");

    for (const socket of websocketServer.clients) {
      socket.terminate();
    }

    finishShutdown(1);
  }, SHUTDOWN_TIMEOUT_MS);
  shutdownTimer.unref();

  websocketServer.close((error) => {
    if (error && (error as NodeJS.ErrnoException).code !== "ERR_SERVER_NOT_RUNNING") {
      console.error("[glix-server] WebSocket sunucusu kapanış hatası:", error);
    }

    websocketClosed = true;
    maybeFinish();
  });

  httpServer.close((error) => {
    if (error && (error as NodeJS.ErrnoException).code !== "ERR_SERVER_NOT_RUNNING") {
      console.error("[glix-server] HTTP sunucusu kapanış hatası:", error);
    }

    httpClosed = true;
    maybeFinish();
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
