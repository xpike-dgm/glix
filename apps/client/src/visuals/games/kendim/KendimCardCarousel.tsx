import { useCallback, useEffect } from "react";
import type { JSX, RefObject } from "react";
import type { KendimCardView, MatchPlayerState } from "@glix/shared";
import { findActivePlayer } from "./types";

interface KendimCardCarouselProps {
  readonly cards: readonly KendimCardView[];
  readonly activeIndex: number;
  readonly ownCardId: string | null;
  readonly matches: Record<string, string>;
  readonly players: readonly MatchPlayerState[];
  readonly isLocked: boolean;
  readonly cardSocketRef?: RefObject<HTMLDivElement | null>;
  readonly onChangeIndex: (newIndex: number) => void;
  readonly onClearMapping: (cardId: string) => void;
}

export function KendimCardCarousel({
  cards,
  activeIndex,
  ownCardId,
  matches,
  players,
  isLocked,
  cardSocketRef,
  onChangeIndex,
  onClearMapping
}: KendimCardCarouselProps): JSX.Element {
  const total = cards.length;
  const safeIndex = total > 0 ? Math.max(0, Math.min(activeIndex, total - 1)) : 0;
  const currentCard = cards[safeIndex];

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    onChangeIndex((safeIndex - 1 + total) % total);
  }, [onChangeIndex, safeIndex, total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    onChangeIndex((safeIndex + 1) % total);
  }, [onChangeIndex, safeIndex, total]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "ArrowLeft") {
        handlePrev();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!currentCard) {
    return (
      <div className="kendim-carousel-deck" aria-label="Kartlar bekleniyor">
        <div className="kendim-card-placeholder">Kartlar dağıtılıyor…</div>
      </div>
    );
  }

  // Derive private own-card status strictly from local ownCardId
  const isOwnCard = Boolean(ownCardId && currentCard.cardId === ownCardId);
  const mappedPlayerId = matches[currentCard.cardId] ?? null;
  const mappedPlayer = findActivePlayer(players, mappedPlayerId);

  // Responsive font scaling for word
  const wordLen = currentCard.word.length;
  const wordScaleClass = wordLen > 18 ? "is-super-long" : wordLen > 12 ? "is-long" : "is-standard";

  return (
    <div className="kendim-carousel-deck" aria-label="Kelime Kartları Destesi">
      {/* Top Deck Navigation Bar */}
      <div className="kendim-deck-status-bar">
        <span className="kendim-deck-eyebrow">KARTLAR</span>
        <strong className="kendim-deck-counter-label">KART {safeIndex + 1} / {total}</strong>

        {/* Semantic Dots Indicator (Progress display, primary nav is ‹/›) */}
        <div
          className="kendim-deck-dots"
          role="progressbar"
          aria-label={`Kart ${safeIndex + 1} / ${total}`}
          aria-valuenow={safeIndex + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        >
          {cards.map((card, index) => {
            const hasMapping = Boolean(matches[card.cardId]);
            const isCurrent = index === safeIndex;
            const isLocalCard = Boolean(ownCardId && card.cardId === ownCardId);

            return (
              <span
                key={card.cardId}
                aria-hidden="true"
                className={`kendim-deck-dot-indicator ${isCurrent ? "is-active" : ""} ${hasMapping ? "is-mapped" : ""} ${isLocalCard ? "is-own" : ""}`}
              >
                <span className="kendim-deck-dot-inner" />
              </span>
            );
          })}
        </div>
      </div>

      {/* Main Card Arena with Carousel Controls */}
      <div className="kendim-card-stage">
        <button
          type="button"
          className="kendim-carousel-arrow is-prev"
          onClick={handlePrev}
          disabled={total <= 1}
          aria-label="Önceki kart"
        >
          ‹
        </button>

        {/* Hero Active Card Container */}
        <div
          className={`kendim-hero-card ${isOwnCard ? "is-own-card" : ""} ${mappedPlayer ? "has-tether" : ""}`}
          data-card-id={currentCard.cardId}
        >
          <div className="kendim-card-frame">
            <div className="kendim-card-foil-sheen" aria-hidden="true" />
            <div className="kendim-card-tech-grid top-right" aria-hidden="true" />
            <div className="kendim-card-tech-grid bottom-left" aria-hidden="true" />

            <div className="kendim-card-topline">
              <span className="kendim-card-index-pill">KART #{safeIndex + 1}</span>
              {isOwnCard && (
                <span className="kendim-own-card-badge" aria-label="Bu senin kelimen">
                  SENİN KARTIN
                </span>
              )}
            </div>

            <div className="kendim-card-body">
              <span className="kendim-card-quote-mark" aria-hidden="true">“</span>
              <p className={`kendim-card-word ${wordScaleClass}`}>
                {currentCard.word}
              </p>
              <span className="kendim-card-quote-mark is-closing" aria-hidden="true">”</span>
            </div>

            <div className="kendim-card-tether-bar">
              {mappedPlayer ? (
                <div className="kendim-tether-indicator is-connected">
                  <span className="kendim-tether-dot" aria-hidden="true" />
                  <span className="kendim-tether-label">
                    BAĞLANDI: <strong>{mappedPlayer.nickname}</strong>
                  </span>
                  {!isLocked && (
                    <button
                      type="button"
                      className="kendim-clear-mapping-btn"
                      onClick={() => onClearMapping(currentCard.cardId)}
                      aria-label="Eşleştirmeyi kaldır"
                    >
                      <span className="kendim-clear-mapping-icon" aria-hidden="true">✕</span>
                    </button>
                  )}
                </div>
              ) : isLocked ? (
                <div className="kendim-tether-indicator is-locked-neutral">
                  <span className="kendim-tether-lock-icon" aria-hidden="true">🔒</span>
                  <span className="kendim-tether-label">SEÇİMLER KİLİTLİ</span>
                </div>
              ) : (
                <div className="kendim-tether-indicator is-empty">
                  <span className="kendim-tether-empty-dot" aria-hidden="true" />
                  <span className="kendim-tether-label">EŞLEŞTİRİLMEDİ (BOŞ)</span>
                </div>
              )}
            </div>
          </div>

          {/* Magnetic Connection Socket on Card Bottom */}
          <div
            ref={cardSocketRef}
            className={`kendim-card-socket ${mappedPlayer ? "is-connected" : isLocked ? "is-locked" : "is-dormant"}`}
            aria-hidden="true"
          >
            <span className="kendim-socket-ring-outer" />
            <span className="kendim-socket-ring-inner" />
            <span className="kendim-socket-aperture" />
          </div>
        </div>

        <button
          type="button"
          className="kendim-carousel-arrow is-next"
          onClick={handleNext}
          disabled={total <= 1}
          aria-label="Sonraki kart"
        >
          ›
        </button>
      </div>
    </div>
  );
}
