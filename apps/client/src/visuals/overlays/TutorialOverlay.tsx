import type { JSX } from "react";
import type { MatchPlayerState } from "@glix/shared";
import { BriefingScreen } from "../briefing/BriefingScreen";

export interface TutorialOverlayProps {
  readonly gameName: string;
  readonly category?: string | undefined;
  readonly steps: readonly string[];
  readonly progress?: number | undefined;
  readonly remainingLabel?: string | undefined;
  readonly readyCount?: number | undefined;
  readonly eligibleCount?: number | undefined;
  readonly readyPlayerIds?: readonly string[] | undefined;
  readonly players?: readonly MatchPlayerState[] | undefined;
  readonly selfPlayerId?: string | null | undefined;
  readonly isReady?: boolean | undefined;
  readonly canReady?: boolean | undefined;
  readonly onReady?: (() => void) | undefined;
}

export function TutorialOverlay({
  gameName,
  category,
  steps,
  readyCount = 0,
  eligibleCount = 0,
  readyPlayerIds = [],
  players,
  selfPlayerId = null,
  isReady = false,
  canReady = false,
  onReady
}: TutorialOverlayProps): JSX.Element {
  return (
    <BriefingScreen
      gameName={gameName}
      category={category}
      steps={steps}
      readyCount={readyCount}
      eligibleCount={eligibleCount}
      readyPlayerIds={readyPlayerIds}
      players={players}
      selfPlayerId={selfPlayerId}
      isReady={isReady}
      canReady={canReady}
      onReady={onReady}
    />
  );
}
