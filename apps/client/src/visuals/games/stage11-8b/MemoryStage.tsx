import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, JSX, KeyboardEvent } from "react";
import type {
  JsonValue,
  MatchPlayerState,
  MemoryColor,
  MemoryOwnState,
  MemoryPublicState
} from "@glix/shared";

export interface MemoryStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

const MEMORY_COLORS: readonly MemoryColor[] = ["cyan", "magenta", "amber", "lime"];

const COLOR_META: Record<MemoryColor, {
  readonly label: string;
  readonly shortLabel: string;
  readonly accent: string;
  readonly glow: string;
}> = {
  cyan: {
    label: "Turkuaz",
    shortLabel: "TURKUAZ",
    accent: "#73f5ff",
    glow: "rgba(115, 245, 255, 0.46)"
  },
  magenta: {
    label: "Pembe",
    shortLabel: "PEMBE",
    accent: "#ff69dc",
    glow: "rgba(255, 105, 220, 0.44)"
  },
  amber: {
    label: "Amber",
    shortLabel: "AMBER",
    accent: "#ffd166",
    glow: "rgba(255, 209, 102, 0.44)"
  },
  lime: {
    label: "Yeşil",
    shortLabel: "YEŞİL",
    accent: "#b3f56d",
    glow: "rgba(179, 245, 109, 0.42)"
  }
};

const EMPTY_PUBLIC_STATE: MemoryPublicState = {
  gameId: "zaman-bombasi-hafizasi",
  kind: "zaman-bombasi-hafizasi",
  started: false,
  subPhase: "display",
  sequence: [],
  sequenceIndex: 0,
  sequenceLength: 2,
  resultSequence: [],
  activePlayerId: null,
  inputDeadline: null,
  displayUntil: null,
  order: [],
  eliminatedPlayerIds: [],
  lastFailedPlayerId: null,
  mistakeCount: 0,
  initialPlayerCount: 0,
  eliminationThreshold: 0,
  finished: false
};

