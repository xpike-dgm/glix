import { useEffect, useState } from "react";
import type { JSX } from "react";
import { PREMIUM_ASSET_PATHS } from "../../visualAssetManifest";

interface KpkSparksFxProps {
  readonly xPercent: number;
  readonly yPercent: number;
  readonly accentColor: string;
  readonly onDone?: () => void;
}

export function KpkSparksFx({
  xPercent,
  yPercent,
  accentColor,
  onDone
}: KpkSparksFxProps): JSX.Element | null {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(false);
      onDone?.();
    }, 420);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!active) return null;

  return (
    <div
      className="kpk-sparks-container"
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        "--spark-accent": accentColor
      } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="kpk-spark-flash" />
      <div
        className="kpk-spark-burst"
        style={{
          backgroundImage: `url(${PREMIUM_ASSET_PATHS.games.kontrolPaneliKaosu.sparks})`
        }}
      />
      <div className="kpk-spark-particles">
        <span className="p1" />
        <span className="p2" />
        <span className="p3" />
        <span className="p4" />
        <span className="p5" />
        <span className="p6" />
      </div>
    </div>
  );
}
