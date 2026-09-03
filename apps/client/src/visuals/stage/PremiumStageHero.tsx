import type { CSSProperties, JSX } from "react";
import type { GameDefinition } from "@glix/shared";
import type { VisualPhase } from "../types";

interface PremiumStageHeroProps {
  readonly game: GameDefinition;
  readonly phase: VisualPhase;
  readonly progress: number;
  readonly isSpectator: boolean;
  readonly ownHasSubmitted: boolean;
}

interface HeroStyle extends CSSProperties {
  "--hero-progress": string;
}

function familyFor(game: GameDefinition): string {
  if (game.id === "kontrol-paneli-kaosu") return "console";
  if (game.id === "cagrisim-agi" || game.category === "sosyal") return "social";
  if (game.category === "risk") return "risk";
  if (game.category === "hafiza") return "memory";
  if (game.category === "sayi") return "number";
  return "timing";
}

function HeroObject({ family }: { readonly family: string }): JSX.Element {
  if (family === "console") {
    return (
      <div className="stage-hero-object hero-console-object" aria-hidden="true">
        <span className="hero-console-topline" />
        <div className="hero-console-slots"><i /><i /><i /><i /></div>
        <div className="hero-console-screen"><span /><span /><span /></div>
        <div className="hero-console-dial" />
      </div>
    );
  }

  if (family === "social") {
    return (
      <div className="stage-hero-object hero-social-object" aria-hidden="true">
        <span className="hero-social-orbit orbit-one" />
        <span className="hero-social-orbit orbit-two" />
        <span className="hero-social-node node-one" />
        <span className="hero-social-node node-two" />
        <span className="hero-social-node node-three" />
        <div className="hero-social-core"><span>GLIX</span></div>
      </div>
    );
  }

  if (family === "risk") {
    return (
      <div className="stage-hero-object hero-risk-object" aria-hidden="true">
        <span className="hero-risk-ring ring-one" />
        <span className="hero-risk-ring ring-two" />
        <div className="hero-risk-chamber"><i /><b>!</b></div>
        <span className="hero-risk-reticle" />
      </div>
    );
  }

  if (family === "memory") {
    return (
      <div className="stage-hero-object hero-memory-object" aria-hidden="true">
        {["#72f4ff", "#ff55d8", "#ffc857", "#a8f46a"].map((color, index) => (
          <span className={`hero-memory-pad pad-${index + 1}`} style={{ "--pad-color": color } as CSSProperties} key={color}>{index + 1}</span>
        ))}
      </div>
    );
  }

  if (family === "number") {
    return (
      <div className="stage-hero-object hero-number-object" aria-hidden="true">
        <span className="hero-number-arc arc-one" />
        <span className="hero-number-arc arc-two" />
        <div className="hero-number-readout">00<span>.00</span></div>
        <i className="hero-number-marker" />
      </div>
    );
  }

  return (
    <div className="stage-hero-object hero-timing-object" aria-hidden="true">
      <span className="hero-timing-ring ring-one" />
      <span className="hero-timing-ring ring-two" />
      <div className="hero-timing-button"><span>GO</span></div>
      <span className="hero-timing-tick tick-one" />
      <span className="hero-timing-tick tick-two" />
      <span className="hero-timing-tick tick-three" />
    </div>
  );
}

export function PremiumStageHero({
  game,
  phase,
  progress,
  isSpectator,
  ownHasSubmitted
}: PremiumStageHeroProps): JSX.Element {
  const family = familyFor(game);
  const style: HeroStyle = { "--hero-progress": `${Math.round(progress * 100)}%` };

  return (
    <div className={`glix-stage-hero glix-hero-family-${family} glix-hero-phase-${phase} ${isSpectator ? "is-spectator" : ""} ${ownHasSubmitted ? "is-submitted" : ""}`} style={style}>
      <div className="glix-stage-hero-scan" aria-hidden="true" />
      <span className="glix-stage-hero-corner corner-one" aria-hidden="true" />
      <span className="glix-stage-hero-corner corner-two" aria-hidden="true" />
      <div className="glix-stage-hero-object-wrap"><HeroObject family={family} /></div>
      <div className="glix-stage-hero-caption">
        <span>{game.category.toUpperCase()} / {game.supportsPortrait ? "PORTRAIT STAGE" : "LANDSCAPE STAGE"}</span>
        <strong>{phase === "playing" ? "HAMLE ANI" : phase === "results" ? "AÇILIM" : phase === "finished" ? "TAMAMLANDI" : "SAHNE HAZIR"}</strong>
      </div>
      <div className="glix-stage-hero-meter" aria-hidden="true"><span /></div>
    </div>
  );
}
