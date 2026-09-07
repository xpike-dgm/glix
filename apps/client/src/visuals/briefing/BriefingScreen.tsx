import type { JSX } from "react";
import type { MatchPlayerState } from "@glix/shared";

export interface BriefingScreenProps {
  readonly gameName: string;
  readonly category?: string | undefined;
  readonly steps: readonly string[];
  readonly readyCount: number;
  readonly eligibleCount: number;
  readonly readyPlayerIds: readonly string[];
  readonly players?: readonly MatchPlayerState[] | undefined;
  readonly selfPlayerId: string | null;
  readonly isReady: boolean;
  readonly canReady?: boolean | undefined;
  readonly onReady?: (() => void) | undefined;
}

export function BriefingScreen({
  gameName,
  category,
  steps,
  readyCount,
  eligibleCount,
  readyPlayerIds,
  players,
  selfPlayerId,
  isReady,
  canReady = true,
  onReady
}: BriefingScreenProps): JSX.Element {
  const readySet = new Set(readyPlayerIds);
  const displayCount = Math.max(0, readyCount);
  const totalCount = Math.max(displayCount, eligibleCount);

  return (
    <section
      className="glix-briefing-screen"
      role="region"
      aria-label={`${gameName} oyun anlatımı ve hazırlık ekranı`}
    >
      <div className="glix-briefing-content">
        {/* Top Header info */}
        <header className="glix-briefing-header">
          {category && (
            <span className="glix-briefing-category">{category}</span>
          )}
          <h1 className="glix-briefing-title">{gameName}</h1>
          <p className="glix-briefing-subtitle">
            Herkes hazır olduğunda oyun başlayacak.
          </p>
        </header>

        {/* Mascot / Hero badge */}
        <div className="glix-briefing-hero" aria-hidden="true">
          <div className="glix-briefing-hero-glow" />
          <div className="glix-briefing-mascot">
            <span className="glix-mascot-face" style={{ fontSize: "2.4rem" }}>✦</span>
          </div>
        </div>

        {/* Short, crisp step cards */}
        <div className="glix-briefing-steps" role="list">
          {steps.map((step, idx) => (
            <div className="glix-briefing-step-card" key={idx} role="listitem">
              <span className="glix-briefing-step-index">{idx + 1}</span>
              <p className="glix-briefing-step-text">{step}</p>
            </div>
          ))}
        </div>

        {/* Ready Status & Roster */}
        <div className="glix-briefing-status-bar">
          <span>Hazır Oyuncular</span>
          <span style={{ color: "var(--glix-lime)", fontWeight: 800 }}>
            {displayCount} / {totalCount}
          </span>
        </div>

        {/* Avatar indicators if players provided */}
        {players && players.length > 0 && (
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
            {players.filter((p) => p.connected && !p.eliminated).map((p) => {
              const playerReady = readySet.has(p.id);
              const initial = (p.nickname.trim()[0] || "?").toUpperCase();

              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    borderRadius: "999px",
                    background: playerReady ? "rgba(0, 255, 136, 0.15)" : "rgba(255, 255, 255, 0.08)",
                    border: `1px solid ${playerReady ? "rgba(0, 255, 136, 0.4)" : "rgba(255, 255, 255, 0.12)"}`,
                    fontSize: "0.78rem"
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: playerReady ? "var(--glix-lime)" : "rgba(255,255,255,0.2)",
                      color: playerReady ? "#000" : "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 800
                    }}
                  >
                    {playerReady ? "✓" : initial}
                  </span>
                  <span style={{ color: playerReady ? "var(--glix-lime)" : "rgba(255,255,255,0.7)" }}>
                    {p.nickname} {p.id === selfPlayerId && "(Sen)"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prominent Action Bar */}
      <div className="glix-briefing-actions">
        <button
          className={`glix-btn-ready ${isReady ? "is-ready" : ""}`}
          type="button"
          disabled={!canReady || isReady}
          onClick={canReady && !isReady ? onReady : undefined}
          aria-label={isReady ? "Hazırsın" : "Hazırım"}
        >
          <span>{isReady ? "✓" : "⚡"}</span>
          <span>{isReady ? "Hazırsın (Diğerleri Bekleniyor)" : "Hazırım!"}</span>
        </button>
      </div>
    </section>
  );
}
