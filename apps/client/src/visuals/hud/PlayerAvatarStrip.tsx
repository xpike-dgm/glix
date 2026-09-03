import type { CSSProperties, JSX } from "react";
import type { MatchPlayerState } from "@glix/shared";
import { PREMIUM_VISUAL_ASSETS } from "../visualAssetManifest";

interface PlayerAvatarStripProps {
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly readyPlayerIds: readonly string[];
  readonly ownHasSubmitted: boolean;
}

interface AvatarStyle extends CSSProperties {
  "--avatar-accent": string;
}

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
        {players.slice(0, PREMIUM_VISUAL_ASSETS.avatarPips.length).map((player, index) => {
          const avatar = PREMIUM_VISUAL_ASSETS.avatarPips[index] ?? PREMIUM_VISUAL_ASSETS.avatarPips[0];
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
                <img className="glix-player-pip-image" src={avatar.src} alt="" aria-hidden="true" decoding="async" loading={avatar.loading} />
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
