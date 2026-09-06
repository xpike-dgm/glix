import { lazy, Suspense } from "react";
import type { JSX } from "react";
import type { ClientActionState, GameId, JsonValue, MatchPlayerState, RuntimePhaseId } from "@glix/shared";
import { safeLazy, StageLoadingFallback } from "../../../lazyPreload";

const LazyCaprazAtesStage = lazy(safeLazy(() => import("./CaprazAtesStage").then((m) => ({ default: m.CaprazAtesStage }))));
const LazyKorBombaStage = lazy(safeLazy(() => import("./KorBombaStage").then((m) => ({ default: m.KorBombaStage }))));
const LazyMemoryStage = lazy(safeLazy(() => import("./MemoryStage").then((m) => ({ default: m.MemoryStage }))));
const LazyRusRuletiStage = lazy(safeLazy(() => import("./RusRuletiStage").then((m) => ({ default: m.RusRuletiStage }))));
const LazySizmaStage = lazy(safeLazy(() => import("./SizmaStage").then((m) => ({ default: m.SizmaStage }))));
const LazyZehirliKadehStage = lazy(safeLazy(() => import("./ZehirliKadehStage")));

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

const PHASE_COPY: Readonly<Record<RuntimePhaseId, string>> = {
  tutorial: "Oyunun ritmini ve ana nesnesini tanı.",
  preparing: "Hazır olduğunda kendi cihazından oyuna katıl.",
  playing: "Sıran geldiğinde hamleni kendi cihazından yap.",
  results: "Turun sonucu açık; puanlar şimdi sahnede.",
  transition: "Sıradaki oyun hazırlanıyor.",
  finished: "Bu oyun tamamlandı."
};

function gameSurface(props: Omit<Stage11BStageProps, "phase" | "isReady" | "onReady" | "actionState">): JSX.Element {
  let surface: JSX.Element;
  switch (props.gameId) {
    case "sizma":
      surface = <LazySizmaStage {...props} />;
      break;
    case "rus-ruleti":
      surface = <LazyRusRuletiStage {...props} />;
      break;
    case "kor-bomba":
      surface = <LazyKorBombaStage {...props} />;
      break;
    case "zehirli-kadeh":
      surface = <LazyZehirliKadehStage {...props} />;
      break;
    case "capraz-ates":
      surface = <LazyCaprazAtesStage {...props} />;
      break;
    case "zaman-bombasi-hafizasi":
      surface = <LazyMemoryStage {...props} />;
      break;
  }
  return (
    <Suspense fallback={<StageLoadingFallback gameName={props.gameName} />}>
      {surface}
    </Suspense>
  );
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
  const surfaceProps = { gameId, gameName, publicState, ownState, selfPlayerId, players, now, isSpectator, onSubmit };
  const actionKey = actionState === null
    ? "no-action"
    : `${actionState.status}-${actionState.status === "pending" ? actionState.actionId : actionState.status === "rejected" || actionState.status === "accepted" ? actionState.ackStateVersion : actionState.authoritativeVersion}`;

  return (
    <div className={`stage11b-stage stage11b-stage-${gameId} stage11b-stage-phase-${phase}`} role="region" aria-label={`${gameName} oyun alanı`}>

      {phase === "preparing" && (
        <section className="stage11b-ready-card" aria-live="polite">
          <div className="stage11b-ready-seal" aria-hidden="true">{isReady ? "✓" : "→"}</div>
          <div>
            <span>{isSpectator ? "İZLEMEDE" : isReady ? "HAZIR" : "OYUNA KATIL"}</span>
            <strong>{isSpectator ? "Bu turu izliyorsun." : isReady ? "Hazırsın." : "Sahneye katıl."}</strong>
            <small>{isSpectator ? "Ortak oyun akışı burada görünür." : isReady ? "Diğer oyuncuların hazır olması bekleniyor." : "Hazır olduğunda oyuna katıl."}</small>
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
