import { useCallback, useMemo, useState } from "react";
import type { FormEvent, JSX, KeyboardEvent } from "react";
import type {
  JsonValue,
  MatchPlayerState,
  SozlukBlofuOwnState,
  SozlukBlofuPublicState,
  SozlukDefinitionView
} from "@glix/shared";

interface SozlukBlofuStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

type PendingAction =
  | { readonly kind: "write"; readonly text: string; readonly submittedAt: number }
  | { readonly kind: "choose"; readonly definitionId: string; readonly submittedAt: number }
  | null;

const MAX_BLUFF_LENGTH = 100;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isSozlukPublicState(value: unknown): value is SozlukBlofuPublicState {
  if (!isObject(value) || value.gameId !== "sozluk-blofu" || value.kind !== "sozluk-blofu") return false;
  const subPhase = value.subPhase;
  return (
    (subPhase === "write" || subPhase === "choose" || subPhase === "results") &&
    typeof value.finished === "boolean" &&
    typeof value.word === "string"
  );
}

function isSozlukOwnState(value: unknown): value is SozlukBlofuOwnState {
  if (!isObject(value) || value.gameId !== "sozluk-blofu" || value.kind !== "sozluk-blofu") return false;
  return (
    typeof value.hasWritten === "boolean" &&
    typeof value.hasChosen === "boolean" &&
    typeof value.finished === "boolean"
  );
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  if (!playerId) return "Sözlük Tanımı";
  return players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function secondsLeft(deadline: number | null, now: number): number {
  return deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));
}

