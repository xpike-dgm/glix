import type { JSX } from "react";
import type { ClientActionState, GameId, JsonValue, MatchPlayerState, RuntimePhaseId } from "@glix/shared";
import { YaziYazStage } from "./YaziYazStage";
import { SozlukBlofuStage } from "./SozlukBlofuStage";
import { CagrisimAgiStage } from "./CagrisimAgiStage";
import { RusvetDarbeStage } from "./RusvetDarbeStage";
import { KaralamaDefteriStage } from "./KaralamaDefteriStage";
import { IttifakStage } from "./IttifakStage";

export type Stage11DGameId = Extract<
  GameId,
  "yazi-yaz" | "sozluk-blofu" | "cagrisim-agi" | "rusvet-darbe" | "karalama-defteri" | "ittifak"
>;

const STAGE11D_GAME_IDS: readonly Stage11DGameId[] = [
  "yazi-yaz",
  "sozluk-blofu",
  "cagrisim-agi",
  "rusvet-darbe",
  "karalama-defteri",
  "ittifak"
];

export function isStage11DGameId(gameId: GameId): gameId is Stage11DGameId {
  return STAGE11D_GAME_IDS.includes(gameId as Stage11DGameId);
}

interface Stage11DStageProps {
  readonly gameId: Stage11DGameId;
  readonly gameName: string;
  readonly phase: RuntimePhaseId;
  readonly publicState: unknown;
  readonly ownState: JsonValue | null;
  readonly selfPlayerId: string | null;
  readonly players: readonly MatchPlayerState[];
  readonly now: number;
  readonly isSpectator: boolean;
  readonly isReady: boolean;
  readonly actionState: ClientActionState | null;
  readonly onReady: () => void;
  readonly onSubmit: (payload: JsonValue) => void;
}

const PHASE_COPY: Readonly<Record<RuntimePhaseId, string>> = {
  tutorial: "Oyunun ritmini ve ana nesnesini tanı.",
  preparing: "Hazır olduğunda kendi cihazından oyuna katıl.",
  playing: "Sıran geldiğinde hamleni kendi cihazından yap.",
  results: "Turun sonucu açık; puanlar şimdi sahnede.",
  transition: "Sıradaki oyun hazırlanıyor.",
  finished: "Bu oyun tamamlandı."
};

function gameSurface(props: Omit<Stage11DStageProps, "gameName" | "phase" | "isReady" | "onReady" | "actionState">): JSX.Element {
  switch (props.gameId) {
    case "yazi-yaz":
      return <YaziYazStage {...props} />;
    case "sozluk-blofu":
      return <SozlukBlofuStage {...props} />;
    case "cagrisim-agi":
      return <CagrisimAgiStage {...props} />;
    case "rusvet-darbe":
      return <RusvetDarbeStage {...props} />;
    case "karalama-defteri":
      return <KaralamaDefteriStage {...props} />;
    case "ittifak":
      return <IttifakStage {...props} />;
  }
}

export function Stage11DStage({
  gameId,
  gameName,
  phase,
  publicState,
  ownState,
  selfPlayerId,
  players,
  now,
  isSpectator,
  isReady,
  actionState,
  onReady,
  onSubmit
}: Stage11DStageProps): JSX.Element {
  const surfaceProps = { gameId, publicState, ownState, selfPlayerId, players, now, isSpectator, onSubmit };
  const actionKey =
    actionState === null
      ? "no-action"
      : `${actionState.status}-${
          actionState.status === "pending"
            ? actionState.actionId
            : actionState.status === "rejected" || actionState.status === "accepted"
            ? actionState.ackStateVersion
            : actionState.authoritativeVersion
        }`;

  return (
    <div
      className={`stage11d-stage stage11d-stage-${gameId} stage11d-stage-phase-${phase}`}
      role="region"
      aria-label={`${gameName} oyun alanı`}
    >
      {phase === "preparing" && (
        <section className="stage11d-ready-card" aria-live="polite">
          <div className="stage11d-ready-seal" aria-hidden="true">
            {isReady ? "✓" : "→"}
          </div>
          <div>
            <span>{isSpectator ? "İZLEMEDE" : isReady ? "HAZIR" : "OYUNA KATIL"}</span>
            <strong>{isSpectator ? "Bu turu izliyorsun." : isReady ? "Hazırsın." : "Sahneye katıl."}</strong>
            <small>
              {isSpectator
                ? "Ortak oyun akışı burada görünür."
                : isReady
                ? "Diğer oyuncuların hazır olması bekleniyor."
                : "Hazır olduğunda oyuna katıl."}
            </small>
          </div>
          {!isSpectator && (
            <button
              type="button"
              className="stage11d-ready-button"
              disabled={isReady}
              onClick={onReady}
            >
              {isReady ? "HAZIR" : "HAZIRIM"}
            </button>
          )}
        </section>
      )}

      {phase === "transition" ? (
        <div className="stage11d-transition-card" role="status">
          <span aria-hidden="true" /> {PHASE_COPY.transition}
        </div>
      ) : (
        <div className="stage11d-stage-surface" key={`${gameId}-${phase}`}>
          {actionState?.status === "rejected" && (
            <div className="stage11d-negative-ack-card" role="alert">
              <span aria-hidden="true">⚠️</span>
              <span>{actionState.reason ?? "Hamle geçersiz veya reddedildi."}</span>
            </div>
          )}
          <fieldset
            className="stage11d-action-fence"
            disabled={actionState?.status === "pending"}
            aria-busy={actionState?.status === "pending"}
          >
            <div key={actionKey} className="stage11d-action-reset-boundary">
              {gameSurface(surfaceProps)}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
