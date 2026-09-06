import type { JSX } from "react";
import type {
  AcgozlulukOwnState,
  AcgozlulukPublicState,
  CizgiyiGecmeOwnState,
  CizgiyiGecmePublicState,
  ClientActionState,
  GameId,
  GizliAlisverisOwnState,
  GizliAlisverisPublicState,
  GizliKarelerOwnState,
  GizliKarelerPublicState,
  JsonValue,
  MatchPlayerState,
  OrtalamaninYarisiOwnState,
  OrtalamaninYarisiPublicState,
  RuntimePhaseId
} from "@glix/shared";
import { AcgozlulukLimitiStage } from "./AcgozlulukLimitiStage";
import { OrtalamaninYarisiStage } from "./OrtalamaninYarisiStage";
import { GizliKarelerStage } from "./GizliKarelerStage";
import { CizgiyiGecmeStage } from "./CizgiyiGecmeStage";
import { GizliAlisverisStage } from "./GizliAlisverisStage";
import "./stage11c.css";

export type Stage11CGameId = Extract<
  GameId,
  "acgozluluk-limiti" | "ortalamanin-yarisi" | "gizli-kareler" | "cizgiyi-gecme" | "gizli-alisveris"
>;

export const STAGE11C_GAME_IDS: readonly Stage11CGameId[] = [
  "acgozluluk-limiti",
  "ortalamanin-yarisi",
  "gizli-kareler",
  "cizgiyi-gecme",
  "gizli-alisveris"
];

export function isStage11CGameId(gameId: GameId): gameId is Stage11CGameId {
  return STAGE11C_GAME_IDS.includes(gameId as Stage11CGameId);
}

export interface Stage11CStageProps {
  readonly gameId: Stage11CGameId;
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

function gameSurface(props: Omit<Stage11CStageProps, "gameName" | "phase" | "isReady" | "onReady" | "actionState">): JSX.Element {
  switch (props.gameId) {
    case "acgozluluk-limiti":
      return (
        <AcgozlulukLimitiStage
          publicState={props.publicState as AcgozlulukPublicState}
          ownState={props.ownState as AcgozlulukOwnState | null}
          selfPlayerId={props.selfPlayerId}
          players={props.players}
          now={props.now}
          isSpectator={props.isSpectator}
          onSubmit={props.onSubmit}
        />
      );
    case "ortalamanin-yarisi":
      return (
        <OrtalamaninYarisiStage
          publicState={props.publicState as OrtalamaninYarisiPublicState}
          ownState={props.ownState as OrtalamaninYarisiOwnState | null}
          selfPlayerId={props.selfPlayerId}
          players={props.players}
          now={props.now}
          isSpectator={props.isSpectator}
          onSubmit={props.onSubmit}
        />
      );
    case "gizli-kareler":
      return (
        <GizliKarelerStage
          publicState={props.publicState as GizliKarelerPublicState}
          ownState={props.ownState as GizliKarelerOwnState | null}
          selfPlayerId={props.selfPlayerId}
          players={props.players}
          now={props.now}
          isSpectator={props.isSpectator}
          onSubmit={props.onSubmit}
        />
      );
    case "cizgiyi-gecme":
      return (
        <CizgiyiGecmeStage
          publicState={props.publicState as CizgiyiGecmePublicState}
          ownState={props.ownState as CizgiyiGecmeOwnState | null}
          selfPlayerId={props.selfPlayerId}
          players={props.players}
          now={props.now}
          isSpectator={props.isSpectator}
          onSubmit={props.onSubmit}
        />
      );
    case "gizli-alisveris":
      return (
        <GizliAlisverisStage
          publicState={props.publicState as GizliAlisverisPublicState}
          ownState={props.ownState as GizliAlisverisOwnState | null}
          selfPlayerId={props.selfPlayerId}
          players={props.players}
          now={props.now}
          isSpectator={props.isSpectator}
          onSubmit={props.onSubmit}
        />
      );
  }
}

export function Stage11CStage({
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
}: Stage11CStageProps): JSX.Element {
  const surfaceProps = { gameId, publicState, ownState, selfPlayerId, players, now, isSpectator, onSubmit };
  const actionKey = actionState === null
    ? "no-action"
    : `${actionState.status}-${actionState.status === "pending" ? actionState.actionId : actionState.status === "rejected" || actionState.status === "accepted" ? actionState.ackStateVersion : actionState.authoritativeVersion}`;

  return (
    <div
      className={`stage11c-stage stage11c-stage-${gameId} stage11c-stage-phase-${phase}`}
      role="region"
      aria-label={`${gameName} oyun alanı`}
    >
      {phase === "preparing" && (
        <section className="stage11c-ready-card" aria-live="polite">
          <div className="stage11c-ready-seal" aria-hidden="true">{isReady ? "✓" : "→"}</div>
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
              className="stage11c-ready-button"
              disabled={isReady}
              onClick={onReady}
            >
              {isReady ? "HAZIR" : "HAZIRIM"}
            </button>
          )}
        </section>
      )}

      {phase === "transition" ? (
        <div style={{ padding: "1.5rem", textAlign: "center", color: "#72f4ff", fontWeight: 800 }}>
          Sıradaki oyun hazırlanıyor…
        </div>
      ) : (
        <div className="stage11c-stage-surface" key={`${gameId}-${phase}`}>
          <fieldset
            className="stage11c-action-fence"
            disabled={actionState?.status === "pending"}
            aria-busy={actionState?.status === "pending"}
          >
            <div key={actionKey} className="stage11c-action-reset-boundary">
              {gameSurface(surfaceProps)}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}