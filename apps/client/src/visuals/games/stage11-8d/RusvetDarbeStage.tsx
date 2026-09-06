import { useCallback, useMemo, useState } from "react";
import type { JSX } from "react";
import type {
  JsonValue,
  MatchPlayerState,
  RpsChoice,
  RusvetAllocationView,
  RusvetDarbeOwnState,
  RusvetDarbePublicState
} from "@glix/shared";

interface RusvetDarbeStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

type PendingAction =
  | { readonly kind: "vote"; readonly targetId: string; readonly submittedAt: number }
  | { readonly kind: "rps"; readonly choice: RpsChoice; readonly submittedAt: number }
  | { readonly kind: "distribution"; readonly submittedAt: number }
  | null;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isRusvetPublicState(value: unknown): value is RusvetDarbePublicState {
  if (!isObject(value) || value.gameId !== "rusvet-darbe" || value.kind !== "rusvet-darbe") return false;
  const subPhase = value.subPhase;
  return (
    (subPhase === "election" || subPhase === "rps" || subPhase === "distribution" || subPhase === "results") &&
    typeof value.finished === "boolean" &&
    Array.isArray(value.rpsCandidateIds) &&
    typeof value.rpsRound === "number"
  );
}

function isRusvetOwnState(value: unknown): value is RusvetDarbeOwnState {
  if (!isObject(value) || value.gameId !== "rusvet-darbe" || value.kind !== "rusvet-darbe") return false;
  return (
    typeof value.hasVoted === "boolean" &&
    typeof value.isPresident === "boolean" &&
    typeof value.canChooseRps === "boolean" &&
    typeof value.hasChosenRps === "boolean" &&
    Array.isArray(value.rpsCandidateIds) &&
    typeof value.remainingDistributionPoints === "number" &&
    Array.isArray(value.submittedAllocations) &&
    typeof value.hasSubmittedDistribution === "boolean" &&
    typeof value.finished === "boolean"
  );
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  if (!playerId) return "Meclis Üyesi";
  return players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function playerAvatarLetter(players: readonly MatchPlayerState[], playerId: string | null): string {
  const name = playerName(players, playerId);
  return name.trim().charAt(0).toLocaleUpperCase("tr-TR") || "?";
}

function secondsLeft(deadline: number | null, now: number): number {
  return deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));
}

