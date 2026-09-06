import { useCallback, useMemo, useState } from "react";
import type { FormEvent, JSX, KeyboardEvent } from "react";
import type {
  CagrisimAgiOwnState,
  CagrisimAgiPublicState,
  CagrisimGroupView,
  JsonValue,
  MatchPlayerState
} from "@glix/shared";

interface CagrisimAgiStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

type PendingAction = { readonly answer: string; readonly submittedAt: number } | null;

const MAX_ANSWER_LENGTH = 40;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isCagrisimPublicState(value: unknown): value is CagrisimAgiPublicState {
  if (!isObject(value) || value.gameId !== "cagrisim-agi" || value.kind !== "cagrisim-agi") return false;
  const subPhase = value.subPhase;
  return (
    (subPhase === "answer" || subPhase === "results") &&
    typeof value.finished === "boolean" &&
    typeof value.mainWord === "string"
  );
}

function isCagrisimOwnState(value: unknown): value is CagrisimAgiOwnState {
  if (!isObject(value) || value.gameId !== "cagrisim-agi" || value.kind !== "cagrisim-agi") return false;
  return (
    typeof value.hasSubmitted === "boolean" &&
    typeof value.finished === "boolean"
  );
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  if (!playerId) return "Oyuncu";
  return players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function secondsLeft(deadline: number | null, now: number): number {
  return deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));
}

const STYLES = `
  .stage11d-cagrisim {
    --cag-bg: #080a16;
    --cag-card-bg: rgba(18, 22, 45, 0.88);
    --cag-border: rgba(114, 244, 255, 0.22);
    --cag-cyan: #72f4ff;
    --cag-purple: #b57cff;
    --cag-pink: #ff55d8;
    --cag-lime: #a8f46a;
    --cag-yellow: #ffc857;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    color: #edf2ff;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
    overflow: hidden;
    position: relative;
  }

  .stage11d-cagrisim *, .stage11d-cagrisim *::before, .stage11d-cagrisim *::after {
    box-sizing: border-box;
  }

  .stage11d-cagrisim-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--cag-border);
    background: rgba(8, 10, 22, 0.85);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
  }

  .stage11d-cagrisim-title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .stage11d-cagrisim-badge {
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    color: var(--cag-cyan);
    text-transform: uppercase;
  }

  .stage11d-cagrisim-heading {
    font-size: clamp(0.95rem, 2.2vw, 1.25rem);
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stage11d-cagrisim-timer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 200, 87, 0.4);
    background: rgba(255, 200, 87, 0.12);
    color: var(--cag-yellow);
    font-size: 0.82rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .stage11d-cagrisim-main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(10px, 1.8vh, 16px) clamp(10px, 2vw, 18px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(114, 244, 255, 0.25) transparent;
  }

  /* Central Neural Node / Prompt */
  .stage11d-cagrisim-core-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 18px 22px;
    border-radius: 16px;
    border: 1px solid rgba(114, 244, 255, 0.35);
    background: radial-gradient(circle, rgba(114, 244, 255, 0.15) 0%, rgba(18, 22, 45, 0.95) 75%);
    box-shadow: 0 0 24px rgba(114, 244, 255, 0.18), inset 0 0 16px rgba(114, 244, 255, 0.1);
    text-align: center;
    position: relative;
    flex-shrink: 0;
  }

  .stage11d-cagrisim-core-sub {
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 0.18em;
    color: var(--cag-cyan);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .stage11d-cagrisim-core-word {
    font-size: clamp(1.4rem, 4vw, 2.2rem);
    font-weight: 900;
    letter-spacing: 0.06em;
    color: #fff;
    text-shadow: 0 0 20px rgba(114, 244, 255, 0.5);
    margin: 0;
  }

  /* Interaction Action Card */
  .stage11d-cagrisim-action-card {
    padding: 14px;
    border-radius: 12px;
    border: 1px solid var(--cag-border);
    background: var(--cag-card-bg);
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  }

  .stage11d-cagrisim-input {
    width: 100%;
    min-height: 46px;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid rgba(114, 244, 255, 0.35);
    background: rgba(10, 14, 30, 0.85);
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .stage11d-cagrisim-input:focus {
    border-color: var(--cag-cyan);
    box-shadow: 0 0 12px rgba(114, 244, 255, 0.3);
  }

  .stage11d-cagrisim-btn {
    min-height: 44px;
    padding: 10px 18px;
    border-radius: 8px;
    border: 1px solid var(--cag-cyan);
    background: linear-gradient(135deg, rgba(114, 244, 255, 0.25), rgba(60, 120, 240, 0.2));
    color: #fff;
    font-size: 0.88rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: transform 0.15s ease, filter 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .stage11d-cagrisim-btn:hover:not(:disabled) {
    filter: brightness(1.15);
    transform: translateY(-1px);
  }

  .stage11d-cagrisim-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* Result Clusters / Elastic Graph */
  .stage11d-cagrisim-results-graph {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .stage11d-cagrisim-cluster {
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid rgba(114, 244, 255, 0.3);
    background: linear-gradient(135deg, rgba(20, 26, 54, 0.9), rgba(12, 16, 36, 0.95));
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    overflow: hidden;
  }

  .stage11d-cagrisim-cluster.is-match {
    border-color: var(--cag-lime);
    box-shadow: 0 0 16px rgba(168, 244, 106, 0.2);
  }

  .stage11d-cagrisim-cluster.is-solo {
    opacity: 0.65;
    border-color: rgba(140, 160, 230, 0.18);
  }

  .stage11d-cagrisim-cluster-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .stage11d-cagrisim-cluster-word {
    font-size: 1.15rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    color: #fff;
  }

  .stage11d-cagrisim-cluster-badge {
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.68rem;
    font-weight: 800;
  }

  .stage11d-cagrisim-cluster-badge.badge-match {
    background: rgba(168, 244, 106, 0.2);
    border: 1px solid var(--cag-lime);
    color: var(--cag-lime);
  }

  .stage11d-cagrisim-cluster-badge.badge-solo {
    background: rgba(255, 255, 255, 0.08);
    color: var(--stage11d-dim);
  }

  .stage11d-cagrisim-cluster-members {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .stage11d-cagrisim-member-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    font-size: 0.76rem;
    font-weight: 700;
    color: #edf2ff;
  }
`;

