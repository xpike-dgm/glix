import type { JSX } from "react";
import type {
  ButonaBasOwnState,
  ButonaBasPublicState,
  ClientActionState,
  GameId,
  GizliHirsizOwnState,
  GizliHirsizPublicState,
  JsonValue,
  KorKronometreOwnState,
  KorKronometrePublicState,
  MatchPlayerState,
  RuntimePhaseId,
  SonKisiOwnState,
  SonKisiPublicState,
  AsiriYuklemeOwnState,
  AsiriYuklemePublicState
} from "@glix/shared";
import type { VisualConnectionState } from "../types";
import { AsiriYuklemeStage } from "./stage11a/AsiriYuklemeStage";
import { ButonaBasStage } from "./stage11a/ButonaBasStage";
import { GizliHirsizStage } from "./stage11a/GizliHirsizStage";
import { KorKronometreStage } from "./stage11a/KorKronometreStage";
import { SonKisiStage } from "./stage11a/SonKisiStage";
import "./Stage11ATimingPressureStage.css";

export const STAGE11A_GAME_IDS = [
  "butona-bas",
  "gizli-hirsiz",
  "kor-kronometre",
  "asiri-yukleme",
  "son-kisi"
] as const satisfies readonly GameId[];

export type Stage11AGameId = (typeof STAGE11A_GAME_IDS)[number];

export function isStage11AGameId(gameId: GameId): gameId is Stage11AGameId {
  return STAGE11A_GAME_IDS.includes(gameId as Stage11AGameId);
}

export interface Stage11ATimingPressureStageProps {
  readonly gameId: Stage11AGameId;
  readonly gameName: string;
  readonly phase: RuntimePhaseId;
  readonly publicState: JsonValue;
  readonly ownState: JsonValue | null;
  readonly selfPlayerId: string | null;
  readonly players: readonly MatchPlayerState[];
  readonly now: number;
  readonly isSpectator: boolean;
  readonly actionState: ClientActionState | null;
  readonly ready: boolean;
  readonly connection: VisualConnectionState;
  readonly onReady: () => void;
  readonly onSubmit: (payload: JsonValue) => void;
}

export function Stage11ATimingPressureStage({
  gameId,
  gameName,
  phase,
  publicState,
  ownState,
  selfPlayerId,
  players,
  now,
  isSpectator,
  actionState,
  ready,
  connection,
  onReady,
  onSubmit
}: Stage11ATimingPressureStageProps): JSX.Element {
  const commonProps = {
    phase,
    selfPlayerId,
    players,
    now,
    isSpectator,
    actionState,
    isReady: ready,
    onReady,
    onSubmit
  } as const;

  // Butona, Gizli Hırsız, and Aşırı Yükleme own their preparation control so
  // their stage remains a complete game surface. The two stages without a
  // local ready affordance use this shared dock.
  const showSharedReadyDock = gameId === "kor-kronometre" || gameId === "son-kisi";

  let gameStage: JSX.Element;

  switch (gameId) {
    case "butona-bas":
      gameStage = (
        <ButonaBasStage
          {...commonProps}
          publicState={publicState as unknown as ButonaBasPublicState}
          ownState={ownState as unknown as ButonaBasOwnState | null}
        />
      );
      break;
    case "gizli-hirsiz":
      gameStage = (
        <GizliHirsizStage
          {...commonProps}
          publicState={publicState as unknown as GizliHirsizPublicState}
          ownState={ownState as unknown as GizliHirsizOwnState | null}
        />
      );
      break;
    case "kor-kronometre":
      gameStage = (
        <KorKronometreStage
          {...commonProps}
          publicState={publicState as unknown as KorKronometrePublicState}
          ownState={ownState as unknown as KorKronometreOwnState | null}
          onSubmitAction={onSubmit}
        />
      );
      break;
    case "asiri-yukleme":
      gameStage = (
        <AsiriYuklemeStage
          {...commonProps}
          publicState={publicState as unknown as AsiriYuklemePublicState}
          ownState={ownState as unknown as AsiriYuklemeOwnState | null}
        />
      );
      break;
    case "son-kisi":
      gameStage = (
        <SonKisiStage
          {...commonProps}
          publicState={publicState as unknown as SonKisiPublicState}
          ownState={ownState as unknown as SonKisiOwnState | null}
        />
      );
      break;
  }

  return (
    <div
      className={`stage11a-stage stage11a-${gameId} stage11a-phase-${phase} stage11a-connection-${connection}`}
    >
      <h1 id="match-title" className="stage11a-visually-hidden">{gameName}</h1>
      <div className="stage11a-surface">{gameStage}</div>

      {phase === "preparing" && !isSpectator && showSharedReadyDock && (
        <div className="stage11a-ready-dock" aria-live="polite">
          <div>
            <span className="stage11a-dock-kicker">SAHNE SENKRONU</span>
            <strong>{ready ? "Hazırsın." : "Hamle alanını hazırla."}</strong>
            <small>{ready ? "Diğer oyuncular bekleniyor." : "Hazır olduğunda prova kilidi açılır."}</small>
          </div>
          <button className="stage11a-ready-button" type="button" disabled={ready} onClick={onReady}>
            <span aria-hidden="true">{ready ? "✓" : "→"}</span>
            {ready ? "HAZIR" : "HAZIRIM"}
          </button>
        </div>
      )}

      {phase === "transition" && (
        <div className="stage11a-transition" role="status">
          <span aria-hidden="true" />
          <strong>SAHNE KİLİTLENİYOR</strong>
          <small>Sıradaki oyun yükleniyor.</small>
        </div>
      )}
    </div>
  );
}
