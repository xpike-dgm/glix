import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSX, PointerEvent } from "react";
import type {
  DrawingColor,
  DrawingPoint,
  DrawingStroke,
  JsonValue,
  KaralamaDefteriOwnState,
  KaralamaDefteriPublicState,
  KaralamaDrawingView,
  MatchPlayerState
} from "@glix/shared";

interface KaralamaDefteriStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

const DRAWING_COLORS: readonly DrawingColor[] = ["cyan", "pink", "yellow", "lime", "orange", "violet"];

const COLOR_MAP: Readonly<Record<DrawingColor, string>> = {
  cyan: "#72f4ff",
  pink: "#ff55d8",
  yellow: "#ffc857",
  lime: "#a8f46a",
  orange: "#ff8c42",
  violet: "#b57cff"
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isKaralamaPublicState(value: unknown): value is KaralamaDefteriPublicState {
  if (!isObject(value) || value.gameId !== "karalama-defteri" || value.kind !== "karalama-defteri") return false;
  const subPhase = value.subPhase;
  return (
    (subPhase === "draw" || subPhase === "vote" || subPhase === "results") &&
    typeof value.finished === "boolean"
  );
}

function isKaralamaOwnState(value: unknown): value is KaralamaDefteriOwnState {
  if (!isObject(value) || value.gameId !== "karalama-defteri" || value.kind !== "karalama-defteri") return false;
  return (
    (value.role === "informed" || value.role === "ignorant") &&
    typeof value.hasDrawing === "boolean" &&
    typeof value.hasVoted === "boolean" &&
    typeof value.finished === "boolean"
  );
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  if (!playerId) return "Çizer";
  return players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function secondsLeft(deadline: number | null, now: number): number {
  return deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));
}