const STYLES = `
  .stage11d-sozluk {
    --sozluk-bg: #090c17;
    --sozluk-card-bg: rgba(18, 23, 44, 0.9);
    --sozluk-card-border: rgba(140, 160, 230, 0.22);
    --sozluk-cyan: #72f4ff;
    --sozluk-gold: #ffbe53;
    --sozluk-pink: #ff55d8;
    --sozluk-lime: #a8f46a;
    --sozluk-drawer-bg: linear-gradient(180deg, #181d36, #101324);
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

  .stage11d-sozluk *, .stage11d-sozluk *::before, .stage11d-sozluk *::after {
    box-sizing: border-box;
  }

  .stage11d-sozluk-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--sozluk-card-border);
    background: rgba(9, 12, 23, 0.85);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
  }

  .stage11d-sozluk-title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .stage11d-sozluk-badge {
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    color: var(--sozluk-gold);
    text-transform: uppercase;
  }

  .stage11d-sozluk-heading {
    font-size: clamp(0.95rem, 2.2vw, 1.25rem);
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stage11d-sozluk-timer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 190, 83, 0.4);
    background: rgba(255, 190, 83, 0.12);
    color: var(--sozluk-gold);
    font-size: 0.82rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .stage11d-sozluk-main {
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

  /* Word Banner */
  .stage11d-sozluk-word-card {
    padding: 14px 18px;
    border-radius: 12px;
    border: 1px solid rgba(255, 190, 83, 0.35);
    background: radial-gradient(circle at 50% 0%, rgba(255, 190, 83, 0.15), rgba(15, 19, 38, 0.95));
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
    text-align: center;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stage11d-sozluk-word-kicker {
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 0.16em;
    color: var(--sozluk-gold);
    text-transform: uppercase;
  }

  .stage11d-sozluk-word-display {
    font-size: clamp(1.3rem, 3.5vw, 1.8rem);
    font-weight: 900;
    letter-spacing: 0.08em;
    color: #fff;
    text-shadow: 0 0 16px rgba(255, 190, 83, 0.4);
    margin: 0;
  }

  /* Drawer Cards Container */
  .stage11d-sozluk-drawer {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--sozluk-card-border);
    background: var(--sozluk-drawer-bg);
    box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.5);
  }

  .stage11d-sozluk-drawer-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--stage11d-muted);
    text-transform: uppercase;
  }

  .stage11d-sozluk-cards-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Definition Slip */
  .stage11d-sozluk-slip {
    min-height: 48px;
    padding: 12px 14px;
    border-radius: 9px;
    border: 1px solid rgba(140, 160, 230, 0.25);
    background: rgba(14, 18, 36, 0.85);
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
    position: relative;
    user-select: none;
  }

  .stage11d-sozluk-slip:hover:not(:disabled) {
    border-color: var(--sozluk-cyan);
    background: rgba(20, 28, 54, 0.95);
    transform: translateY(-1px);
  }

  .stage11d-sozluk-slip.is-selected {
    border-color: var(--sozluk-cyan);
    background: rgba(114, 244, 255, 0.12);
    box-shadow: 0 0 12px rgba(114, 244, 255, 0.2);
  }

  .stage11d-sozluk-slip.is-own-bluff {
    opacity: 0.65;
    cursor: not-allowed;
    border-color: rgba(255, 85, 216, 0.35);
    background: rgba(255, 85, 216, 0.06);
  }

  .stage11d-sozluk-slip.is-real-truth {
    border-color: var(--sozluk-gold);
    background: linear-gradient(135deg, rgba(255, 190, 83, 0.18), rgba(20, 26, 50, 0.95));
    box-shadow: 0 0 18px rgba(255, 190, 83, 0.28);
  }

  .stage11d-sozluk-slip-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .stage11d-sozluk-slip-tag {
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: var(--stage11d-dim);
    text-transform: uppercase;
  }

  .stage11d-sozluk-truth-seal {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    background: rgba(255, 190, 83, 0.25);
    border: 1px solid var(--sozluk-gold);
    color: var(--sozluk-gold);
    text-transform: uppercase;
  }

  .stage11d-sozluk-bluff-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.62rem;
    font-weight: 800;
    background: rgba(255, 85, 216, 0.18);
    border: 1px solid var(--sozluk-pink);
    color: var(--sozluk-pink);
  }

  .stage11d-sozluk-slip-text {
    font-size: 0.9rem;
    line-height: 1.4;
    color: #edf2ff;
    word-break: break-word;
  }

  .stage11d-sozluk-slip-voters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 0.72rem;
    color: var(--stage11d-muted);
  }

  .stage11d-sozluk-voter-pill {
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
    font-weight: 700;
  }

  /* Interaction Write Card */
  .stage11d-sozluk-action-card {
    padding: 14px;
    border-radius: 12px;
    border: 1px solid var(--sozluk-card-border);
    background: var(--sozluk-card-bg);
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  }

  .stage11d-sozluk-textarea {
    width: 100%;
    min-height: 80px;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid rgba(140, 160, 230, 0.35);
    background: rgba(10, 13, 27, 0.85);
    color: #fff;
    font-size: 0.92rem;
    line-height: 1.4;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .stage11d-sozluk-textarea:focus {
    border-color: var(--sozluk-gold);
    box-shadow: 0 0 10px rgba(255, 190, 83, 0.25);
  }

  .stage11d-sozluk-btn {
    min-height: 44px;
    padding: 10px 18px;
    border-radius: 8px;
    border: 1px solid var(--sozluk-gold);
    background: linear-gradient(135deg, rgba(255, 190, 83, 0.25), rgba(200, 140, 30, 0.2));
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

  .stage11d-sozluk-btn:hover:not(:disabled) {
    filter: brightness(1.15);
    transform: translateY(-1px);
  }

  .stage11d-sozluk-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .stage11d-sozluk-score-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--sozluk-card-border);
    background: rgba(16, 21, 44, 0.6);
  }
`;

