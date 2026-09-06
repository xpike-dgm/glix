import { useCallback, useMemo, useState } from "react";
import type { FormEvent, JSX, KeyboardEvent } from "react";
import type {
  JsonValue,
  MatchPlayerState,
  YaziYazGuessView,
  YaziYazOwnState,
  YaziYazPublicState
} from "@glix/shared";

interface YaziYazStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

type PendingAction =
  | { readonly kind: "write"; readonly text?: string; readonly submittedAt: number }
  | { readonly kind: "guess"; readonly targetId: string; readonly word: string; readonly submittedAt: number }
  | null;

const MAX_WORD_LENGTH = 50;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isYaziPublicState(value: unknown): value is YaziYazPublicState {
  if (!isObject(value) || value.gameId !== "yazi-yaz" || value.kind !== "yazi-yaz") return false;
  const subPhase = value.subPhase;
  return (
    (subPhase === "write" || subPhase === "discussion" || subPhase === "guess" || subPhase === "results") &&
    typeof value.finished === "boolean"
  );
}

function isYaziOwnState(value: unknown): value is YaziYazOwnState {
  if (!isObject(value) || value.gameId !== "yazi-yaz" || value.kind !== "yazi-yaz") return false;
  return (
    (value.role === "writer" || value.role === "innocent") &&
    typeof value.hasWritten === "boolean" &&
    typeof value.hasGuessed === "boolean" &&
    typeof value.canGuess === "boolean" &&
    Array.isArray(value.guessTargetPlayerIds) &&
    typeof value.finished === "boolean"
  );
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  if (!playerId) return "Oyuncu";
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
  .stage11d-yazi {
    --yazi-bg: #0b0d19;
    --yazi-card-bg: rgba(20, 26, 48, 0.88);
    --yazi-card-border: rgba(135, 155, 220, 0.22);
    --yazi-neon-cyan: #5de8ff;
    --yazi-neon-pink: #ff55d8;
    --yazi-neon-amber: #ffbe53;
    --yazi-neon-lime: #a8f46a;
    --yazi-slip-paper: #161c36;
    --yazi-slip-edge: rgba(93, 232, 255, 0.35);
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

  .stage11d-yazi *, .stage11d-yazi *::before, .stage11d-yazi *::after {
    box-sizing: border-box;
  }

  .stage11d-yazi-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--yazi-card-border);
    background: rgba(11, 13, 25, 0.85);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
  }

  .stage11d-yazi-title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .stage11d-yazi-badge {
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    color: var(--yazi-neon-cyan);
    text-transform: uppercase;
  }

  .stage11d-yazi-heading {
    font-size: clamp(0.95rem, 2.2vw, 1.25rem);
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stage11d-yazi-timer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 190, 83, 0.4);
    background: rgba(255, 190, 83, 0.12);
    color: var(--yazi-neon-amber);
    font-size: 0.82rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .stage11d-yazi-main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(10px, 1.8vh, 16px) clamp(10px, 2vw, 18px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(93, 232, 255, 0.25) transparent;
  }

  /* Mechanical Reveal Rail */
  .stage11d-yazi-rail {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--yazi-card-border);
    background: linear-gradient(180deg, rgba(16, 21, 41, 0.8), rgba(11, 14, 28, 0.9));
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.4);
    flex-shrink: 0;
  }

  .stage11d-yazi-rail-track {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 6px 2px 8px;
    scrollbar-width: thin;
    scrollbar-color: rgba(93, 232, 255, 0.3) transparent;
  }

  .stage11d-yazi-rail-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--stage11d-muted);
    text-transform: uppercase;
  }

  /* Anonymous Paper Slip */
  .stage11d-yazi-slip {
    flex: 0 0 130px;
    height: 94px;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--yazi-slip-paper);
    border: 1px dashed var(--yazi-slip-edge);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    transition: transform 0.25s ease, border-color 0.25s ease;
  }

  .stage11d-yazi-slip.is-sealed {
    border-style: solid;
    border-color: var(--yazi-neon-cyan);
    box-shadow: 0 0 14px rgba(93, 232, 255, 0.22);
  }

  .stage11d-yazi-slip.is-revealed {
    border-style: solid;
    border-color: var(--yazi-neon-pink);
    background: linear-gradient(135deg, #1d1b38, #131427);
    box-shadow: 0 0 16px rgba(255, 85, 216, 0.25);
  }

  .stage11d-yazi-slip-stamp {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 0.55rem;
    font-weight: 900;
    padding: 2px 5px;
    border-radius: 4px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .stage11d-yazi-slip-stamp.stamp-secret {
    background: rgba(255, 190, 83, 0.18);
    color: var(--yazi-neon-amber);
    border: 1px solid rgba(255, 190, 83, 0.35);
  }

  .stage11d-yazi-slip-stamp.stamp-sealed {
    background: rgba(93, 232, 255, 0.15);
    color: var(--yazi-neon-cyan);
    border: 1px solid rgba(93, 232, 255, 0.35);
  }

  .stage11d-yazi-slip-stamp.stamp-writer {
    background: rgba(255, 85, 216, 0.2);
    color: var(--yazi-neon-pink);
    border: 1px solid rgba(255, 85, 216, 0.4);
  }

  .stage11d-yazi-slip-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 14px;
    min-width: 0;
  }

  .stage11d-yazi-slip-text {
    font-size: 0.84rem;
    font-weight: 700;
    color: #fff;
    word-break: break-word;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .stage11d-yazi-slip-masked {
    font-size: 0.72rem;
    color: var(--stage11d-dim);
    letter-spacing: 0.2em;
    font-style: italic;
  }

  .stage11d-yazi-slip-author {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--stage11d-muted);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Interaction Card */
  .stage11d-yazi-action-card {
    padding: 14px;
    border-radius: 12px;
    border: 1px solid var(--yazi-card-border);
    background: var(--yazi-card-bg);
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  }

  .stage11d-yazi-role-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.04em;
  }

  .stage11d-yazi-role-banner.is-writer {
    background: rgba(255, 85, 216, 0.15);
    border: 1px solid rgba(255, 85, 216, 0.35);
    color: var(--yazi-neon-pink);
  }

  .stage11d-yazi-role-banner.is-innocent {
    background: rgba(93, 232, 255, 0.12);
    border: 1px solid rgba(93, 232, 255, 0.3);
    color: var(--yazi-neon-cyan);
  }

  .stage11d-yazi-input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .stage11d-yazi-input-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--stage11d-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .stage11d-yazi-text-input {
    width: 100%;
    min-height: 44px;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid rgba(135, 155, 220, 0.35);
    background: rgba(10, 13, 27, 0.85);
    color: #fff;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .stage11d-yazi-text-input:focus {
    border-color: var(--yazi-neon-cyan);
    box-shadow: 0 0 10px rgba(93, 232, 255, 0.25);
  }

  .stage11d-yazi-btn {
    min-height: 44px;
    padding: 10px 18px;
    border-radius: 8px;
    border: 1px solid var(--yazi-neon-cyan);
    background: linear-gradient(135deg, rgba(93, 232, 255, 0.25), rgba(40, 150, 220, 0.2));
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

  .stage11d-yazi-btn:hover:not(:disabled) {
    filter: brightness(1.15);
    transform: translateY(-1px);
  }

  .stage11d-yazi-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .stage11d-yazi-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* Candidate Grid for Guessing */
  .stage11d-yazi-target-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
  }

  .stage11d-yazi-target-chip {
    min-height: 44px;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid var(--yazi-card-border);
    background: rgba(14, 18, 38, 0.7);
    color: #edf2ff;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .stage11d-yazi-target-chip.is-selected {
    border-color: var(--yazi-neon-pink);
    background: rgba(255, 85, 216, 0.16);
    box-shadow: 0 0 10px rgba(255, 85, 216, 0.25);
  }

  .stage11d-yazi-target-chip:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .stage11d-yazi-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #37466d, #212942);
    display: grid;
    place-items: center;
    font-size: 0.72rem;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
  }

  .stage11d-yazi-target-name {
    font-size: 0.8rem;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Result Breakdown Table */
  .stage11d-yazi-results {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stage11d-yazi-result-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--yazi-card-border);
    background: rgba(16, 21, 44, 0.6);
  }

  .stage11d-yazi-result-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .stage11d-yazi-result-points {
    font-size: 0.95rem;
    font-weight: 900;
    color: var(--yazi-neon-lime);
    flex-shrink: 0;
  }
