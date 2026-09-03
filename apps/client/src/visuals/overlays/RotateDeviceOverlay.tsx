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
          <svg viewBox="0 0 120 120" className="glix-rotate-svg" width="100%" height="100%">
            {/* Guide Rotation Arc */}
            <path
              d="M 94 40 A 38 38 0 0 0 38 24"
              fill="none"
              stroke="#ff007f"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 4"
            />
            <polygon points="34,18 36,30 24,24" fill="#ff007f" />

            {/* Clearly Identifiable Smartphone Silhouette */}
            <g className="glix-rotating-phone">
              {/* Outer Phone Body */}
              <rect
                x="41"
                y="22"
                width="38"
                height="76"
                rx="8"
                fill="#070b19"
                stroke="#00f5ff"
                strokeWidth="2.5"
              />
              {/* Active Screen Display Area */}
              <rect
                x="45"
                y="30"
                width="30"
                height="60"
                rx="4"
                fill="#0e1736"
                stroke="rgba(0, 245, 255, 0.3)"
                strokeWidth="1"
              />
              {/* Dynamic Island / Speaker */}
              <rect
                x="53"
                y="25.5"
                width="14"
                height="3"
                rx="1.5"
                fill="#00f5ff"
              />
              {/* Screen Home Bar Indicator */}
              <rect
                x="52"
                y="85"
                width="16"
                height="2.5"
                rx="1.25"
                fill="#ffd700"
              />
            </g>
          </svg>
        </div>
        <span className="glix-rotate-kicker">YATAY EKRAN GEREKLİ</span>
        <h2>Cihazını yatay çevir.</h2>
        <p><strong>{gameName}</strong> geniş ekranda oynanır. Sahne hazır; telefonu 90° döndür.</p>
        {roomCode && <span className="glix-rotate-room">ODA {roomCode}</span>}
      </div>
    </div>
  );
}
