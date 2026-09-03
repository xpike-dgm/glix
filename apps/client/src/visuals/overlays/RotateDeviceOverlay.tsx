import type { JSX } from "react";

interface RotateDeviceOverlayProps {
  readonly gameName: string;
  readonly roomCode?: string;
}

export function RotateDeviceOverlay({ gameName, roomCode }: RotateDeviceOverlayProps): JSX.Element {
  return (
    <div className="glix-rotate-overlay" role="alert" aria-live="assertive">
      <div className="glix-rotate-panel">
        <div className="glix-rotate-illustration" aria-hidden="true">
          <svg viewBox="0 0 120 120" focusable="false">
            <path className="rotate-arrow rotate-arrow-one" d="M25 45a37 37 0 0 1 52-15l8 7" />
            <path className="rotate-arrow rotate-arrow-two" d="M95 75a37 37 0 0 1-52 15l-8-7" />
            <path className="rotate-arrow-head" d="m78 24 10 13-17 2M42 96 32 83l17-2" />
            <rect className="rotate-phone" x="42" y="28" width="36" height="64" rx="7" />
            <path className="rotate-phone-screen" d="M49 39h22v33H49z" />
            <circle cx="60" cy="83" r="3" />
          </svg>
        </div>
        <span className="glix-rotate-kicker">LANDSCAPE STAGE</span>
        <h2>Cihazını yatay çevir.</h2>
        <p><strong>{gameName}</strong> geniş ekranda oynanır. Sahne hazır; telefonu 90° döndür.</p>
        {roomCode && <span className="glix-rotate-room">ODA {roomCode}</span>}
      </div>
    </div>
  );
}
