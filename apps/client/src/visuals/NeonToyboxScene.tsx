import { useEffect } from "react";
import type { CSSProperties, JSX } from "react";
import type { GameDefinition, MatchState } from "@glix/shared";
import {
  NEON_TOYBOX_ASSETS,
  NEON_TOYBOX_CHARACTER_STYLES,
  preloadCriticalVisualAssets
} from "./assetManifest";

interface NeonToyboxSceneProps {
  readonly state: MatchState;
  readonly game: GameDefinition;
  readonly selfPlayerId: string | null;
  readonly ownHasSubmitted: boolean;
  readonly progress: number;
}

type ToyboxCharacterStyle = CSSProperties & {
  "--toybox-accent": string;
  "--toybox-delay": string;
  "--toybox-x": string;
  "--toybox-depth": string;
};

const PHASE_COPY: Record<MatchState["phase"], string> = {
  tutorial: "SAHNEYİ İZLE",
  preparing: "YERİNİ AL",
  playing: "HAMLE ANI",
  results: "SONUÇLAR AÇILIYOR",
  transition: "SIRADAKİ OYUN",
  finished: "ROTA TAMAMLANDI"
};

function phaseMotionClass(phase: MatchState["phase"]): string {
  if (phase === "playing") {
    return "is-live";
  }

  if (phase === "results" || phase === "finished") {
    return "is-resolved";
  }

  return "is-idle";
}

export function NeonToyboxScene({
  state,
  game,
  selfPlayerId,
  ownHasSubmitted,
  progress
}: NeonToyboxSceneProps): JSX.Element {
  useEffect(() => {
    void preloadCriticalVisualAssets().catch(() => {
      // CSS and procedural layers remain usable if the optional backdrop fails.
    });
  }, []);

  const players = state.players.slice(0, NEON_TOYBOX_CHARACTER_STYLES.length);
  const gameProp = game.id === "butona-bas"
    ? NEON_TOYBOX_ASSETS.gameProps.butonaBas
    : game.id === "sizma"
      ? NEON_TOYBOX_ASSETS.gameProps.sizma
      : game.id === "zaman-bombasi-hafizasi"
        ? NEON_TOYBOX_ASSETS.gameProps.memory
        : null;

  return (
    <div
      className={`toybox-scene toybox-phase-${state.phase} toybox-game-${game.id} ${gameProp ? "has-game-prop" : ""} ${phaseMotionClass(state.phase)} ${ownHasSubmitted ? "self-submitted" : ""}`}
      style={{ "--toybox-progress": `${Math.round(progress * 100)}%` } as CSSProperties}
      aria-label={`${game.name} Neon Toybox oyun sahnesi`}
    >
      <img
        className="toybox-scene-backdrop"
        src={NEON_TOYBOX_ASSETS.stageBackdrop.src}
        alt=""
        aria-hidden="true"
        decoding="async"
        loading="eager"
      />
      {gameProp && (
        <img
          className="toybox-game-prop"
          src={gameProp.src}
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="eager"
        />
      )}
      <div className="toybox-scene-vignette" aria-hidden="true" />
      <div className="toybox-scene-atmosphere" aria-hidden="true">
        <span className="toybox-orb orb-cyan" />
        <span className="toybox-orb orb-pink" />
        <span className="toybox-orb orb-amber" />
        <span className="toybox-spark spark-one" />
        <span className="toybox-spark spark-two" />
        <span className="toybox-spark spark-three" />
      </div>
      <div className="toybox-parallax-grid" aria-hidden="true" />
      <div className="toybox-scene-hud">
        <span className="toybox-hud-label">NEON TOYBOX / LIVE STAGE</span>
        <span className="toybox-hud-count">{String(state.inputCount).padStart(2, "0")} EVENT</span>
      </div>

      <div className="toybox-beam beam-left" aria-hidden="true" />
      <div className="toybox-beam beam-right" aria-hidden="true" />

      <div className="toybox-stage-deck" aria-hidden="true">
        <span className="toybox-deck-edge deck-edge-one" />
        <span className="toybox-deck-edge deck-edge-two" />
        <div className="toybox-reactor">
          <span className="toybox-reactor-ring ring-one" />
          <span className="toybox-reactor-ring ring-two" />
          <span className="toybox-reactor-core"><i /></span>
          <span className="toybox-reactor-reflection" />
        </div>
        <div className="toybox-scene-caption">
          <small>{game.category.toUpperCase()} / {game.supportsPortrait ? "DİKEY HAZIR" : "YATAY HAZIR"}</small>
          <strong>{PHASE_COPY[state.phase]}</strong>
        </div>
      </div>

      <div className="toybox-characters" aria-hidden="true">
        {players.map((player, index) => {
          const variant = NEON_TOYBOX_CHARACTER_STYLES[index] ?? NEON_TOYBOX_CHARACTER_STYLES[0];
          const position = players.length === 1 ? 50 : 10 + (index / (players.length - 1)) * 80;
          const style = {
            "--toybox-accent": variant.accent,
            "--toybox-delay": `${index * 80}ms`,
            "--toybox-x": `${position}%`,
            "--toybox-depth": `${0.84 + (index % 3) * 0.07}`
          } as ToyboxCharacterStyle;
          const isSelf = player.id === selfPlayerId;

          return (
            <div
              className={`toybox-character character-${variant.shape} ${isSelf ? "is-self" : ""} ${player.eliminated ? "is-out" : ""}`}
              key={player.id}
              style={style}
              title={player.nickname}
            >
              <span className="toybox-character-shadow" />
              <span className="toybox-character-aura" />
              <span className="toybox-character-model">
                <span className="toybox-character-antenna" />
                <span className="toybox-character-head">
                  <span className="toybox-character-ear ear-left" />
                  <span className="toybox-character-ear ear-right" />
                  <span className="toybox-character-visor"><i /><i /></span>
                </span>
                <span className="toybox-character-body"><i /></span>
                <span className="toybox-character-arm arm-left" />
                <span className="toybox-character-arm arm-right" />
                <span className="toybox-character-badge">{index + 1}</span>
              </span>
              <span className="toybox-character-tag">{isSelf ? "SEN" : player.nickname}</span>
            </div>
          );
        })}
      </div>

      <div className="toybox-foreground-fx" aria-hidden="true">
        <span className="toybox-fx-line fx-line-one" />
        <span className="toybox-fx-line fx-line-two" />
        <span className="toybox-fx-dot fx-dot-one" />
        <span className="toybox-fx-dot fx-dot-two" />
      </div>
      <div className="toybox-scene-progress" aria-hidden="true"><span /></div>
    </div>
  );
}
