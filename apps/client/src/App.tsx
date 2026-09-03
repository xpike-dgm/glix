import { useEffect, useMemo, useRef, useState } from "react";
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
  type KontrolPaneliOwnState
} from "@glix/shared";
import { Stage6GameControls } from "./games/Stage6GameControls";
import { Stage7GameControls } from "./games/Stage7GameControls";
import { Stage8GameControls } from "./games/Stage8GameControls";
import { Stage9GameControls } from "./games/Stage9GameControls";
import { GameHUD } from "./visuals/hud/GameHUD";
import { HomeScreen } from "./visuals/home/HomeScreen";
import { ResultOverlay } from "./visuals/overlays/ResultOverlay";
import { SpectatorOverlay } from "./visuals/overlays/SpectatorOverlay";
import { TutorialOverlay } from "./visuals/overlays/TutorialOverlay";
import { GameViewport } from "./visuals/viewport/GameViewport";
import { PremiumStageHero } from "./visuals/stage/PremiumStageHero";
import { KpkStage } from "./visuals/games/kontrol-paneli-kaosu/KpkStage";
import { preloadPremiumBrandAssets, preloadPremiumGamePack } from "./visuals/visualAssetManifest";

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
    return "SUNUCU HAZIR";
  }

  if (connection === "connecting") {
    return "BAĞLANIYOR";
  }

  return "BAĞLANTI KOPTU";
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
  const [ownGameState, setOwnGameState] = useState<JsonValue | null>(null);
  const [clockOffset, setClockOffset] = useState(0);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | undefined>(undefined);
  const reconnectAttemptRef = useRef(0);
  const nicknameRef = useRef(nickname);
  const roomCodeRef = useRef(roomCodeInput);
  const resumeTokenRef = useRef(readStoredValue(STORAGE_KEYS.resumeToken));

  useEffect(() => {
    void preloadPremiumBrandAssets();
  }, []);

  useEffect(() => {
    if (matchState?.currentGameId) {
      void preloadPremiumGamePack(matchState.currentGameId);
    }
  }, [matchState?.currentGameId]);

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
      if (!active || reconnectTimerRef.current !== undefined) {
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
      if (!active) {
        return;
      }

      setConnection("connecting");
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        if (!active) {
          return;
        }

        reconnectAttemptRef.current = 0;
        setConnection("connected");
        setError(null);
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
      });

      socket.addEventListener("message", (event) => {
        try {
          const value: unknown = JSON.parse(String(event.data));

          if (!isServerMessage(value)) {
            setError("Sunucudan beklenmeyen bir yanıt geldi.");
            return;
          }

          if (value.type === "server:ready") {
            setServerVersion(value.serverVersion);
            return;
          }

          if (value.type === "server:session") {
            setSelfPlayerId(value.playerId);
            resumeTokenRef.current = value.reconnectToken;
            roomCodeRef.current = value.roomCode;
            setRoomCodeInput(value.roomCode);
            writeStoredValue(STORAGE_KEYS.resumeToken, value.reconnectToken);
            writeStoredValue(STORAGE_KEYS.roomCode, value.roomCode);
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
            setMatchState(value.state);
            setRoomState(null);
            setSelfPlayerId(value.selfPlayerId);
            setCanManageGames(value.canManageMatch);
            setOwnHasSubmitted(value.ownHasSubmitted);
            setOwnGameState(value.ownGameState);
            setClockOffset(value.state.serverNow - Date.now());
            setScreen("match");
            setError(null);
            setNotice(null);
            return;
          }

          if (value.type === "server:game-input-ack") {
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
            setNotice(value.reason === "left" ? "Odadan ayrıldın." : "Oda kapatıldı.");
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
          setError("Sunucudan okunamayan bir yanıt geldi.");
        }
      });

      socket.addEventListener("error", () => {
        if (active) {
          setConnection("offline");
        }
      });

      socket.addEventListener("close", () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (active) {
          setConnection("offline");
          scheduleReconnect();
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
      setError("Sunucu bağlantısı hazır değil. Birkaç saniye sonra tekrar dene.");
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

  const handleStartMatch = (): void => {
    if (!canManageGames || !roomState) {
      return;
    }

    setError(null);
    setNotice("Gerçek mini oyun rotası hazırlanıyor.");
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
    sendMessage({
      type: "client:game:submit",
      payload,
      clientTime: Date.now()
    });
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

      {screen === "create" && (
        <RoomForm
          mode="create"
          nickname={nickname}
          roomCode={roomCodeInput}
          connection={connection}
          error={error}
          onNicknameChange={setNickname}
          onRoomCodeChange={setRoomCodeInput}
          onSubmit={handleCreateRoom}
          onBack={() => { clearFormError(); setScreen("home"); }}
        />
      )}

      {screen === "join" && (
        <RoomForm
          mode="join"
          nickname={nickname}
          roomCode={roomCodeInput}
          connection={connection}
          error={error}
          onNicknameChange={setNickname}
          onRoomCodeChange={setRoomCodeInput}
          onSubmit={handleJoinRoom}
          onBack={() => { clearFormError(); setScreen("home"); }}
        />
      )}

      {screen === "lobby" && roomState && (
        <section className="lobby-layout glix-lobby-screen" aria-labelledby="lobby-title">
          <header className="lobby-header">
            <div>
              <p className="eyebrow">GLIX / ODA LOBİSİ</p>
              <h1 id="lobby-title">Maç kuruluyor<span>.</span></h1>
            </div>
            <div className="lobby-header-actions">
              <ConnectionPill connection={connection} />
              <button className="text-button danger-button" type="button" onClick={handleLeaveRoom}>ODADAN ÇIK</button>
            </div>
          </header>

          <div className="room-banner">
            <div>
              <span className="banner-label">KATILIM KODU</span>
              <strong className="room-code">{roomState.roomCode}</strong>
            </div>
            <button className="copy-button" type="button" onClick={() => void copyRoomCode()}>
              <span>⧉</span>
              KODU KOPYALA
            </button>
          </div>

          <div className="lobby-grid">
            <section className="lobby-card players-card" aria-labelledby="players-title">
              <div className="card-heading">
                <div>
                  <p className="eyebrow">OYUNCULAR</p>
                  <h2 id="players-title">Oda ekibi</h2>
                </div>
                <span className="count-badge">{roomMemberCount}/{MAX_PLAYERS}</span>
              </div>
              <p className="card-description">Kodunu arkadaşlarınla paylaş. Odaya giren herkes burada görünür.</p>
              <div className="player-list">
                {roomState.players.map((player, index) => (
                  <div className={`player-row ${player.id === selfPlayerId ? "is-self" : ""}`} key={player.id}>
                    <span className={`avatar avatar-${(index % 8) + 1}`} aria-hidden="true">{player.nickname.slice(0, 1).toUpperCase()}</span>
                    <span className="player-name">
                      <strong>{player.nickname}</strong>
                      {player.id === selfPlayerId && <small>SEN</small>}
                    </span>
                    {player.id === roomState.hostPlayerId && <span className="host-badge">HOST</span>}
                    <span className={`player-connection ${player.connected ? "online" : "away"}`}>
                      <i />
                      {player.connected ? "HAZIR" : "BEKLİYOR"}
                    </span>
                  </div>
                ))}
                {roomMemberCount < MAX_PLAYERS && (
                  <div className="player-row empty-player">
                    <span className="avatar avatar-empty">＋</span>
                    <span className="player-name"><strong>Arkadaşlarını bekle</strong><small>{MAX_PLAYERS - roomMemberCount} boş yer</small></span>
                  </div>
                )}
              </div>
              <div className="self-status">
                <span className="status-pulse" />
                {currentPlayer ? `${currentPlayer.nickname} olarak bağlandın.` : "Oturum hazırlanıyor."}
              </div>
            </section>

            <section className="lobby-card games-card" aria-labelledby="games-title">
              <div className="card-heading game-heading">
                <div>
                  <p className="eyebrow">ODA YÖNETİMİ</p>
                  <h2 id="games-title">Mini oyun rotası</h2>
                </div>
                <span className="selection-count">
                  {roomState.selectionMode === "random" ? `${roomState.randomGameCount} RASTGELE` : `${roomState.selectedGameIds.length} SEÇİLİ`}
                </span>
              </div>

              <div className="mode-switch" role="group" aria-label="Mini oyun seçim modu">
                <button className={roomState.selectionMode === "manual" ? "active" : ""} type="button" disabled={!canManageGames} onClick={() => switchSelectionMode("manual")}>MANUEL SEÇİM</button>
                <button className={roomState.selectionMode === "random" ? "active" : ""} type="button" disabled={!canManageGames} onClick={() => switchSelectionMode("random")}>RASTGELE ROTA</button>
              </div>

              {roomState.selectionMode === "random" ? (
                <div className="random-control">
                  <div>
                    <strong>Kaç oyun oynansın?</strong>
                    <small>Uygun oyun havuzu: {availableGameIds.size}</small>
                  </div>
                  <input
                    aria-label="Rastgele oyun sayısı"
                    type="number"
                    min="1"
                    max={Math.max(1, availableGameIds.size)}
                    value={roomState.randomGameCount}
                    disabled={!canManageGames}
                    onChange={(event) => changeRandomGameCount(event.target.value)}
                  />
                </div>
              ) : (
                <p className="selection-help">
                  {canManageGames ? "Oynanacak oyunları seç veya listeden çıkar." : "Oyun listesini yalnızca oda yöneticisi değiştirebilir."}
                </p>
              )}

              <div className="game-list">
                {GAME_CATALOG.map((game, index) => {
                  const selected = selectedGameSet.has(game.id);
                  const available = availableGameIds.has(game.id);
                  const isRandom = roomState.selectionMode === "random";

                  return (
                    <button
                      className={`game-row ${selected ? "selected" : ""} ${!available ? "unavailable" : ""} ${isRandom ? "read-only" : ""}`}
                      type="button"
                      key={game.id}
                      disabled={!canManageGames || isRandom || (!selected && !available)}
                      onClick={() => toggleGame(game.id)}
                    >
                      <span className={`game-index index-${(index % 5) + 1}`}>{String(index + 1).padStart(2, "0")}</span>
                      <span className="game-name"><strong>{game.name}</strong><small>{game.category.toUpperCase()} / {game.supportsPortrait ? "DİKEY" : "YATAY"}</small></span>
                      <span className="game-min">{game.minPlayers}+<small>OYUNCU</small></span>
                      <span className="selection-mark">{selected ? "✓" : "＋"}</span>
                    </button>
                  );
                })}
              </div>
              <div className="games-footer">
                <span><i className="legend-dot selected-dot" /> SEÇİLİ</span>
                <span><i className="legend-dot warning-dot" /> {connectedCount < 3 ? "3+ OYUNLAR OYUNCU BEKLİYOR" : "TÜM OYUNLAR UYGUN"}</span>
              </div>
            </section>
          </div>

          {error && <div className="inline-message error-message" role="alert">{error}</div>}
          {notice && <div className="inline-message notice-message" role="status">{notice}</div>}

          <div className="lobby-footer">
            <span>BAĞLANTI KODU İLE OYNA</span>
            <span>PROTOKOL v{PROTOCOL_VERSION} / SUNUCU {serverVersion}</span>
            <button
              className="button button-start"
              type="button"
              disabled={!canStartMatch}
              onClick={handleStartMatch}
              title={canStartMatch ? "Seçtiğin gerçek oyun rotasını başlat" : "En az iki bağlı oyuncu ve uygun oyunlar gerekli"}
            >
              OYUN ROTASINI BAŞLAT <small>{availableGameCount} UYGUN OYUN</small>
            </button>
          </div>
        </section>
      )}

      {screen === "match" && matchState && (
        <MatchScreen
          state={matchState}
          selfPlayerId={selfPlayerId}
          ownHasSubmitted={ownHasSubmitted}
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
    </main>
  );
}

interface MatchScreenProps {
  readonly state: MatchState;
  readonly selfPlayerId: string | null;
  readonly ownHasSubmitted: boolean;
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
    tutorial: "TUTORİAL",
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
    playing: "Kuralın gerektirdiği hamleyi kendi telefonundan yap. Skoru sunucu hesaplar.",
    results: "Bu oyunun puanları ve varsa elenme sonucu işleniyor.",
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

function tutorialStepsForGame(game: GameDefinition): readonly string[] {
  const action = game.category === "sayi"
    ? "sayıyı seç ve kilitle"
    : game.category === "risk"
      ? "riski oku ve hedefini seç"
      : game.category === "hafiza"
        ? "deseni gör ve sırayla tekrar et"
        : game.category === "zaman"
          ? "süreyi oku ve doğru anda dokun"
          : "sahnedeki nesneye hamle yap";

  return [
    `${game.name} nesnesini ve hedefini oku.`,
    "Hazır olduğunda kendi telefonunda onay ver.",
    `Sıra geldiğinde ${action}.`
  ];
}

function MatchScreen({
  state,
  selfPlayerId,
  ownHasSubmitted,
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

  const stageControls = stage6GameId ? (
    <Stage6GameControls
      gameId={stage6GameId}
      publicState={state.gameState}
      ownState={ownGameState}
      selfPlayerId={selfPlayerId}
      players={state.players}
      now={now}
      onSubmit={onSubmit}
    />
  ) : stage7GameId ? (
    <Stage7GameControls
      gameId={stage7GameId}
      publicState={state.gameState}
      ownState={ownGameState}
      selfPlayerId={selfPlayerId}
      players={state.players}
      now={now}
      onSubmit={onSubmit}
    />
  ) : stage8GameId ? (
    <Stage8GameControls
      gameId={stage8GameId}
      publicState={state.gameState}
      ownState={ownGameState}
      selfPlayerId={selfPlayerId}
      players={state.players}
      now={now}
      onSubmit={onSubmit}
    />
  ) : stage9GameId ? (
    <Stage9GameControls
      gameId={stage9GameId}
      publicState={state.gameState}
      ownState={ownGameState}
      selfPlayerId={selfPlayerId}
      players={state.players}
      now={now}
      onSubmit={onSubmit}
    />
  ) : (
    <div className="glix-default-action">
      <button className="glix-default-action-button" type="button" disabled={ownHasSubmitted} onClick={() => onSubmit({ action: "motor-provasi" })}>
        <span aria-hidden="true">✦</span>
        <strong>{ownHasSubmitted ? "HAMLE ALINDI" : "HAMLE GÖNDER"}</strong>
        <small>{ownHasSubmitted ? "SONUCU BEKLE" : "TEK DOKUNUŞ"}</small>
      </button>
      <p>Hamleni sahnedeki ana nesne üzerinden gönder. Skoru sunucu hesaplar.</p>
    </div>
  );

  const resultControls = state.phase === "results" && !isSpectator ? (
    <>
      {stage6GameId && (
        <Stage6GameControls
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
        <Stage7GameControls
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
        <Stage8GameControls
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
        <Stage9GameControls
          gameId={stage9GameId}
          publicState={state.gameState}
          ownState={ownGameState}
          selfPlayerId={selfPlayerId}
          players={state.players}
          now={now}
          onSubmit={onSubmit}
        />
      )}
    </>
  ) : null;

  const isKpk = game.id === "kontrol-paneli-kaosu";

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
            gameName={game.name}
            category={game.category}
            gameIndex={state.currentGameIndex}
            gameTotal={state.gameIds.length}
            phase={state.phase}
            phaseLabel={matchPhaseLabel(state.phase)}
            deadline={state.phaseEndsAt}
            now={now}
            totalDurationSeconds={totalDurationSeconds}
            players={state.players}
            selfPlayer={self}
            selfPlayerId={selfPlayerId}
            readyPlayerIds={state.readyPlayerIds}
            ownHasSubmitted={ownHasSubmitted}
            connection={connection}
            onLeave={onLeave}
          />
        }
        stage={
          isKpk ? (
            <KpkStage
              publicState={state.gameState as unknown as KontrolPaneliPublicState}
              ownState={ownGameState as unknown as KontrolPaneliOwnState | null | undefined}
              phase={state.phase}
              isSpectator={isSpectator}
              selfPlayerId={selfPlayerId}
              isReady={ready}
              onReady={onReady}
              onSubmitAction={onSubmit}
            />
          ) : undefined
        }
        hero={
          isKpk ? undefined : (
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
                steps={tutorialSteps}
                progress={progress}
                remainingLabel={formatRemaining(remaining)}
              />
            )}
            {state.phase === "results" && (
              <ResultOverlay gameName={game.name} disableInteraction>
                {resultControls}
              </ResultOverlay>
            )}
            {state.phase === "finished" && (
              <ResultOverlay gameName="GLIX rotası" final>
                <div className="glix-final-score-rail">
                  {sortedPlayers.slice(0, 8).map((player, index) => (
                    <div className="glix-final-score-row" key={player.id}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{player.nickname}</strong>
                      <small>+{player.miniGameScore}</small>
                      <b>{player.score}</b>
                    </div>
                  ))}
                </div>
                {canManageMatch && (
                  <button className="glix-return-lobby" type="button" onClick={onReturnLobby}>LOBİYE DÖN</button>
                )}
              </ResultOverlay>
            )}
            {isSpectator && state.phase !== "finished" && (
              <SpectatorOverlay
                roomCode={roomCode}
                connected={Boolean(self?.connected)}
                eliminated={Boolean(self?.eliminated)}
              />
            )}
          </>
        }
      >
        {!isKpk && (
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
                {stageControls}
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
          <span>{connection === "connected" ? "SYNC AKTİF" : "BAĞLANTI BEKLENİYOR"}</span>
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

interface RoomFormProps {
  readonly mode: "create" | "join";
  readonly nickname: string;
  readonly roomCode: string;
  readonly connection: ConnectionState;
  readonly error: string | null;
  readonly onNicknameChange: (value: string) => void;
  readonly onRoomCodeChange: (value: string) => void;
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  readonly onBack: () => void;
}

function RoomForm({
  mode,
  nickname,
  roomCode,
  connection,
  error,
  onNicknameChange,
  onRoomCodeChange,
  onSubmit,
  onBack
}: RoomFormProps): JSX.Element {
  const isJoin = mode === "join";

  return (
    <section className="form-layout" aria-labelledby="room-form-title">
      <div className="form-intro">
        <button className="back-button" type="button" onClick={onBack}>← ANA SAYFA</button>
        <p className="eyebrow">{isJoin ? "ODA KODU / KATIL" : "YENİ ODA / KUR"}</p>
        <h1 id="room-form-title">
          {isJoin ? "Ekibe katıl." : "Odanı kur."}
          <span> Hazır mısın?</span>
        </h1>
        <p className="hero-description">
          {isJoin ? "Arkadaşının paylaştığı kodu ve kendi takma adını gir." : "Takma adını seç, oda kodunu arkadaşlarınla paylaş ve oyun rotasını yönet."}
        </p>
      </div>

      <form className="room-form-card" onSubmit={onSubmit}>
        <div className="form-card-topline">
          <span className="form-card-index">01</span>
          <ConnectionPill connection={connection} />
        </div>

        {isJoin && (
          <label className="field-group">
            <span>ODA KODU</span>
            <input
              className="room-code-input"
              type="text"
              value={roomCode}
              onChange={(event) => onRoomCodeChange(event.target.value.replace(/\s+/g, "").toUpperCase().slice(0, ROOM_CODE_LENGTH))}
              placeholder="ABCDE"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={ROOM_CODE_LENGTH}
              autoFocus
            />
            <small>Arkadaşının ekranındaki {ROOM_CODE_LENGTH} karakterli kod.</small>
          </label>
        )}

        <label className="field-group">
          <span>TAKMA ADIN</span>
          <input
            type="text"
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value.slice(0, MAX_NICKNAME_LENGTH))}
            placeholder="Örn. NeonKedi"
            autoComplete="nickname"
            maxLength={MAX_NICKNAME_LENGTH}
            autoFocus={!isJoin}
          />
          <small>Hesap yok. Bu ad yalnızca bu maçta görünür.</small>
        </label>

        {error && <div className="form-error" role="alert">{error}</div>}

        <button className="button button-primary form-submit" type="submit">
          <span className="button-icon">{isJoin ? "↗" : "＋"}</span>
          <span>
            <strong>{isJoin ? "ODAYA KATIL" : "ODA OLUŞTUR"}</strong>
            <small>{isJoin ? "ARKADAŞLARINI BEKLE" : "KODU ARKADAŞLARINLA PAYLAŞ"}</small>
          </span>
        </button>
      </form>
    </section>
  );
}

export default App;
