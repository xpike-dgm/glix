import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";
import {
  GAME_CATALOG,
  DEFAULT_WS_PATH,
  MAX_NICKNAME_LENGTH,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PROTOCOL_VERSION,
  ROOM_CODE_LENGTH,
  getAvailableGames,
  getConnectedPlayerCount,
  getGameDefinition,
  reduceClientActionState,
  type ClientMessage,
  type GameId,
  type GameDefinition,
  type JsonValue,
  type LobbyState,
  type MatchState,
  type ServerMessage,
  type Stage6GameId,
  type Stage7GameId,
  type Stage8GameId,
  type Stage9GameId,
  type KontrolPaneliPublicState,
  type KontrolPaneliOwnState,
  type KendimPublicState,
  type KendimOwnState,
  type ClientActionState,
  type SubmissionStatus
} from "@glix/shared";
import { GameHUD } from "./visuals/hud/GameHUD";
import { HomeScreen } from "./visuals/home/HomeScreen";
import { RoomEntryScreen } from "./visuals/home/RoomEntryScreen";
import { LobbyScreen } from "./visuals/lobby/LobbyScreen";
import { ResultOverlay } from "./visuals/overlays/ResultOverlay";
import { SpectatorOverlay } from "./visuals/overlays/SpectatorOverlay";
import { TutorialOverlay } from "./visuals/overlays/TutorialOverlay";
import { GameViewport } from "./visuals/viewport/GameViewport";
import { PremiumStageHero } from "./visuals/stage/PremiumStageHero";
import { isStage11BGameId, Stage11BStage } from "./visuals/games/stage11-8b/Stage11BStage";
import { preloadPremiumBrandAssets, preloadPremiumGamePack } from "./visuals/visualAssetManifest";
import { pwaService } from "./pwa";
import { safeLazy, preloadGameStage, preloadNextScheduledGame, StageLoadingFallback } from "./lazyPreload";

const LazyStage11AStage = lazy(safeLazy(() => import("./visuals/games/Stage11ATimingPressureStage").then((m) => ({ default: m.Stage11ATimingPressureStage }))));
const LazyStage11CStage = lazy(safeLazy(() => import("./visuals/games/stage11c/Stage11CStage").then((m) => ({ default: m.Stage11CStage }))));
const LazyStage11DStage = lazy(safeLazy(() => import("./visuals/games/stage11-8d/Stage11DStage").then((m) => ({ default: m.Stage11DStage }))));



const LazyKpkStage = lazy(safeLazy(() => import("./visuals/games/kontrol-paneli-kaosu/KpkStage").then((m) => ({ default: m.KpkStage }))));
const LazyKendimStage = lazy(safeLazy(() => import("./visuals/games/kendim/KendimStage").then((m) => ({ default: m.KendimStage }))));
const LazyStage6GameControls = lazy(safeLazy(() => import("./games/Stage6GameControls").then((m) => ({ default: m.Stage6GameControls }))));
const LazyStage7GameControls = lazy(safeLazy(() => import("./games/Stage7GameControls").then((m) => ({ default: m.Stage7GameControls }))));
const LazyStage8GameControls = lazy(safeLazy(() => import("./games/Stage8GameControls").then((m) => ({ default: m.Stage8GameControls }))));
const LazyStage9GameControls = lazy(safeLazy(() => import("./games/Stage9GameControls").then((m) => ({ default: m.Stage9GameControls }))));


type ConnectionState = "connecting" | "connected" | "offline";
type Screen = "home" | "create" | "join" | "lobby" | "match";

const CLIENT_VERSION = "0.7.0";