export function SozlukBlofuStage({
  publicState: rawPublic,
  ownState: rawOwn,
  players,
  selfPlayerId,
  now,
  isSpectator,
  onSubmit
}: SozlukBlofuStageProps): JSX.Element {
  const publicState = isSozlukPublicState(rawPublic) ? rawPublic : null;
  const ownState = isSozlukOwnState(rawOwn) ? rawOwn : null;

  const [bluffText, setBluffText] = useState("");
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const subPhase = publicState?.subPhase ?? "write";
  const seconds = secondsLeft(publicState?.phaseEndsAt ?? null, now);
  const isFinished = publicState?.finished ?? false;

  useMemo(() => {
    setPendingAction(null);
  }, [subPhase]);

  const handleWriteSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const clean = bluffText.trim();
      if (!clean || ownState?.hasWritten || pendingAction) return;
      setPendingAction({ kind: "write", text: clean, submittedAt: now });
      onSubmit({ kind: "dictionary-bluff", text: clean });
    },
    [bluffText, now, onSubmit, ownState?.hasWritten, pendingAction]
  );

  const handleChooseSubmit = useCallback(() => {
    if (!selectedDefinitionId || ownState?.hasChosen || pendingAction) return;
    setPendingAction({ kind: "choose", definitionId: selectedDefinitionId, submittedAt: now });
    onSubmit({ kind: "dictionary-choice", definitionId: selectedDefinitionId });
  }, [now, onSubmit, ownState?.hasChosen, pendingAction, selectedDefinitionId]);

  if (!publicState) {
    return (
      <div className="stage11d-sozluk">
        <style>{STYLES}</style>
        <div style={{ padding: "20px", textAlign: "center" }}>Sözlük Blöfü sahnesi kuruluyor…</div>
      </div>
    );
  }

  const hasSubmittedWrite = ownState?.hasWritten || (pendingAction?.kind === "write");
  const hasSubmittedChoose = ownState?.hasChosen || (pendingAction?.kind === "choose");

  return (
    <div className="stage11d-sozluk">
      <style>{STYLES}</style>

      {/* Header */}
      <header className="stage11d-sozluk-header">
        <div className="stage11d-sozluk-title-group">
          <span className="stage11d-sozluk-badge">
            {subPhase === "write" && "BLÖF YAZMA FAZI"}
            {subPhase === "choose" && "DOĞRU TANIMI BULMA FAZI"}
            {subPhase === "results" && "GERÇEK MÜHÜR AÇILDI"}
          </span>
          <h2 className="stage11d-sozluk-heading">
            {subPhase === "write" && "İnandırıcı Bir Tanım Uydur"}
            {subPhase === "choose" && "Gerçek Sözlük Tanımını Seç"}
            {subPhase === "results" && "Gerçek Tanım ve Blöfler"}
          </h2>
        </div>
        {!isFinished && publicState.phaseEndsAt && (
          <div className="stage11d-sozluk-timer">
            <span>⏱️</span>
            <span>{seconds}s</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="stage11d-sozluk-main">
        {/* Core Word Banner */}
        <section className="stage11d-sozluk-word-card">
          <span className="stage11d-sozluk-word-kicker">Günün Sözlük Kelimesi</span>
          <h1 className="stage11d-sozluk-word-display">{publicState.word}</h1>
        </section>

        {/* Phase 1: Write bluff */}
        {subPhase === "write" && !isSpectator && (
          <section className="stage11d-sozluk-action-card">
            <form onSubmit={handleWriteSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "var(--stage11d-muted)" }}>
                <span>Sahte/İnandırıcı Tanımını Yaz</span>
                <span>{bluffText.length}/{MAX_BLUFF_LENGTH}</span>
              </div>
              <textarea
                className="stage11d-sozluk-textarea"
                placeholder="Bu kelimenin sözlükteki anlamı ne olabilir? Diğerlerini kandıracak bir tanım yaz…"
                maxLength={MAX_BLUFF_LENGTH}
                value={bluffText}
                disabled={hasSubmittedWrite}
                onChange={(e) => setBluffText(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleWriteSubmit();
                  }
                }}
              />
              <button
                type="submit"
                className="stage11d-sozluk-btn"
                disabled={hasSubmittedWrite || bluffText.trim().length === 0}
              >
                {hasSubmittedWrite ? "✓ Blöf Çekmeceye Kaydırıldı" : "📜 Blöfünü Çekmeceye Gönder"}
              </button>
            </form>
          </section>
        )}

        {/* Phase 2: Choose among definitions */}
        {subPhase === "choose" && (
          <section className="stage11d-sozluk-drawer">
            <div className="stage11d-sozluk-drawer-head">
              <span>Sözlük Çekmecesi</span>
              <span>1 Gerçek Tanım + Oyuncu Blöfleri</span>
            </div>

            <div className="stage11d-sozluk-cards-list">
              {publicState.definitions?.map((d: SozlukDefinitionView, idx) => {
                const isOwn = !isSpectator && ownState?.bluffText && d.text === ownState.bluffText;
                const isSelected = selectedDefinitionId === d.id;

                return (
                  <button
                    key={d.id}
                    type="button"
                    className={`stage11d-sozluk-slip ${isSelected ? "is-selected" : ""} ${isOwn ? "is-own-bluff" : ""}`}
                    disabled={isSpectator || hasSubmittedChoose || Boolean(isOwn)}
                    onClick={() => setSelectedDefinitionId(d.id)}
                  >
                    <div className="stage11d-sozluk-slip-top">
                      <span className="stage11d-sozluk-slip-tag">TANIM #{idx + 1}</span>
                      {isOwn && <span className="stage11d-sozluk-bluff-badge">Senin Blöfün</span>}
                      {isSelected && <span style={{ color: "var(--sozluk-cyan)", fontSize: "0.7rem", fontWeight: 800 }}>✓ SEÇİLDİ</span>}
                    </div>
                    <div className="stage11d-sozluk-slip-text">{d.text}</div>
                  </button>
                );
              })}
            </div>

            {!isSpectator && (
              <button
                type="button"
                className="stage11d-sozluk-btn"
                style={{ marginTop: "8px" }}
                disabled={hasSubmittedChoose || !selectedDefinitionId}
                onClick={handleChooseSubmit}
              >
                {hasSubmittedChoose ? "✓ Tercih Mühürlendi" : "🔍 Gerçek Tanım Olarak Mühürle"}
              </button>
            )}
          </section>
        )}

        {/* Phase 3: Results */}
        {subPhase === "results" && (
          <section className="stage11d-sozluk-drawer">
            <div className="stage11d-sozluk-drawer-head">
              <span>Sonuç Çekmecesi</span>
              <span>Hakikat Mührü İfşası</span>
            </div>

            <div className="stage11d-sozluk-cards-list">
              {publicState.definitions?.map((d: SozlukDefinitionView, idx) => {
                const isReal = d.isReal === true;
                const author = d.ownerId ? playerName(players, d.ownerId) : "Türk Dil Kurumu (Gerçek)";

                return (
                  <div
                    key={d.id}
                    className={`stage11d-sozluk-slip ${isReal ? "is-real-truth" : ""}`}
                    style={{ cursor: "default" }}
                  >
                    <div className="stage11d-sozluk-slip-top">
                      <span className="stage11d-sozluk-slip-tag">KART #{idx + 1}</span>
                      {isReal ? (
                        <span className="stage11d-sozluk-truth-seal">⭐ GERÇEK TANIM</span>
                      ) : (
                        <span className="stage11d-sozluk-bluff-badge">✍️ {author}</span>
                      )}
                    </div>
                    <div className="stage11d-sozluk-slip-text">{d.text}</div>
                    {d.selectedByPlayerIds && d.selectedByPlayerIds.length > 0 && (
                      <div className="stage11d-sozluk-slip-voters">
                        <span>Seçenler:</span>
                        {d.selectedByPlayerIds.map((voterId) => (
                          <span key={voterId} className="stage11d-sozluk-voter-pill">
                            {playerName(players, voterId)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Score points view */}
            {publicState.resultPoints && (
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--stage11d-muted)", textTransform: "uppercase" }}>
                  Tur Puanları
                </span>
                {publicState.resultPoints.map((entry) => (
                  <div key={entry.playerId} className="stage11d-sozluk-score-row">
                    <span style={{ fontSize: "0.84rem", fontWeight: 700 }}>
                      {playerName(players, entry.playerId)}
                    </span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 900, color: "var(--sozluk-lime)" }}>
                      {entry.points > 0 ? `+${entry.points}` : "0"}
                    </span>
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
              border: "1px solid var(--sozluk-card-border)",
              color: "var(--stage11d-muted)",
              fontSize: "0.78rem"
            }}
          >
            👀 İzleyici modu: Sözlük blöfleri çekmecede toplanıyor. Hakikat mührü sonuç fazında açılacak.
          </div>
        )}
      </main>
    </div>
  );
}
