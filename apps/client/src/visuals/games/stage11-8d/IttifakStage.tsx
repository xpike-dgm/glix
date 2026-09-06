import { useCallback, useMemo, useState } from "react";
import type { JSX } from "react";
import type {
  IttifakOwnState,
  IttifakPublicState,
  JsonValue,
  MatchPlayerState
} from "@glix/shared";

interface IttifakStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

type PendingAction = { readonly targetId: string; readonly submittedAt: number } | null;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isIttifakPublicState(value: unknown): value is IttifakPublicState {
  if (!isObject(value) || value.gameId !== "ittifak" || value.kind !== "ittifak") return false;
  const subPhase = value.subPhase;
  return (
    (subPhase === "bargain" || subPhase === "vote" || subPhase === "results") &&
    typeof value.finished === "boolean"
  );
}

function isIttifakOwnState(value: unknown): value is IttifakOwnState {
  if (!isObject(value) || value.gameId !== "ittifak" || value.kind !== "ittifak") return false;
  return typeof value.hasVoted === "boolean" && typeof value.finished === "boolean";
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  if (!playerId) return "Müttefik";
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
  .stage11d-ittifak {
    --it-bg: #090b17;
    --it-card-bg: rgba(18, 23, 46, 0.9);
    --it-border: rgba(140, 160, 235, 0.22);
    --it-cyan: #72f4ff;
    --it-gold: #ffbe53;
    --it-lime: #a8f46a;
    --it-purple: #b57cff;
    --it-pink: #ff55d8;
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

  .stage11d-ittifak *, .stage11d-ittifak *::before, .stage11d-ittifak *::after {
    box-sizing: border-box;
  }

  .stage11d-ittifak-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--it-border);
    background: rgba(9, 11, 23, 0.85);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
  }

  .stage11d-ittifak-title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .stage11d-ittifak-badge {
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    color: var(--it-purple);
    text-transform: uppercase;
  }

  .stage11d-ittifak-heading {
    font-size: clamp(0.95rem, 2.2vw, 1.25rem);
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stage11d-ittifak-timer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 190, 83, 0.4);
    background: rgba(255, 190, 83, 0.12);
    color: var(--it-gold);
    font-size: 0.82rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .stage11d-ittifak-main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(10px, 1.8vh, 16px) clamp(10px, 2vw, 18px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(181, 124, 255, 0.25) transparent;
  }

  /* Alliance Roundtable Table */
  .stage11d-ittifak-table {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid rgba(181, 124, 255, 0.3);
    background: radial-gradient(circle at 50% 50%, rgba(181, 124, 255, 0.15), rgba(13, 17, 36, 0.95));
    box-shadow: 0 0 24px rgba(181, 124, 255, 0.15);
    text-align: center;
    flex-shrink: 0;
  }

  .stage11d-ittifak-table-kicker {
    font-size: 0.68rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    color: var(--it-purple);
    text-transform: uppercase;
  }

  .stage11d-ittifak-table-status {
    font-size: 1.1rem;
    font-weight: 800;
    color: #fff;
    margin: 0;
  }

  /* Pact Tiles Grid */
  .stage11d-ittifak-tiles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
  }

  .stage11d-ittifak-tile {
    min-height: 70px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--it-border);
    background: rgba(16, 21, 42, 0.85);
    color: #edf2ff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .stage11d-ittifak-tile:hover:not(:disabled) {
    border-color: var(--it-purple);
    background: rgba(181, 124, 255, 0.16);
    transform: translateY(-2px);
  }

  .stage11d-ittifak-tile.is-selected {
    border-color: var(--it-purple);
    background: rgba(181, 124, 255, 0.25);
    box-shadow: 0 0 16px rgba(181, 124, 255, 0.35);
  }

  .stage11d-ittifak-tile:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .stage11d-ittifak-tile-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #44376d, #252142);
    display: grid;
    place-items: center;
    font-size: 0.76rem;
    font-weight: 800;
    color: #fff;
  }

  .stage11d-ittifak-tile-name {
    font-size: 0.82rem;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .stage11d-ittifak-primary-btn {
    min-height: 44px;
    padding: 10px 18px;
    border-radius: 8px;
    border: 1px solid var(--it-purple);
    background: linear-gradient(135deg, rgba(181, 124, 255, 0.25), rgba(120, 60, 240, 0.2));
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

  .stage11d-ittifak-primary-btn:hover:not(:disabled) {
    filter: brightness(1.15);
    transform: translateY(-1px);
  }

  .stage11d-ittifak-primary-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* Result Graph */
  .stage11d-ittifak-result-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stage11d-ittifak-result-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid var(--it-border);
    background: rgba(16, 21, 44, 0.6);
  }
`;

export function IttifakStage({
  publicState: rawPublic,
  ownState: rawOwn,
  players,
  selfPlayerId,
  now,
  isSpectator,
  onSubmit
}: IttifakStageProps): JSX.Element {
  const publicState = isIttifakPublicState(rawPublic) ? rawPublic : null;
  const ownState = isIttifakOwnState(rawOwn) ? rawOwn : null;

  const [targetId, setTargetId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const subPhase = publicState?.subPhase ?? "bargain";
  const seconds = secondsLeft(publicState?.phaseEndsAt ?? null, now);
  const isFinished = publicState?.finished ?? false;

  useMemo(() => {
    setPendingAction(null);
  }, [subPhase]);

  const handleVoteSubmit = useCallback(() => {
    if (!targetId || ownState?.hasVoted || pendingAction) return;
    setPendingAction({ targetId, submittedAt: now });
    onSubmit({ kind: "alliance-vote", targetPlayerId: targetId });
  }, [now, onSubmit, ownState?.hasVoted, pendingAction, targetId]);

  if (!publicState) {
    return (
      <div className="stage11d-ittifak">
        <style>{STYLES}</style>
        <div style={{ padding: "20px", textAlign: "center" }}>İttifak sahnesi kuruluyor…</div>
      </div>
    );
  }

  const eligibleTargets = players.filter(
    (p) => p.id !== selfPlayerId && p.connected && p.currentGameParticipant && !p.eliminated
  );

  const hasSubmitted = ownState?.hasVoted || (pendingAction !== null);

  return (
    <div className="stage11d-ittifak">
      <style>{STYLES}</style>

      {/* Header */}
      <header className="stage11d-ittifak-header">
        <div className="stage11d-ittifak-title-group">
          <span className="stage11d-ittifak-badge">
            {subPhase === "bargain" && "PAZARLIK FAZI"}
            {subPhase === "vote" && "GİZLİ İTTİFAK OYLAMASI"}
            {subPhase === "results" && "İTTİFAK AĞI AÇILDI"}
          </span>
          <h2 className="stage11d-ittifak-heading">
            {subPhase === "bargain" && "Diplomasi ve Anlaşmalar"}
            {subPhase === "vote" && "Gizli Müttefikini Mühürle"}
            {subPhase === "results" && "İttifak Karşılıkları"}
          </h2>
        </div>
        {!isFinished && publicState.phaseEndsAt && (
          <div className="stage11d-ittifak-timer">
            <span>⏱️</span>
            <span>{seconds}s</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="stage11d-ittifak-main">
        {/* Alliance Roundtable */}
        <section className="stage11d-ittifak-table">
          <span className="stage11d-ittifak-table-kicker">Sosyal İttifak Masası</span>
          <h1 className="stage11d-ittifak-table-status">
            {subPhase === "bargain" && "Pazarlık Devam Ediyor: Müttefikini Seçmeye Hazırlan"}
            {subPhase === "vote" && "Kimse Görmeden Gizli İttifak Oyu Ver"}
            {subPhase === "results" && "İttifak Bağları Çözüldü"}
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--stage11d-muted)" }}>
            Herkes bir oyuncuya oy verir. Aldığın her oy sana +1 puan kazandırır!
          </p>
        </section>

        {/* Phase 1: Bargain */}
        {subPhase === "bargain" && (
          <section style={{ padding: "14px", borderRadius: "12px", background: "rgba(18, 23, 46, 0.9)", border: "1px solid var(--it-border)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--it-purple)" }}>
              Masadaki Oyuncular (Pazarlık Yapın)
            </span>
            <div className="stage11d-ittifak-tiles-grid">
              {eligibleTargets.map((player) => (
                <div key={player.id} className="stage11d-ittifak-tile" style={{ cursor: "default" }}>
                  <span className="stage11d-ittifak-tile-avatar">
                    {playerAvatarLetter(players, player.id)}
                  </span>
                  <span className="stage11d-ittifak-tile-name">{player.nickname}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Phase 2: Vote */}
        {subPhase === "vote" && !isSpectator && (
          <section style={{ padding: "14px", borderRadius: "12px", background: "rgba(18, 23, 46, 0.9)", border: "1px solid var(--it-border)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--stage11d-muted)" }}>
              Kime ittifak oyu vereceksin? (Yalnızca 1 müttefik seçebilirsin)
            </span>
            <div className="stage11d-ittifak-tiles-grid">
              {eligibleTargets.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  className={`stage11d-ittifak-tile ${targetId === player.id ? "is-selected" : ""}`}
                  disabled={hasSubmitted}
                  onClick={() => setTargetId(player.id)}
                >
                  <span className="stage11d-ittifak-tile-avatar">
                    {playerAvatarLetter(players, player.id)}
                  </span>
                  <span className="stage11d-ittifak-tile-name">{player.nickname}</span>
                  {targetId === player.id && (
                    <span style={{ fontSize: "0.68rem", color: "var(--it-purple)", fontWeight: 800 }}>
                      ✓ SEÇİLDİ
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="stage11d-ittifak-primary-btn"
              disabled={hasSubmitted || !targetId}
              onClick={handleVoteSubmit}
            >
              {hasSubmitted ? "✓ İttifak Mührü Basıldı" : "🤝 İttifak Paktını Mühürle"}
            </button>
          </section>
        )}

        {/* Phase 3: Results */}
        {subPhase === "results" && (
          <section style={{ padding: "14px", borderRadius: "12px", background: "rgba(18, 23, 46, 0.9)", border: "1px solid var(--it-border)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "0.95rem" }}>İttifak Oyları ve Kazanılan Puanlar</h3>

            <div className="stage11d-ittifak-result-list">
              {publicState.voteCounts?.map((entry) => (
                <div key={entry.playerId} className="stage11d-ittifak-result-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="stage11d-ittifak-tile-avatar">
                      {playerAvatarLetter(players, entry.playerId)}
                    </span>
                    <strong style={{ fontSize: "0.85rem" }}>
                      {playerName(players, entry.playerId)}
                    </strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--stage11d-muted)" }}>
                      {entry.votes} oy
                    </span>
                    <strong style={{ fontSize: "0.95rem", color: "var(--it-lime)" }}>
                      {entry.votes > 0 ? `+${entry.votes} Puan` : "0 Puan"}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {isSpectator && !isFinished && (
          <div
            style={{
              padding: "10px",
              textAlign: "center",
              borderRadius: "8px",
              background: "rgba(10, 15, 30, 0.7)",
              border: "1px solid var(--it-border)",
              color: "var(--stage11d-muted)",
              fontSize: "0.78rem"
            }}
          >
            👀 İzleyici modu: İttifak masasında gizli paktlar mühürleniyor. Bağlar sonuçta açılacak.
          </div>
        )}
      </main>
    </div>
  );
}
