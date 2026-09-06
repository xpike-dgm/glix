import type { JSX } from "react";
import type { MatchPlayerState, SubmissionStatus } from "@glix/shared";
import { ConnectionStateBadge } from "./ConnectionStateBadge";
import { GameTimer } from "./GameTimer";
import { PlayerAvatarStrip } from "./PlayerAvatarStrip";
import type { VisualConnectionState, VisualPhase } from "../types";

interface GameHUDProps {
  readonly gameId?: string;
  readonly gameName: string;
  readonly category: string;
  readonly gameIndex: number;
  readonly gameTotal: number;
  readonly phase: VisualPhase;
  readonly phaseLabel: string;
  readonly deadline: number | null;
  readonly now: number;
  readonly totalDurationSeconds: number;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayer: MatchPlayerState | undefined;
  readonly selfPlayerId: string | null;
  readonly readyPlayerIds: readonly string[];
  readonly ownHasSubmitted: boolean;
  readonly submissionStatus: SubmissionStatus;
  readonly selfStatusLabel?: string | undefined;
  readonly connection: VisualConnectionState;
  readonly onLeave: () => void;
}

function selfState(
  player: MatchPlayerState | undefined,
  ownHasSubmitted: boolean,
  submissionStatus: SubmissionStatus,
  gameId?: string,
  phase?: VisualPhase,
  selfStatusLabel?: string
): string {
  if (!player) return "OTURUM ARANIYOR";
  if (player.eliminated) return "ELENDİ";
  if (!player.currentGameParticipant) return "İZLEYİCİ";
  if (!player.connected) return "BAĞLANTI YOK";
  if (selfStatusLabel) return selfStatusLabel;
  if (gameId === "kontrol-paneli-kaosu") {
    return ownHasSubmitted ? "KABLO KESİLDİ" : "SENİN PANELİN";
  }
  if (gameId === "kendim") {
    if (phase === "results") return "SONUÇLAR";
    return ownHasSubmitted ? "SEÇİMLER KİLİTLİ" : "EŞLEŞTİR";
  }
  if (submissionStatus.mode === "repeatable") return submissionStatus.canAct ? "HAMLEYE DEVAM" : "BEKLİYOR";
  return submissionStatus.completed ? "HAMLE GÖNDERİLDİ" : submissionStatus.canAct ? "SENİN SIRAN" : "BEKLİYOR";
}

export function GameHUD({
  gameId,
  gameName,
  category,
  gameIndex,
  gameTotal,
  phase,
  phaseLabel,
  deadline,
  now,
  totalDurationSeconds,
  players,
  selfPlayer,
  selfPlayerId,
  readyPlayerIds,
  ownHasSubmitted,
  submissionStatus,
  selfStatusLabel,
  connection,
  onLeave
}: GameHUDProps): JSX.Element {
  const selfStatus = selfState(selfPlayer, ownHasSubmitted, submissionStatus, gameId, phase, selfStatusLabel);
  return (
    <header className="glix-game-hud">
      <div className="glix-hud-topline">
        <div className="glix-hud-game-label">
          <span className="glix-hud-index">OYUN {String(gameIndex + 1).padStart(2, "0")} / {String(gameTotal).padStart(2, "0")}</span>
          <strong>{gameName}</strong>
          <small>{category.toUpperCase()} · {phaseLabel}</small>
        </div>

        <GameTimer
          deadline={deadline}
          now={now}
          totalDurationSeconds={totalDurationSeconds}
          size="regular"
        />

        <div className="glix-hud-self-cluster">
          <div className="glix-self-player-badge" aria-label={`Sen: ${selfPlayer?.nickname ?? "Oyuncu"}, ${selfStatus}`}>
            <span className="glix-self-player-glyph" aria-hidden="true">{selfPlayer?.nickname.slice(0, 1).toUpperCase() ?? "?"}</span>
            <span><strong>{selfPlayer?.nickname ?? "Oyuncu"}</strong><small>{selfStatus}</small></span>
            <b>{selfPlayer?.score ?? 0}</b>
          </div>
          <ConnectionStateBadge connection={connection} compact />
          <button className="glix-hud-exit" type="button" onClick={onLeave} aria-label="Odadan çık">ÇIK</button>
        </div>
      </div>

      <div className="glix-hud-rule" aria-hidden="true"><span /><i /><span /></div>

      <PlayerAvatarStrip
        players={players}
        selfPlayerId={selfPlayerId}
        readyPlayerIds={readyPlayerIds}
        ownHasSubmitted={submissionStatus.completed && submissionStatus.mode !== "repeatable"}
      />

      <span className="glix-hud-phase" data-phase={phase}>{phaseLabel}</span>
    </header>
  );
}
