import { useState, useCallback, useEffect } from "react";
import type { JSX } from "react";
import type { JsonValue } from "@glix/shared";
import type { KontrolPaneliPublicState, KontrolPaneliOwnState, PanelColor } from "@glix/shared";
import type { VisualPhase } from "../../types";
import { KpkWireCorridor } from "./KpkWireCorridor";
import { KpkClueDock } from "./KpkClueDock";
import { KpkSparksFx } from "./KpkSparksFx";
import { DEFAULT_SPECTATOR_COLORS, KPK_WIRE_CONFIG } from "./types";
import { PREMIUM_ASSET_PATHS } from "../../visualAssetManifest";

interface KpkStageProps {
  readonly publicState: KontrolPaneliPublicState;
  readonly ownState: KontrolPaneliOwnState | null | undefined;
  readonly phase: VisualPhase;
  readonly isSpectator: boolean;
  readonly selfPlayerId: string | null;
  readonly isReady?: boolean;
  readonly onReady?: () => void;
  readonly onSubmitAction: (payload: JsonValue) => void;
}

export function KpkStage({
  publicState,
  ownState,
  phase,
  isSpectator,
  selfPlayerId,
  isReady,
  onReady,
  onSubmitAction
}: KpkStageProps): JSX.Element {
  // Local pending/committed selection - never invented on reconnect
  const [localCutColor, setLocalCutColor] = useState<PanelColor | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [sparkFx, setSparkFx] = useState<{ x: number; y: number; color: string } | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const hasCutConfirmed = Boolean(ownState?.hasCut);
  const isResultsPhase = phase === "results" || publicState.finished;

  // Resolve player's server result from publicState.results
  const myResult = isResultsPhase && selfPlayerId && publicState.results
    ? publicState.results.find((r) => r.playerId === selfPlayerId) ?? null
    : null;

  // Reset local state if phase transitions away from playing/results
  useEffect(() => {
    if (phase === "preparing" || phase === "tutorial") {
      setLocalCutColor(null);
      setIsPending(false);
      setSparkFx(null);
    }
  }, [phase]);

  // Handle cut submission
  const handleCut = useCallback((color: PanelColor, xPercent: number, yPercent: number): void => {
    if (isSpectator || hasCutConfirmed || isPending || isResultsPhase) {
      return;
    }

    setLocalCutColor(color);
    setIsPending(true);

    const wireCfg = KPK_WIRE_CONFIG[color];
    setSparkFx({ x: xPercent, y: yPercent, color: wireCfg?.accentColor ?? "#00f5ff" });
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 240);

    // Submit server-authoritative action
    onSubmitAction({ kind: "panel-cut", color });
  }, [isSpectator, hasCutConfirmed, isPending, isResultsPhase, onSubmitAction]);

  // Determine wire list: own panel colors or spectator default
  const panelColors = (ownState?.panelColors && ownState.panelColors.length === 4)
    ? ownState.panelColors
    : DEFAULT_SPECTATOR_COLORS;

  // Lock status: either confirmed by server (hasCut), pending local submit, or results phase
  const isConsoleLocked = hasCutConfirmed || isPending || isResultsPhase;

  // Clue text comes strictly from ownState.clueText
  const clueText = ownState?.clueText ?? "";

  // Dynamic console status text
  let statusMessage: string | null = null;
  if (isResultsPhase && myResult) {
    statusMessage = myResult.correct
      ? "DOĞRU KABLO KESİLDİ — KONSOL ÇÖZÜLDÜ"
      : myResult.cutColor
      ? "YANLIŞ KABLO KESİLDİ — SİSTEM KİLİTLENDİ"
      : "KABLO KESİLMEDİ — SÜRE DOLDU";
  } else if (hasCutConfirmed) {
    statusMessage = localCutColor
      ? `${localCutColor.toLocaleUpperCase("tr-TR")} KESİLDİ — DİĞER OYUNCULAR BEKLENİYOR`
      : "KABLO KESİLDİ — DİĞER OYUNCULAR BEKLENİYOR";
  } else if (isPending) {
    statusMessage = "SEÇİM İLETİLİYOR...";
  }

  return (
    <div className="kpk-stage-container" aria-label="Kontrol Paneli Kaosu Arcade Sahnesi">
      {/* 16:9 Responsive Arcade Console Chassis */}
      <div className={`kpk-chassis-stage ${isShaking ? "is-shaking" : ""}`}>
        {/* Raster Chassis Backplate with transparent cutout bays */}
        <img
          src={PREMIUM_ASSET_PATHS.games.kontrolPaneliKaosu.chassis}
          alt=""
          className="kpk-chassis-image"
          decoding="async"
          loading="eager"
        />

        {/* 4 Interactive Cable Corridors positioned precisely in cutout slots */}
        <div className="kpk-wires-layer">
          {panelColors.map((color, index) => {
            // Determine severed state:
            // 1. In results: driven authoritatively by server result (myResult.cutColor)
            // 2. In playing: driven by localCutColor ONLY IF pending or confirmed by server
            let isSevered = false;
            if (isResultsPhase && myResult) {
              isSevered = myResult.cutColor === color;
            } else if (localCutColor === color && (hasCutConfirmed || isPending)) {
              isSevered = true;
            }

            const isResultTarget = Boolean(isResultsPhase && myResult?.correctColor === color);
            const isResultCut = Boolean(isResultsPhase && myResult?.cutColor === color);

            return (
              <KpkWireCorridor
                key={`${color}-${index}`}
                index={index}
                color={color}
                isSevered={isSevered}
                isLocked={isConsoleLocked}
                isPending={isPending}
                isSpectator={isSpectator}
                phase={phase}
                isResultTarget={isResultTarget}
                isResultCut={isResultCut}
                onCut={handleCut}
              />
            );
          })}
        </div>

        {/* Restrained Electrical Micro-Spark FX */}
        {sparkFx && (
          <KpkSparksFx
            xPercent={sparkFx.x}
            yPercent={sparkFx.y}
            accentColor={sparkFx.color}
            onDone={() => setSparkFx(null)}
          />
        )}

        {/* Tactile Private Clue Terminal Dock */}
        <div className="kpk-clue-dock-anchor">
          <KpkClueDock
            clueText={clueText}
            isSpectator={isSpectator}
            phase={phase}
            isLocked={isConsoleLocked}
            statusMessage={statusMessage}
            myResult={myResult}
          />
        </div>

        {/* Preparing Phase Ready Action */}
        {phase === "preparing" && !isSpectator && onReady && (
          <div className="kpk-ready-overlay">
            <button
              className="kpk-ready-button"
              type="button"
              disabled={isReady}
              onClick={onReady}
            >
              <span aria-hidden="true">{isReady ? "✓" : "→"}</span>
              <strong>{isReady ? "HAZIRSIN" : "HAZIRIM"}</strong>
              <small>{isReady ? "DİĞERLERİ BEKLENİYOR" : "KONSOLU AÇ"}</small>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
