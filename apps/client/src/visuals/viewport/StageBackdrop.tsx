import type { JSX } from "react";
import { PREMIUM_VISUAL_ASSETS } from "../visualAssetManifest";

interface StageBackdropProps {
  readonly requiresLandscape: boolean;
}

export function StageBackdrop({ requiresLandscape }: StageBackdropProps): JSX.Element {
  const asset = requiresLandscape
    ? PREMIUM_VISUAL_ASSETS.sharedStage[1]
    : PREMIUM_VISUAL_ASSETS.sharedStage[0];

  return (
    <div className="glix-stage-backdrop" aria-hidden="true">
      <img className="glix-backdrop-raster" src={asset.src} alt="" decoding="async" loading={asset.loading} />
      <div className="glix-backdrop-noise" />
      <div className="glix-backdrop-beam beam-cyan" />
      <div className="glix-backdrop-beam beam-magenta" />
      <div className="glix-backdrop-grid" />
      <svg className="glix-backdrop-frame" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <path d="M3 19V6h13M81 6h13v13M97 81v13H84M19 94H6V81" />
        <path className="secondary-frame" d="M6 27V6h21M73 6h21v21M94 73v21H73M27 94H6V73" />
      </svg>
    </div>
  );
}