const MEMORY_STAGE_STYLES = `
.stage11b-memory-root {
  --stage11b-memory-ink: #eef4ff;
  --stage11b-memory-muted: #8f9bb7;
  --stage11b-memory-dim: #5b6681;
  --stage11b-memory-panel: rgba(8, 13, 31, 0.88);
  display: grid;
  gap: 0.82rem;
  width: min(100%, 43rem);
  margin: 0 auto;
  color: var(--stage11b-memory-ink);
  font-family: inherit;
}

.stage11b-memory-skin,
.stage11b-memory-wall,
.stage11b-memory-input,
.stage11b-memory-results {
  border: 1px solid rgba(160, 178, 255, 0.17);
  border-radius: 1.18rem;
  background: linear-gradient(145deg, rgba(19, 26, 57, 0.96), var(--stage11b-memory-panel));
  box-shadow: 0 1.1rem 3rem rgba(0, 0, 0, 0.26), inset 0 1px rgba(255, 255, 255, 0.07);
}

.stage11b-memory-skin {
  position: relative;
  display: grid;
  gap: 0.9rem;
  padding: clamp(0.75rem, 2.5vw, 1.12rem);
  overflow: hidden;
}

.stage11b-memory-skin::before {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(148, 165, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 165, 255, 0.035) 1px, transparent 1px);
  background-size: 1.6rem 1.6rem;
  content: "";
  pointer-events: none;
}

.stage11b-memory-skin > * {
  position: relative;
  z-index: 1;
}

.stage11b-memory-header,
.stage11b-memory-phase-row,
.stage11b-memory-input-heading,
.stage11b-memory-result-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
}

.stage11b-memory-eyebrow,
.stage11b-memory-kicker,
.stage11b-memory-roster-label {
  color: var(--stage11b-memory-dim);
  font-size: 0.5rem;
  font-weight: 950;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.stage11b-memory-title {
  display: grid;
  gap: 0.25rem;
  margin: 0;
  font-size: clamp(1.03rem, 3.3vw, 1.42rem);
  letter-spacing: 0.035em;
}

.stage11b-memory-title span {
  color: var(--stage11b-memory-muted);
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.stage11b-memory-phase-pill,
.stage11b-memory-timer {
  border: 1px solid rgba(115, 245, 255, 0.32);
  border-radius: 999px;
  padding: 0.42rem 0.62rem;
  color: #aafaff;
  background: rgba(115, 245, 255, 0.08);
  font-size: 0.52rem;
  font-weight: 950;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.stage11b-memory-timer {
  min-width: 4.35rem;
  color: #ffe1a0;
  border-color: rgba(255, 209, 102, 0.32);
  background: rgba(255, 209, 102, 0.08);
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.stage11b-memory-wall {
  display: grid;
  gap: 0.72rem;
  padding: clamp(0.72rem, 2.3vw, 1rem);
  border-color: rgba(115, 245, 255, 0.28);
  background: radial-gradient(circle at 50% 8%, rgba(115, 245, 255, 0.1), transparent 40%), rgba(5, 9, 24, 0.86);
}

.stage11b-memory-wall-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.65rem;
}

.stage11b-memory-wall-label strong {
  font-size: 0.82rem;
  letter-spacing: 0.07em;
}

.stage11b-memory-wall-label span {
  color: var(--stage11b-memory-muted);
  font-size: 0.55rem;
  text-align: right;
}

.stage11b-memory-sequence {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(3.7rem, 1fr));
  gap: 0.58rem;
  min-height: 5.4rem;
}

.stage11b-memory-light {
  display: grid;
  place-items: center;
  min-height: 5.25rem;
  border: 1px solid var(--stage11b-memory-accent);
  border-radius: 0.9rem;
  color: var(--stage11b-memory-accent);
  background: linear-gradient(145deg, color-mix(in srgb, var(--stage11b-memory-accent) 25%, transparent), rgba(14, 20, 46, 0.82));
  box-shadow: 0 0.45rem 1.2rem var(--stage11b-memory-glow), inset 0 1px rgba(255, 255, 255, 0.37);
  animation: stage11b-memory-light-pulse 1.45s ease-in-out both;
}

.stage11b-memory-light span {
  display: grid;
  gap: 0.18rem;
  justify-items: center;
  color: inherit;
  font-size: 0.52rem;
  font-weight: 950;
  letter-spacing: 0.1em;
}

.stage11b-memory-light span::before {
  width: 1.15rem;
  height: 1.15rem;
  border: 2px solid currentColor;
  border-radius: 50%;
  background: currentColor;
  box-shadow: inset 0 2px rgba(255, 255, 255, 0.58), 0 0 1.1rem currentColor;
  content: "";
}

.stage11b-memory-covered {
  display: grid;
  place-items: center;
  min-height: 5.25rem;
  border: 1px dashed rgba(160, 178, 255, 0.27);
  border-radius: 0.9rem;
  color: var(--stage11b-memory-dim);
  background: repeating-linear-gradient(135deg, rgba(160, 178, 255, 0.045) 0 0.35rem, transparent 0.35rem 0.7rem), rgba(10, 15, 34, 0.88);
  text-align: center;
}

.stage11b-memory-covered span {
  display: grid;
  gap: 0.35rem;
  font-size: 0.53rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.stage11b-memory-covered span::before {
  color: #7783a2;
  content: "•••";
  font-size: 1.25rem;
  letter-spacing: 0.22em;
}

.stage11b-memory-progress {
  display: flex;
  justify-content: center;
  gap: 0.38rem;
  min-height: 0.48rem;
}

.stage11b-memory-progress i {
  width: 0.44rem;
  height: 0.44rem;
  border: 1px solid rgba(160, 178, 255, 0.35);
  border-radius: 50%;
  background: rgba(160, 178, 255, 0.12);
}

.stage11b-memory-progress i.is-filled {
  border-color: #b3f56d;
  background: #b3f56d;
  box-shadow: 0 0 0.65rem rgba(179, 245, 109, 0.62);
}

.stage11b-memory-input {
  display: grid;
  gap: 0.78rem;
  padding: clamp(0.72rem, 2.3vw, 1rem);
  border-color: rgba(255, 105, 220, 0.22);
}

.stage11b-memory-input-heading > div,
.stage11b-memory-result-heading > div {
  display: grid;
  gap: 0.22rem;
}

.stage11b-memory-input-heading strong,
.stage11b-memory-result-heading strong {
  font-size: 0.92rem;
  letter-spacing: 0.035em;
}

.stage11b-memory-input-heading p,
.stage11b-memory-result-heading p {
  margin: 0;
  color: var(--stage11b-memory-muted);
  font-size: 0.58rem;
}

.stage11b-memory-pads {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.58rem;
}

.stage11b-memory-pad {
  display: grid;
  place-items: center;
  gap: 0.42rem;
  min-height: 4.5rem;
  border: 1px solid var(--stage11b-memory-accent);
  border-radius: 0.82rem;
  padding: 0.55rem 0.35rem;
  color: var(--stage11b-memory-accent);
  background: linear-gradient(145deg, color-mix(in srgb, var(--stage11b-memory-accent) 20%, transparent), rgba(12, 18, 42, 0.92));
  box-shadow: 0 0.35rem 0.9rem var(--stage11b-memory-glow), inset 0 1px rgba(255, 255, 255, 0.25);
  cursor: pointer;
  touch-action: manipulation;
  transition: transform 100ms ease, filter 100ms ease, opacity 100ms ease;
}

.stage11b-memory-pad::before {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid currentColor;
  border-radius: 50%;
  background: currentColor;
  box-shadow: inset 0 2px rgba(255, 255, 255, 0.62), 0 0 1rem currentColor;
  content: "";
}

.stage11b-memory-pad span {
  color: inherit;
  font-size: 0.5rem;
  font-weight: 950;
  letter-spacing: 0.08em;
}

.stage11b-memory-pad:not(:disabled):active {
  transform: translateY(0.14rem) scale(0.97);
  filter: brightness(1.3);
}

.stage11b-memory-pad:disabled {
  cursor: default;
  filter: saturate(0.35);
  opacity: 0.42;
}

.stage11b-memory-lock,
.stage11b-memory-retry {
  min-height: 2.85rem;
  border: 1px solid rgba(115, 245, 255, 0.52);
  border-radius: 0.72rem;
  color: #06111b;
  background: linear-gradient(135deg, #73f5ff, #d7ffff);
  box-shadow: 0 0.55rem 1.2rem rgba(115, 245, 255, 0.15), inset 0 1px rgba(255, 255, 255, 0.78);
  cursor: pointer;
  font-size: 0.59rem;
  font-weight: 950;
  letter-spacing: 0.12em;
}

.stage11b-memory-lock:disabled,
.stage11b-memory-retry:disabled {
  cursor: default;
  color: var(--stage11b-memory-dim);
  background: rgba(115, 245, 255, 0.08);
  opacity: 0.8;
}

.stage11b-memory-notice,
.stage11b-memory-spectator,
.stage11b-memory-error {
  border-radius: 0.66rem;
  padding: 0.58rem 0.68rem;
  font-size: 0.57rem;
  font-weight: 800;
  line-height: 1.45;
}

.stage11b-memory-notice {
  color: #b8ffff;
  background: rgba(115, 245, 255, 0.08);
}

.stage11b-memory-spectator {
  color: #ffd9f6;
  background: rgba(255, 105, 220, 0.09);
}

.stage11b-memory-error {
  color: #ffb5c4;
  background: rgba(255, 84, 117, 0.1);
}

.stage11b-memory-roster {
  display: grid;
  gap: 0.42rem;
}

.stage11b-memory-roster-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.stage11b-memory-player {
  display: inline-flex;
  align-items: center;
  gap: 0.34rem;
  min-width: 0;
  border: 1px solid rgba(160, 178, 255, 0.16);
  border-radius: 999px;
  padding: 0.36rem 0.5rem;
  color: var(--stage11b-memory-muted);
  background: rgba(10, 15, 35, 0.62);
  font-size: 0.52rem;
}

.stage11b-memory-player strong {
  max-width: 7rem;
  overflow: hidden;
  color: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage11b-memory-player::before {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: #596580;
  content: "";
}

.stage11b-memory-player.is-active {
  border-color: rgba(255, 209, 102, 0.7);
  color: #ffe4a8;
  background: rgba(255, 209, 102, 0.1);
  box-shadow: 0 0 1rem rgba(255, 209, 102, 0.15);
}

.stage11b-memory-player.is-active::before {
  background: #ffd166;
  box-shadow: 0 0 0.65rem #ffd166;
}

.stage11b-memory-player.is-self {
  color: #aafaff;
}

.stage11b-memory-player.is-eliminated {
  color: #6b7590;
  text-decoration: line-through;
}

.stage11b-memory-results {
  display: grid;
  gap: 0.84rem;
  padding: clamp(0.72rem, 2.3vw, 1rem);
  border-color: rgba(179, 245, 109, 0.26);
}

.stage11b-memory-result-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 0.58rem;
}

.stage11b-memory-result-card {
  display: grid;
  gap: 0.48rem;
  min-width: 0;
  border: 1px solid rgba(160, 178, 255, 0.14);
  border-radius: 0.78rem;
  padding: 0.62rem;
  background: rgba(5, 9, 24, 0.55);
}

.stage11b-memory-result-card > strong {
  color: var(--stage11b-memory-muted);
  font-size: 0.51rem;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.stage11b-memory-recap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.stage11b-memory-recap i {
  display: grid;
  place-items: center;
  width: 1.64rem;
  height: 1.64rem;
  border: 1px solid var(--stage11b-memory-accent);
  border-radius: 0.42rem;
  color: var(--stage11b-memory-accent);
  background: color-mix(in srgb, var(--stage11b-memory-accent) 18%, transparent);
  box-shadow: 0 0 0.7rem var(--stage11b-memory-glow);
  font-size: 0.44rem;
  font-style: normal;
  font-weight: 950;
}

.stage11b-memory-empty-result {
  color: var(--stage11b-memory-dim);
  font-size: 0.56rem;
  line-height: 1.4;
}

.stage11b-memory-mistake-count {
  color: #ffb5c4;
  font-size: 1.45rem;
  font-variant-numeric: tabular-nums;
}

.stage11b-memory-ladder {
  display: grid;
  gap: 0.38rem;
}

.stage11b-memory-ladder-row {
  display: grid;
  grid-template-columns: 1.55rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.45rem;
  border-radius: 0.54rem;
  padding: 0.38rem 0.45rem;
  color: #b9c4e0;
  background: rgba(160, 178, 255, 0.05);
  font-size: 0.56rem;
}

.stage11b-memory-ladder-row.is-survivor {
  color: #e6ffc7;
  background: rgba(179, 245, 109, 0.1);
}

.stage11b-memory-ladder-row.is-eliminated {
  color: #78839f;
}

.stage11b-memory-ladder-rank {
  color: #ffd166;
  font-weight: 950;
}

.stage11b-memory-ladder-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage11b-memory-ladder-state {
  font-size: 0.47rem;
  font-weight: 950;
  letter-spacing: 0.08em;
}

.stage11b-memory-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes stage11b-memory-light-pulse {
  0%, 100% { filter: brightness(0.76); transform: scale(0.97); }
  35%, 68% { filter: brightness(1.35); transform: scale(1); }
}

@media (max-width: 560px) {
  .stage11b-memory-header {
    align-items: flex-start;
  }

  .stage11b-memory-phase-pill {
    padding-inline: 0.48rem;
  }

  .stage11b-memory-sequence {
    grid-template-columns: repeat(auto-fit, minmax(3.35rem, 1fr));
  }

  .stage11b-memory-light,
  .stage11b-memory-covered {
    min-height: 4.4rem;
  }

  .stage11b-memory-result-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stage11b-memory-root *,
  .stage11b-memory-root *::before,
  .stage11b-memory-root *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}
`;

