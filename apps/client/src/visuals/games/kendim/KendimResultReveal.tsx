import { useState, useCallback } from "react";
import type { JSX } from "react";
import type { KendimCardView, KendimMatchResultView, MatchPlayerState, Stage8PointsView } from "@glix/shared";
import { findActivePlayer, getPlayerAvatarUrl } from "./types";

interface KendimResultRevealProps {
  readonly cards: readonly KendimCardView[];
  readonly matchResults: readonly KendimMatchResultView[];
  readonly ownerBonusPlayerIds: readonly string[];
  readonly resultPoints: readonly Stage8PointsView[];
  readonly selfPlayerId: string | null;
  readonly players: readonly MatchPlayerState[];
  readonly isSpectator: boolean;
}

export function KendimResultReveal({
  cards,
  matchResults,
  ownerBonusPlayerIds,
  resultPoints,
  selfPlayerId,
  players,
  isSpectator
}: KendimResultRevealProps): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(true); // Default to revealed owner

  const total = cards.length;
  const safeIndex = total > 0 ? Math.max(0, Math.min(activeIndex, total - 1)) : 0;
  const currentCard = cards[safeIndex];

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
    setIsFlipped(true);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
    setIsFlipped(true);
  }, [total]);

  if (!currentCard) {
    return (
      <div className="kendim-result-deck" aria-label="Sonuçlar yükleniyor">
        <div className="kendim-card-placeholder">Sonuçlar hesaplanıyor…</div>
      </div>
    );
  }

  // Owner information is authoritative from server during result phase
  const ownerPlayer = findActivePlayer(players, currentCard.ownerId);
  const ownerIndex = players.findIndex((p) => p.id === currentCard.ownerId);
  const isOwnerBonus = Boolean(currentCard.ownerId && ownerBonusPlayerIds.includes(currentCard.ownerId));

  // Self player guess evaluation for this card
  const myGuess = selfPlayerId
    ? matchResults.find((r) => r.guesserId === selfPlayerId && r.cardId === currentCard.cardId)
    : null;
  const myTargetPlayer = myGuess ? findActivePlayer(players, myGuess.targetPlayerId) : null;

  // Self total round points from authoritative resultPoints
  const myResultEntry = selfPlayerId ? resultPoints.find((p) => p.playerId === selfPlayerId) : null;
  const myTotalRoundScore = myResultEntry ? myResultEntry.points : 0;
  const scorePrefix = myTotalRoundScore > 0 ? "+" : "";

  // Is this self's own card?
  const isMyCard = Boolean(selfPlayerId && currentCard.ownerId === selfPlayerId);

  return (
    <div className="kendim-result-deck" aria-label="Kendim Tur Sonuçları">
      {/* Top Deck Navigation Bar */}
      <div className="kendim-deck-status-bar">
        <div className="kendim-deck-counter">
          <span className="kendim-deck-eyebrow">SONUÇ AÇIKLAMA DESTEK ALANI</span>
          <strong>KART {safeIndex + 1} / {total}</strong>
        </div>

        {/* Semantic Dots Indicator */}
        <div className="kendim-deck-dots" role="tablist" aria-label="Sonuç kartı seçimi">
          {cards.map((card, index) => {
            const isCurrent = index === safeIndex;
            const guessForCard = selfPlayerId
              ? matchResults.find((r) => r.guesserId === selfPlayerId && r.cardId === card.cardId)
              : null;
            const statusClass = guessForCard
              ? guessForCard.correct ? "is-correct-dot" : "is-wrong-dot"
              : "is-unmapped-dot";

            return (
              <button
                key={card.cardId}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Sonuç Kartı ${index + 1}`}
                className={`kendim-deck-dot ${isCurrent ? "is-active" : ""} ${statusClass}`}
                onClick={() => {
                  setActiveIndex(index);
                  setIsFlipped(true);
                }}
              >
                <span className="kendim-deck-dot-inner" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2D Planar Flip Hero Card */}
      <div className="kendim-card-stage is-result-stage">
        <button
          type="button"
          className="kendim-carousel-arrow is-prev"
          onClick={handlePrev}
          disabled={total <= 1}
          aria-label="Önceki sonuç kartı"
        >
          ‹
        </button>

        {/* 2D Planar Flip Card Container */}
        <div
          className={`kendim-hero-card is-result-card ${isFlipped ? "is-revealed" : "is-word-side"}`}
          onClick={() => setIsFlipped((prev) => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsFlipped((prev) => !prev);
            }
          }}
          aria-label={`${currentCard.word} kartı, sahibi ${ownerPlayer?.nickname ?? "Bilinmiyor"}. Çevirmek için dokun.`}
        >
          <div className="kendim-card-frame">
            <div className="kendim-card-foil-sheen" aria-hidden="true" />

            {/* Front / Back 2D Content */}
            {isFlipped ? (
              /* REVEALED OWNER BACKFACE */
              <div className="kendim-card-revealed-face">
                <div className="kendim-revealed-topline">
                  <span className="kendim-card-index-pill">KART #{safeIndex + 1}</span>
                  <span className="kendim-revealed-badge">KART SAHİBİ</span>
                </div>

                <div className="kendim-owner-portrait-cluster">
                  <div className={`kendim-owner-avatar-frame ${isOwnerBonus ? "has-bonus-halo" : ""}`}>
                    <img
                      src={getPlayerAvatarUrl(ownerIndex >= 0 ? ownerIndex : 0)}
                      alt=""
                      className="kendim-owner-avatar-img"
                    />
                    {isOwnerBonus && (
                      <span className="kendim-owner-bonus-halo" aria-hidden="true" />
                    )}
                  </div>
                  <strong className="kendim-owner-nickname">
                    {ownerPlayer?.nickname ?? "Bilinmeyen"}
                  </strong>
                  <span className="kendim-owner-word-echo">“{currentCard.word}”</span>
                </div>

                {isOwnerBonus && (
                  <div className="kendim-owner-bonus-stamp" aria-label="Tek doğru tahmin bonusu">
                    <span className="kendim-stamp-star" aria-hidden="true">★</span>
                    <span>TEK DOĞRU TAHMİN BONUSU +1</span>
                  </div>
                )}
              </div>
            ) : (
              /* ANONYMOUS WORD FRONTFACE */
              <div className="kendim-card-front-face">
                <div className="kendim-card-topline">
                  <span className="kendim-card-index-pill">KART #{safeIndex + 1}</span>
                  <span className="kendim-flip-hint">DOKUN VE SAHİBİNİ GÖR</span>
                </div>
                <div className="kendim-card-body">
                  <span className="kendim-card-quote-mark" aria-hidden="true">“</span>
                  <p className="kendim-card-word">{currentCard.word}</p>
                  <span className="kendim-card-quote-mark is-closing" aria-hidden="true">”</span>
                </div>
              </div>
            )}

            {/* Player's Mapping Result Marker (Semantic Status) */}
            <div className="kendim-result-marker-bar">
              {isSpectator ? (
                <div className="kendim-result-badge is-neutral">
                  <span className="kendim-result-icon" aria-hidden="true">👁</span>
                  <span>GÖZLEM MODU</span>
                </div>
              ) : isMyCard ? (
                <div className="kendim-result-badge is-self-card">
                  <span className="kendim-result-icon" aria-hidden="true">✦</span>
                  <span>SENİN KELİMEN</span>
                </div>
              ) : myGuess ? (
                myGuess.correct ? (
                  <div className="kendim-result-badge is-correct">
                    <span className="kendim-result-icon" aria-hidden="true">✓</span>
                    <span className="kendim-result-text">
                      DOĞRU EŞLEŞTİRME <strong>+1</strong>
                    </span>
                  </div>
                ) : (
                  <div className="kendim-result-badge is-wrong">
                    <span className="kendim-result-icon" aria-hidden="true">✕</span>
                    <span className="kendim-result-text">
                      YANLIŞ ({myTargetPlayer?.nickname ?? "Bilinmeyen"}) <strong>−1</strong>
                    </span>
                  </div>
                )
              ) : (
                <div className="kendim-result-badge is-neutral">
                  <span className="kendim-result-icon" aria-hidden="true">—</span>
                  <span className="kendim-result-text">EŞLEŞTİRİLMEDİ (0)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="kendim-carousel-arrow is-next"
          onClick={handleNext}
          disabled={total <= 1}
          aria-label="Sonraki sonuç kartı"
        >
          ›
        </button>
      </div>

      {/* Secondary Compact Player Summary (Strictly secondary, scroll-free, no large modal) */}
      <div className="kendim-result-footer">
        {!isSpectator && (
          <div className="kendim-self-score-chip" aria-label={`Senin tur puanın: ${scorePrefix}${myTotalRoundScore}`}>
            <span className="kendim-chip-label">TUR PUANIN</span>
            <strong className="kendim-chip-value">{scorePrefix}{myTotalRoundScore}</strong>
          </div>
        )}

        <div className="kendim-compact-roster-rail" aria-label="Tüm oyuncu tur sonuçları">
          {resultPoints.map((entry) => {
            const player = findActivePlayer(players, entry.playerId);
            const isMe = entry.playerId === selfPlayerId;
            const ptsPrefix = entry.points > 0 ? "+" : "";

            return (
              <div
                key={entry.playerId}
                className={`kendim-compact-player-chip ${isMe ? "is-self" : ""}`}
              >
                <span className="kendim-roster-name">{player?.nickname ?? entry.playerId.slice(0, 4)}</span>
                <strong className={`kendim-roster-score ${entry.points > 0 ? "is-positive" : entry.points < 0 ? "is-negative" : ""}`}>
                  {ptsPrefix}{entry.points}
                </strong>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
