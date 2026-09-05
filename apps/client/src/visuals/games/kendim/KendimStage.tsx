import { useState, useCallback, useEffect, useRef } from "react";
import type { JSX } from "react";
import type { JsonValue, KendimPublicState, KendimOwnState, MatchPlayerState } from "@glix/shared";
import type { VisualPhase } from "../../types";
import type { ClientActionState } from "@glix/shared";
import { findActivePlayer, isEligibleTarget, pruneInvalidLocalMappings } from "./types";
import { KendimWordComposer } from "./KendimWordComposer";
import { KendimCardCarousel } from "./KendimCardCarousel";
import { KendimPortraitTray } from "./KendimPortraitTray";
import { KendimResultReveal } from "./KendimResultReveal";
import { KendimTetherOverlay } from "./KendimTetherOverlay";

interface KendimStageProps {
  readonly publicState: KendimPublicState;
  readonly ownState: KendimOwnState | null | undefined;
  readonly phase: VisualPhase;
  readonly isSpectator: boolean;
  readonly selfPlayerId: string | null;
  readonly players?: readonly MatchPlayerState[];
  readonly isReady?: boolean;
  readonly actionState: ClientActionState | null;
  readonly onReady?: () => void;
  readonly onSubmitAction: (payload: JsonValue) => void;
}