type MemoryStyle = CSSProperties & Record<"--stage11b-memory-accent" | "--stage11b-memory-glow", string>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMemoryColor(value: unknown): value is MemoryColor {
  return typeof value === "string" && MEMORY_COLORS.includes(value as MemoryColor);
}

function isMemoryPublicState(value: unknown): value is MemoryPublicState {
  if (!isRecord(value)) return false;
  return value.gameId === "zaman-bombasi-hafizasi"
    && value.kind === "zaman-bombasi-hafizasi"
    && (value.subPhase === "display" || value.subPhase === "input" || value.subPhase === "results")
    && typeof value.sequenceLength === "number"
    && Number.isFinite(value.sequenceLength)
    && value.sequenceLength >= 0
    && typeof value.mistakeCount === "number"
    && Number.isFinite(value.mistakeCount)
    && value.mistakeCount >= 0
    && Array.isArray(value.sequence)
    && value.sequence.every(isMemoryColor)
    && Array.isArray(value.resultSequence)
    && value.resultSequence.every(isMemoryColor);
}

function isMemoryOwnState(value: unknown): value is MemoryOwnState {
  if (!isRecord(value)) return false;
  return value.gameId === "zaman-bombasi-hafizasi"
    && value.kind === "zaman-bombasi-hafizasi"
    && typeof value.isActive === "boolean"
    && typeof value.eliminated === "boolean"
    && typeof value.inputIndex === "number"
    && Number.isFinite(value.inputIndex)
    && typeof value.sequenceLength === "number"
    && Number.isFinite(value.sequenceLength)
    && (value.inputDeadline === null || typeof value.inputDeadline === "number");
}

