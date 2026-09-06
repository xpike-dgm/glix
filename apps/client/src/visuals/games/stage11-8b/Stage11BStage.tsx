import type { JSX } from "react";
import type { ClientActionState, GameId, JsonValue, MatchPlayerState, RuntimePhaseId } from "@glix/shared";
import { CaprazAtesStage } from "./CaprazAtesStage";
import { KorBombaStage } from "./KorBombaStage";
import { MemoryStage } from "./MemoryStage";
import { RusRuletiStage } from "./RusRuletiStage";
import { SizmaStage } from "./SizmaStage";
import ZehirliKadehStage from "./ZehirliKadehStage";

export type Stage11BGameId = Extract<
  GameId,
  "sizma" | "rus-ruleti" | "kor-bomba" | "zehirli-kadeh" | "capraz-ates" | "zaman-bombasi-hafizasi"
>;

const STAGE11B_GAME_IDS: readonly Stage11BGameId[] = [
  "sizma",
  "rus-ruleti",
  "kor-bomba",
  "zehirli-kadeh",
  "capraz-ates",
  "zaman-bombasi-hafizasi"
];

export function isStage11BGameId(gameId: GameId): gameId is Stage11BGameId {
  return STAGE11B_GAME_IDS.includes(gameId as Stage11BGameId);
}

interface Stage11BStageProps {
  readonly gameId: Stage11BGameId;
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

const PHASE_LABELS: Readonly<Record<RuntimePhaseId, string>> = {
  tutorial: "KISA TANITIM",
  preparing: "HAZIRLIK KAPISI",
  playing: "CANLI TUR",
  results: "SONUÇ KİLİDİ",
  transition: "GEÇİŞ",
  finished: "ROTA SONU"
};

const PHASE_COPY: Readonly<Record<RuntimePhaseId, string>> = {
  tutorial: "Nesne, ritim ve güvenlik sınırı burada görünür.",
  preparing: "Hazır olduğunda kendi cihazından kapıyı aç.",
  playing: "Hamle sunucunun güncel sahne durumuyla doğrulanır.",
  results: "Sonuçlar açıldı; özel bilgiler yalnızca izin verilen sınırda görünür.",
  transition: "Bir sonraki yüzey kuruluyor.",
  finished: "Bu rota tamamlandı."
};

function gameSurface(props: Omit<Stage11BStageProps, "gameName" | "phase" | "isReady" | "onReady" | "actionState">): JSX.Element {
  switch (props.gameId) {
    case "sizma":
      return <SizmaStage {...props} />;
    case "rus-ruleti":
      return <RusRuletiStage {...props} />;
    case "kor-bomba":
      return <KorBombaStage {...props} />;
    case "zehirli-kadeh":
      return <ZehirliKadehStage {...props} />;
    case "capraz-ates":
      return <CaprazAtesStage {...props} />;
    case "zaman-bombasi-hafizasi":
      return <MemoryStage {...props} />;
  }
}

export function Stage11BStage({
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
}: Stage11BStageProps): JSX.Element {
  const surfaceProps = { gameId, publicState, ownState, selfPlayerId, players, now, isSpectator, onSubmit };
  const actionKey = actionState === null
    ? "no-action"
    : `${actionState.status}-${actionState.status === "pending" ? actionState.actionId : actionState.status === "rejected" || actionState.status === "accepted" ? actionState.ackStateVersion : actionState.authoritativeVersion}`;

  return (
    <div className={`stage11b-stage stage11b-stage-${gameId} stage11b-stage-phase-${phase}`}>
      <header className="stage11b-stage-header">
        <div>
          <span className="stage11b-stage-kicker">GLIX / STAGE 11.8B · HIDDEN RISK TARGET</span>
          <h1>{gameName}</h1>
        </div>
        <div className="stage11b-stage-phase">
          <span>{PHASE_LABELS[phase]}</span>
          <small>{PHASE_COPY[phase]}</small>
        </div>
      </header>

      {phase === "preparing" && (
        <section className="stage11b-ready-card" aria-live="polite">
          <div className="stage11b-ready-seal" aria-hidden="true">{isReady ? "✓" : "→"}</div>
          <div>
            <span>{isSpectator ? "PUBLIC WATCH" : isReady ? "GATE OPEN" : "READY BARRIER"}</span>
            <strong>{isSpectator ? "Hazırlık bariyerini izliyorsun." : isReady ? "Hazırsın." : "Sahneye katıl."}</strong>
            <small>{isSpectator ? "Sadece kamusal sahne akışı gösterilir." : isReady ? "Diğer oyuncuların hazır olmasını bekliyoruz." : "Kendi cihazındaki hazır düğmesiyle kilidi aç."}</small>
          </div>
          {!isSpectator && (
            <button type="button" className="stage11b-ready-button" disabled={isReady} onClick={onReady}>
              {isReady ? "HAZIR" : "HAZIRIM"}
            </button>
          )}
        </section>
      )}

      {phase === "transition" ? (
        <div className="stage11b-transition-card" role="status"><span aria-hidden="true" /> {PHASE_COPY.transition}</div>
      ) : (
        <div className="stage11b-stage-surface" key={`${gameId}-${phase}`}>
          <fieldset className="stage11b-action-fence" disabled={actionState?.status === "pending"} aria-busy={actionState?.status === "pending"}>
            <div key={actionKey} className="stage11b-action-reset-boundary">
              {gameSurface(surfaceProps)}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
