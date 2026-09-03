import type { CSSProperties, JSX } from "react";

interface PylonStyle extends CSSProperties {
  "--pylon-angle": string;
  "--pylon-accent": string;
  "--pylon-delay": string;
}

const PYLONS = [
  { accent: "#72f4ff", glyph: "▲" },
  { accent: "#ff55d8", glyph: "♥" },
  { accent: "#ffc857", glyph: "⚡" },
  { accent: "#a8f46a", glyph: "≡" },
  { accent: "#9a7bff", glyph: "∿" },
  { accent: "#ff8b5d", glyph: "⚠" },
  { accent: "#00ff88", glyph: "◆" },
  { accent: "#4f8cff", glyph: "✚" }
] as const;

export function SocialPylonArena(): JSX.Element {
  return (
    <div className="social-pylon-arena" aria-hidden="true">
      <div className="pylon-arena-horizon" />
      <div className="pylon-orbit pylon-orbit-outer" />
      <div className="pylon-orbit pylon-orbit-inner" />
      <div className="pylon-core-shadow" />

      {PYLONS.map((pylon, index) => {
        const style: PylonStyle = {
          "--pylon-angle": `${index * 45}deg`,
          "--pylon-accent": pylon.accent,
          "--pylon-delay": `${index * -180}ms`
        };

        return (
          <span className="social-pylon" style={style} key={pylon.glyph}>
            <span className="social-pylon-cap">{pylon.glyph}</span>
            <span className="social-pylon-stem" />
            <span className="social-pylon-foot" />
          </span>
        );
      })}

      <div className="pylon-core">
        <span className="pylon-core-ring ring-one" />
        <span className="pylon-core-ring ring-two" />
        <svg viewBox="0 0 160 160" focusable="false">
          <polygon className="pylon-core-facet facet-back" points="80,8 139,42 139,112 80,147 21,112 21,42" />
          <polygon className="pylon-core-facet facet-front" points="80,23 124,48 124,101 80,128 36,101 36,48" />
          <path className="pylon-core-cross" d="M52 80h56M80 52v56" />
          <circle className="pylon-core-spark" cx="80" cy="80" r="15" />
        </svg>
        <span className="pylon-core-label">SOCIAL<br />CORE</span>
      </div>

      <div className="pylon-arena-caption">
        <span>8 SOCKETS</span>
        <i />
        <span>1 ARENA</span>
      </div>
    </div>
  );
}
