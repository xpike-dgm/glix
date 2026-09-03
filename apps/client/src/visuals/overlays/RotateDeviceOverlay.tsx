import type { JSX } from "react";
import { PREMIUM_VISUAL_ASSETS } from "../visualAssetManifest";

interface RotateDeviceOverlayProps {
  readonly gameName: string;
  readonly roomCode?: string;
}

export function RotateDeviceOverlay({ gameName, roomCode }: RotateDeviceOverlayProps): JSX.Element {
  return (
    <div className="glix-rotate-overlay" role="alert" aria-live="assertive">
      <div className="glix-rotate-panel">
        <div className="glix-rotate-illustration" aria-hidden="true">
          <img className="glix-rotate-icon" src={PREMIUM_VISUAL_ASSETS.common.rotatePhoneIcon.src} alt="" decoding="async" loading="eager" />
        </div>
        <span className="glix-rotate-kicker">LANDSCAPE STAGE</span>
        <h2>Cihazını yatay çevir.</h2>
        <p><strong>{gameName}</strong> geniş ekranda oynanır. Sahne hazır; telefonu 90° döndür.</p>
        {roomCode && <span className="glix-rotate-room">ODA {roomCode}</span>}
      </div>
    </div>
  );
}