const STYLES = `
  .stage11d-rusvet {
    --rd-bg: #090b17;
    --rd-card-bg: rgba(18, 23, 46, 0.9);
    --rd-border: rgba(140, 160, 235, 0.22);
    --rd-gold: #ffbe53;
    --rd-cyan: #72f4ff;
    --rd-red: #ff5577;
    --rd-lime: #a8f46a;
    --rd-purple: #b57cff;
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

  .stage11d-rusvet *, .stage11d-rusvet *::before, .stage11d-rusvet *::after {
    box-sizing: border-box;
  }

  .stage11d-rusvet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--rd-border);
    background: rgba(9, 11, 23, 0.85);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
  }

  .stage11d-rusvet-title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .stage11d-rusvet-badge {
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    color: var(--rd-gold);
    text-transform: uppercase;
  }

  .stage11d-rusvet-heading {
    font-size: clamp(0.95rem, 2.2vw, 1.25rem);
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stage11d-rusvet-timer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 190, 83, 0.4);
    background: rgba(255, 190, 83, 0.12);
    color: var(--rd-gold);
    font-size: 0.82rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .stage11d-rusvet-main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(10px, 1.8vh, 16px) clamp(10px, 2vw, 18px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 190, 83, 0.25) transparent;
  }

  /* Parliament Desk Banner */
  .stage11d-rusvet-desk {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid var(--rd-border);
    background: linear-gradient(180deg, rgba(22, 28, 56, 0.85), rgba(13, 17, 36, 0.95));
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.4);
    flex-shrink: 0;
  }

  .stage11d-rusvet-desk-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: var(--stage11d-muted);
    text-transform: uppercase;
  }

  .stage11d-rusvet-action-card {
    padding: 14px;
    border-radius: 12px;
    border: 1px solid var(--rd-border);
    background: var(--rd-card-bg);
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  }

  /* Candidate Grid */
  .stage11d-rusvet-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
  }

  .stage11d-rusvet-card-btn {
    min-height: 48px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--rd-border);
    background: rgba(14, 18, 38, 0.75);
    color: #edf2ff;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .stage11d-rusvet-card-btn:hover:not(:disabled) {
    border-color: var(--rd-gold);
    background: rgba(255, 190, 83, 0.14);
    transform: translateY(-1px);
  }

  .stage11d-rusvet-card-btn.is-selected {
    border-color: var(--rd-gold);
    background: rgba(255, 190, 83, 0.2);
    box-shadow: 0 0 12px rgba(255, 190, 83, 0.25);
  }

  .stage11d-rusvet-card-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* Duel RPS Arena */
  .stage11d-rusvet-rps-arena {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid rgba(255, 85, 119, 0.4);
    background: radial-gradient(circle at 50% 0%, rgba(255, 85, 119, 0.15), rgba(16, 20, 42, 0.95));
    box-shadow: 0 0 24px rgba(255, 85, 119, 0.15);
  }

  .stage11d-rusvet-rps-controls {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    width: 100%;
  }

  .stage11d-rusvet-rps-btn {
    min-height: 52px;
    min-width: 90px;
    flex: 1;
    max-width: 130px;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid var(--rd-border);
    background: rgba(15, 19, 40, 0.85);
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: 800;
    transition: all 0.15s ease;
  }

  .stage11d-rusvet-rps-btn:hover:not(:disabled) {
    border-color: var(--rd-cyan);
    background: rgba(114, 244, 255, 0.15);
    transform: translateY(-2px);
  }

  .stage11d-rusvet-rps-btn.is-selected {
    border-color: var(--rd-red);
    background: rgba(255, 85, 119, 0.25);
    box-shadow: 0 0 14px rgba(255, 85, 119, 0.35);
  }

  .stage11d-rusvet-rps-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* Budget Ledger */
  .stage11d-rusvet-ledger {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .stage11d-rusvet-ledger-budget-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-radius: 8px;
    border: 1px solid rgba(255, 190, 83, 0.4);
    background: rgba(255, 190, 83, 0.1);
  }

  .stage11d-rusvet-ledger-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--rd-border);
    background: rgba(14, 18, 38, 0.7);
  }

  .stage11d-rusvet-stepper {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stage11d-rusvet-stepper-btn {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    border: 1px solid var(--rd-border);
    background: rgba(25, 32, 60, 0.8);
    color: #fff;
    font-size: 1rem;
    font-weight: 900;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: all 0.15s ease;
  }

  .stage11d-rusvet-stepper-btn:hover:not(:disabled) {
    border-color: var(--rd-gold);
    background: rgba(255, 190, 83, 0.2);
  }

  .stage11d-rusvet-stepper-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .stage11d-rusvet-primary-btn {
    min-height: 44px;
    padding: 10px 18px;
    border-radius: 8px;
    border: 1px solid var(--rd-gold);
    background: linear-gradient(135deg, rgba(255, 190, 83, 0.25), rgba(210, 140, 30, 0.2));
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

  .stage11d-rusvet-primary-btn:hover:not(:disabled) {
    filter: brightness(1.15);
    transform: translateY(-1px);
  }

  .stage11d-rusvet-primary-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export function RusvetDarbeStage({
  publicState: rawPublic,
  ownState: rawOwn,
  players,
  selfPlayerId,
  now,
  isSpectator,
  onSubmit
}: RusvetDarbeStageProps): JSX.Element {
  const publicState = isRusvetPublicState(rawPublic) ? rawPublic : null;
  const ownState = isRusvetOwnState(rawOwn) ? rawOwn : null;

  const [voteTargetId, setVoteTargetId] = useState<string | null>(null);
  const [rpsChoice, setRpsChoice] = useState<RpsChoice | null>(null);
  const [localAllocations, setLocalAllocations] = useState<Record<string, number>>({});
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const subPhase = publicState?.subPhase ?? "election";
  const seconds = secondsLeft(publicState?.phaseEndsAt ?? null, now);
  const isFinished = publicState?.finished ?? false;

  useMemo(() => {
    setPendingAction(null);
  }, [subPhase]);

  // Handle Election Vote
  const handleVoteSubmit = useCallback(() => {
    if (!voteTargetId || ownState?.hasVoted || pendingAction) return;
    setPendingAction({ kind: "vote", targetId: voteTargetId, submittedAt: now });
    onSubmit({ kind: "president-vote", targetPlayerId: voteTargetId });
  }, [now, onSubmit, ownState?.hasVoted, pendingAction, voteTargetId]);

  // Handle RPS Duel Choice
  const handleRpsSubmit = useCallback(
    (choice: RpsChoice) => {
      if (ownState?.hasChosenRps || pendingAction) return;
      setRpsChoice(choice);
      setPendingAction({ kind: "rps", choice, submittedAt: now });
      onSubmit({ kind: "rps-choice", choice });
    },
    [now, onSubmit, ownState?.hasChosenRps, pendingAction]
  );

  // Handle Budget Allocation Change
  const updateAllocation = useCallback(
    (targetId: string, delta: number) => {
      setLocalAllocations((prev) => {
        const current = prev[targetId] ?? 0;
        const next = Math.max(0, Math.min(2, current + delta));
        return { ...prev, [targetId]: next };
      });
    },
    []
  );

  // Current allocated sum
  const currentTotalAllocated = useMemo(() => {
    return Object.values(localAllocations).reduce((sum, val) => sum + val, 0);
  }, [localAllocations]);

  // Handle Distribution Submit
  const handleDistributionSubmit = useCallback(() => {
    if (ownState?.hasSubmittedDistribution || pendingAction) return;
    const allocationsList: RusvetAllocationView[] = Object.entries(localAllocations)
      .filter(([, points]) => points > 0)
      .map(([targetPlayerId, points]) => ({ targetPlayerId, points }));

    setPendingAction({ kind: "distribution", submittedAt: now });
    onSubmit({ kind: "president-distribution", allocations: allocationsList as unknown as JsonValue });
  }, [localAllocations, now, onSubmit, ownState?.hasSubmittedDistribution, pendingAction]);

  if (!publicState) {
    return (
      <div className="stage11d-rusvet">
        <style>{STYLES}</style>
        <div style={{ padding: "20px", textAlign: "center" }}>Rüşvet ve Darbe sahnesi kuruluyor…</div>
      </div>
    );
  }

  const eligibleVoteCandidates = players.filter(
    (p) => p.id !== selfPlayerId && p.connected && p.currentGameParticipant && !p.eliminated
  );

  const hasSubmittedVote = ownState?.hasVoted || (pendingAction?.kind === "vote");
  const hasSubmittedRps = ownState?.hasChosenRps || (pendingAction?.kind === "rps");
  const hasSubmittedDistribution = ownState?.hasSubmittedDistribution || (pendingAction?.kind === "distribution");

  return (
    <div className="stage11d-rusvet">
      <style>{STYLES}</style>

      {/* Header */}
      <header className="stage11d-rusvet-header">
        <div className="stage11d-rusvet-title-group">
          <span className="stage11d-rusvet-badge">
            {subPhase === "election" && "1. BAŞKANLIK SEÇİMİ"}
            {subPhase === "rps" && `BERABERLİK DÜELLOSU (TUR ${publicState.rpsRound})`}
            {subPhase === "distribution" && "2. RÜŞVET BÜTÇESİ DAĞITIMI"}
            {subPhase === "results" && "PARLAMENTO KARARI"}
          </span>
          <h2 className="stage11d-rusvet-heading">
            {subPhase === "election" && "Meclis Başkanını Seç"}
            {subPhase === "rps" && "Taş - Kağıt - Makas Düellosu"}
            {subPhase === "distribution" && "Rüşvet Dağıtım Defteri"}
            {subPhase === "results" && "Meclis Tutanakları ve Puanlar"}
          </h2>
        </div>
        {!isFinished && publicState.phaseEndsAt && (
          <div className="stage11d-rusvet-timer">
            <span>⏱️</span>
            <span>{seconds}s</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="stage11d-rusvet-main">
        {/* Parliament Status Desk */}
        <section className="stage11d-rusvet-desk">
          <div className="stage11d-rusvet-desk-head">
            <span>Meclis Kürsüsü</span>
            <span>
              {subPhase === "election" && "Kapalı Zarflar Toplanıyor"}
              {subPhase === "rps" && `Adaylar Çekişiyor: ${publicState.rpsCandidateIds.length} Aday`}
              {subPhase === "distribution" && `Başkan: ${playerName(players, publicState.presidentId)}`}
              {subPhase === "results" && "Oturum Tamamlandı"}
            </span>
          </div>
        </section>

        {/* Phase 1: Election */}
        {subPhase === "election" && !isSpectator && (
          <section className="stage11d-rusvet-action-card">
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--stage11d-muted)" }}>
              Kimi meclis başkanı seçmek istersin? (Kendine oy veremezsin)
            </span>
            <div className="stage11d-rusvet-grid">
              {eligibleVoteCandidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  className={`stage11d-rusvet-card-btn ${voteTargetId === candidate.id ? "is-selected" : ""}`}
                  disabled={hasSubmittedVote}
                  onClick={() => setVoteTargetId(candidate.id)}
                >
                  <span style={{ fontSize: "1rem" }}>👤</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {candidate.nickname}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="stage11d-rusvet-primary-btn"
              disabled={hasSubmittedVote || !voteTargetId}
              onClick={handleVoteSubmit}
            >
              {hasSubmittedVote ? "✓ Mühürlü Oy Sandığa Atıldı" : "🗳️ Oyu Sandığa Gönder"}
            </button>
          </section>
        )}

        {/* Phase 2: RPS Tie Duel */}
        {subPhase === "rps" && (
          <section className="stage11d-rusvet-rps-arena">
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "1.6rem" }}>⚔️</span>
              <h3 style={{ margin: "4px 0", fontSize: "1rem" }}>Beraberlik Düellosu!</h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--stage11d-muted)" }}>
                En çok oyu alan adaylar berabere kaldı:{" "}
                {publicState.rpsCandidateIds.map((id) => playerName(players, id)).join(", ")}
              </p>
            </div>

            {ownState?.canChooseRps && !isSpectator ? (
              <div className="stage11d-rusvet-rps-controls">
                <button
                  type="button"
                  className={`stage11d-rusvet-rps-btn ${rpsChoice === "rock" ? "is-selected" : ""}`}
                  disabled={hasSubmittedRps}
                  onClick={() => handleRpsSubmit("rock")}
                >
                  <span style={{ fontSize: "1.4rem" }}>🪨</span>
                  <span>TAŞ</span>
                </button>
                <button
                  type="button"
                  className={`stage11d-rusvet-rps-btn ${rpsChoice === "paper" ? "is-selected" : ""}`}
                  disabled={hasSubmittedRps}
                  onClick={() => handleRpsSubmit("paper")}
                >
                  <span style={{ fontSize: "1.4rem" }}>📄</span>
                  <span>KAĞIT</span>
                </button>
                <button
                  type="button"
                  className={`stage11d-rusvet-rps-btn ${rpsChoice === "scissors" ? "is-selected" : ""}`}
                  disabled={hasSubmittedRps}
                  onClick={() => handleRpsSubmit("scissors")}
                >
                  <span style={{ fontSize: "1.4rem" }}>✂️</span>
                  <span>MAKAS</span>
                </button>
              </div>
            ) : (
              <div style={{ fontSize: "0.8rem", color: "var(--stage11d-muted)" }}>
                Adaylar hamlelerini seçiyor, bekleyin…
              </div>
            )}
          </section>
        )}

        {/* Phase 3: Budget Distribution */}
        {subPhase === "distribution" && (
          <section className="stage11d-rusvet-action-card">
            {ownState?.isPresident ? (
              <div className="stage11d-rusvet-ledger">
                <div className="stage11d-rusvet-ledger-budget-box">
                  <div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--rd-gold)" }}>
                      BAŞKANLIK BÜTÇESİ
                    </span>
                    <strong style={{ display: "block", fontSize: "1.1rem" }}>
                      Toplam {ownState.remainingDistributionPoints + currentTotalAllocated} Oy Bütçesi
                    </strong>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--stage11d-muted)" }}>Kalan Puan:</span>
                    <strong style={{ display: "block", fontSize: "1.2rem", color: varBudgetColor(ownState.remainingDistributionPoints - currentTotalAllocated) }}>
                      {Math.max(0, ownState.remainingDistributionPoints - currentTotalAllocated)}
                    </strong>
                  </div>
                </div>

                <div style={{ fontSize: "0.76rem", color: "var(--stage11d-muted)" }}>
                  Meclis üyelerine 1 veya 2 puan rüşvet dağıt:
                </div>

                {eligibleVoteCandidates.map((candidate) => {
                  const val = localAllocations[candidate.id] ?? 0;

                  return (
                    <div key={candidate.id} className="stage11d-rusvet-ledger-row">
                      <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                        {candidate.nickname}
                      </span>
                      <div className="stage11d-rusvet-stepper">
                        <button
                          type="button"
                          className="stage11d-rusvet-stepper-btn"
                          disabled={hasSubmittedDistribution || val <= 0}
                          onClick={() => updateAllocation(candidate.id, -1)}
                        >
                          -
                        </button>
                        <span style={{ minWidth: "24px", textAlign: "center", fontWeight: 800 }}>
                          {val}
                        </span>
                        <button
                          type="button"
                          className="stage11d-rusvet-stepper-btn"
                          disabled={
                            hasSubmittedDistribution ||
                            val >= 2 ||
                            currentTotalAllocated >= (ownState.remainingDistributionPoints + currentTotalAllocated)
                          }
                          onClick={() => updateAllocation(candidate.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="stage11d-rusvet-primary-btn"
                  disabled={hasSubmittedDistribution || currentTotalAllocated === 0}
                  onClick={handleDistributionSubmit}
                >
                  {hasSubmittedDistribution ? "✓ Bütçe Dağıtıldı" : "💰 Bütçeyi Meclise Dağıt"}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "16px" }}>
                <span style={{ fontSize: "1.8rem" }}>🏛️</span>
                <h3 style={{ margin: "6px 0", fontSize: "1rem" }}>
                  Başkan {playerName(players, publicState.presidentId)} Bütçeyi Dağıtıyor
                </h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--stage11d-muted)" }}>
                  Başkan gizli rüşvet bütçesini meclis üyelerine bölüştürüyor. Sonuçlar bekleniyor…
                </p>
              </div>
            )}
          </section>
        )}

        {/* Phase 4: Results */}
        {subPhase === "results" && (
          <section className="stage11d-rusvet-action-card">
            <h3 style={{ margin: "0 0 6px 0", fontSize: "0.95rem" }}>Parlamento Tutanakları</h3>

            {publicState.presidentId && (
              <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255, 190, 83, 0.12)", border: "1px solid rgba(255, 190, 83, 0.3)" }}>
                👑 Seçilen Başkan: <strong>{playerName(players, publicState.presidentId)}</strong> (+1 Başkan Puanı)
              </div>
            )}

            {/* Bribery Allocations */}
            {publicState.allocations && publicState.allocations.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--stage11d-muted)", textTransform: "uppercase" }}>
                  Dağıtılan Rüşvet Puanları
                </span>
                {publicState.allocations.map((a: RusvetAllocationView) => (
                  <div key={a.targetPlayerId} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", fontSize: "0.82rem" }}>
                    <span>👤 {playerName(players, a.targetPlayerId)}</span>
                    <strong style={{ color: "var(--rd-lime)" }}>+{a.points} Puan</strong>
                  </div>
                ))}
              </div>
            )}

            {/* Total Points Breakdown */}
            {publicState.resultPoints && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--stage11d-muted)", textTransform: "uppercase" }}>
                  Nihai Tur Puanları
                </span>
                {publicState.resultPoints.map((entry) => (
                  <div key={entry.playerId} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: "6px", background: "rgba(16, 21, 44, 0.6)", fontSize: "0.85rem" }}>
                    <span>{playerName(players, entry.playerId)}</span>
                    <strong style={{ color: "var(--rd-lime)", fontSize: "0.95rem" }}>
                      {entry.points > 0 ? `+${entry.points}` : "0"}
                    </strong>
                  </div>
                ))}
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
              border: "1px solid var(--rd-border)",
              color: "var(--stage11d-muted)",
              fontSize: "0.78rem"
            }}
          >
            👀 İzleyici modu: Parlamento gizli oylama ve bütçe oturumunda.
          </div>
        )}
      </main>
    </div>
  );
}

function varBudgetColor(rem: number): string {
  if (rem === 0) return "var(--rd-lime)";
  if (rem < 0) return "var(--rd-red)";
  return "var(--rd-gold)";
}