export function KendimStage({
  publicState,
  ownState,
  phase,
  isSpectator,
  selfPlayerId,
  players = [],
  isReady,
  actionState,
  onReady,
  onSubmitAction
}: KendimStageProps): JSX.Element {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [isMatchesPending, setIsMatchesPending] = useState(false);

  // Refs for dynamic tether measurement
  const matchSurfaceRef = useRef<HTMLDivElement | null>(null);
  const cardSocketRef = useRef<HTMLDivElement | null>(null);
  const portraitSocketRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleSetPortraitSocketRef = useCallback((playerId: string, el: HTMLDivElement | null): void => {
    portraitSocketRefs.current[playerId] = el;
  }, []);

  const subPhase = publicState?.subPhase ?? "write";
  const cards = publicState?.cards ?? [];
  const totalCards = cards.length;
  const currentCard = totalCards > 0 ? cards[Math.min(activeCardIndex, totalCards - 1)] : null;
  const currentCardId = currentCard?.cardId ?? null;

  // Derive private own card id strictly from ownState
  const ownCardId = ownState?.ownCardId ?? null;
  const isOwnCardActive = Boolean(currentCardId && ownCardId && currentCardId === ownCardId);

  // Locked state: confirmed by server or currently pending
  const hasSubmittedMatches = Boolean(ownState?.hasSubmittedMatches);
  const isMatchesLocked = hasSubmittedMatches || isMatchesPending;

  // Prune invalid local mappings when player eligibility changes BEFORE authoritative submission is accepted
  useEffect(() => {
    if (hasSubmittedMatches) return;
    setMatches((currentMatches) => {
      const { prunedMatches, hasPruned } = pruneInvalidLocalMappings(currentMatches, players);
      return hasPruned ? prunedMatches : currentMatches;
    });
  }, [players, hasSubmittedMatches]);

  // Derive the currently valid local mappings for pre-submit state (synchronous consistency across renders)
  const effectiveMatches = hasSubmittedMatches
    ? matches
    : pruneInvalidLocalMappings(matches, players).prunedMatches;

  // Reset pending matches if rejected by server, or when authoritative ownState confirms
  useEffect(() => {
    if (!actionState || actionState.status === "rejected" || (actionState.status === "accepted" && hasSubmittedMatches)) setIsMatchesPending(false);
  }, [actionState, hasSubmittedMatches]);

  useEffect(() => {
    if (hasSubmittedMatches) {
      setIsMatchesPending(false);
    }
  }, [hasSubmittedMatches]);

  // Reset local state if phase changes back to preparing
  useEffect(() => {
    if (phase === "preparing" || phase === "tutorial") {
      setMatches({});
      setIsMatchesPending(false);
      setActiveCardIndex(0);
    }
  }, [phase]);

  // Handle word submission
  const handleSubmitWord = useCallback((word: string): void => {
    onSubmitAction({ kind: "kendim-word", word });
  }, [onSubmitAction]);

  // Handle mapping a player to the currently active card
  const handleSelectPlayer = useCallback((targetPlayerId: string): void => {
    if (!currentCardId || isMatchesLocked || isSpectator) return;
    // Guard against mapping own card to self
    if (isOwnCardActive && targetPlayerId === selfPlayerId) return;

    // Guard against mapping to an ineligible target
    const targetPlayer = findActivePlayer(players, targetPlayerId);
    if (!targetPlayer) return;

    setMatches((prev) => ({
      ...prev,
      [currentCardId]: targetPlayerId
    }));
  }, [currentCardId, isMatchesLocked, isOwnCardActive, isSpectator, players, selfPlayerId]);

  // Handle clearing mapping for the current card
  const handleClearCurrentMapping = useCallback((): void => {
    if (!currentCardId || isMatchesLocked || isSpectator) return;
    setMatches((prev) => {
      const next = { ...prev };
      delete next[currentCardId];
      return next;
    });
  }, [currentCardId, isMatchesLocked, isSpectator]);

  // Handle clearing mapping for any specific card
  const handleClearMappingForCard = useCallback((cardId: string): void => {
    if (isMatchesLocked || isSpectator) return;
    setMatches((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  }, [isMatchesLocked, isSpectator]);

  // Handle batch match submission
  const handleLockMatches = useCallback((): void => {
    if (isMatchesLocked || isSpectator) return;
    setIsMatchesPending(true);

    // Authoritative client-side pruning before submit
    const { prunedMatches } = pruneInvalidLocalMappings(matches, players);
    if (!hasSubmittedMatches) {
      setMatches(prunedMatches);
    }

    const formattedMatches = Object.entries(prunedMatches)
      .filter(([, targetPlayerId]) => Boolean(targetPlayerId))
      .map(([cardId, targetPlayerId]) => ({ cardId, targetPlayerId }));

    onSubmitAction({
      kind: "kendim-matches",
      matches: formattedMatches
    });
  }, [isMatchesLocked, isSpectator, matches, players, hasSubmittedMatches, onSubmitAction]);

  const mappedCount = Object.keys(effectiveMatches).length;
  const currentMappedPlayerId = currentCardId ? (effectiveMatches[currentCardId] ?? null) : null;
  const targetSocketEl = currentMappedPlayerId ? (portraitSocketRefs.current[currentMappedPlayerId] ?? null) : null;

  return (
    <div className="kendim-stage-container" aria-label="Kendim Portre Oyun Alanı">
      {/* 1. Preparing Phase Overlay */}
      {phase === "preparing" && !isSpectator && onReady && (
        <div className="kendim-ready-overlay">
          <button
            className="kendim-ready-button"
            type="button"
            disabled={isReady}
            onClick={onReady}
          >
            <span aria-hidden="true">{isReady ? "✓" : "→"}</span>
            <strong>{isReady ? "HAZIRSIN" : "HAZIRIM"}</strong>
            <small>{isReady ? "DİĞERLERİ BEKLENİYOR" : "KİMLİK TARAMASINA BAŞLA"}</small>
          </button>
        </div>
      )}

      {/* 2. Write Phase (30s): Identity Scanner */}
      {subPhase === "write" && (
        <KendimWordComposer
          initialWord={ownState?.ownWord ?? ""}
          hasWritten={Boolean(ownState?.hasWritten)}
          isSpectator={isSpectator}
          actionState={actionState}
          onSubmitWord={handleSubmitWord}
        />
      )}

      {/* 3. Match Phase (30s): Card Deck + Portrait Tray + Physical Tether */}
      {subPhase === "match" && (
        <div ref={matchSurfaceRef} className="kendim-match-surface">
          {/* Dynamic SVG Neon Tether Overlay */}
          <KendimTetherOverlay
            containerRef={matchSurfaceRef}
            cardSocketRef={cardSocketRef}
            targetSocketRef={targetSocketEl}
            isMapped={Boolean(currentMappedPlayerId && !isSpectator)}
            activeCardId={currentCardId}
            targetPlayerId={currentMappedPlayerId}
          />

          <KendimCardCarousel
            cards={cards}
            activeIndex={activeCardIndex}
            ownCardId={ownCardId}
            matches={effectiveMatches}
            players={players}
            isLocked={isMatchesLocked}
            cardSocketRef={cardSocketRef}
            onChangeIndex={setActiveCardIndex}
            onClearMapping={handleClearMappingForCard}
          />

          <KendimPortraitTray
            players={players}
            selfPlayerId={selfPlayerId}
            isOwnCardActive={isOwnCardActive}
            currentMappedPlayerId={currentMappedPlayerId}
            isLocked={isMatchesLocked}
            isSpectator={isSpectator}
            setPortraitSocketRef={handleSetPortraitSocketRef}
            onSelectPlayer={handleSelectPlayer}
            onClearMapping={handleClearCurrentMapping}
            onLockMatches={handleLockMatches}
            mappedCount={mappedCount}
            totalCardsCount={totalCards}
          />
        </div>
      )}

      {/* 4. Results Phase: Integrated Card Flip Reveal */}
      {(subPhase === "results" || publicState?.finished) && (
        <KendimResultReveal
          cards={cards}
          matchResults={publicState?.matchResults ?? []}
          ownerBonusPlayerIds={publicState?.ownerBonusPlayerIds ?? []}
          resultPoints={publicState?.resultPoints ?? []}
          selfPlayerId={selfPlayerId}
          players={players}
          isSpectator={isSpectator}
        />
      )}
    </div>
  );
}
