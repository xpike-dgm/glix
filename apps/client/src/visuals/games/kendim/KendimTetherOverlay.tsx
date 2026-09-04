import { useState, useLayoutEffect } from "react";
import type { JSX, RefObject } from "react";

interface KendimTetherOverlayProps {
  readonly containerRef: RefObject<HTMLDivElement | null>;
  readonly cardSocketRef: RefObject<HTMLDivElement | null>;
  readonly targetSocketRef: HTMLDivElement | null;
  readonly isMapped: boolean;
  readonly activeCardId: string | null;
  readonly targetPlayerId: string | null;
}

interface TetherGeometry {
  readonly path: string;
}

export function KendimTetherOverlay({
  containerRef,
  cardSocketRef,
  targetSocketRef,
  isMapped,
  activeCardId,
  targetPlayerId
}: KendimTetherOverlayProps): JSX.Element {
  const [geometry, setGeometry] = useState<TetherGeometry | null>(null);

  useLayoutEffect(() => {
    if (!isMapped || !targetSocketRef || !cardSocketRef.current || !containerRef.current) {
      setGeometry(null);
      return;
    }

    let isMounted = true;

    const measure = (): void => {
      if (!isMounted) return;
      const container = containerRef.current;
      const cardSocket = cardSocketRef.current;
      const targetSocket = targetSocketRef;

      if (!container || !cardSocket || !targetSocket) {
        setGeometry(null);
        return;
      }

      const cRect = container.getBoundingClientRect();
      const csRect = cardSocket.getBoundingClientRect();
      const tsRect = targetSocket.getBoundingClientRect();

      // Coordinates relative to stage container
      const x1 = csRect.left + csRect.width / 2 - cRect.left;
      const y1 = csRect.bottom - cRect.top - 2; // slight ingress into socket collar
      const x2 = tsRect.left + tsRect.width / 2 - cRect.left;
      const y2 = tsRect.top - cRect.top + 3; // slight ingress into destination socket

      const dy = y2 - y1;
      const controlOffsetY = Math.max(24, Math.abs(dy) * 0.45);

      const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${x1.toFixed(1)} ${(y1 + controlOffsetY).toFixed(1)}, ${x2.toFixed(1)} ${(y2 - controlOffsetY).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;

      setGeometry({ path });
    };

    // Initial measurement
    measure();

    // Secondary measurement on animation frame in case fonts/images/layout settle
    const rafId = requestAnimationFrame(measure);

    // Attach ResizeObserver to container
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        measure();
      });
      resizeObserver.observe(containerRef.current);
    }

    const handleWindowResize = (): void => {
      measure();
    };
    window.addEventListener("resize", handleWindowResize);

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [containerRef, cardSocketRef, targetSocketRef, isMapped, activeCardId, targetPlayerId]);

  return (
    <svg
      className="kendim-tether-canvas"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
        overflow: "visible"
      }}
    >
      <defs>
        <filter id="kendim-tether-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="kendim-tether-beam-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00f5ff" />
          <stop offset="50%" stopColor="#00ff88" />
          <stop offset="100%" stopColor="#38ef7d" />
        </linearGradient>
      </defs>

      {geometry && (
        <g className="kendim-tether-group">
          {/* Ambient Outer Halo */}
          <path
            d={geometry.path}
            fill="none"
            stroke="#00ff88"
            strokeWidth="8"
            strokeOpacity="0.25"
            strokeLinecap="round"
            filter="url(#kendim-tether-glow)"
          />
          {/* Core Neon Beam */}
          <path
            d={geometry.path}
            fill="none"
            stroke="url(#kendim-tether-beam-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="kendim-tether-core-path"
          />
          {/* Inner Filament */}
          <path
            d={geometry.path}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.9"
            strokeLinecap="round"
          />
          {/* Animated energy pulse along path */}
          <path
            d={geometry.path}
            fill="none"
            stroke="#00ff88"
            strokeWidth="4"
            strokeDasharray="10 30"
            strokeLinecap="round"
            className="kendim-tether-pulse-path"
          />
        </g>
      )}
    </svg>
  );
}
