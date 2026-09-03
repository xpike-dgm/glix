import { useEffect, useState } from "react";
import type { JSX, ReactNode } from "react";
import { RotateDeviceOverlay } from "../overlays/RotateDeviceOverlay";

interface OrientationGateProps {
  readonly requiresLandscape: boolean;
  readonly gameName: string;
  readonly roomCode?: string;
  readonly children: ReactNode;
}

function isLandscapeViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(orientation: landscape)").matches || window.innerWidth > window.innerHeight;
}

export function OrientationGate({
  requiresLandscape,
  gameName,
  roomCode,
  children
}: OrientationGateProps): JSX.Element {
  const [isLandscape, setIsLandscape] = useState(isLandscapeViewport);
  const locked = requiresLandscape && !isLandscape;

  useEffect(() => {
    if (!requiresLandscape) {
      return;
    }

    const mediaQuery = window.matchMedia("(orientation: landscape)");
    const updateOrientation = (): void => setIsLandscape(mediaQuery.matches || window.innerWidth > window.innerHeight);

    updateOrientation();
    mediaQuery.addEventListener?.("change", updateOrientation);
    window.addEventListener("resize", updateOrientation);

    return () => {
      mediaQuery.removeEventListener?.("change", updateOrientation);
      window.removeEventListener("resize", updateOrientation);
    };
  }, [requiresLandscape]);

  useEffect(() => {
    const content = document.querySelector<HTMLElement>('[data-glix-orientation-content="active"]');
    if (!content) return;
    content.toggleAttribute("inert", locked);
  }, [locked]);

  return (
    <div className={`glix-orientation-frame ${locked ? "is-orientation-locked" : ""}`}>
      <div
        className="glix-orientation-content"
        data-glix-orientation-content="active"
        aria-hidden={locked}
      >
        {children}
      </div>
      {locked && <RotateDeviceOverlay gameName={gameName} {...(roomCode ? { roomCode } : {})} />}
    </div>
  );
}
