import type { JSX } from "react";
import type { MatchPlayerState } from "@glix/shared";
import { getPlayerAvatarUrl, isEligibleTarget } from "./types";

interface KendimPortraitTrayProps {
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly isOwnCardActive: boolean;
  readonly currentMappedPlayerId: string | null;
  readonly isLocked: boolean;
  readonly isSpectator: boolean;
  readonly onSelectPlayer: (targetPlayerId: string) => void;
  readonly onClearMapping: () => void;
  readonly onLockMatches: () => void;
  readonly mappedCount: number;
  readonly totalCardsCount: number;
}

export function KendimPortraitTray({
  players,
  selfPlayerId,
  isOwnCardActive,
  currentMappedPlayerId,
  isLocked,
  isSpectator,
  onSelectPlayer,
  onClearMapping,
  onLockMatches,
  mappedCount,
  totalCardsCount
}: KendimPortraitTrayProps): JSX.Element {
  // Only display eligible participants in the match tray
  const eligiblePlayers = players.filter(isEligibleTarget);

  return (
    <div className="kendim-portrait-tray-section" aria-label="Oyuncu Portre Tepsisi">
      <div className="kendim-tray-header">
        <span className="kendim-tray-label">PORTRELER</span>
        <span className="kendim-tray-instruction">
          {isLocked
            ? "Eşleştirmeler kilitlendi"
            : isSpectator
            ? "Gözlem modu — eşleştirme yapılamaz"
            : isOwnCardActive
            ? "Kendi kartını kendine bağlayamazsın"
            : "Kartı bağlamak için bir portre seç"}
        </span>
      </div>

      <div className="kendim-portrait-grid" role="group" aria-label="Oyuncu portreleri">
        {eligiblePlayers.map((player, index) => {
          const isSelf = player.id === selfPlayerId;
          const isInvalidSelfTarget = isOwnCardActive && isSelf;
          const isMappedToCurrent = currentMappedPlayerId === player.id;
          const isDisabled = isLocked || isSpectator || isInvalidSelfTarget;

          return (
            <button
              key={player.id}
              type="button"
              className={`kendim-portrait-token ${isMappedToCurrent ? "is-tethered" : ""} ${isInvalidSelfTarget ? "is-invalid-self" : ""}`}
              disabled={isDisabled}
              aria-label={`${player.nickname}${isMappedToCurrent ? " (bağlandı)" : ""}${isInvalidSelfTarget ? " (kendi kartın)" : ""}`}
              onClick={() => {
                if (isMappedToCurrent) {
                  onClearMapping();
                } else {
                  onSelectPlayer(player.id);
                }
              }}
            >
              <div className="kendim-portrait-frame">
                <img
                  src={getPlayerAvatarUrl(index)}
                  alt=""
                  className="kendim-portrait-avatar"
                  loading="eager"
                  decoding="async"
                />
                {isMappedToCurrent && (
                  <span className="kendim-magnetic-pin" aria-hidden="true">
                    <span className="kendim-pin-dot" />
                    <span className="kendim-pin-ring" />
                  </span>
                )}
              </div>
              <span className="kendim-portrait-name">{player.nickname}</span>
            </button>
          );
        })}
      </div>

      {/* Batch submission footer */}
      <div className="kendim-tray-footer">
        <div className="kendim-mapping-summary">
          <span className="kendim-mapping-count">
            <strong>{mappedCount}</strong> / {totalCardsCount} kart eşleşti
          </span>
          <span className="kendim-mapping-subtext">
            {isLocked ? "Kararların kaydedildi" : "Boş bırakılan kartlar puan kaybettirmez"}
          </span>
        </div>

        {!isSpectator && (
          <button
            type="button"
            className="kendim-lock-matches-button"
            disabled={isLocked}
            onClick={onLockMatches}
          >
            <span className="kendim-lock-glow" aria-hidden="true" />
            <span className="kendim-lock-content">
              <span className="kendim-lock-icon" aria-hidden="true">
                {isLocked ? "🔒" : "⚡"}
              </span>
              <strong>{isLocked ? "EŞLEŞTİRMELER KİLİTLİ" : "EŞLEŞTİRMELERİ KİLİTLE"}</strong>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