function resolveWebSocketUrl(): string {
  const configuredUrl = import.meta.env.VITE_WS_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  if (import.meta.env.DEV) {
    return `ws://${window.location.hostname}:8787${DEFAULT_WS_PATH}`;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${DEFAULT_WS_PATH}`;
}

const wsUrl = resolveWebSocketUrl();
const STORAGE_KEYS = {
  nickname: "glix:nickname",
  roomCode: "glix:room-code",
  resumeToken: "glix:resume-token"
} as const;

function readStoredValue(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeStoredValue(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Local storage is an enhancement; the lobby still works without it.
  }
}

function removeStoredValue(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Local storage is an enhancement; the lobby still works without it.
  }
}

function isServerMessage(value: unknown): value is ServerMessage {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      typeof value.type === "string" &&
      value.type.startsWith("server:")
  );
}

function connectionLabel(connection: ConnectionState): string {
  if (connection === "connected") {
    return "BAĞLI";
  }

  if (connection === "connecting") {
    return "BAĞLANIYOR";
  }

  return "BAĞLANTI YOK";
}

function isStage6GameId(gameId: GameId): gameId is Stage6GameId {
  return gameId === "butona-bas" || gameId === "sizma" || gameId === "zaman-bombasi-hafizasi";
}

function isStage7GameId(gameId: GameId): gameId is Stage7GameId {
  return gameId === "gizli-hirsiz" || gameId === "kor-kronometre" || gameId === "kor-bomba" || gameId === "acgozluluk-limiti" || gameId === "ortalamanin-yarisi" || gameId === "gizli-kareler" || gameId === "cizgiyi-gecme" || gameId === "gizli-alisveris" || gameId === "asiri-yukleme" || gameId === "capraz-ates";
}

function isStage8GameId(gameId: GameId): gameId is Stage8GameId {
  return gameId === "yazi-yaz" || gameId === "kendim" || gameId === "sozluk-blofu" || gameId === "cagrisim-agi" || gameId === "rusvet-darbe" || gameId === "karalama-defteri" || gameId === "ittifak" || gameId === "kontrol-paneli-kaosu" || gameId === "zehirli-kadeh";
}

function isStage9GameId(gameId: GameId): gameId is Stage9GameId {
  return gameId === "rus-ruleti" || gameId === "son-kisi";
}

type Stage11AGameId = Extract<
  GameId,
  "butona-bas" | "gizli-hirsiz" | "kor-kronometre" | "asiri-yukleme" | "son-kisi"
>;

function isStage11AGameId(gameId: GameId): gameId is Stage11AGameId {
  return (
    gameId === "butona-bas" ||
    gameId === "gizli-hirsiz" ||
    gameId === "kor-kronometre" ||
    gameId === "asiri-yukleme" ||
    gameId === "son-kisi"
  );
}

type Stage11CGameId = Extract<
  GameId,
  "acgozluluk-limiti" | "ortalamanin-yarisi" | "gizli-kareler" | "cizgiyi-gecme" | "gizli-alisveris"
>;

function isStage11CGameId(gameId: GameId): gameId is Stage11CGameId {
  return (
    gameId === "acgozluluk-limiti" ||
    gameId === "ortalamanin-yarisi" ||
    gameId === "gizli-kareler" ||
    gameId === "cizgiyi-gecme" ||
    gameId === "gizli-alisveris"
  );
}

type Stage11DGameId = Extract<
  GameId,
  "yazi-yaz" | "sozluk-blofu" | "cagrisim-agi" | "rusvet-darbe" | "karalama-defteri" | "ittifak"
>;

function isStage11DGameId(gameId: GameId): gameId is Stage11DGameId {
  return (
    gameId === "yazi-yaz" ||
    gameId === "sozluk-blofu" ||
    gameId === "cagrisim-agi" ||
    gameId === "rusvet-darbe" ||
    gameId === "karalama-defteri" ||
    gameId === "ittifak"
  );
}

function App(): JSX.Element {
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [serverVersion, setServerVersion] = useState("—");
  const [screen, setScreen] = useState<Screen>("home");
  const [nickname, setNickname] = useState(() => readStoredValue(STORAGE_KEYS.nickname));
  const [roomCodeInput, setRoomCodeInput] = useState(() => readStoredValue(STORAGE_KEYS.roomCode));
  const [roomState, setRoomState] = useState<LobbyState | null>(null);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [selfPlayerId, setSelfPlayerId] = useState<string | null>(null);
  const [canManageGames, setCanManageGames] = useState(false);
  const [ownHasSubmitted, setOwnHasSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({ mode: "none", canAct: false, completed: false, acceptedActionCount: 0, locked: true });
  const [ownGameState, setOwnGameState] = useState<JsonValue | null>(null);
  const [clockOffset, setClockOffset] = useState(0);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ClientActionState | null>(null);
  const [protocolMismatch, setProtocolMismatch] = useState<{
    serverProtocol: number;
    clientProtocol: number;
    serverVersion: string;
  } | null>(null);
  const [hasPwaUpdate, setHasPwaUpdate] = useState(() => pwaService.hasUpdate);
  const [isOffline, setIsOffline] = useState(() => pwaService.isOffline);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | undefined>(undefined);
  const handshakeTimeoutRef = useRef<number | undefined>(undefined);
  const reconnectAttemptRef = useRef(0);
  const nicknameRef = useRef(nickname);
  const roomCodeRef = useRef(roomCodeInput);
  const resumeTokenRef = useRef(readStoredValue(STORAGE_KEYS.resumeToken));
  const actionSequenceRef = useRef(0);
  const actionClientInstanceRef = useRef(crypto.randomUUID());
  const sessionScopeRef = useRef("boot");
  const latestMatchRef = useRef<{ matchId: string; stateVersion: number; actionScope: string } | null>(null);
  const protocolMismatchRef = useRef(false);
  const pongSamplesRef = useRef<number[]>([]);

  useEffect(() => {
    return pwaService.subscribe(() => {
      setHasPwaUpdate(pwaService.hasUpdate);
      setIsOffline(pwaService.isOffline);
    });
  }, []);

  useEffect(() => {
    void preloadPremiumBrandAssets();
  }, []);

  useEffect(() => {
    if (matchState?.currentGameId) {
      void preloadPremiumGamePack(matchState.currentGameId);
      preloadGameStage(matchState.currentGameId);
      preloadNextScheduledGame(matchState.gameIds, matchState.currentGameIndex);
    }
  }, [matchState?.currentGameId, matchState?.currentGameIndex, matchState?.gameIds]);

  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    nicknameRef.current = nickname;
  }, [nickname]);

  useEffect(() => {
    roomCodeRef.current = roomCodeInput;
  }, [roomCodeInput]);

  useEffect(() => {
    let active = true;

    const scheduleReconnect = (): void => {
      if (!active || protocolMismatchRef.current || reconnectTimerRef.current !== undefined) {
        return;
      }

      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(750 * 2 ** Math.min(attempt, 3), 5_000);
      reconnectAttemptRef.current += 1;
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = undefined;
        openSocket();
      }, delay);
    };

    const openSocket = (): void => {
      if (!active || protocolMismatchRef.current) {
        return;
      }

      setConnection("connecting");
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        if (!active || protocolMismatchRef.current) {
          return;
        }

        reconnectAttemptRef.current = 0;
        setError(null);

        // Handshake timeout: wait up to 5000ms for server:ready
        handshakeTimeoutRef.current = window.setTimeout(() => {
          if (socket.readyState === WebSocket.OPEN) {
            console.warn("[glix-client] Handshake timeout waiting for server:ready");
            socket.close(1000, "handshake_timeout");
            setConnection("offline");
            setError("Sunucu el sıkışma zaman aşımı.");
            scheduleReconnect();
          }
        }, 5000);
      });

      socket.addEventListener("message", (event) => {
        try {
          const value: unknown = JSON.parse(String(event.data));

          if (!isServerMessage(value)) {
            setError("Oyun bağlantısından beklenmeyen bir yanıt geldi.");
            return;
          }

          if (value.type === "server:ready") {
            if (handshakeTimeoutRef.current !== undefined) {
              window.clearTimeout(handshakeTimeoutRef.current);
              handshakeTimeoutRef.current = undefined;
            }

            const readyMsg = value as { serverVersion?: unknown; protocolVersion?: unknown };
            const serverProto = typeof readyMsg.protocolVersion === "number" ? readyMsg.protocolVersion : -1;
            const srvVer = typeof readyMsg.serverVersion === "string" ? readyMsg.serverVersion : "—";

            if (serverProto !== PROTOCOL_VERSION) {
              console.warn(`[glix-client] Protocol mismatch: server v${serverProto} !== client v${PROTOCOL_VERSION}`);
              setProtocolMismatch({
                serverProtocol: serverProto,
                clientProtocol: PROTOCOL_VERSION,
                serverVersion: srvVer
              });
              protocolMismatchRef.current = true;
              if (reconnectTimerRef.current !== undefined) {
                window.clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = undefined;
              }
              socket.close(1000, "protocol_mismatch");
              setConnection("offline");
              return;
            }

            // Compatible protocol!
            setConnection("connected");
            setServerVersion(srvVer);
            socket.send(JSON.stringify({ type: "client:hello", clientVersion: CLIENT_VERSION }));

            const storedRoomCode = roomCodeRef.current.trim();
            const storedNickname = nicknameRef.current.trim();
            const storedResumeToken = resumeTokenRef.current;

            if (storedRoomCode && storedNickname && storedResumeToken) {
              socket.send(
                JSON.stringify({
                  type: "client:room:join",
                  roomCode: storedRoomCode,
                  nickname: storedNickname,
                  resumeToken: storedResumeToken
                })
              );
            }
            return;
          }

          if (value.type === "server:pong") {
            const clientTime = typeof value.clientTime === "number" ? value.clientTime : 0;
            const serverTime = typeof value.serverTime === "number" ? value.serverTime : 0;
            if (clientTime > 0 && serverTime > 0) {
              const now = Date.now();
              const rtt = now - clientTime;
              if (rtt >= 0 && rtt < 1500) {
                const sampleOffset = serverTime + (rtt / 2) - now;
                pongSamplesRef.current.push(sampleOffset);
                if (pongSamplesRef.current.length > 7) {
                  pongSamplesRef.current.shift();
                }
                const sorted = [...pongSamplesRef.current].sort((a, b) => a - b);
                const medianOffset = sorted[Math.floor(sorted.length / 2)];
                if (typeof medianOffset === "number") {
                  setClockOffset(medianOffset);
                }
              }
            }

            return;
          }

          if (value.type === "server:session") {
            setSelfPlayerId(value.playerId);
            resumeTokenRef.current = value.reconnectToken;
            roomCodeRef.current = value.roomCode;
            setRoomCodeInput(value.roomCode);
            writeStoredValue(STORAGE_KEYS.resumeToken, value.reconnectToken);
            writeStoredValue(STORAGE_KEYS.roomCode, value.roomCode);
            sessionScopeRef.current = value.reconnectToken;
            setActionState(null);
            return;
          }

          if (value.type === "server:room-state") {
            setRoomState(value.state);
            setMatchState(null);
            setSelfPlayerId(value.selfPlayerId);
            setCanManageGames(value.canManageGames);
            setOwnHasSubmitted(false);
            setOwnGameState(null);
            setRoomCodeInput(value.state.roomCode);
            roomCodeRef.current = value.state.roomCode;
            setScreen("lobby");
            setError(null);
            return;
          }

          if (value.type === "server:match-state") {
            const latest = latestMatchRef.current;
            if (latest?.matchId === value.state.matchId && value.state.stateVersion < latest.stateVersion) return;
            latestMatchRef.current = { matchId: value.state.matchId, stateVersion: value.state.stateVersion, actionScope: value.actionScope };
            setMatchState(value.state);
            setRoomState(null);
            setSelfPlayerId(value.selfPlayerId);
            setCanManageGames(value.canManageMatch);
            setOwnHasSubmitted(value.ownHasSubmitted);
            setSubmissionStatus(value.submissionStatus);
            setOwnGameState(value.ownGameState);
            setClockOffset(value.state.serverNow - Date.now());
            setScreen("match");
            setError(null);
            setNotice(null);
            const self = value.state.players.find((player) => player.id === value.selfPlayerId);
            setActionState((current) => reduceClientActionState(current, {
              type: "scope",
              scope: { matchId: value.state.matchId, gameId: value.state.currentGameId, phaseIndex: value.state.phaseIndex, actionScope: value.actionScope, sessionId: sessionScopeRef.current, spectator: !self?.currentGameParticipant || Boolean(self.eliminated) },
              stateVersion: value.state.stateVersion,
              mode: value.submissionStatus.mode,
              completed: value.submissionStatus.completed
            }));
            return;
          }

          if (value.type === "server:game-input-ack") {
            if (latestMatchRef.current && value.stateVersion > latestMatchRef.current.stateVersion) {
              latestMatchRef.current = { ...latestMatchRef.current, stateVersion: value.stateVersion };
            }
            setActionState((current) => current ? reduceClientActionState(current, { type: "ack", actionId: value.actionId, accepted: value.accepted, stateVersion: value.stateVersion, ...(value.reason ? { reason: value.reason } : {}) }) : current);

            if (value.accepted) {
              setNotice("GLIX sahne hamleni kaydetti." + (value.inputSequence ? " #" + value.inputSequence : ""));
              return;
            }

            const inputMessages: Record<string, string> = {
              input_phase_locked: "Bu fazda hamle gönderemezsin.",
              input_late: "Hamle süresi doldu.",
              input_duplicate: "Bu fazda yalnızca bir hamle gönderebilirsin.",
              input_disabled: "Bu faz hamle kabul etmiyor.",
              input_empty_not_allowed: "Boş hamle kabul edilmiyor.",
              spectator: "Elendin; artık yalnızca izleyicisin.",
              invalid_game_input: "Hamle kabul edilmedi."
            };
            setError(inputMessages[value.reason ?? "invalid_game_input"] ?? "Hamle kabul edilmedi.");
            return;
          }

          if (value.type === "server:room-left") {
            setRoomState(null);
            setMatchState(null);
            setSelfPlayerId(null);
            setCanManageGames(false);
            setOwnHasSubmitted(false);
            setOwnGameState(null);
            setScreen("home");
            setError(null);
            setNotice(
              value.reason === "left"
                ? "Odadan ayrıldın."
                : value.reason === "kicked"
                  ? "Odadan çıkarıldın."
                  : "Oda kapatıldı."
            );
            resumeTokenRef.current = "";
            roomCodeRef.current = "";
            removeStoredValue(STORAGE_KEYS.resumeToken);
            removeStoredValue(STORAGE_KEYS.roomCode);
            return;
          }

          if (value.type === "server:error") {
            setError(value.message);

            if (value.code === "room_not_found" || value.code === "resume_failed") {
              resumeTokenRef.current = "";
              roomCodeRef.current = "";
              removeStoredValue(STORAGE_KEYS.resumeToken);
              removeStoredValue(STORAGE_KEYS.roomCode);
              setRoomState(null);
              setSelfPlayerId(null);
              setCanManageGames(false);
              setScreen("join");
            }
          }
        } catch {
          setError("Oyun bağlantısından okunamayan bir yanıt geldi.");
        }
      });

      socket.addEventListener("error", () => {
        if (handshakeTimeoutRef.current !== undefined) {
          window.clearTimeout(handshakeTimeoutRef.current);
          handshakeTimeoutRef.current = undefined;
        }
        if (active) {
          setConnection("offline");
        }
      });

      socket.addEventListener("close", () => {
        if (handshakeTimeoutRef.current !== undefined) {
          window.clearTimeout(handshakeTimeoutRef.current);
          handshakeTimeoutRef.current = undefined;
        }
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (active) {
          setConnection("offline");
          if (!protocolMismatchRef.current) {
            scheduleReconnect();
          }
        }
      });
    };

    const heartbeatTimer = window.setInterval(() => {
      const socket = socketRef.current;

      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "client:ping", clientTime: Date.now() }));
      }
    }, 10_000);

    const handleOnline = (): void => {
      const socket = socketRef.current;

      if (!socket || socket.readyState === WebSocket.CLOSED) {
        scheduleReconnect();
      }
    };

    window.addEventListener("online", handleOnline);
    openSocket();

    return () => {
      active = false;
      window.clearInterval(heartbeatTimer);
      window.removeEventListener("online", handleOnline);

      if (handshakeTimeoutRef.current !== undefined) {
        window.clearTimeout(handshakeTimeoutRef.current);
        handshakeTimeoutRef.current = undefined;
      }

      if (reconnectTimerRef.current !== undefined) {
        window.clearTimeout(reconnectTimerRef.current);
      }

      reconnectTimerRef.current = undefined;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = (message: ClientMessage): boolean => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("Oyun bağlantısı hazır değil. Birkaç saniye sonra tekrar dene.");
      return false;
    }

    socket.send(JSON.stringify(message));
    return true;
  };

  const clearFormError = (): void => {
    setError(null);
    setNotice(null);
  };

  const handleCreateRoom = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const normalizedNickname = nickname.trim();

    if (!normalizedNickname) {
      setError("Bir takma ad yazmalısın.");
      return;
    }

    nicknameRef.current = normalizedNickname;
    setNickname(normalizedNickname);
    writeStoredValue(STORAGE_KEYS.nickname, normalizedNickname);
    setError(null);

    sendMessage({ type: "client:room:create", nickname: normalizedNickname });
  };

  const handleJoinRoom = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const normalizedNickname = nickname.trim();
    const normalizedRoomCode = roomCodeInput.replace(/\s+/g, "").toUpperCase();

    if (!normalizedNickname) {
      setError("Bir takma ad yazmalısın.");
      return;
    }

    if (normalizedRoomCode.length !== ROOM_CODE_LENGTH) {
      setError(`Oda kodu ${ROOM_CODE_LENGTH} karakter olmalı.`);
      return;
    }

    const existingRoomCode = roomCodeRef.current.trim().toUpperCase();
    const canResume =
      Boolean(resumeTokenRef.current) && existingRoomCode === normalizedRoomCode;

    nicknameRef.current = normalizedNickname;
    roomCodeRef.current = normalizedRoomCode;
    setNickname(normalizedNickname);
    setRoomCodeInput(normalizedRoomCode);
    writeStoredValue(STORAGE_KEYS.nickname, normalizedNickname);
    writeStoredValue(STORAGE_KEYS.roomCode, normalizedRoomCode);
    setError(null);

    sendMessage({
      type: "client:room:join",
      roomCode: normalizedRoomCode,
      nickname: normalizedNickname,
      ...(canResume ? { resumeToken: resumeTokenRef.current } : {})
    });
  };

  const handleLeaveRoom = (): void => {
    sendMessage({ type: "client:room:leave" });
    setRoomState(null);
    setMatchState(null);
    setSelfPlayerId(null);
    setCanManageGames(false);
    setOwnHasSubmitted(false);
    setOwnGameState(null);
    setScreen("home");
    setNotice("Odadan ayrılma isteği gönderildi.");
    resumeTokenRef.current = "";
    roomCodeRef.current = "";
    removeStoredValue(STORAGE_KEYS.resumeToken);
    removeStoredValue(STORAGE_KEYS.roomCode);
  };

  const handleKickPlayer = (targetPlayerId: string): void => {
    if (!canManageGames || !roomState || targetPlayerId === selfPlayerId ||
        !roomState.players.some((player) => player.id === targetPlayerId)) {
      return;
    }

    setError(null);
    sendMessage({ type: "client:room:kick", targetPlayerId });
  };

  const handleStartMatch = (): void => {
    if (!canManageGames || !roomState) {
      return;
    }

    setError(null);
    setNotice("Mini oyun rotası hazırlanıyor.");
    sendMessage({ type: "client:room:start" });
  };

  const handleGameReady = (): void => {
    const self = matchState?.players.find((player) => player.id === selfPlayerId);

    if (!matchState || !self?.currentGameParticipant || self.eliminated) {
      setError("Bu mini oyunda izleyicisin; hazır bildirimi gönderemezsin.");
      return;
    }

    setError(null);
    sendMessage({ type: "client:game:ready" });
  };

  const handleGameInput = (payload: JsonValue): void => {
    const self = matchState?.players.find((player) => player.id === selfPlayerId);

    if (
      !matchState ||
      matchState.phase !== "playing" ||
      !self?.currentGameParticipant ||
      self.eliminated
    ) {
      return;
    }

    setError(null);
    const actionId = `${actionClientInstanceRef.current}:${++actionSequenceRef.current}`;
    const observedStateVersion = latestMatchRef.current?.matchId === matchState.matchId ? latestMatchRef.current.stateVersion : matchState.stateVersion;
    setActionState((current) => current ? reduceClientActionState(current, { type: "submit", actionId, observedStateVersion }) : current);
    const sent = sendMessage({
      type: "client:game:submit",
      payload,
      clientTime: Date.now(),
      actionId,
      stateVersion: observedStateVersion,
      phaseIndex: matchState.phaseIndex,
      actionScope: latestMatchRef.current?.actionScope ?? "adapter"
    });

    if (!sent) {
      setError("Bağlantı çevrimdışı; hamle gönderilemedi.");
      setActionState((current) => current ? reduceClientActionState(current, { type: "ack", actionId, accepted: false, stateVersion: observedStateVersion, reason: "offline" }) : current);
    }
  };

  const handleReturnLobby = (): void => {
    setError(null);
    setNotice("Lobiye dönülüyor.");
    sendMessage({ type: "client:match:return-lobby" });
  };

  const roomMemberCount = roomState?.players.length ?? 0;
  const connectedCount = roomState ? getConnectedPlayerCount(roomState.players) : 0;

  const copyRoomCode = async (): Promise<void> => {
    if (!roomState) {
      return;
    }

    try {
      await navigator.clipboard.writeText(roomState.roomCode);
      setNotice("Oda kodu panoya kopyalandı.");
    } catch {
      setNotice(`Oda kodu: ${roomState.roomCode}`);
    }
  };

  const updateGameSelection = (
    selectionMode: LobbyState["selectionMode"],
    selectedGameIds: readonly GameId[],
    randomGameCount: number
  ): void => {
    if (!canManageGames) {
      return;
    }

    setError(null);
    sendMessage({
      type: "client:room:update-games",
      selectionMode,
      selectedGameIds,
      randomGameCount
    });
  };

  const toggleGame = (gameId: GameId): void => {
    if (!roomState || roomState.selectionMode !== "manual" || !canManageGames) {
      return;
    }

    const selected = new Set(roomState.selectedGameIds);

    if (selected.has(gameId)) {
      selected.delete(gameId);
    } else if (availableGameIds.has(gameId)) {
      selected.add(gameId);
    } else {
      return;
    }

    updateGameSelection("manual", [...selected], roomState.randomGameCount);
  };

  const switchSelectionMode = (selectionMode: LobbyState["selectionMode"]): void => {
    if (!roomState || !canManageGames || roomState.selectionMode === selectionMode) {
      return;
    }

    const availableGameIds = getAvailableGames(connectedCount).map((game) => game.id as GameId);
    const selectedGameIds = selectionMode === "manual" ? availableGameIds : [];
    const maxRandomCount = Math.max(1, getAvailableGames(connectedCount).length);
    const randomGameCount = Math.min(roomState.randomGameCount, maxRandomCount);
    updateGameSelection(selectionMode, selectedGameIds, randomGameCount);
  };

  const changeRandomGameCount = (value: string): void => {
    if (!roomState || !canManageGames) {
      return;
    }

    const maxRandomCount = Math.max(1, getAvailableGames(connectedCount).length);
    const parsed = Number(value);

    if (!Number.isInteger(parsed)) {
      return;
    }

    updateGameSelection("random", [], Math.max(1, Math.min(parsed, maxRandomCount)));
  };

  const selectedGameSet = useMemo(
    () => new Set(roomState?.selectedGameIds ?? []),
    [roomState?.selectedGameIds]
  );
  const availableGameIds = useMemo(
    () => new Set(getAvailableGames(connectedCount).map((game) => game.id)),
    [connectedCount]
  );

  const currentPlayer = roomState?.players.find((player) => player.id === selfPlayerId);
  const availableGameCount = availableGameIds.size;
  const canStartMatch = Boolean(
    roomState &&
      canManageGames &&
      connectedCount >= MIN_PLAYERS &&
      (roomState.selectionMode === "random"
        ? roomState.randomGameCount <= availableGameCount
        : roomState.selectedGameIds.length > 0 &&
          roomState.selectedGameIds.every((gameId) => availableGameIds.has(gameId)))
  );
  const matchNow = clockNow + clockOffset;

  return (
    <main className="app-shell">
      <div className="grid-floor" aria-hidden="true" />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      {isOffline && !protocolMismatch && (
        <div className="glix-offline-notice" role="status">
          <span>Bağlantı yok. GLIX çok oyunculu çalışır; oynamak için internete bağlan.</span>
        </div>
      )}

      {hasPwaUpdate && !protocolMismatch && screen !== "match" && (
        <aside className="glix-update-toast" role="status" aria-live="polite">
          <span>GLIX'in yeni bir sürümü hazır.</span>
          <button
            type="button"
            className="glix-update-toast-action"
            onClick={() => void pwaService.update()}
          >
            GÜNCELLE
          </button>
        </aside>
      )}

      {protocolMismatch ? (
        <section className="glix-update-gate" role="alert" aria-live="assertive">
          <div className="glix-update-gate-card">
            <div className="glix-update-gate-badge">GÜNCELLEME GEREKLİ</div>
            <h1 className="glix-update-gate-title">GLIX güncellendi.</h1>
            <p className="glix-update-gate-message">
              Oyuna devam etmek için uygulamayı yenile.
            </p>
            <button
              type="button"
              className="glix-update-gate-button"
              onClick={() => void pwaService.update()}
            >
              YENİLE
            </button>
            <details className="glix-protocol-diagnostic">
              <summary>Teknik Detaylar</summary>
              <div className="glix-protocol-diagnostic-content">
                <span>Sunucu İletişim Sürümü: v{protocolMismatch.serverProtocol}</span>
                <span>İstemci İletişim Sürümü: v{protocolMismatch.clientProtocol}</span>
                <span>Sunucu Sürümü: {protocolMismatch.serverVersion}</span>
              </div>
            </details>
          </div>
        </section>
      ) : (
        <>
          {screen !== "lobby" && screen !== "match" && screen !== "home" && (
            <header className="site-header">
              <button className="wordmark" type="button" onClick={() => { clearFormError(); setScreen("home"); }}>
                GLIX
              </button>
              <div className="header-meta">
                <span className="catalog-chip">24 MİNİ OYUN</span>
                <ConnectionPill connection={connection} />
              </div>
            </header>
          )}

      {screen === "home" && (
        <HomeScreen
          connection={connection}
          onCreateRoom={() => { clearFormError(); setScreen("create"); }}
          onJoinRoom={() => { clearFormError(); setScreen("join"); }}
          onHowToPlay={() => setNotice("Odayı kur veya kodla katıl; her oyuncu hamlesini kendi telefonundan yapar.")}
        />
      )}

      {(screen === "create" || screen === "join") && (
        <RoomEntryScreen
          mode={screen === "create" ? "create" : "join"}
          nickname={nickname}
          roomCode={roomCodeInput}
          error={error}
          onModeChange={(m) => {
            clearFormError();
            setScreen(m);
          }}
          onNicknameChange={setNickname}
          onRoomCodeChange={setRoomCodeInput}
          onSubmit={screen === "create" ? handleCreateRoom : handleJoinRoom}
          onBack={() => { clearFormError(); setScreen("home"); }}
        />
      )}

      {screen === "lobby" && roomState && (
        <LobbyScreen
          roomState={roomState}
          selfPlayerId={selfPlayerId}
          canManageGames={canManageGames}
          canStartMatch={canStartMatch}
          availableGameIds={availableGameIds}
          availableGameCount={availableGameCount}
          connectedCount={connectedCount}
          connection={connection}
          error={error}
          notice={notice}
          onCopyRoomCode={() => void copyRoomCode()}
          onLeaveRoom={handleLeaveRoom}
          onStartMatch={handleStartMatch}
          onSwitchSelectionMode={switchSelectionMode}
          onToggleGame={toggleGame}
          onChangeRandomGameCount={changeRandomGameCount}
          onKickPlayer={handleKickPlayer}
        />
      )}

      {screen === "match" && matchState && (
        <MatchScreen
          state={matchState}
          selfPlayerId={selfPlayerId}
          ownHasSubmitted={ownHasSubmitted}
          submissionStatus={submissionStatus}
          actionState={actionState}
          ownGameState={ownGameState}
          now={matchNow}
          error={error}
          notice={notice}
          canManageMatch={canManageGames}
          connection={connection}
          roomCode={roomCodeRef.current || "—"}
          onReady={handleGameReady}
          onSubmit={handleGameInput}
          onReturnLobby={handleReturnLobby}
          onLeave={handleLeaveRoom}
        />
      )}

      {screen !== "lobby" && screen !== "match" && error && <div className="toast-message error-message" role="alert">{error}</div>}
      {screen !== "lobby" && screen !== "match" && notice && <div className="toast-message notice-message" role="status">{notice}</div>}
        </>
      )}
    </main>
  );
}

interface MatchScreenProps {
  readonly state: MatchState;
  readonly selfPlayerId: string | null;
  readonly ownHasSubmitted: boolean;
  readonly submissionStatus: SubmissionStatus;
  readonly actionState: ClientActionState | null;
  readonly ownGameState: JsonValue | null;
  readonly now: number;
  readonly error: string | null;
  readonly notice: string | null;
  readonly canManageMatch: boolean;
  readonly connection: ConnectionState;
  readonly roomCode: string;
  readonly onReady: () => void;
  readonly onSubmit: (payload: JsonValue) => void;
  readonly onReturnLobby: () => void;
  readonly onLeave: () => void;
}

function matchPhaseLabel(phase: MatchState["phase"]): string {
  const labels: Record<MatchState["phase"], string> = {
    tutorial: "KISA ANLATIM",
    preparing: "HAZIRLIK",
    playing: "OYNA",
    results: "SONUÇLAR",
    transition: "GEÇİŞ",
    finished: "MAÇ BİTTİ"
  };

  return labels[phase];
}

function matchPhaseDescription(phase: MatchState["phase"]): string {
  const descriptions: Record<MatchState["phase"], string> = {
    tutorial: "On saniyelik görsel anlatımı izle; oyunun ritmi ve hamlesi burada gösterilir.",
    preparing: "Herkes hazır olduğunda gerçek mini oyun başlar.",
    playing: "Sıran geldiğinde hamleni kendi telefonundan yap. Puanın tur sonunda görünür.",
    results: "Bu oyunun puanları ve varsa elenme sonucu birazdan görünür.",
    transition: "Sıradaki mini oyun sahnesi hazırlanıyor.",
    finished: "Seçilen rota tamamlandı. Genel skor tablosu hazır."
  };


  return descriptions[phase];
}

function formatRemaining(milliseconds: number | null): string {
  if (milliseconds === null) {
    return "—";
  }

  return Math.max(0, Math.ceil(milliseconds / 1000)) + " sn";
}

const GAME_TUTORIAL_STEPS: Readonly<Record<GameId, readonly string[]>> = {
  "yazi-yaz": ["İki oyuncu gizlice kelime yazar; diğerleri masum rolündedir.", "Masada konuşarak yazanları ve kelimelerini bulmaya çalış.", "Tahminde doğru oyuncu ve doğru kelime ayrı ayrı puan kazandırır."],
  "kendim": ["Kendini anlatan tek bir kelime yaz.", "Karıştırılan kelime kartlarını, sahipleriyle eşleştir.", "Doğru eşleştirme puan getirir; yanlış eşleştirme puan götürür."],
  "sizma": ["Bir oyuncunun kelimesi diğerlerinden farklıdır.", "Herkes iki tur boyunca kelimesini söylemeden sesli ipucu verir.", "Sonunda gizlice oy vererek sızmacıyı bulmaya çalış."],
  "sozluk-blofu": ["Gösterilen kelime için gerçekmiş gibi sahte bir tanım yaz.", "Gerçek tanımla oyuncuların sahte tanımları karıştırılacak.", "Gerçeği seçerek ve kendi sahte tanımına başkalarını inandırarak puan kazan."],
  "cagrisim-agi": ["Ekranda herkesin gördüğü ortak bir kelime olacak.", "Aklına gelen tek bir çağrışımı gizlice yaz.", "Aynı cevabı veren oyuncular birlikte puan kazanır."],
  "butona-bas": ["45 saniye boyunca büyük butonu istediğin an kullan.", "Aynı kısa zaman aralığında en az iki kişi basarsa her biri puan kazanır.", "Tek başına basan puan kaybeder; arkadaşlarınla zamanı tuttur."],
  "rus-ruleti": ["Silah sırası sana geldiğinde hayatta olan birini veya kendini seç.", "Her güvenli atıştan sonra patlama riski artar.", "Mini oyun sonunda hayatta kalanlar puan kazanır."],
  "gizli-hirsiz": ["30 saniye içinde gizlice Çal veya hiç dokunma.", "Yalnızca bir kişi çalmaya kalkarsa o kişi puan kazanır.", "Birden fazla kişi çalarsa çalanların her biri puan kaybeder."],
  "kor-kronometre": ["Gizli sayaç başladı; gerçek zamanı göremeyeceksin.", "10. saniyeye olabildiğince yakın anda bir kez bas.", "En yakına basan iki oyuncu sırasıyla puan kazanır."],
  "kor-bomba": ["Bomba rastgele bir oyuncuda başlar ve gizli bir anda patlar.", "Bombayı başka bir oyuncuya devredebilirsin; her pas süreyi değiştirir.", "Bomba patladığında elinde tutan oyuncu puan kaybeder."],
  "rusvet-darbe": ["Önce masada pazarlık yapıp gizlice başkan adayına oy ver.", "En fazla oy alan kişi başkan olur.", "Başkan kendisi hariç oyunculara sınırlı puan dağıtır."],
  "acgozluluk-limiti": ["Oyuncu sayısına kadar bir sayı seç.", "Herkesin seçtiği sayılar gizlice toplanacak.", "Ortak limit aşılmazsa seçtiğin kadar puan kazanırsın; aşılırsa kimse kazanamaz."],
  "ortalamanin-yarisi": ["0 ile 100 arasında gizlice tam sayı seç.", "Hedef, herkesin seçtiği sayıların ortalamasının yarısıdır.", "Bu hedefe en yakın oyuncular puan kazanır."],
  "gizli-kareler": ["Tahtadaki bir kareyi herkesten gizli seç.", "Başka oyuncuyla aynı kareyi seçersen bu mini oyunda elenirsin.", "Çakışmadan iki aşamayı da tamamlayarak puan topla."],
  "karalama-defteri": ["Herkes bir nesne çizer; bir oyuncuya farklı ama benzer kelime verilmiştir.", "Çizimlerinizi inceleyip yüz yüze tartışın.", "Oylamada farklı kelimeyi alan oyuncuyu bulmaya çalışın."],
  "ittifak": ["Masadaki oyuncularla yüz yüze anlaşmalar yap.", "Birbirinize oy sözü verebilirsiniz ama sözünüzü tutmak zorunda değilsiniz.", "Sürenin sonunda kendin hariç bir kişiye gizli oy ver."],
  "son-kisi": ["Sistemin belirlediği bitiş anı gizlidir.", "Bitişten önce dilediğin anda yalnızca bir kez kaçışa bas.", "Gizli bitişten önce en son kaçabilen oyuncu puan kazanır."],
  "cizgiyi-gecme": ["0 ile 100 arasında gizlice risk sayısı seç.", "Aynı onluk dilimi seçen oyuncular değerlendirme dışı kalır.", "Tek kalan dilimlerin en yüksek sayılarını seçenler puan kazanır."],
  "gizli-alisveris": ["60 kredi bütçeyle istediğin ürünleri gizlice seç.", "Bir ürünü birden çok kişi alırsa ürünün değeri paylaşılır.", "Bütçeni ve rakiplerinin seçimlerini tahmin ederek en değerli sepeti kur."],
  "asiri-yukleme": ["Tıklamalar ortak enerji çubuğunu doldurur.", "100 kapasitesini aşan son tıklama yapan oyuncu ceza alır.", "Patlatmadan en fazla katkıyı sağlayan oyuncular puan kazanır."],
  "kontrol-paneli-kaosu": ["Kendi telefonundaki kablo panelini ve ipucunu incele.", "İpucundaki sıra ve renk koşullarını kontrol et.", "Doğru kabloyu keserek puan kazanmaya çalış."],
  "zehirli-kadeh": ["Kadehinin zehirli olup olmadığını bilmiyorsun.", "Bir kez başka oyuncuyla kadehini takas edebilirsin.", "Süre dolunca temiz kadeh taşıyanlar puan kazanır."],
  "capraz-ates": ["Kendin dışında bir oyuncuyu gizlice hedefle.", "Herkesin seçimi süre sonunda aynı anda açılır.", "Kime nişan aldığın ve kimin seni hedeflediği puanını belirler."],
  "zaman-bombasi-hafizasi": ["Yanan renkleri gösterildiği sırayla ezberle.", "Sıra sana geldiğinde renk dizisini doğru tekrar et.", "Dizi giderek uzar; hata yapanlar bu mini oyunda elenir."]
};

function tutorialStepsForGame(game: GameDefinition): readonly string[] {
  return GAME_TUTORIAL_STEPS[game.id as GameId];
}

function MatchScreen({
  state,
  selfPlayerId,
  ownHasSubmitted,
  submissionStatus,
  actionState,
  ownGameState,
  now,
  error,
  notice,
  canManageMatch,
  connection,
  roomCode,
  onReady,
  onSubmit,
  onReturnLobby,
  onLeave
}: MatchScreenProps): JSX.Element {
  const game = getGameDefinition(state.currentGameId);
  const stage6GameId = isStage6GameId(state.currentGameId) ? state.currentGameId : null;
  const stage7GameId = isStage7GameId(state.currentGameId) ? state.currentGameId : null;
  const stage8GameId = isStage8GameId(state.currentGameId) ? state.currentGameId : null;
  const stage9GameId = isStage9GameId(state.currentGameId) ? state.currentGameId : null;
  const stage11AGameId = isStage11AGameId(state.currentGameId) ? state.currentGameId : null;
  const stage11BGameId = isStage11BGameId(state.currentGameId) ? state.currentGameId : null;
  const stage11CGameId = isStage11CGameId(state.currentGameId) ? state.currentGameId : null;
  const stage11DGameId = isStage11DGameId(state.currentGameId) ? state.currentGameId : null;
  const remaining = state.phaseEndsAt === null ? null : Math.max(0, state.phaseEndsAt - now);
  const duration = state.phaseEndsAt === null ? null : Math.max(0, state.phaseEndsAt - state.phaseStartedAt);
  const progress = state.phase === "finished"
    ? 1
    : duration && duration > 0
      ? Math.min(1, Math.max(0, 1 - (remaining ?? 0) / duration))
      : 0;
  const totalDurationSeconds = duration && duration > 0 ? duration / 1000 : 0;
  const self = state.players.find((player) => player.id === selfPlayerId);
  const isSpectator = !self?.currentGameParticipant || Boolean(self.eliminated);
  const ready = state.readyPlayerIds.includes(selfPlayerId ?? "");
  const sortedPlayers = [...state.players].sort(
    (left, right) => right.score - left.score || right.miniGameScore - left.miniGameScore
  );
  const tutorialSteps = tutorialStepsForGame(game);
  const locksForAck = actionState?.status === "pending" && submissionStatus.mode !== "repeatable";

  const stageControls = stage6GameId ? (
    <Suspense fallback={<StageLoadingFallback gameName={game.name} />}>
      <LazyStage6GameControls
        gameId={stage6GameId}
        publicState={state.gameState}
        ownState={ownGameState}
        selfPlayerId={selfPlayerId}
        players={state.players}
        now={now}
        onSubmit={onSubmit}
      />
    </Suspense>
  ) : stage7GameId ? (
    <Suspense fallback={<StageLoadingFallback gameName={game.name} />}>
      <LazyStage7GameControls
        gameId={stage7GameId}
        publicState={state.gameState}
        ownState={ownGameState}
        selfPlayerId={selfPlayerId}
        players={state.players}
        now={now}
        onSubmit={onSubmit}
      />
    </Suspense>
  ) : stage8GameId ? (
    <Suspense fallback={<StageLoadingFallback gameName={game.name} />}>
      <LazyStage8GameControls
        gameId={stage8GameId}
        publicState={state.gameState}
        ownState={ownGameState}
        selfPlayerId={selfPlayerId}
        players={state.players}
        now={now}
        onSubmit={onSubmit}
      />
    </Suspense>
  ) : stage9GameId ? (
    <Suspense fallback={<StageLoadingFallback gameName={game.name} />}>
      <LazyStage9GameControls
        gameId={stage9GameId}
        publicState={state.gameState}
        ownState={ownGameState}
        selfPlayerId={selfPlayerId}
        players={state.players}
        now={now}
        onSubmit={onSubmit}
      />
    </Suspense>
  ) : (
    <div className="glix-default-action">
      <button className="glix-default-action-button" type="button" disabled={ownHasSubmitted} onClick={() => onSubmit({ action: "motor-provasi" })}>
        <span aria-hidden="true">✦</span>
        <strong>{ownHasSubmitted ? "HAMLE ALINDI" : "HAMLE GÖNDER"}</strong>
        <small>{ownHasSubmitted ? "SONUCU BEKLE" : "TEK DOKUNUŞ"}</small>
      </button>
      <p>Hamleni sahnedeki ana nesne üzerinden gönder. Puanlar oyun sonunda hesaplanır.</p>
    </div>
  );

  const resultControls = state.phase === "results" && !isSpectator ? (
    <Suspense fallback={<StageLoadingFallback gameName={game.name} />}>
      {stage6GameId && (
        <LazyStage6GameControls
          gameId={stage6GameId}
          publicState={state.gameState}
          ownState={ownGameState}
          selfPlayerId={selfPlayerId}
          players={state.players}
          now={now}
          onSubmit={onSubmit}
        />
      )}
      {stage7GameId && (
        <LazyStage7GameControls
          gameId={stage7GameId}
          publicState={state.gameState}
          ownState={ownGameState}
          selfPlayerId={selfPlayerId}
          players={state.players}
          now={now}
          onSubmit={onSubmit}
        />
      )}
      {stage8GameId && (
        <LazyStage8GameControls
          gameId={stage8GameId}
          publicState={state.gameState}
          ownState={ownGameState}
          selfPlayerId={selfPlayerId}
          players={state.players}
          now={now}
          onSubmit={onSubmit}
        />
      )}
      {stage9GameId && (
        <LazyStage9GameControls
          gameId={stage9GameId}
          publicState={state.gameState}
          ownState={ownGameState}
          selfPlayerId={selfPlayerId}
          players={state.players}
          now={now}
          onSubmit={onSubmit}
        />
      )}
    </Suspense>
  ) : null;

  const isKpk = game.id === "kontrol-paneli-kaosu";
  const isKendim = game.id === "kendim";
  const hidesKorKronometreClock = stage11AGameId === "kor-kronometre" && state.phase === "playing";
  const kendimPublicState = isKendim ? (state.gameState as unknown as KendimPublicState) : null;
  const kendimOwnState = isKendim ? (ownGameState as unknown as KendimOwnState) : null;
  const kendimSelfStatusLabel = isKendim
    ? state.phase === "results"
      ? "SONUÇLAR"
      : kendimPublicState?.subPhase === "write"
        ? (kendimOwnState?.hasWritten ? "KELİME MÜHÜRLENDİ" : "KELİME YAZ")
        : (kendimOwnState?.hasSubmittedMatches ? "SEÇİMLER KİLİTLİ" : "EŞLEŞTİR")
    : undefined;

  return (
    <section className="glix-match-screen" aria-labelledby="match-title">
      <GameViewport
        gameId={game.id}
        gameName={game.name}
        phase={state.phase}
        requiresLandscape={!game.supportsPortrait}
        roomCode={roomCode}
        connection={connection}
        hud={
          <GameHUD
            gameId={game.id}
            gameName={game.name}
            category={game.category}
            gameIndex={state.currentGameIndex}
            gameTotal={state.gameIds.length}
            phase={state.phase}
            phaseLabel={matchPhaseLabel(state.phase)}
            deadline={hidesKorKronometreClock ? null : state.phaseEndsAt}
            now={now}
            totalDurationSeconds={totalDurationSeconds}
            players={state.players}
            selfPlayer={self}
            selfPlayerId={selfPlayerId}
            readyPlayerIds={state.readyPlayerIds}
            ownHasSubmitted={ownHasSubmitted}
            submissionStatus={submissionStatus}
            selfStatusLabel={kendimSelfStatusLabel}
            connection={connection}
            onLeave={onLeave}
          />
        }
        stage={
          isKpk ? (
            <Suspense fallback={<StageLoadingFallback gameName={game.name} />}>
              <LazyKpkStage
                publicState={state.gameState as unknown as KontrolPaneliPublicState}
                ownState={ownGameState as unknown as KontrolPaneliOwnState | null | undefined}
                phase={state.phase}
                isSpectator={isSpectator}
                selfPlayerId={selfPlayerId}
                players={sortedPlayers}
                isReady={ready}
                onReady={onReady}
                actionState={actionState}
                onSubmitAction={onSubmit}
              />
            </Suspense>
          ) : isKendim ? (
            <Suspense fallback={<StageLoadingFallback gameName={game.name} />}>
              <LazyKendimStage
                publicState={state.gameState as unknown as KendimPublicState}
                ownState={ownGameState as unknown as KendimOwnState | null | undefined}
                phase={state.phase}
                isSpectator={isSpectator}
                selfPlayerId={selfPlayerId}
                players={sortedPlayers}
                isReady={ready}
                actionState={actionState}
                onReady={onReady}
                onSubmitAction={onSubmit}
              />
            </Suspense>
          ) : stage11BGameId ? (
            <Stage11BStage
              gameId={stage11BGameId}
              gameName={game.name}
              phase={state.phase}
              publicState={state.gameState}
              ownState={ownGameState}
              selfPlayerId={selfPlayerId}
              players={sortedPlayers}
              now={now}
              isSpectator={isSpectator}
              isReady={ready}
              actionState={actionState}
              onReady={onReady}
              onSubmit={onSubmit}
            />
          ) : stage11AGameId ? (
            <Suspense fallback={<StageLoadingFallback gameName={game.name} />}>
              <LazyStage11AStage
                gameId={stage11AGameId}
                gameName={game.name}
                phase={state.phase}
                publicState={state.gameState}
                ownState={ownGameState}
                selfPlayerId={selfPlayerId}
                players={sortedPlayers}
                now={now}
                isSpectator={isSpectator}
                actionState={actionState}
                ready={ready}
                connection={connection}
                onReady={onReady}
                onSubmit={onSubmit}
              />
            </Suspense>
          ) : stage11CGameId ? (
            <Suspense fallback={<StageLoadingFallback gameName={game.name} />}>
              <LazyStage11CStage
                gameId={stage11CGameId}
                gameName={game.name}
                phase={state.phase}
                publicState={state.gameState}
                ownState={ownGameState}
                selfPlayerId={selfPlayerId}
                players={sortedPlayers}
                now={now}
                isSpectator={isSpectator}
                isReady={ready}
                actionState={actionState}
                onReady={onReady}
                onSubmit={onSubmit}
              />
            </Suspense>
          ) : stage11DGameId ? (
            <Suspense fallback={<StageLoadingFallback gameName={game.name} />}>
              <LazyStage11DStage
                gameId={stage11DGameId}
                gameName={game.name}
                phase={state.phase}
                publicState={state.gameState}
                ownState={ownGameState}
                selfPlayerId={selfPlayerId}
                players={sortedPlayers}
                now={now}
                isSpectator={isSpectator}
                isReady={ready}
                actionState={actionState}
                onReady={onReady}
                onSubmit={onSubmit}
              />
            </Suspense>
          ) : undefined
        }
        hero={
          isKpk || isKendim || stage11AGameId || stage11BGameId || stage11CGameId || stage11DGameId ? undefined : (
            <PremiumStageHero
              game={game}
              phase={state.phase}
              progress={progress}
              isSpectator={isSpectator}
              ownHasSubmitted={ownHasSubmitted}
            />
          )
        }
        overlays={
          <>
            {state.phase === "tutorial" && (
              <TutorialOverlay
                gameName={game.name}
                category={game.category}
                steps={tutorialSteps}
                readyCount={state.readyPlayerIds.length}
                eligibleCount={state.players.filter((p) => p.connected && p.currentGameParticipant && !p.eliminated).length}
                readyPlayerIds={state.readyPlayerIds}
                players={state.players}
                selfPlayerId={selfPlayerId}
                isReady={ready}
                canReady={!isSpectator && !ready && connection === "connected"}
                onReady={onReady}
              />
            )}
            {state.phase === "results" && !isKpk && !isKendim && !stage11AGameId && !stage11BGameId && !stage11CGameId && !stage11DGameId && (
              <ResultOverlay gameName={game.name} disableInteraction>
                {resultControls}
              </ResultOverlay>
            )}
            {state.phase === "finished" && (
              <ResultOverlay
                gameName="GLIX"
                final
                scores={sortedPlayers.map((player, index) => ({
                  id: player.id,
                  nickname: player.nickname,
                  score: player.score,
                  miniGameScore: player.miniGameScore,
                  rank: index + 1
                }))}
                winner={sortedPlayers[0] ? {
                  id: sortedPlayers[0].id,
                  nickname: sortedPlayers[0].nickname,
                  score: sortedPlayers[0].score,
                  miniGameScore: sortedPlayers[0].miniGameScore,
                  rank: 1,
                  isWinner: true
                } : null}
                onReturnLobby={canManageMatch ? onReturnLobby : undefined}
              />
            )}
            {isSpectator && state.phase !== "finished" && !isKpk && !isKendim && !stage11AGameId && !stage11BGameId && !stage11CGameId && !stage11DGameId && (
              <SpectatorOverlay
                roomCode={roomCode}
                connected={Boolean(self?.connected)}
                eliminated={Boolean(self?.eliminated)}
              />
            )}
          </>
        }
      >
        {!isKpk && !isKendim && !stage11AGameId && !stage11BGameId && !stage11CGameId && !stage11DGameId && (
          <>
            <div className="glix-stage-context">
              <div>
                <span className="glix-stage-context-kicker">{matchPhaseLabel(state.phase)}</span>
                <h1 id="match-title">{game.name}</h1>
              </div>
              <p>{matchPhaseDescription(state.phase)}</p>
            </div>

            {state.phase === "preparing" && !isSpectator && (
              <button className="glix-ready-button" type="button" disabled={ready} onClick={onReady}>
                <span aria-hidden="true">{ready ? "✓" : "→"}</span>
                <strong>{ready ? "HAZIRSIN" : "HAZIRIM"}</strong>
                <small>{ready ? "DİĞERLERİ BEKLENİYOR" : "PROVAYA GEÇ"}</small>
              </button>
            )}

            {state.phase === "playing" && !isSpectator && (
              <div className="glix-control-slot" aria-label={`${game.name} hamle alanı`}>
                <fieldset className="glix-action-fence" disabled={locksForAck}>
                  {stageControls}
                </fieldset>
              </div>
            )}

            {state.phase === "transition" && (
              <div className="glix-transition-callout" role="status"><span /> Sıradaki oyun yükleniyor</div>
            )}

            {state.phase === "finished" && (
              <p className="glix-finished-note">Skorlar kaydedildi. Yeni bir rota başlatmak için lobiye dön.</p>
            )}
          </>
        )}

        {error && <div className="glix-match-message is-error" role="alert">{error}</div>}
        {notice && <div className="glix-match-message is-notice" role="status">{notice}</div>}

        <footer className="glix-match-footer">
          <span>ODA {roomCode}</span>
          {connection !== "connected" && (
            <span>{connection === "connecting" ? "Bağlanıyor…" : "Çevrimdışı"}</span>
          )}
        </footer>

      </GameViewport>
    </section>
  );
}

function ConnectionPill({ connection }: { connection: ConnectionState }): JSX.Element {
  return (
    <span className={`connection-pill ${connection}`}>
      <span className="status-dot" />
      {connectionLabel(connection)}
    </span>
  );
}

export default App;

