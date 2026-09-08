import type { JSX } from "react";
import type { MatchPlayerState } from "@glix/shared";

export type Stage11BIconKind = "memory" | "crosshair" | "gun" | "clue" | "glass" | "clock" | "lock" | "plane" | "swap" | "star" | "info";

interface Stage11BIconProps {
  readonly kind: Stage11BIconKind;
  readonly className?: string;
}

export function Stage11BIcon({ kind, className = "" }: Stage11BIconProps): JSX.Element {
  const common = { className: `stage11b-icon ${className}`.trim(), viewBox: "0 0 48 48", fill: "none", "aria-hidden": true, focusable: false } as const;

  switch (kind) {
    case "memory":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2" />
          <path d="M24 9v-5M24 44v-5M9 24H4M44 24h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 27v-7a6 6 0 0 1 12 0v7M16 27h16v12H16z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="24" cy="32" r="1.7" fill="currentColor" />
        </svg>
      );
    case "crosshair":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="13" stroke="currentColor" strokeWidth="2" />
          <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M24 3v9M24 36v9M3 24h9M36 24h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "gun":
      return (
        <svg {...common}>
          <path d="M11 18h21v8H19l-2 12h-7l2-13h-1z" fill="currentColor" fillOpacity=".22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 18h9v5h-9M17 18v-5h13v5M20 26l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "clue":
      return (
        <svg {...common}>
          <path d="M9 11.5A7.5 7.5 0 0 1 16.5 4h15A7.5 7.5 0 0 1 39 11.5v7A7.5 7.5 0 0 1 31.5 26H23l-7 7v-7h-.5A7.5 7.5 0 0 1 8 18.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="17" cy="15" r="1.5" fill="currentColor" />
          <circle cx="24" cy="15" r="1.5" fill="currentColor" />
          <circle cx="31" cy="15" r="1.5" fill="currentColor" />
        </svg>
      );
    case "glass":
      return (
        <svg {...common}>
          <path d="M14 8h20l-2 12c-.5 3.2-3.1 5.7-6 6.5V38h7v4H15v-4h7V26.5c-2.9-.8-5.5-3.3-6-6.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M15 15h18M19 19h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="2" />
          <path d="M24 15v10l6 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="13" y="21" width="22" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M18 21v-5a6 6 0 0 1 12 0v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="30" r="1.6" fill="currentColor" />
          <path d="M24 31.5v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "plane":
      return (
        <svg {...common}>
          <path d="m7 23 34-15-10 31-7-13z" fill="currentColor" fillOpacity=".22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M7 23h17M24 26 41 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "swap":
      return (
        <svg {...common}>
          <path d="M10 16h25l-5-5M38 32H13l5 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m24 5 5.8 11.7L43 18.4l-9.5 9.3 2.2 13.1L24 34.6l-11.7 6.2 2.2-13.1L5 18.4l13.2-1.7z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="2" />
          <path d="M24 21v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="24" cy="15" r="1.8" fill="currentColor" />
        </svg>
      );
  }
}

interface Stage11BReferenceHeaderProps {
  readonly title: string;
  readonly icon: Exclude<Stage11BIconKind, "clock" | "lock" | "plane" | "swap" | "star" | "info">;
  readonly timerLabel: string;
  readonly timerValue: string;
  readonly accent: "cyan" | "pink" | "violet" | "amber";
}

export function Stage11BReferenceHeader({ title, icon, timerLabel, timerValue, accent }: Stage11BReferenceHeaderProps): JSX.Element {
  return (
    <header className={`stage11b-reference-header is-${accent}`}>
      <span className="stage11b-reference-back" aria-hidden="true">←</span>
      <span className="stage11b-reference-logo" aria-label="GLIX">GL<span>IX</span></span>
      <span className="stage11b-reference-icon"><Stage11BIcon kind={icon} /></span>
      <strong className="stage11b-reference-title">{title}</strong>
      <span className="stage11b-reference-timer"><Stage11BIcon kind="clock" /><span><small>{timerLabel}</small><b>{timerValue}</b></span></span>
    </header>
  );
}

interface BlobAvatarProps {
  readonly player?: Pick<MatchPlayerState, "nickname">;
  readonly index: number;
  readonly size?: "tiny" | "small" | "regular" | "large";
  readonly muted?: boolean;
}

export function BlobAvatar({ player, index, size = "regular", muted = false }: BlobAvatarProps): JSX.Element {
  const label = player?.nickname ?? "Oyuncu";
  return (
    <span className={`stage11b-blob-avatar is-${size} avatar-tone-${index % 4} ${muted ? "is-muted" : ""}`} role="img" aria-label={`${label} avatarı`}>
      <i className="stage11b-blob-avatar__arm stage11b-blob-avatar__arm--left" />
      <i className="stage11b-blob-avatar__arm stage11b-blob-avatar__arm--right" />
      <i className="stage11b-blob-avatar__body" />
      <i className="stage11b-blob-avatar__head"><b className="stage11b-blob-avatar__eye stage11b-blob-avatar__eye--left" /><b className="stage11b-blob-avatar__eye stage11b-blob-avatar__eye--right" /><b className="stage11b-blob-avatar__mouth" /></i>
    </span>
  );
}

export function AvatarInitial({ nickname }: { readonly nickname: string }): JSX.Element {
  return <span className="stage11b-avatar-initial" aria-hidden="true">{nickname.trim().slice(0, 1).toLocaleUpperCase("tr-TR") || "?"}</span>;
}
