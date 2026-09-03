import type { RuntimePhaseId } from "./engine.js";

export const PROTOCOL_VERSION = 1 as const;
export const DEFAULT_SERVER_PORT = 8787 as const;
export const DEFAULT_WS_PATH = "/ws" as const;
export const MAX_PLAYERS = 8 as const;
export const MIN_PLAYERS = 2 as const;
export const ROOM_CODE_LENGTH = 5 as const;
export const MIN_NICKNAME_LENGTH = 1 as const;
export const MAX_NICKNAME_LENGTH = 20 as const;
export const DEFAULT_RANDOM_GAME_COUNT = 5 as const;
export const ROOM_EMPTY_GRACE_MS = 120_000 as const;

export type AppPhase =
  | "lobby"
  | "tutorial"
  | "preparing"
  | "playing"
  | "results"
  | "scoreboard"
  | "finished";

export type GameCategory =
  | "sosyal"
  | "zaman"
  | "sayi"
  | "strateji"
  | "hafiza"
  | "risk";

export interface GameDefinition {
  readonly id: string;
  readonly name: string;
  readonly minPlayers: number;
  readonly maxPlayers: number;
  readonly tutorialSeconds: number;
  readonly category: GameCategory;
  readonly supportsPortrait: boolean;
}

export const GAME_CATALOG = [
  { id: "yazi-yaz", name: "Yazı Yaz", minPlayers: 3, maxPlayers: 8, tutorialSeconds: 10, category: "sosyal", supportsPortrait: true },
  { id: "kendim", name: "Kendim", minPlayers: 3, maxPlayers: 8, tutorialSeconds: 10, category: "sosyal", supportsPortrait: true },
  { id: "sizma", name: "Sızma", minPlayers: 3, maxPlayers: 8, tutorialSeconds: 10, category: "sosyal", supportsPortrait: true },
  { id: "sozluk-blofu", name: "Sözlük Blöfü", minPlayers: 3, maxPlayers: 8, tutorialSeconds: 10, category: "sosyal", supportsPortrait: true },
  { id: "cagrisim-agi", name: "Çağrışım Ağı", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "sosyal", supportsPortrait: true },
  { id: "butona-bas", name: "Butona Bas", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "zaman", supportsPortrait: true },
  { id: "rus-ruleti", name: "Rus Ruleti", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "risk", supportsPortrait: false },
  { id: "gizli-hirsiz", name: "Gizli Hırsız", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "zaman", supportsPortrait: true },
  { id: "kor-kronometre", name: "Kör Kronometre", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "zaman", supportsPortrait: true },
  { id: "kor-bomba", name: "Kör Bomba", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "risk", supportsPortrait: false },
  { id: "rusvet-darbe", name: "Rüşvet ve Darbe", minPlayers: 3, maxPlayers: 8, tutorialSeconds: 10, category: "strateji", supportsPortrait: true },
  { id: "acgozluluk-limiti", name: "Açgözlülük Limiti", minPlayers: 3, maxPlayers: 8, tutorialSeconds: 10, category: "sayi", supportsPortrait: true },
  { id: "ortalamanin-yarisi", name: "Ortalamaya En Yakın", minPlayers: 3, maxPlayers: 8, tutorialSeconds: 10, category: "sayi", supportsPortrait: true },
  { id: "gizli-kareler", name: "Gizli Kareler", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "strateji", supportsPortrait: true },
  { id: "karalama-defteri", name: "Karalama Defteri", minPlayers: 3, maxPlayers: 8, tutorialSeconds: 10, category: "sosyal", supportsPortrait: true },
  { id: "ittifak", name: "İttifak", minPlayers: 3, maxPlayers: 8, tutorialSeconds: 10, category: "sosyal", supportsPortrait: true },
  { id: "son-kisi", name: "Son Kişi", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "zaman", supportsPortrait: true },
  { id: "cizgiyi-gecme", name: "Çizgiyi Geçme", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "sayi", supportsPortrait: true },
  { id: "gizli-alisveris", name: "Gizli Alışveriş", minPlayers: 3, maxPlayers: 8, tutorialSeconds: 10, category: "strateji", supportsPortrait: true },
  { id: "asiri-yukleme", name: "Aşırı Yükleme", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "zaman", supportsPortrait: true },
  { id: "kontrol-paneli-kaosu", name: "Kontrol Paneli Kaosu", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "strateji", supportsPortrait: false },
  { id: "zehirli-kadeh", name: "Zehirli Kadeh", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "risk", supportsPortrait: true },
  { id: "capraz-ates", name: "Çapraz Ateş", minPlayers: 3, maxPlayers: 8, tutorialSeconds: 10, category: "strateji", supportsPortrait: true },
  { id: "zaman-bombasi-hafizasi", name: "Zaman Bombası Hafızası", minPlayers: 2, maxPlayers: 8, tutorialSeconds: 10, category: "hafiza", supportsPortrait: true }
] as const satisfies readonly GameDefinition[];

export type GameId = (typeof GAME_CATALOG)[number]["id"];
export type GameSelectionMode = "manual" | "random";

export interface PlayerSummary {
  readonly id: string;
  readonly nickname: string;
  readonly score: number;
  readonly connected: boolean;
}

export function getConnectedPlayerCount(
  players: readonly Pick<PlayerSummary, "connected">[]
): number {
  return players.reduce((count, player) => count + (player.connected ? 1 : 0), 0);
}

