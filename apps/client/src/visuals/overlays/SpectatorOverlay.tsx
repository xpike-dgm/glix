import type { JSX } from "react";

interface SpectatorOverlayProps {
  readonly roomCode: string;
  readonly connected: boolean;
  readonly eliminated: boolean;
}

export function SpectatorOverlay({ roomCode, connected, eliminated }: SpectatorOverlayProps): JSX.Element {
  return (
    <div className="glix-spectator-overlay" role="status">
      <span className="glix-spectator-mark" aria-hidden="true">◌</span>
      <span><strong>{eliminated ? "ELENDİN" : "İZLEYİCİ MODU"}</strong><small>{eliminated ? "Bu turu izliyorsun." : "Bu oyuna sonraki turda katılabilirsin."} · ODA {roomCode} · {connected ? "BAĞLI" : "BAĞLANTI YOK"}</small></span>
    </div>
  );
}
