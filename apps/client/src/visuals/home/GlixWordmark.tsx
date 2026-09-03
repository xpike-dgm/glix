import type { JSX } from "react";

interface GlixWordmarkProps {
  readonly compact?: boolean;
}

export function GlixWordmark({ compact = false }: GlixWordmarkProps): JSX.Element {
  return (
    <svg
      className={`glix-wordmark-svg ${compact ? "is-compact" : ""}`}
      viewBox="0 0 238 72"
      role="img"
      aria-label="GLIX"
    >
      <defs>
        <linearGradient id="glix-wordmark-fill" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f5f7ff" />
          <stop offset="0.48" stopColor="#72f4ff" />
          <stop offset="1" stopColor="#ff55d8" />
        </linearGradient>
      </defs>
      <path className="glix-wordmark-edge" d="M12 14h42M182 14h44" />
      <path className="glix-wordmark-edge glix-wordmark-edge-bottom" d="M12 58h28M198 58h28" />
      <text x="119" y="54" textAnchor="middle" fill="url(#glix-wordmark-fill)">GLIX</text>
      <path className="glix-wordmark-prism" d="M146 18l19 18-19 18-8-8 10-10-10-10z" />
    </svg>
  );
}