export function CagrisimAgiStage({
  publicState: rawPublic,
  ownState: rawOwn,
  players,
  selfPlayerId,
  now,
  isSpectator,
  onSubmit
}: CagrisimAgiStageProps): JSX.Element {
  const publicState = isCagrisimPublicState(rawPublic) ? rawPublic : null;
  const ownState = isCagrisimOwnState(rawOwn) ? rawOwn : null;

  const [answerInput, setAnswerInput] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const subPhase = publicState?.subPhase ?? "answer";
  const seconds = secondsLeft(publicState?.phaseEndsAt ?? null, now);
  const isFinished = publicState?.finished ?? false;

  useMemo(() => {
    setPendingAction(null);
  }, [subPhase]);

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const clean = answerInput.trim();
      if (!clean || ownState?.hasSubmitted || pendingAction) return;
      setPendingAction({ answer: clean, submittedAt: now });
      onSubmit({ kind: "association", answer: clean });
    },
    [answerInput, now, onSubmit, ownState?.hasSubmitted, pendingAction]
  );

  if (!publicState) {
    return (
      <div className="stage11d-cagrisim">
        <style>{STYLES}</style>
        <div style={{ padding: "20px", textAlign: "center" }}>Çağrışım Ağı sahnesi kuruluyor…</div>
      </div>
    );
  }

  const hasSubmitted = ownState?.hasSubmitted || (pendingAction !== null);

  return (
    <div className="stage11d-cagrisim">
      <style>{STYLES}</style>

      {/* Header */}
      <header className="stage11d-cagrisim-header">
        <div className="stage11d-cagrisim-title-group">
          <span className="stage11d-cagrisim-badge">
            {subPhase === "answer" && "ÇAĞRIŞIM FAZI"}
            {subPhase === "results" && "AĞ KİLİTLENDİ"}
          </span>
          <h2 className="stage11d-cagrisim-heading">
            {subPhase === "answer" && "İlk Aklına Gelen Kelime"}
            {subPhase === "results" && "Eşleşen Çağrışım Grupları"}
          </h2>
        </div>
        {!isFinished && publicState.phaseEndsAt && (
          <div className="stage11d-cagrisim-timer">
            <span>⏱️</span>
            <span>{seconds}s</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="stage11d-cagrisim-main">
        {/* Glowing Center Word Node */}
        <section className="stage11d-cagrisim-core-node">
          <span className="stage11d-cagrisim-core-sub">Merkez Çağrışım Düğümü</span>
          <h1 className="stage11d-cagrisim-core-word">{publicState.mainWord}</h1>
        </section>

        {/* Phase 1: Submit Answer */}
        {subPhase === "answer" && !isSpectator && (
          <section className="stage11d-cagrisim-action-card">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "var(--stage11d-muted)" }}>
                <span>Aklına gelen ilk kelimeyi yaz</span>
                <span>{answerInput.length}/{MAX_ANSWER_LENGTH}</span>
              </div>
              <input
                className="stage11d-cagrisim-input"
                type="text"
                placeholder="Örn: Mavi, Uzay, Hız…"
                maxLength={MAX_ANSWER_LENGTH}
                value={answerInput}
                disabled={hasSubmitted}
                onChange={(e) => setAnswerInput(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSubmit();
                  }
                }}
              />
              <button
                type="submit"
                className="stage11d-cagrisim-btn"
                disabled={hasSubmitted || answerInput.trim().length === 0}
              >
                {hasSubmitted ? "✓ Düğüme Kilitlendi" : "⚡ Çağrışımı Gönder"}
              </button>
            </form>
          </section>
        )}

        {/* Phase 2: Results Elastic Graph */}
        {subPhase === "results" && (
          <section className="stage11d-cagrisim-results-graph">
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--stage11d-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Fiziksel Çağrışım Kümeleri (2+ Eşleşme = Grup Boyutu Kadar Puan)
            </div>

            {publicState.groups && publicState.groups.length > 0 ? (
              publicState.groups.map((grp: CagrisimGroupView, idx) => {
                const isMatch = grp.playerIds.length >= 2;

                return (
                  <div
                    key={`${grp.answer}-${idx}`}
                    className={`stage11d-cagrisim-cluster ${isMatch ? "is-match" : "is-solo"}`}
                  >
                    <div className="stage11d-cagrisim-cluster-head">
                      <span className="stage11d-cagrisim-cluster-word">“{grp.answer}”</span>
                      <span className={`stage11d-cagrisim-cluster-badge ${isMatch ? "badge-match" : "badge-solo"}`}>
                        {isMatch ? `+${grp.points} Puan (${grp.playerIds.length} Oyuncu)` : "Yalnız (0 Puan)"}
                      </span>
                    </div>
                    <div className="stage11d-cagrisim-cluster-members">
                      {grp.playerIds.map((pid) => (
                        <div key={pid} className="stage11d-cagrisim-member-pill">
                          <span>👤</span>
                          <span>{playerName(players, pid)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: "var(--stage11d-muted)", textAlign: "center", padding: "14px" }}>
                Grup oluşmadı.
              </div>
            )}
          </section>
        )}

        {isSpectator && !isFinished && (
          <div
            style={{
              padding: "10px",
              textAlign: "center",
              borderRadius: "8px",
              background: "rgba(10, 15, 30, 0.7)",
              border: "1px solid var(--cag-border)",
              color: "var(--stage11d-muted)",
              fontSize: "0.78rem"
            }}
          >
            👀 İzleyici modu: Oyuncular gizli çağrışımlarını düğümlere bağlıyor. Eşleşme ağı sonuçta örülecek.
          </div>
        )}
      </main>
    </div>
  );
}
