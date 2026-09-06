import type { JSX, ReactNode } from "react";
import type { VisualConnectionState, VisualPhase } from "../types";
import { OrientationGate } from "./OrientationGate";
import { StageBackdrop } from "./StageBackdrop";

interface GameViewportProps {
  readonly gameId: string;
  readonly gameName: string;
  readonly phase: VisualPhase;
  readonly requiresLandscape: boolean;
  readonly roomCode?: string;
  readonly connection: VisualConnectionState;
  readonly hud: ReactNode;
  readonly hero?: ReactNode;
  readonly stage?: ReactNode;
  readonly children?: ReactNode;
  readonly overlays?: ReactNode;
}

export function GameViewport({
  gameId,
  gameName,
  phase,
  requiresLandscape,
  roomCode,
  connection,
  hud,
  hero,
  stage,
  children,
  overlays
}: GameViewportProps): JSX.Element {
  return (
    <section
      className={`glix-game-viewport glix-phase-${phase} glix-connection-${connection}`}
      data-game-id={gameId}
      aria-label={`${gameName} oyun sahnesi`}
    >
      <StageBackdrop requiresLandscape={requiresLandscape} />
      <OrientationGate
        requiresLandscape={requiresLandscape}
        gameName={gameName}
        {...(roomCode ? { roomCode } : {})}
      >
        <div className="glix-viewport-safe-area">
          {hud}
          {stage ? (
            <div className="glix-game-stage-slot">{stage}</div>
          ) : (
            <div className="glix-game-content">
              <div className="glix-stage-hero-slot">{hero}</div>
              <div className="glix-interaction-slot">{children}</div>
            </div>
          )}
          {overlays}
          <span className="glix-viewport-connection-note" aria-hidden="true">
            {connection === "connected" ? "BAĞLI" : connection === "connecting" ? "YENİDEN BAĞLANIYOR" : "ÇEVRİMDIŞI"}

          </span>
        </div>
      </OrientationGate>
    </section>
  );
}
