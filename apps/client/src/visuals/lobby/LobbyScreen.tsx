import { useState, type JSX } from "react";
import {
  GAME_CATALOG,
  MAX_PLAYERS,
  type GameId,
  type LobbyState
} from "@glix/shared";
import type { VisualConnectionState } from "../types";

export interface LobbyScreenProps {
  readonly roomState: LobbyState;
  readonly selfPlayerId: string | null;
  readonly canManageGames: boolean;
  readonly canStartMatch: boolean;
  readonly availableGameIds: ReadonlySet<string>;
  readonly availableGameCount: number;
  readonly connectedCount: number;
  readonly connection?: VisualConnectionState | undefined;
  readonly error: string | null;
  readonly notice: string | null;
  readonly initialAccordionOpen?: boolean | undefined;
  readonly onCopyRoomCode: () => void;
  readonly onLeaveRoom?: (() => void) | undefined;
  readonly onStartMatch: () => void;
  readonly onSwitchSelectionMode: (mode: "manual" | "random") => void;
  readonly onToggleGame: (gameId: GameId) => void;
  readonly onChangeRandomGameCount: (value: string) => void;
  readonly onKickPlayer?: ((playerId: string) => void) | undefined;
}

export function LobbyScreen({
  roomState,
  selfPlayerId,
  canManageGames,
  canStartMatch,
  availableGameIds,
  availableGameCount,
  connectedCount,
  error,
  notice,
  initialAccordionOpen = false,
  onCopyRoomCode,
  onLeaveRoom,
  onStartMatch,
  onSwitchSelectionMode,
  onToggleGame,
  onChangeRandomGameCount,
  onKickPlayer
}: LobbyScreenProps): JSX.Element {
  const [isGamesOpen, setIsGamesOpen] = useState(initialAccordionOpen);
  const [copied, setCopied] = useState(false);

  const selectedGameSet = new Set(roomState.selectedGameIds);
  const roomMemberCount = roomState.players.length;

  const handleCopy = (): void => {
    onCopyRoomCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="glix-lobby-screen" aria-labelledby="glix-lobby-title">
      <div className="glix-lobby-container">
        {/* Top bar with back/leave */}
        {onLeaveRoom && (
          <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
            <button
              className="glix-btn-back"
              type="button"
              onClick={onLeaveRoom}
              aria-label="Odadan ayrıl"
            >
              ← Odadan Ayrıl
            </button>
          </div>
        )}

        {/* 1. ROOM CODE CARD */}
        <section className="glix-room-code-card" aria-label="Oda Kodu Bilgisi">
          <div className="glix-room-code-info">
            <div className="glix-room-code-label">Oda Kodu</div>
            <div className="glix-room-code-display">{roomState.roomCode}</div>
          </div>
          <button
            className="glix-btn-copy-code"
            type="button"
            onClick={handleCopy}
            aria-label="Oda kodunu kopyala"
          >
            {copied ? "Kopyalandı! ✓" : "Kodu Kopyala ❐"}
          </button>
        </section>

        {/* 2. PLAYERS ROSTER CARD */}
        <section className="glix-players-card" aria-labelledby="glix-players-title">
          <div className="glix-players-header">
            <h2 id="glix-players-title" className="glix-players-title">
              <span>Oyuncular</span>
            </h2>
            <span className="glix-players-count">
              {roomMemberCount}/{MAX_PLAYERS}
            </span>
          </div>

          <div className="glix-players-list" role="list">
            {roomState.players.map((player) => {
              const isHost = player.id === roomState.hostPlayerId;
              const isSelf = player.id === selfPlayerId;
              const initial = (player.nickname.trim()[0] || "?").toUpperCase();

              return (
                <div className="glix-player-item" key={player.id} role="listitem">
                  <div className="glix-player-main">
                    <div className="glix-player-avatar" aria-hidden="true">
                      {initial}
                    </div>
                    <div className="glix-player-meta">
                      <span className="glix-player-name">
                        {player.nickname} {isSelf && "(Sen)"}
                      </span>
                      {isHost && (
                        <span className="glix-host-badge">
                          👑 Oda Sahibi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Kick UI rendered ONLY if onKickPlayer callback is provided and caller is host and not self */}
                  {canManageGames && !isSelf && onKickPlayer && (
                    <button
                      className="glix-btn-kick"
                      type="button"
                      onClick={() => onKickPlayer(player.id)}
                      aria-label={`${player.nickname} adlı oyuncuyu odadan çıkar`}
                    >
                      Çıkar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. MINIGAME SELECTION ACCORDION (CLOSED BY DEFAULT) */}
        <section className="glix-games-accordion" aria-labelledby="glix-games-heading">
          <button
            id="glix-games-heading"
            className="glix-games-trigger"
            type="button"
            onClick={() => setIsGamesOpen(!isGamesOpen)}
            aria-expanded={isGamesOpen}
            aria-controls="glix-games-panel"
          >
            <span>Minigame Seçimi ({selectedGameSet.size} Seçili)</span>
            <span className={`glix-accordion-arrow ${isGamesOpen ? "open" : ""}`}>
              ▼
            </span>
          </button>

          {isGamesOpen && (
            <div id="glix-games-panel" className="glix-games-panel">
              {canManageGames && (
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                  <button
                    className={`glix-segment-btn ${roomState.selectionMode === "manual" ? "active-create" : ""}`}
                    type="button"
                    style={{ flex: "none", padding: "6px 14px", fontSize: "0.85rem" }}
                    onClick={() => onSwitchSelectionMode("manual")}
                  >
                    Elle Seçim
                  </button>
                  <button
                    className={`glix-segment-btn ${roomState.selectionMode === "random" ? "active-create" : ""}`}
                    type="button"
                    style={{ flex: "none", padding: "6px 14px", fontSize: "0.85rem" }}
                    onClick={() => onSwitchSelectionMode("random")}
                  >
                    Rastgele
                  </button>
                </div>
              )}

              {roomState.selectionMode === "random" ? (
                <div style={{ padding: "12px", textAlign: "center" }}>
                  <label htmlFor="glix-random-count" style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>
                    Oyun Sayısı:
                  </label>
                  <select
                    id="glix-random-count"
                    value={roomState.randomGameCount}
                    disabled={!canManageGames}
                    onChange={(e) => onChangeRandomGameCount(e.target.value)}
                    style={{
                      marginLeft: "10px",
                      padding: "6px 12px",
                      background: "rgba(255,255,255,0.1)",
                      color: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px"
                    }}
                  >
                    {[3, 5, 7, 10].map((num) => (
                      <option key={num} value={num} style={{ background: "#0a0d1d" }}>
                        {num} Mini Oyun
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="glix-game-grid">
                  {GAME_CATALOG.map((game) => {
                    const isSelected = selectedGameSet.has(game.id);
                    const isAvailable = availableGameIds.has(game.id);

                    return (
                      <button
                        key={game.id}
                        type="button"
                        className={`glix-game-card-toggle ${isSelected ? "selected" : ""}`}
                        disabled={!canManageGames}
                        onClick={() => onToggleGame(game.id)}
                        aria-pressed={isSelected}
                        style={{
                          opacity: isAvailable ? 1 : 0.45,
                          cursor: canManageGames ? "pointer" : "default"
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{game.name}</span>
                        <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>{game.category}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {error && (
          <div className="glix-entry-error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(0, 240, 255, 0.12)",
              border: "1px solid rgba(0, 240, 255, 0.3)",
              borderRadius: "8px",
              color: "var(--glix-cyan)",
              fontSize: "0.9rem"
            }}
            role="status"
          >
            {notice}
          </div>
        )}

        {/* 4. LARGE START MATCH CTA */}
        {canManageGames && (
          <button
            className="glix-btn-start-match"
            type="button"
            disabled={!canStartMatch}
            onClick={onStartMatch}
            aria-label="Oyunu Başlat"
          >
            <span>▶</span>
            <span>Oyunu Başlat</span>
          </button>
        )}

        {!canManageGames && (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", padding: "12px" }}>
            Oda yöneticisinin oyunu başlatması bekleniyor...
          </div>
        )}
      </div>
    </main>
  );
}