function secondsRemaining(deadline: number | null, now: number): number | null {
  return deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  if (playerId === null) return "Bekleniyor";
  return players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function publicColors(value: unknown): readonly MemoryColor[] {
  return Array.isArray(value) && value.every(isMemoryColor) ? value : [];
}

function memoryStyle(color: MemoryColor): MemoryStyle {
  const meta = COLOR_META[color];
  return {
    "--stage11b-memory-accent": meta.accent,
    "--stage11b-memory-glow": meta.glow
  };
}

function formatTimer(seconds: number | null): string {
  return seconds === null ? "—" : `${String(seconds).padStart(2, "0")} SN`;
}

function resultSummary(publicState: MemoryPublicState, players: readonly MatchPlayerState[]): {
  readonly sequence: readonly MemoryColor[];
  readonly mistakeCount: number;
  readonly survivorIds: readonly string[];
} {
  const sequence = publicColors(publicState.resultSequence);
  const survivorIds = publicState.order.filter((playerId) => !publicState.eliminatedPlayerIds.includes(playerId));
  return {
    sequence,
    mistakeCount: publicState.mistakeCount,
    survivorIds: survivorIds.filter((playerId) => players.some((player) => player.id === playerId))
  };
}

function MemorySequence({ sequence, result = false }: { readonly sequence: readonly MemoryColor[]; readonly result?: boolean }): JSX.Element {
  if (sequence.length === 0) {
    return <div className="stage11b-memory-covered" aria-label={result ? "Son dizi özeti bu public snapshot'ta bulunmuyor" : "Dizi kapalı"}><span>{result ? "SON DİZİ ÖZETİ YOK" : "DİZİ KAPALI"}</span></div>;
  }

  return (
    <div className={result ? "stage11b-memory-recap" : "stage11b-memory-sequence"}>
      {sequence.map((color, index) => {
        const meta = COLOR_META[color];
        if (result) {
          return <i className="stage11b-memory-recap-token" key={index} style={memoryStyle(color)} aria-label={`${index + 1}. ${meta.label}`}><span aria-hidden="true">{index + 1}</span></i>;
        }
        return <div className="stage11b-memory-light" key={index} style={{ ...memoryStyle(color), animationDelay: `${index * 500}ms` }}><span>{meta.shortLabel}</span></div>;
      })}
    </div>
  );
}

export function MemoryStage({
  publicState,
  ownState,
  players,
  selfPlayerId,
  now,
  isSpectator,
  onSubmit
}: MemoryStageProps): JSX.Element {
  const state = isMemoryPublicState(publicState) ? publicState : EMPTY_PUBLIC_STATE;
  const own = !isSpectator && isMemoryOwnState(ownState) ? ownState : null;
  const [draft, setDraft] = useState<MemoryColor[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isResults = state.subPhase === "results" || state.finished;
  const displayIsLegal = state.subPhase === "display"
    && state.started
    && (state.displayUntil === null || now < state.displayUntil);
  const activePlayerId = state.activePlayerId;
  const activeName = playerName(players, activePlayerId);
  const inputDeadline = own?.isActive ? own.inputDeadline : state.inputDeadline;
  const inputSeconds = secondsRemaining(inputDeadline, now);
  const displaySeconds = secondsRemaining(state.displayUntil, now);
  const canInput = state.subPhase === "input"
    && !isResults
    && !isSpectator
    && own?.isActive === true
    && own.eliminated === false
    && inputSeconds !== null
    && inputSeconds > 0
    && !isPending;
  const result = useMemo(() => resultSummary(state, players), [state, players]);

  useEffect(() => {
    setDraft([]);
    setIsPending(false);
    setLocalError(null);
  }, [state.subPhase, state.sequenceLength, state.activePlayerId, state.finished]);

  useEffect(() => {
    if (!isPending) return undefined;
    const timeout = window.setTimeout(() => setIsPending(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [isPending]);

  const submitSequence = useCallback((): void => {
    if (!canInput) return;
    if (draft.length !== state.sequenceLength) {
      setLocalError(`Dizi ${state.sequenceLength} adımdan oluşuyor.`);
      return;
    }
    try {
      const payload: JsonValue = { kind: "memory-sequence", sequence: [...draft] };
      setLocalError(null);
      setIsPending(true);
      onSubmit(payload);
    } catch {
      setIsPending(false);
      setLocalError("Gönderim hazırlanamadı; tekrar deneyebilirsin.");
    }
  }, [canInput, draft, onSubmit, state.sequenceLength]);

  const addColor = useCallback((color: MemoryColor): void => {
    if (!canInput) return;
    if (draft.length >= state.sequenceLength) return;
    setLocalError(null);
    setDraft((current) => [...current, color]);
  }, [canInput, draft.length, state.sequenceLength]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>): void => {
    // Native button keyboard activation owns focused controls; the wall-level
    // shortcut handler only responds when the wall itself has focus.
    if (event.target !== event.currentTarget) return;
    if (!canInput) return;
    const keyIndex = Number(event.key) - 1;
    if (keyIndex >= 0 && keyIndex < MEMORY_COLORS.length) {
      event.preventDefault();
      addColor(MEMORY_COLORS[keyIndex]!);
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && draft.length === state.sequenceLength) {
      event.preventDefault();
      submitSequence();
    }
  }, [addColor, canInput, draft.length, state.sequenceLength, submitSequence]);

  const roster = state.order.length > 0
    ? state.order.map((playerId) => players.find((player) => player.id === playerId)).filter((player): player is MatchPlayerState => player !== undefined)
    : players;
  const heading = !state.started
    ? "Dizi hazırlanıyor"
    : isResults
      ? "Bomba sustu"
      : state.subPhase === "display"
        ? "Işık duvarını izle"
        : own?.isActive
          ? "Sıra sende"
          : `${activeName} cevaplıyor`;

  return (
    <div className="stage11b-memory-root" onKeyDown={handleKeyDown} tabIndex={0} aria-label="Zaman Bombası Hafızası">
      <style>{MEMORY_STAGE_STYLES}</style>
      <section className="stage11b-memory-skin">
        <header className="stage11b-memory-header">
          <h1 className="stage11b-memory-title">
            ZAMAN BOMBASI HAFIZASI
            <span>MEMORY WALL / PROTOCOL 3</span>
          </h1>
          <span className="stage11b-memory-phase-pill">{heading}</span>
        </header>

        <div className="stage11b-memory-phase-row">
          <span className="stage11b-memory-kicker">DİZİ UZUNLUĞU <strong>{state.sequenceLength}</strong></span>
          <span className="stage11b-memory-timer">
            {state.subPhase === "display" ? formatTimer(displaySeconds) : formatTimer(inputSeconds)}
          </span>
        </div>

        <section className="stage11b-memory-wall" aria-label={displayIsLegal ? "Gösterilen renk dizisi" : "Kapalı hafıza duvarı"}>
          <div className="stage11b-memory-wall-label">
            <strong>{displayIsLegal ? "DİZİYİ KAYDET" : "HAFIZA KAPAĞI"}</strong>
            <span>{displayIsLegal ? "Sıra ve renkleri takip et" : "Giriş sırasında dizi gizlidir"}</span>
          </div>
          {displayIsLegal ? <MemorySequence sequence={state.sequence} /> : <MemorySequence sequence={[]} />}
          <div className="stage11b-memory-progress" aria-label={`Dizi uzunluğu ${state.sequenceLength}`}>
            {Array.from({ length: Math.max(0, state.sequenceLength) }, (_, index) => <i key={index} className={displayIsLegal || index < draft.length ? "is-filled" : undefined} />)}
          </div>
        </section>

        {isResults ? (
          <section className="stage11b-memory-results" aria-label="Hafıza sonucu">
            <div className="stage11b-memory-result-heading">
              <div>
                <span className="stage11b-memory-kicker">SONUÇ / PUBLIC RECAP</span>
                <strong>Son dizi ve hayatta kalanlar</strong>
                <p>Özet yalnızca public oyun durumundan okunur.</p>
              </div>
              <span className="stage11b-memory-timer">{result.mistakeCount} HATA</span>
            </div>
            <div className="stage11b-memory-result-grid">
              <div className="stage11b-memory-result-card">
                <strong>DİZİ RECAP</strong>
                <MemorySequence sequence={result.sequence} result />
              </div>
              <div className="stage11b-memory-result-card">
                <strong>HATALAR</strong>
                <span className="stage11b-memory-mistake-count">{result.mistakeCount}</span>
                <span className="stage11b-memory-empty-result">Yanlış giriş yapanlar public elenme kaydıyla işaretlenir.</span>
              </div>
            </div>
            <div className="stage11b-memory-result-card">
              <strong>SURVIVOR LADDER</strong>
              <div className="stage11b-memory-ladder">
                {roster.length === 0 ? <span className="stage11b-memory-empty-result">Oyuncu listesi bekleniyor.</span> : roster.map((player, index) => {
                  const eliminated = state.eliminatedPlayerIds.includes(player.id);
                  const survivorIndex = result.survivorIds.indexOf(player.id);
                  return (
                    <div className={`stage11b-memory-ladder-row ${eliminated ? "is-eliminated" : "is-survivor"}`} key={player.id}>
                      <span className="stage11b-memory-ladder-rank">{eliminated ? "—" : `#${survivorIndex >= 0 ? survivorIndex + 1 : index + 1}`}</span>
                      <span className="stage11b-memory-ladder-name">{player.nickname}</span>
                      <span className="stage11b-memory-ladder-state">{eliminated ? "ELENDİ" : "HAYATTA"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          <section className="stage11b-memory-input" aria-label="Renk giriş pedi">
            <div className="stage11b-memory-input-heading">
              <div>
                <span className="stage11b-memory-kicker">KAPALI GİRİŞ PEDİ</span>
                <strong>{own?.isActive && !isSpectator ? "Aynı sırayı bas" : "Aktif oyuncuyu bekle"}</strong>
                <p>{own?.isActive && !isSpectator ? "1–4 tuşları veya renk pedleriyle diziyi kur." : "Bu panel yalnızca aktif oyuncunun girişini kabul eder."}</p>
              </div>
              <span className="stage11b-memory-timer">{draft.length}/{state.sequenceLength}</span>
            </div>

            <div className="stage11b-memory-pads">
              {MEMORY_COLORS.map((color, index) => {
                const meta = COLOR_META[color];
                return <button className="stage11b-memory-pad" key={index} type="button" style={memoryStyle(color)} disabled={!canInput} onClick={() => addColor(color)} aria-label={`${index + 1}. ${meta.label} pedi`}><span>{index + 1} · {meta.shortLabel}</span></button>;
              })}
            </div>

            <button className="stage11b-memory-lock" type="button" disabled={!canInput || draft.length !== state.sequenceLength} onClick={submitSequence}>
              {isPending ? "DİZİ GÖNDERİLİYOR..." : "DİZİYİ KİLİTLE"}
            </button>

            {isSpectator && <div className="stage11b-memory-spectator">SEYİRCİ MODU · Giriş pedi kapalı. Yalnızca izin verilen gösterim ve public sonuç görünür.</div>}
            {own?.eliminated && <div className="stage11b-memory-spectator">BU OYUNCU ELENDİ · Aktif oyuncunun hamlesini izliyorsun.</div>}
            {isPending && <div className="stage11b-memory-notice" role="status">Dizi sunucuya iletiliyor; onay gelene kadar ped kilitli.</div>}
            {localError && <div className="stage11b-memory-error" role="alert">{localError}</div>}
          </section>
        )}

        <div className="stage11b-memory-roster">
          <span className="stage11b-memory-roster-label">AKTİF SIRA / DÖNGÜSEL OYUNCU LİSTESİ</span>
          <div className="stage11b-memory-roster-list">
            {roster.map((player) => <span className={`stage11b-memory-player ${player.id === activePlayerId ? "is-active" : ""} ${player.id === selfPlayerId ? "is-self" : ""} ${player.eliminated || state.eliminatedPlayerIds.includes(player.id) ? "is-eliminated" : ""}`} key={player.id}><strong>{player.nickname}</strong>{player.id === activePlayerId ? <span>AKTİF</span> : player.eliminated || state.eliminatedPlayerIds.includes(player.id) ? <span>ELENDİ</span> : null}</span>)}
          </div>
        </div>
      </section>
    </div>
  );
}