const STYLES = `
  .stage11d-karalama {
    --kd-bg: #090b17;
    --kd-card-bg: rgba(18, 22, 45, 0.9);
    --kd-border: rgba(114, 244, 255, 0.22);
    --kd-cyan: #72f4ff;
    --kd-pink: #ff55d8;
    --kd-yellow: #ffc857;
    --kd-lime: #a8f46a;
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

  .stage11d-karalama *, .stage11d-karalama *::before, .stage11d-karalama *::after {
    box-sizing: border-box;
  }

  .stage11d-karalama-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--kd-border);
    background: rgba(9, 11, 23, 0.85);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
  }

  .stage11d-karalama-title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .stage11d-karalama-badge {
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    color: var(--kd-cyan);
    text-transform: uppercase;
  }

  .stage11d-karalama-heading {
    font-size: clamp(0.95rem, 2.2vw, 1.25rem);
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stage11d-karalama-timer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 200, 87, 0.4);
    background: rgba(255, 200, 87, 0.12);
    color: var(--kd-yellow);
    font-size: 0.82rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .stage11d-karalama-main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: clamp(8px, 1.5vh, 14px) clamp(8px, 1.8vw, 16px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(114, 244, 255, 0.25) transparent;
  }

  /* Role Word Banner */
  .stage11d-karalama-word-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 14px;
    border-radius: 10px;
    background: rgba(15, 20, 42, 0.9);
    border: 1px solid var(--kd-border);
    flex-shrink: 0;
  }

  .stage11d-karalama-sketchbook-frame {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border-radius: 14px;
    border: 2px solid rgba(114, 244, 255, 0.25);
    background: #0f1325;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
    position: relative;
    flex-shrink: 0;
  }

  .stage11d-karalama-canvas-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    max-height: 48vh;
    border-radius: 8px;
    overflow: hidden;
    background: #080a14;
    border: 1px solid rgba(255, 255, 255, 0.1);
    touch-action: none;
  }

  .stage11d-karalama-canvas {
    width: 100%;
    height: 100%;
    display: block;
    cursor: crosshair;
  }

  /* Palette Tools Bar */
  .stage11d-karalama-tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }

  .stage11d-karalama-colors {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stage11d-karalama-color-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.15s ease, border-color 0.15s ease;
    padding: 0;
  }

  .stage11d-karalama-color-btn.is-active {
    border-color: #fff;
    transform: scale(1.15);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
  }

  .stage11d-karalama-sizes {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stage11d-karalama-size-btn {
    min-width: 36px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--kd-border);
    background: rgba(255, 255, 255, 0.08);
    color: #edf2ff;
    font-size: 0.72rem;
    font-weight: 800;
    cursor: pointer;
  }

  .stage11d-karalama-size-btn.is-active {
    border-color: var(--kd-cyan);
    background: rgba(114, 244, 255, 0.2);
  }

  .stage11d-karalama-action-btns {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stage11d-karalama-tool-btn {
    height: 32px;
    padding: 0 10px;
    border-radius: 6px;
    border: 1px solid var(--kd-border);
    background: rgba(255, 255, 255, 0.08);
    color: #edf2ff;
    font-size: 0.74rem;
    font-weight: 700;
    cursor: pointer;
  }

  /* Gallery Mode */
  .stage11d-karalama-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
  }

  .stage11d-karalama-gallery-card {
    padding: 10px;
    border-radius: 10px;
    border: 1px solid var(--kd-border);
    background: rgba(14, 18, 38, 0.85);
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .stage11d-karalama-gallery-card.is-voted {
    border-color: var(--kd-pink);
    box-shadow: 0 0 14px rgba(255, 85, 216, 0.25);
  }

  .stage11d-karalama-gallery-thumb {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: 6px;
    background: #080a14;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .stage11d-karalama-vote-btn {
    min-height: 44px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--kd-pink);
    background: linear-gradient(135deg, rgba(255, 85, 216, 0.2), rgba(180, 50, 180, 0.15));
    color: #fff;
    font-size: 0.82rem;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  .stage11d-karalama-vote-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.15);
  }

  .stage11d-karalama-vote-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

function renderStrokesToCanvas(canvas: HTMLCanvasElement, strokes: readonly DrawingStroke[]): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = "#080a14";
  ctx.fillRect(0, 0, width, height);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const stroke of strokes) {
    if (!stroke.points || stroke.points.length < 2) continue;
    ctx.strokeStyle = COLOR_MAP[stroke.color] || stroke.color;
    ctx.lineWidth = Math.max(2, (stroke.size / 400) * width);

    ctx.beginPath();
    const first = stroke.points[0];
    if (!first) continue;
    ctx.moveTo(first.x * width, first.y * height);

    for (let i = 1; i < stroke.points.length; i++) {
      const pt = stroke.points[i];
      if (!pt) continue;
      ctx.lineTo(pt.x * width, pt.y * height);
    }
    ctx.stroke();
  }
}

export function KaralamaDefteriStage({
  publicState: rawPublic,
  ownState: rawOwn,
  players,
  selfPlayerId,
  now,
  isSpectator,
  onSubmit
}: KaralamaDefteriStageProps): JSX.Element {
  const publicState = isKaralamaPublicState(rawPublic) ? rawPublic : null;
  const ownState = isKaralamaOwnState(rawOwn) ? rawOwn : null;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentColor, setCurrentColor] = useState<DrawingColor>("cyan");
  const [currentSize, setCurrentSize] = useState<number>(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);

  const [voteTargetId, setVoteTargetId] = useState<string | null>(null);
  const [hasVotedSubmitted, setHasVotedSubmitted] = useState(false);

  const subPhase = publicState?.subPhase ?? "draw";
  const seconds = secondsLeft(publicState?.phaseEndsAt ?? null, now);
  const isFinished = publicState?.finished ?? false;

  // Redraw canvas whenever strokes change
  useEffect(() => {
    if (!canvasRef.current) return;
    renderStrokesToCanvas(canvasRef.current, strokes);
  }, [strokes]);

  // Pointer drawing handlers
  const handlePointerDown = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setIsDrawing(true);
    setCurrentPoints([{ x, y }]);
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      setCurrentPoints((prev) => {
        if (prev.length >= 135) return prev;
        const last = prev[prev.length - 1];
        if (last && Math.hypot(last.x - x, last.y - y) < 0.003) return prev;
        return [...prev, { x, y }];
      });
    },
    [isDrawing]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length >= 2) {
      const newStroke: DrawingStroke = {
        color: currentColor,
        size: currentSize,
        points: currentPoints
      };
      setStrokes((prev) => {
        const next = [...prev, newStroke].slice(-100);
        // Auto-save debounced submit
        onSubmit({ kind: "drawing-save", strokes: next as unknown as JsonValue });
        return next;
      });
    }
    setCurrentPoints([]);
  }, [currentColor, currentPoints, currentSize, isDrawing, onSubmit]);

  const handleUndo = useCallback(() => {
    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      onSubmit({ kind: "drawing-save", strokes: next as unknown as JsonValue });
      return next;
    });
  }, [onSubmit]);

  const handleClear = useCallback(() => {
    setStrokes([]);
    onSubmit({ kind: "drawing-save", strokes: [] });
  }, [onSubmit]);

  const handleVote = useCallback(
    (targetId: string) => {
      if (ownState?.hasVoted || hasVotedSubmitted) return;
      setVoteTargetId(targetId);
      setHasVotedSubmitted(true);
      onSubmit({ kind: "drawing-vote", targetPlayerId: targetId });
    },
    [hasVotedSubmitted, onSubmit, ownState?.hasVoted]
  );

  if (!publicState) {
    return (
      <div className="stage11d-karalama">
        <style>{STYLES}</style>
        <div style={{ padding: "20px", textAlign: "center" }}>Karalama Defteri sahnesi kuruluyor…</div>
      </div>
    );
  }

  return (
    <div className="stage11d-karalama">
      <style>{STYLES}</style>

      {/* Header */}
      <header className="stage11d-karalama-header">
        <div className="stage11d-karalama-title-group">
          <span className="stage11d-karalama-badge">
            {subPhase === "draw" && "ÇİZİM FAZI"}
            {subPhase === "vote" && "GALERİ VE OYLAMA"}
            {subPhase === "results" && "DEFTER İFŞASI"}
          </span>
          <h2 className="stage11d-karalama-heading">
            {subPhase === "draw" && "Karalama Defterine Çiz"}
            {subPhase === "vote" && "Kim Bilgisiz Çizer? Oy Ver"}
            {subPhase === "results" && "Bilgisiz Çizer Bulundu mu?"}
          </h2>
        </div>
        {!isFinished && publicState.phaseEndsAt && (
          <div className="stage11d-karalama-timer">
            <span>⏱️</span>
            <span>{seconds}s</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="stage11d-karalama-main">
        {/* Phase 1: Draw */}
        {subPhase === "draw" && !isSpectator && (
          <>
            <section className="stage11d-karalama-word-banner">
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--kd-cyan)", textTransform: "uppercase" }}>
                  {ownState?.role === "ignorant" ? "🎭 ROLÜN: BİLGİSİZ ÇİZER" : "🎨 ROLÜN: BİLGİLİ ÇİZER"}
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: 900 }}>
                  Çizilecek Kelime: <span style={{ color: "var(--kd-yellow)" }}>{ownState?.assignedWord ?? "—"}</span>
                </div>
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--stage11d-muted)", textAlign: "right" }}>
                {ownState?.role === "ignorant" ? "Diğerlerine sezdirme!" : "İpucunu gizli tut!"}
              </span>
            </section>

            <section className="stage11d-karalama-sketchbook-frame">
              <div className="stage11d-karalama-canvas-wrap">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={450}
                  className="stage11d-karalama-canvas"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              </div>

              {/* Tools Bar */}
              <div className="stage11d-karalama-tools">
                <div className="stage11d-karalama-colors">
                  {DRAWING_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Renk: ${c}`}
                      className={`stage11d-karalama-color-btn ${currentColor === c ? "is-active" : ""}`}
                      style={{ background: COLOR_MAP[c] }}
                      onClick={() => setCurrentColor(c)}
                    />
                  ))}
                </div>

                <div className="stage11d-karalama-sizes">
                  <button
                    type="button"
                    className={`stage11d-karalama-size-btn ${currentSize === 4 ? "is-active" : ""}`}
                    onClick={() => setCurrentSize(4)}
                  >
                    İnce
                  </button>
                  <button
                    type="button"
                    className={`stage11d-karalama-size-btn ${currentSize === 8 ? "is-active" : ""}`}
                    onClick={() => setCurrentSize(8)}
                  >
                    Orta
                  </button>
                  <button
                    type="button"
                    className={`stage11d-karalama-size-btn ${currentSize === 16 ? "is-active" : ""}`}
                    onClick={() => setCurrentSize(16)}
                  >
                    Kalın
                  </button>
                </div>

                <div className="stage11d-karalama-action-btns">
                  <button
                    type="button"
                    className="stage11d-karalama-tool-btn"
                    disabled={strokes.length === 0}
                    onClick={handleUndo}
                  >
                    ↩ Geri Al
                  </button>
                  <button
                    type="button"
                    className="stage11d-karalama-tool-btn"
                    disabled={strokes.length === 0}
                    onClick={handleClear}
                  >
                    🗑️ Temizle
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Phase 2: Vote in Gallery */}
        {subPhase === "vote" && (
          <section className="stage11d-karalama-gallery">
            {publicState.drawings?.map((d: KaralamaDrawingView) => {
              const isSelf = d.playerId === selfPlayerId;
              const isVotedThis = voteTargetId === d.playerId;
              const canVote = !isSpectator && !ownState?.hasVoted && !hasVotedSubmitted && !isSelf;

              return (
                <div
                  key={d.playerId}
                  className={`stage11d-karalama-gallery-card ${isVotedThis ? "is-voted" : ""}`}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", fontWeight: 700 }}>
                    <span>👤 {playerName(players, d.playerId)} {isSelf ? "(Sen)" : ""}</span>
                    {isVotedThis && <span style={{ color: "var(--kd-pink)", fontSize: "0.68rem" }}>✓ OYLANDI</span>}
                  </div>

                  <GalleryThumbnail strokes={d.strokes} />

                  {!isSpectator && (
                    <button
                      type="button"
                      className="stage11d-karalama-vote-btn"
                      disabled={!canVote}
                      onClick={() => handleVote(d.playerId)}
                    >
                      {isSelf ? "Kendi Çizimin" : isVotedThis ? "✓ Şüpheli Seçildi" : "🎯 Şüpheli Bilgisiz Bu"}
                    </button>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Phase 3: Results */}
        {subPhase === "results" && (
          <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: "rgba(18, 22, 45, 0.9)",
                border: "1px solid var(--kd-border)",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "var(--kd-cyan)", textTransform: "uppercase" }}>
                  BİLGİSİZ ÇİZER SONUCU
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: publicState.outsiderCaught ? "var(--kd-lime)" : "var(--kd-pink)" }}>
                  {publicState.outsiderCaught ? "✓ BİLGİSİZ YAKALANDI" : "🎭 BİLGİSİZ KURTULDU"}
                </span>
              </div>

              <div style={{ fontSize: "0.95rem" }}>
                Bilgisiz Çizer: <strong>{playerName(players, publicState.outsiderPlayerId)}</strong>
              </div>

              <div style={{ display: "flex", gap: "14px", fontSize: "0.82rem", color: "var(--stage11d-muted)" }}>
                <div>Ortak Kelime: <strong style={{ color: "#fff" }}>{publicState.commonWord ?? "—"}</strong></div>
                <div>Bilgisiz Kelimesi: <strong style={{ color: "var(--kd-yellow)" }}>{publicState.outsiderWord ?? "—"}</strong></div>
              </div>
            </div>

            {/* Gallery Reveal */}
            <div className="stage11d-karalama-gallery">
              {publicState.drawings?.map((d: KaralamaDrawingView) => {
                const isOutsider = d.playerId === publicState.outsiderPlayerId;
                const voteEntry = publicState.voteCounts?.find((v) => v.playerId === d.playerId);

                return (
                  <div
                    key={d.playerId}
                    className={`stage11d-karalama-gallery-card ${isOutsider ? "is-voted" : ""}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", fontWeight: 700 }}>
                      <span>👤 {playerName(players, d.playerId)}</span>
                      {isOutsider && (
                        <span style={{ background: "rgba(255, 85, 216, 0.2)", color: "var(--kd-pink)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.68rem" }}>
                          BİLGİSİZ
                        </span>
                      )}
                    </div>
                    <GalleryThumbnail strokes={d.strokes} />
                    <div style={{ fontSize: "0.76rem", color: "var(--stage11d-muted)", textAlign: "center" }}>
                      {voteEntry?.votes ?? 0} oy aldı
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Result Points */}
            {publicState.resultPoints && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--stage11d-muted)", textTransform: "uppercase" }}>
                  Tur Puanları
                </span>
                {publicState.resultPoints.map((entry) => (
                  <div key={entry.playerId} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", background: "rgba(16, 21, 44, 0.6)", fontSize: "0.85rem" }}>
                    <span>{playerName(players, entry.playerId)}</span>
                    <strong style={{ color: "var(--kd-lime)", fontSize: "0.95rem" }}>
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
              border: "1px solid var(--kd-border)",
              color: "var(--stage11d-muted)",
              fontSize: "0.78rem"
            }}
          >
            👀 İzleyici modu: Çizerler gizli kelimelerini tuvale aktarıyor. Galeri oylama fazında açılacak.
          </div>
        )}
      </main>
    </div>
  );
}

function GalleryThumbnail({ strokes }: { readonly strokes: readonly DrawingStroke[] }): JSX.Element {
  const thumbRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!thumbRef.current) return;
    renderStrokesToCanvas(thumbRef.current, strokes);
  }, [strokes]);

  return (
    <canvas
      ref={thumbRef}
      width={320}
      height={240}
      className="stage11d-karalama-gallery-thumb"
    />
  );
}
