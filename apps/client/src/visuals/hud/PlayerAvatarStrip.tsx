import type { CSSProperties, JSX } from "react";
import type { MatchPlayerState } from "@glix/shared";

interface PlayerAvatarStripProps {
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly readyPlayerIds: readonly string[];
  readonly ownHasSubmitted: boolean;
}

interface AvatarStyle extends CSSProperties {
  "--avatar-accent": string;
}

const AVATAR_STYLES = [
  { accent: "#72f4ff", glyph: "▲" },
  { accent: "#ff55d8", glyph: "♥" },
  { accent: "#ffc857", glyph: "⚡" },
  { accent: "#a8f46a", glyph: "≡" },
  { accent: "#9a7bff", glyph: "∿" },
  { accent: "#ff8b5d", glyph: "⚠" },
  { accent: "#00ff88", glyph: "◆" },
  { accent: "#4f8cff", glyph: "✚" }
] as const;

function playerState(player: MatchPlayerState, isReady: boolean, isSelf: boolean, ownHasSubmitted: boolean): string {
  if (player.eliminated) return "ELENDİ";
  if (!player.currentGameParticipant) return "İZLEYİCİ";
  if (!player.connected) return "KOPTU";
  if (isReady || (isSelf && ownHasSubmitted)) return "HAZIR";
  return "BEKLİYOR";
}

export function PlayerAvatarStrip({
  players,
  selfPlayerId,
  readyPlayerIds,
  ownHasSubmitted
}: PlayerAvatarStripProps): JSX.Element {
  return (
    <div className="glix-player-strip" aria-label="Oyuncu durumu">
      <span className="glix-strip-label">OYUNCULAR</span>
      <div className="glix-player-strip-list">
        {players.slice(0, AVATAR_STYLES.length).map((player, index) => {
          const avatar = AVATAR_STYLES[index] ?? AVATAR_STYLES[0];
          const isSelf = player.id === selfPlayerId;
          const isReady = readyPlayerIds.includes(player.id);
          const status = playerState(player, isReady, isSelf, ownHasSubmitted);
          const style: AvatarStyle = { "--avatar-accent": avatar.accent };

          return (
            <div
              className={`glix-player-pip ${isSelf ? "is-self" : ""} ${player.eliminated ? "is-eliminated" : ""} ${!player.connected ? "is-disconnected" : ""} ${isReady || (isSelf && ownHasSubmitted) ? "is-ready" : ""}`}
              style={style}
              key={player.id}
              aria-label={`${player.nickname}: ${status}`}
              title={`${player.nickname} — ${status}`}
            >
              <span className="glix-player-pip-avatar">
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <path d="M8 16 11 9l9-4 9 4 3 7-3 11-9 7-9-7z" />
                  <path className="glix-pip-visor" d="M11 17h18l-2 8H13z" />
                  <text x="20" y="23" textAnchor="middle">{avatar.glyph}</text>
                </svg>
                <span className="glix-player-pip-state" aria-hidden="true" />
              </span>
              <span className="glix-player-pip-name">{isSelf ? "SEN" : player.nickname}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