`;

export function YaziYazStage({
  publicState: rawPublic,
  ownState: rawOwn,
  players,
  selfPlayerId,
  now,
  isSpectator,
  onSubmit
}: YaziYazStageProps): JSX.Element {
  const publicState = isYaziPublicState(rawPublic) ? rawPublic : null;
  const ownState = isYaziOwnState(rawOwn) ? rawOwn : null;

  const [inputWord, setInputWord] = useState("");
  const [guessTargetId, setGuessTargetId] = useState<string | null>(null);
  const [guessWord, setGuessWord] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const subPhase = publicState?.subPhase ?? "write";
  const seconds = secondsLeft(publicState?.phaseEndsAt ?? null, now);
  const isFinished = publicState?.finished ?? false;

  // Clear pending state when subphase changes
  useMemo(() => {
    setPendingAction(null);
  }, [subPhase]);

  // Handle writer submit
  const handleWriterSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const clean = inputWord.trim();
      if (!clean || ownState?.hasWritten || pendingAction) return;
      setPendingAction({ kind: "write", text: clean, submittedAt: now });
      onSubmit({ kind: "yazi-word", word: clean });
    },
    [inputWord, now, onSubmit, ownState?.hasWritten, pendingAction]
  );

  // Handle innocent submit
  const handleInnocentSubmit = useCallback(() => {
    if (ownState?.hasWritten || pendingAction) return;
    setPendingAction({ kind: "write", submittedAt: now });
    onSubmit({ kind: "yazi-masum" });
  }, [now, onSubmit, ownState?.hasWritten, pendingAction]);

  // Handle guess submit
  const handleGuessSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const cleanWord = guessWord.trim();
      if (!guessTargetId || !cleanWord || ownState?.hasGuessed || pendingAction) return;
      setPendingAction({ kind: "guess", targetId: guessTargetId, word: cleanWord, submittedAt: now });
      onSubmit({ kind: "yazi-guess", targetWriterId: guessTargetId, targetWord: cleanWord });
    },
    [guessTargetId, guessWord, now, onSubmit, ownState?.hasGuessed, pendingAction]
  );

  // Eligible guess targets
  const eligibleTargets = useMemo(() => {
    const targetIds = ownState?.guessTargetPlayerIds ?? [];
    return players.filter(
      (p) =>
        p.id !== selfPlayerId &&
        p.connected &&
        p.currentGameParticipant &&
        !p.eliminated &&
        (targetIds.length === 0 || targetIds.includes(p.id))
    );
  }, [ownState?.guessTargetPlayerIds, players, selfPlayerId]);

  if (!publicState) {
    return (
      <div className="stage11d-yazi">
        <style>{STYLES}</style>
        <div style={{ padding: "20px", textAlign: "center" }}>Yazı Yaz sahnesi kuruluyor…</div>
      </div>
    );
  }

  const isWriter = ownState?.role === "writer";
  const hasSubmittedWrite = ownState?.hasWritten || (pendingAction?.kind === "write");
  const hasSubmittedGuess = ownState?.hasGuessed || (pendingAction?.kind === "guess");

  return (
    <div className="stage11d-yazi">
      <style>{STYLES}</style>

      {/* Header */}
      <header className="stage11d-yazi-header">
        <div className="stage11d-yazi-title-group">
          <span className="stage11d-yazi-badge">
            {subPhase === "write" && "YAZMA FAZI"}
            {subPhase === "discussion" && "TARTIŞMA FAZI"}
            {subPhase === "guess" && "TAHMİN FAZI"}
            {subPhase === "results" && "SONUÇ FAZI"}
          </span>
          <h2 className="stage11d-yazi-heading">
            {subPhase === "write" && "Gizli Yazı Pusulası"}
            {subPhase === "discussion" && "Yazar Kim? Tartışma"}
            {subPhase === "guess" && "Yazar ve Kelimeyi Tahmin Et"}
            {subPhase === "results" && "Pusulalar Açıldı"}
          </h2>
        </div>
        {!isFinished && publicState.phaseEndsAt && (
          <div className="stage11d-yazi-timer">
            <span>⏱️</span>
            <span>{seconds}s</span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="stage11d-yazi-main">
        {/* Rail Section */}
        <section className="stage11d-yazi-rail">
          <div className="stage11d-yazi-rail-label">
            <span>Mekanik İfşa Rayı</span>
            <span>
              {subPhase === "results"
                ? "Kimlikler Açıldı"
                : subPhase === "discussion" || subPhase === "guess"
                ? "Kapalı Pusulalar"
                : "Mühür Bekleniyor"}
            </span>
          </div>

          <div className="stage11d-yazi-rail-track">
            {subPhase === "results" && publicState.entries ? (
              publicState.entries.map((entry) => (
                <div
                  key={entry.playerId}
                  className={`stage11d-yazi-slip is-revealed ${entry.role === "writer" ? "is-writer" : ""}`}
                >
                  <span className={`stage11d-yazi-slip-stamp ${entry.role === "writer" ? "stamp-writer" : "stamp-sealed"}`}>
                    {entry.role === "writer" ? "YAZAR" : "MASUM"}
                  </span>
                  <div className="stage11d-yazi-slip-body">
                    <span className="stage11d-yazi-slip-text">
                      {entry.role === "writer" ? entry.word || "—" : "—"}
                    </span>
                    <span className="stage11d-yazi-slip-author">
                      👤 {playerName(players, entry.playerId)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              // Anonymous slips during play
              players
                .filter((p) => p.currentGameParticipant && !p.eliminated)
                .map((player, idx) => (
                  <div
                    key={player.id}
                    className={`stage11d-yazi-slip ${
                      player.id === selfPlayerId && hasSubmittedWrite ? "is-sealed" : ""
                    }`}
                  >
                    <span className="stage11d-yazi-slip-stamp stamp-secret">
                      PUSULA #{idx + 1}
                    </span>
                    <div className="stage11d-yazi-slip-body">
                      <span className="stage11d-yazi-slip-masked">••••••••</span>
                      <span className="stage11d-yazi-slip-author">
                        {player.id === selfPlayerId ? "(Senin Pusulan)" : "Gizli Yazar"}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>

        {/* Action Panel for Active Subphase */}
        {subPhase === "write" && !isSpectator && (
          <section className="stage11d-yazi-action-card">
            <div className={`stage11d-yazi-role-banner ${isWriter ? "is-writer" : "is-innocent"}`}>
              <span>{isWriter ? "✍️ GİZLİ YAZAR" : "🛡️ MASUM OYUNCU"}</span>
              <span>
                {isWriter
                  ? "Sana gizli bir kelime verildi. Pusulana bir kelime yaz!"
                  : "Bu tur masumsun. Pusulanı onayla ve tartışmaya hazırlan."}
              </span>
            </div>

            {isWriter ? (
              <form onSubmit={handleWriterSubmit} className="stage11d-yazi-input-group">
                <label className="stage11d-yazi-input-label" htmlFor="yazi-word-input">
                  Gizli Pusula Kelimesi ({inputWord.length}/{MAX_WORD_LENGTH})
                </label>
                <input
                  id="yazi-word-input"
                  className="stage11d-yazi-text-input"
                  type="text"
                  placeholder="Kelimeyi girin…"
                  maxLength={MAX_WORD_LENGTH}
                  value={inputWord}
                  disabled={hasSubmittedWrite}
                  onChange={(e) => setInputWord(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      handleWriterSubmit();
                    }
                  }}
                />
                <button
                  type="submit"
                  className="stage11d-yazi-btn"
                  disabled={hasSubmittedWrite || inputWord.trim().length === 0}
                >
                  {hasSubmittedWrite ? "✓ Pusula Mühürlendi" : "🔏 Pusulayı Mühürle"}
                </button>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--stage11d-muted)" }}>
                  Yazarlar kelimelerini pusulaya mühürlüyor. Hazır olduğunda katılımını onayla.
                </p>
                <button
                  type="button"
                  className="stage11d-yazi-btn"
                  disabled={hasSubmittedWrite}
                  onClick={handleInnocentSubmit}
                >
                  {hasSubmittedWrite ? "✓ Katılım Mühürlendi" : "🛡️ Katılımı Onayla"}
                </button>
              </div>
            )}
          </section>
        )}

        {subPhase === "discussion" && (
          <section className="stage11d-yazi-action-card">
            <div style={{ textAlign: "center", padding: "10px" }}>
              <span style={{ fontSize: "1.8rem" }}>💬</span>
              <h3 style={{ margin: "6px 0", fontSize: "1rem" }}>Tartışma Zamanı</h3>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--stage11d-muted)" }}>
                Kimin yazar olduğunu düşünüyorsunuz? Birbirinizi sorgulayın! Süre bitince tahminler başlayacak.
              </p>
            </div>
          </section>
        )}

        {subPhase === "guess" && !isSpectator && (
          <section className="stage11d-yazi-action-card">
            <div className="stage11d-yazi-input-group">
              <span className="stage11d-yazi-input-label">1. Şüpheli Yazarı Seç</span>
              <div className="stage11d-yazi-target-grid">
                {eligibleTargets.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    className={`stage11d-yazi-target-chip ${guessTargetId === candidate.id ? "is-selected" : ""}`}
                    disabled={hasSubmittedGuess}
                    onClick={() => setGuessTargetId(candidate.id)}
                  >
                    <span className="stage11d-yazi-avatar">
                      {playerAvatarLetter(players, candidate.id)}
                    </span>
                    <span className="stage11d-yazi-target-name">{candidate.nickname}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGuessSubmit} className="stage11d-yazi-input-group">
              <label className="stage11d-yazi-input-label" htmlFor="yazi-guess-input">
                2. Yazdığı Kelime Tahmini
              </label>
              <input
                id="yazi-guess-input"
                className="stage11d-yazi-text-input"
                type="text"
                placeholder="Yazarın yazdığı kelimeyi tahmin edin…"
                maxLength={MAX_WORD_LENGTH}
                value={guessWord}
                disabled={hasSubmittedGuess}
                onChange={(e) => setGuessWord(e.target.value)}
              />
              <button
                type="submit"
                className="stage11d-yazi-btn"
                disabled={hasSubmittedGuess || !guessTargetId || guessWord.trim().length === 0}
              >
                {hasSubmittedGuess ? "✓ Tahmin Mühürlendi" : "🎯 Tahmini Gönder"}
              </button>
            </form>
          </section>
        )}

        {/* Results Phase */}
        {subPhase === "results" && (
          <section className="stage11d-yazi-action-card">
            <h3 style={{ margin: "0 0 8px 0", fontSize: "0.95rem" }}>Tahminler ve Skor Dağılımı</h3>
            <div className="stage11d-yazi-results">
              {publicState.guesses && publicState.guesses.length > 0 ? (
                publicState.guesses.map((g: YaziYazGuessView) => (
                  <div key={g.playerId} className="stage11d-yazi-result-row">
                    <div className="stage11d-yazi-result-info">
                      <strong style={{ fontSize: "0.85rem" }}>{playerName(players, g.playerId)}</strong>
                      <span style={{ fontSize: "0.74rem", color: "var(--stage11d-muted)" }}>
                        {g.targetWriterId
                          ? `Hedef: ${playerName(players, g.targetWriterId)} (${g.targetWord ?? "—"})`
                          : "Tahmin yapılmadı"}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: g.personCorrect ? "var(--yazi-neon-lime)" : "var(--stage11d-dim)" }}>
                        {g.personCorrect ? "✓ Yazar doğru bilindi" : "✗ Yazar yanlış"}
                        {g.wordCorrect ? " · Kelime de doğru!" : ""}
                      </span>
                    </div>
                    <div className="stage11d-yazi-result-points">
                      {g.points > 0 ? `+${g.points}` : "0"}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--stage11d-muted)", fontSize: "0.82rem" }}>
                  Sonuçlar hesaplandı.
                </div>
              )}
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
              border: "1px solid var(--yazi-card-border)",
              color: "var(--stage11d-muted)",
              fontSize: "0.78rem"
            }}
          >
            👀 İzleyici modu: Gizli pusulalar mühürleniyor. Kimlikler sonuç fazında açılacak.
          </div>
        )}
      </main>
    </div>
  );
}
