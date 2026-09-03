import { useState } from "react";
import type { JSX, MouseEvent, KeyboardEvent } from "react";
import type { PanelColor } from "@glix/shared";
import {
  KPK_WIRE_CONFIG,
  KPK_SLOT_GEOMETRY,
  KPK_CORRIDOR_VERTICAL,
  getWireAsset
} from "./types";
import { PREMIUM_ASSET_PATHS } from "../../visualAssetManifest";

interface KpkWireCorridorProps {
  readonly index: number;
  readonly color: PanelColor;
  readonly isSevered: boolean;
  readonly isLocked: boolean;
  readonly isPending: boolean;
  readonly isSpectator: boolean;
  readonly phase: string;
  readonly isResultTarget?: boolean;
  readonly isResultCut?: boolean;
  readonly onCut?: (color: PanelColor, xPercent: number, yPercent: number) => void;
}

export function KpkWireCorridor({
  index,
  color,
  isSevered,
  isLocked,
  isPending,
  isSpectator,
  phase,
  isResultTarget,
  isResultCut,
  onCut
}: KpkWireCorridorProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const geometry = KPK_SLOT_GEOMETRY[index] ?? KPK_SLOT_GEOMETRY[0];
  const config = KPK_WIRE_CONFIG[color] ?? KPK_WIRE_CONFIG.mavi;
  const wireSrc = getWireAsset(color);

  const canInteract = !isSpectator && phase === "playing" && !isLocked && !isSevered && !isPending;

  const handleAction = (event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>): void => {
    if (!canInteract) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const parentRect = event.currentTarget.closest(".kpk-chassis-stage")?.getBoundingClientRect() ?? rect;

    // Calculate center of this wire relative to the chassis
    const x = ((rect.left + rect.width / 2 - parentRect.left) / parentRect.width) * 100;
    const y = ((rect.top + rect.height / 2 - parentRect.top) / parentRect.height) * 100;

    // Optional subtle haptic feedback if browser supports
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate([15, 30, 15]);
      } catch {
        // Safe fallback
      }
    }

    onCut?.(color, x, y);
  };

  const wireClasses = [
    "kpk-wire-corridor",
    `slot-${index + 1}`,
    `wire-${color}`,
    isSevered ? "is-severed" : "is-intact",
    isLocked ? "is-locked" : "",
    isPending ? "is-pending" : "",
    isHovered && canInteract ? "is-hovered" : "",
    isPressed && canInteract ? "is-pressed" : "",
    isResultTarget ? "is-result-target" : "",
    isResultCut ? "is-result-cut" : "",
    isSpectator ? "is-spectator-mode" : ""
  ].filter(Boolean).join(" ");

  const slotStyle: React.CSSProperties = {
    left: geometry.left,
    width: geometry.width,
    top: KPK_CORRIDOR_VERTICAL.top,
    height: KPK_CORRIDOR_VERTICAL.height,
    "--wire-accent": config.accentColor,
    "--wire-glow": config.glowColor
  } as React.CSSProperties;

  const accessibleLabel = isSpectator
    ? `Kablo ${index + 1}: ${config.label} (İzleyici modu)`
    : isSevered
    ? `Kablo ${index + 1}: ${config.label} (Kesildi)`
    : isLocked
    ? `Kablo ${index + 1}: ${config.label} (Kilitli)`
    : `Kablo ${index + 1}: ${config.label} — Kesmek için seç`;

  return (
    <div className={wireClasses} style={slotStyle}>
      {/* Primary Interaction Surface */}
      {isSpectator ? (
        <div className="kpk-wire-surface spectator" aria-label={accessibleLabel}>
          <div
            className={`kpk-wire-sprite ${isSevered ? "is-severed" : "is-intact"}`}
            style={{
              backgroundImage: `url(${wireSrc})`
            }}
          />
          <div className="kpk-wire-tag" aria-hidden="true">
            <span className="kpk-wire-num">{index + 1}</span>
            <span className="kpk-wire-name">{config.label}</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="kpk-wire-button"
          disabled={!canInteract}
          aria-label={accessibleLabel}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => {
            setIsHovered(false);
            setIsPressed(false);
          }}
          onPointerDown={() => canInteract && setIsPressed(true)}
          onPointerUp={() => setIsPressed(false)}
          onClick={handleAction}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleAction(event);
            }
          }}
        >
          {/* Dual-state raster wire sprite: intact vs severed */}
          <div
            className={`kpk-wire-sprite ${isSevered ? "is-severed" : "is-intact"}`}
            style={{
              backgroundImage: `url(${wireSrc})`
            }}
          />

          {/* Snips reticle hovering over active target */}
          {canInteract && (isHovered || isPressed) && (
            <div className="kpk-wire-reticle" aria-hidden="true">
              <img
                src={PREMIUM_ASSET_PATHS.common.snipsReticle}
                alt=""
                className="reticle-icon"
              />
              <span className="reticle-label">KES</span>
            </div>
          )}

          {/* High-contrast embossed cable ID tag */}
          <div className="kpk-wire-tag" aria-hidden="true">
            <span className="kpk-wire-num">{index + 1}</span>
            <span className="kpk-wire-name">{config.label}</span>
          </div>

          {/* Result outcome marker badge */}
          {isResultCut && (
            <div className={`kpk-wire-result-badge ${isResultTarget ? "is-correct" : "is-wrong"}`}>
              {isResultTarget ? "DOĞRU KESİM" : "YANLIŞ KESİM"}
            </div>
          )}
          {!isResultCut && isResultTarget && (
            <div className="kpk-wire-result-badge is-target-missed">
              HEDEF KABLO
            </div>
          )}
        </button>
      )}
    </div>
  );
}