export interface LobbyState {
  readonly roomCode: string;
  readonly hostPlayerId: string;
  readonly players: readonly PlayerSummary[];
  readonly selectedGameIds: readonly GameId[];
  readonly selectionMode: GameSelectionMode;
  readonly randomGameCount: number;
  readonly phase: "lobby";
}

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export interface MatchPlayerState {
  readonly id: string;
  readonly nickname: string;
  readonly score: number;
  readonly miniGameScore: number;
  readonly connected: boolean;
  readonly currentGameParticipant: boolean;
  readonly eliminated: boolean;
}

export interface MatchState {
  readonly matchId: string;
  readonly gameIds: readonly GameId[];
  readonly currentGameIndex: number;
  readonly currentGameId: GameId;
  readonly phase: RuntimePhaseId;
  readonly phaseIndex: number;
  readonly phaseStartedAt: number;
  readonly phaseEndsAt: number | null;
  readonly serverNow: number;
  readonly stateVersion: number;
  readonly inputCount: number;
  readonly readyPlayerIds: readonly string[];
  readonly eliminatedPlayerIds: readonly string[];
  /** Public, game-specific state. Private assignments are sent separately. */
  readonly gameState: JsonValue;
  readonly players: readonly MatchPlayerState[];
}

export type ClientMessage =
  | {
      readonly type: "client:hello";
      readonly clientVersion: string;
    }
  | {
      readonly type: "client:ping";
      readonly clientTime: number;
    }
  | {
      readonly type: "client:room:create";
      readonly nickname: string;
    }
  | {
      readonly type: "client:room:join";
      readonly roomCode: string;
      readonly nickname: string;
      readonly resumeToken?: string;
    }
  | {
      readonly type: "client:room:update-games";
      readonly selectionMode: GameSelectionMode;
      readonly selectedGameIds: readonly GameId[];
      readonly randomGameCount: number;
    }
  | {
      readonly type: "client:room:start";
    }
  | {
      readonly type: "client:game:ready";
    }
  | {
      readonly type: "client:game:submit";
      readonly payload: JsonValue | null;
      readonly clientTime: number;
    }
  | {
      readonly type: "client:match:return-lobby";
    }
  | {
      readonly type: "client:room:leave";
    };

export type ServerErrorCode =
  | "invalid_message"
  | "unsupported_message"
  | "nickname_required"
  | "nickname_too_long"
  | "room_code_invalid"
  | "room_not_found"
  | "room_full"
  | "room_required"
  | "already_in_room"
  | "not_host"
  | "invalid_game_selection"
  | "invalid_random_count"
  | "resume_failed"
  | "match_in_progress"
  | "match_not_started"
  | "not_enough_players"
  | "not_host_to_start"
  | "input_phase_locked"
  | "input_late"
  | "input_duplicate"
  | "input_disabled"
  | "input_empty_not_allowed"
  | "spectator"
  | "invalid_game_input";

export type ServerMessage =
  | {
      readonly type: "server:ready";
      readonly serverVersion: string;
      readonly protocolVersion: typeof PROTOCOL_VERSION;
    }
  | {
      readonly type: "server:pong";
      readonly clientTime: number;
      readonly serverTime: number;
    }
  | {
      readonly type: "server:session";
      readonly playerId: string;
      readonly reconnectToken: string;
      readonly roomCode: string;
    }
  | {
      readonly type: "server:room-state";
      readonly state: LobbyState;
      readonly selfPlayerId: string;
      readonly canManageGames: boolean;
    }
  | {
      readonly type: "server:room-left";
      readonly roomCode: string;
      readonly reason: "left" | "closed";
    }
  | {
      readonly type: "server:match-state";
      readonly state: MatchState;
      readonly selfPlayerId: string;
      readonly canManageMatch: boolean;
      readonly ownInputCount: number;
      readonly ownHasSubmitted: boolean;
      /** Private state for the receiving player, such as the Sızma word. */
      readonly ownGameState: JsonValue | null;
    }
  | {
      readonly type: "server:game-input-ack";
      readonly accepted: boolean;
      readonly serverTime: number;
      readonly inputSequence?: number;
      readonly reason?:
        | "input_phase_locked"
        | "input_late"
        | "input_duplicate"
        | "input_disabled"
        | "input_empty_not_allowed"
        | "spectator"
        | "invalid_game_input";
    }
  | {
      readonly type: "server:error";
      readonly code: ServerErrorCode;
      readonly message: string;
    };

export function getGameDefinition(gameId: GameId): GameDefinition {
  const definition = GAME_CATALOG.find((game) => game.id === gameId);

  if (!definition) {
    throw new Error(`Bilinmeyen mini oyun: ${gameId}`);
  }

  return definition;
}

export function getAvailableGames(playerCount: number): readonly GameDefinition[] {
  return GAME_CATALOG.filter(
    (game) => playerCount >= game.minPlayers && playerCount <= game.maxPlayers
  );
}

export function getUnavailableGames(playerCount: number): readonly GameDefinition[] {
  return GAME_CATALOG.filter(
    (game) => playerCount < game.minPlayers || playerCount > game.maxPlayers
  );
}

export * from "./engine.js";
export * from "./games.js";
export * from "./games-stage7.js";
export * from "./games-stage8.js";
export * from "./games-stage9.js";
