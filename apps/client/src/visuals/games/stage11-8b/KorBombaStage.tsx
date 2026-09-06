import { useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";
import type {
  JsonValue,
  KorBombaOwnState,
  KorBombaPublicState,
  MatchPlayerState
} from "@glix/shared";

export interface KorBombaStageProps {
  readonly publicState: unknown;
  readonly ownState: unknown | null;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly isSpectator: boolean;
  readonly onSubmit: (payload: JsonValue) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPublicState(value: unknown): KorBombaPublicState | null {
  if (!isRecord(value) || value.gameId !== "kor-bomba" || value.kind !== "kor-bomba") {
    return null;
  }

  return value as unknown as KorBombaPublicState;
}

function readOwnState(value: unknown | null): KorBombaOwnState | null {
  if (!isRecord(value) || value.gameId !== "kor-bomba" || value.kind !== "kor-bomba") {
    return null;
  }

  return value as unknown as KorBombaOwnState;
}

function isLivePlayer(player: MatchPlayerState): boolean {
  return player.connected && player.currentGameParticipant && !player.eliminated;
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  return players.find((player) => player.id === playerId)?.nickname ?? "Taşıyıcı";
}

function safePassCount(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function scoreLabel(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

function HolderBadge({
  name,
  active,
  exploded
}: {
  readonly name: string;
  readonly active: boolean;
  readonly exploded: boolean;
}): JSX.Element {
  return (
    <div className={`stage11b-kor-holder-badge ${active ? "is-active" : ""} ${exploded ? "is-exploded" : ""}`}>
      <span className="stage11b-kor-holder-dot" aria-hidden="true" />
      <span>
        <small>{exploded ? "SON TAŞIYICI" : active ? "AKTİF TAŞIYICI" : "TAŞIYICI"}</small>
        <strong>{name}</strong>
      </span>
    </div>
  );
}

function BombIllustration({ tense, exploded }: { readonly tense: boolean; readonly exploded: boolean }): JSX.Element {
  return (
    <div className={`stage11b-kor-bomb-illustration ${tense ? "is-tense" : ""} ${exploded ? "is-exploded" : ""}`}>
      <svg className="stage11b-kor-bomb-svg" viewBox="0 0 360 270" role="img" aria-label={exploded ? "Patlamış kapalı bomba" : "Kablolu kapalı bomba"}>
        <path className="stage11b-kor-cable-shadow" d="M22 197 C72 215 79 242 133 232 S197 190 235 205 S292 249 339 220" />
        <path className="stage11b-kor-cable" d="M22 197 C72 215 79 242 133 232 S197 190 235 205 S292 249 339 220" />
        <path className="stage11b-kor-cable-lock" d="M37 203 C39 190 50 185 61 192" />
        <ellipse className="stage11b-kor-bomb-shadow" cx="181" cy="216" rx="112" ry="18" />
        <path className="stage11b-kor-bomb-body" d="M84 137 C84 93 119 62 181 62 S278 93 278 137 L260 198 C231 221 131 221 102 198 Z" />
        <path className="stage11b-kor-bomb-cover" d="M91 134 C91 100 125 77 181 77 S271 100 271 134 L255 155 C214 171 147 171 107 155 Z" />
        <path className="stage11b-kor-cover-seam" d="M107 155 C147 171 214 171 255 155" />
        <path className="stage11b-kor-cover-highlight" d="M116 121 C133 99 159 92 184 92" />
        <path className="stage11b-kor-fuse-neck" d="M167 77 L167 53 Q167 43 177 43 L194 43 Q204 43 204 53 L204 77" />
        <rect className="stage11b-kor-fuse-chamber" x="155" y="25" width="62" height="34" rx="10" />
        <rect className="stage11b-kor-fuse-seal" x="163" y="32" width="46" height="20" rx="6" />
        <path className="stage11b-kor-seal-line" d="M169 35 L169 49 M177 35 L177 49 M185 35 L185 49 M193 35 L193 49 M201 35 L201 49" />
        <circle className="stage11b-kor-status-light" cx="232" cy="105" r="7" />
        <path className="stage11b-kor-clasp" d="M135 167 L135 184 Q135 193 144 193 L158 193" />
        <path className="stage11b-kor-clasp" d="M227 167 L227 184 Q227 193 218 193 L204 193" />
        {exploded ? <path className="stage11b-kor-burst" d="M181 72 L193 91 L214 79 L211 103 L237 107 L214 120 L229 139 L204 135 L198 159 L181 140 L164 159 L158 135 L133 139 L148 120 L125 107 L151 103 L148 79 L169 91 Z" /> : null}
      </svg>
      <div className="stage11b-kor-sealed-label">
        <span className="stage11b-kor-sealed-lock" aria-hidden="true">▣</span>
        <span><small>{exploded ? "CHAMBER STATUS" : "FUSE CHAMBER"}</small><strong>{exploded ? "AÇILDI" : "SEALED / GİZLİ"}</strong></span>
      </div>
    </div>
  );
}

function PassTimeline({ passCount, holderName }: { readonly passCount: number; readonly holderName: string }): JSX.Element {
  const visibleDots = Math.min(12, passCount);
  return (
    <section className="stage11b-kor-timeline" aria-label="Bomba pas zaman çizelgesi">
      <div className="stage11b-kor-section-heading">
        <span><i aria-hidden="true" /> PAS ZAMAN ÇİZELGESİ</span>
        <strong>{passCount} pas</strong>
      </div>
      <div className="stage11b-kor-timeline-rail" aria-hidden="true">
        <span className="stage11b-kor-timeline-start" />
        {Array.from({ length: visibleDots }, (_, index) => <span className="stage11b-kor-timeline-pass" key={index} />)}
        <span className="stage11b-kor-timeline-current" />
      </div>
      <div className="stage11b-kor-timeline-labels">
        <span>başlangıç</span>
        <span>{passCount > 12 ? `+${passCount - 12} önceki pas` : "geçmiş rota gizli"}</span>
        <span>{holderName}</span>
      </div>
      <p>Yalnızca pas sayısı ve mevcut taşıyıcı görünür; gizli süre veya özel geçmiş gösterilmez.</p>
    </section>
  );
}

function ResultsPanel({
  publicState,
  players,
  passCount
}: {
  readonly publicState: KorBombaPublicState;
  readonly players: readonly MatchPlayerState[];
  readonly passCount: number;
}): JSX.Element {
  const finalHolderId = publicState.bombHolderId ?? publicState.explodedPlayerId;
  const explodedPlayer = players.find((player) => player.id === publicState.explodedPlayerId);
  const explodedPoints = publicState.resultPoints?.find((result) => result.playerId === publicState.explodedPlayerId)?.points ?? -1;

  return (
    <section className="stage11b-kor-results" aria-live="polite">
      <div className="stage11b-kor-results-title"><span>SAHA SONUCU</span><strong>Patlama gerçekleşti</strong></div>
      <div className="stage11b-kor-results-grid">
        <div className="stage11b-kor-result-card is-danger">
          <small>PATLAMA</small>
          <strong>{explodedPlayer?.nickname ?? "Taşıyıcı"}</strong>
          <b>{scoreLabel(explodedPoints)}</b>
          <span>mini skor</span>
        </div>
        <div className="stage11b-kor-result-card">
          <small>SON TAŞIYICI</small>
          <strong>{playerName(players, finalHolderId)}</strong>
          <b>{passCount}</b>
          <span>toplam pas</span>
        </div>
      </div>
      <PassTimeline passCount={passCount} holderName={playerName(players, finalHolderId)} />
      <div className="stage11b-kor-result-footnote">Patlayan oyuncu: −1</div>
    </section>
  );
}

function StageStyles(): JSX.Element {
  return (
    <style>{`
      .stage11b-kor-stage {
        --kor-ink: #f5f1e8;
        --kor-muted: #9b9a9c;
        --kor-panel: rgba(15, 17, 22, .92);
        --kor-panel-light: rgba(31, 35, 43, .9);
        --kor-line: rgba(255, 255, 255, .1);
        --kor-accent: #ef6c46;
        --kor-accent-bright: #ffba68;
        color: var(--kor-ink);
        width: 100%;
        min-height: 100%;
        box-sizing: border-box;
        padding: clamp(12px, 2.2vw, 26px);
        position: relative;
        overflow: hidden;
        background: radial-gradient(circle at 50% 18%, rgba(113, 44, 31, .2), transparent 42%), linear-gradient(135deg, #111216 0%, #1b1d24 52%, #101115 100%);
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      }
      .stage11b-kor-stage *, .stage11b-kor-stage *::before, .stage11b-kor-stage *::after { box-sizing: border-box; }
      .stage11b-kor-stage button, .stage11b-kor-stage select { font: inherit; }
      .stage11b-kor-stage button:focus-visible, .stage11b-kor-stage select:focus-visible { outline: 3px solid var(--kor-accent-bright); outline-offset: 3px; }
      .stage11b-kor-layout { display: grid; grid-template-columns: minmax(260px, 1.16fr) minmax(290px, .84fr); gap: clamp(12px, 2vw, 28px); max-width: 1180px; margin: 0 auto; position: relative; z-index: 1; }
      .stage11b-kor-left, .stage11b-kor-right { min-width: 0; }
      .stage11b-kor-left { display: grid; grid-template-rows: auto 1fr auto; gap: 12px; }
      .stage11b-kor-kicker { color: var(--kor-accent-bright); font-size: 10px; letter-spacing: .18em; font-weight: 800; }
      .stage11b-kor-title-row { display: flex; align-items: end; justify-content: space-between; gap: 16px; }
      .stage11b-kor-title-row h1 { font-size: clamp(22px, 3.2vw, 38px); line-height: .95; letter-spacing: -.05em; margin: 5px 0 0; }
      .stage11b-kor-status { color: var(--kor-muted); font-size: 12px; text-align: right; max-width: 175px; }
      .stage11b-kor-status strong { color: var(--kor-ink); display: block; font-size: 14px; }
      .stage11b-kor-bomb-deck { min-height: 280px; position: relative; border: 1px solid var(--kor-line); border-radius: 24px; background: linear-gradient(145deg, rgba(43, 47, 56, .72), rgba(10, 11, 15, .92)); box-shadow: inset 0 1px rgba(255, 255, 255, .08), 0 24px 70px rgba(0, 0, 0, .24); display: grid; place-items: center; overflow: hidden; }
      .stage11b-kor-bomb-deck::before { content: ""; position: absolute; inset: 12px; border: 1px solid rgba(255,255,255,.055); border-radius: 16px; pointer-events: none; }
      .stage11b-kor-bomb-deck::after { content: ""; position: absolute; width: 58%; aspect-ratio: 1; border-radius: 50%; background: rgba(239, 108, 70, .08); filter: blur(32px); pointer-events: none; }
      .stage11b-kor-bomb-illustration { width: min(88%, 460px); position: relative; z-index: 1; filter: drop-shadow(0 18px 18px rgba(0,0,0,.38)); }
      .stage11b-kor-bomb-svg { display: block; width: 100%; overflow: visible; }
      .stage11b-kor-bomb-svg path, .stage11b-kor-bomb-svg rect, .stage11b-kor-bomb-svg ellipse, .stage11b-kor-bomb-svg circle { vector-effect: non-scaling-stroke; }
      .stage11b-kor-cable-shadow { fill: none; stroke: #050608; stroke-width: 16; stroke-linecap: round; }
      .stage11b-kor-cable { fill: none; stroke: #d6d1c4; stroke-width: 8; stroke-linecap: round; stroke-dasharray: 2 10; }
      .stage11b-kor-cable-lock { fill: none; stroke: var(--kor-accent); stroke-width: 5; stroke-linecap: round; }
      .stage11b-kor-bomb-shadow { fill: rgba(0,0,0,.38); }
      .stage11b-kor-bomb-body { fill: #282b33; stroke: #545861; stroke-width: 2; }
      .stage11b-kor-bomb-cover { fill: #343943; stroke: #727680; stroke-width: 2; }
      .stage11b-kor-cover-seam, .stage11b-kor-cover-highlight { fill: none; stroke: #8e9298; stroke-linecap: round; stroke-width: 2; opacity: .75; }
      .stage11b-kor-cover-highlight { opacity: .27; stroke-width: 6; }
      .stage11b-kor-fuse-neck { fill: none; stroke: #a8abb0; stroke-width: 8; stroke-linecap: round; }
      .stage11b-kor-fuse-chamber { fill: #1a1c22; stroke: #7c8188; stroke-width: 2; }
      .stage11b-kor-fuse-seal { fill: #b94e39; stroke: #ed8a55; stroke-width: 2; }
      .stage11b-kor-seal-line { stroke: rgba(255,220,150,.58); stroke-width: 1.5; }
      .stage11b-kor-status-light { fill: var(--kor-accent); stroke: #ffb16c; stroke-width: 2; }
      .stage11b-kor-clasp { fill: none; stroke: #afb2b4; stroke-width: 5; stroke-linecap: round; }
      .stage11b-kor-burst { fill: var(--kor-accent); stroke: #ffd07c; stroke-width: 2; }
      .stage11b-kor-bomb-illustration.is-tense .stage11b-kor-status-light { animation: stage11b-kor-pulse 850ms ease-in-out infinite alternate; }
      .stage11b-kor-bomb-illustration.is-exploded .stage11b-kor-bomb-body, .stage11b-kor-bomb-illustration.is-exploded .stage11b-kor-bomb-cover { opacity: .62; }
      .stage11b-kor-sealed-label { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: -10px; color: var(--kor-muted); }
      .stage11b-kor-sealed-lock { color: var(--kor-accent-bright); font-size: 14px; }
      .stage11b-kor-sealed-label small, .stage11b-kor-sealed-label strong { display: block; }
      .stage11b-kor-sealed-label small { font-size: 8px; letter-spacing: .18em; }
      .stage11b-kor-sealed-label strong { color: var(--kor-ink); font-size: 11px; letter-spacing: .1em; }
      .stage11b-kor-tension-line { display: flex; justify-content: space-between; gap: 12px; color: var(--kor-muted); font-size: 11px; letter-spacing: .03em; }
      .stage11b-kor-tension-line strong { color: var(--kor-accent-bright); font-size: 12px; }
      .stage11b-kor-timeline, .stage11b-kor-action-card, .stage11b-kor-results { border: 1px solid var(--kor-line); border-radius: 18px; background: var(--kor-panel); padding: 14px; }
      .stage11b-kor-right { display: grid; align-content: start; gap: 12px; }
      .stage11b-kor-holder-badge { display: flex; gap: 10px; align-items: center; padding: 11px 12px; border-radius: 14px; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.08); }
      .stage11b-kor-holder-badge.is-active { border-color: rgba(255, 186, 104, .55); background: linear-gradient(90deg, rgba(142, 65, 42, .36), rgba(255,255,255,.045)); }
      .stage11b-kor-holder-badge.is-exploded { border-color: rgba(239, 108, 70, .7); }
      .stage11b-kor-holder-dot { width: 10px; height: 10px; border-radius: 50%; background: #777b82; flex: none; }
      .stage11b-kor-holder-badge.is-active .stage11b-kor-holder-dot { background: var(--kor-accent-bright); box-shadow: 0 0 0 4px rgba(255,186,104,.14), 0 0 18px var(--kor-accent); }
      .stage11b-kor-holder-badge.is-exploded .stage11b-kor-holder-dot { background: var(--kor-accent); }
      .stage11b-kor-holder-badge small, .stage11b-kor-holder-badge strong { display: block; }
      .stage11b-kor-holder-badge small { color: var(--kor-muted); font-size: 8px; letter-spacing: .16em; }
      .stage11b-kor-holder-badge strong { color: var(--kor-ink); font-size: 15px; margin-top: 2px; }
      .stage11b-kor-section-heading, .stage11b-kor-action-heading { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
      .stage11b-kor-section-heading span, .stage11b-kor-action-heading small { color: var(--kor-muted); font-size: 9px; letter-spacing: .15em; font-weight: 800; }
      .stage11b-kor-section-heading span { display: flex; align-items: center; gap: 7px; }
      .stage11b-kor-section-heading i { width: 6px; height: 6px; border-radius: 50%; background: var(--kor-accent); display: inline-block; }
      .stage11b-kor-section-heading strong { color: var(--kor-accent-bright); font-size: 12px; }
      .stage11b-kor-timeline-rail { display: flex; align-items: center; gap: 5px; margin: 14px 2px 7px; min-height: 14px; }
      .stage11b-kor-timeline-rail::before { content: ""; height: 1px; flex: 1; background: linear-gradient(90deg, rgba(255,255,255,.12), var(--kor-accent), rgba(255,255,255,.12)); order: 2; }
      .stage11b-kor-timeline-start, .stage11b-kor-timeline-current, .stage11b-kor-timeline-pass { display: block; flex: none; border-radius: 50%; position: relative; z-index: 1; }
      .stage11b-kor-timeline-start { width: 8px; height: 8px; border: 2px solid #74777d; order: 1; }
      .stage11b-kor-timeline-pass { width: 5px; height: 5px; background: #d77a55; order: 3; }
      .stage11b-kor-timeline-current { width: 12px; height: 12px; background: var(--kor-accent-bright); box-shadow: 0 0 0 4px rgba(255,186,104,.13); order: 4; }
      .stage11b-kor-timeline-labels { display: flex; justify-content: space-between; color: #777981; font-size: 9px; gap: 8px; }
      .stage11b-kor-timeline-labels span:nth-child(2) { text-align: center; color: var(--kor-muted); }
      .stage11b-kor-timeline-labels span:last-child { text-align: right; color: var(--kor-ink); max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .stage11b-kor-timeline p { color: #7b7c83; font-size: 10px; line-height: 1.35; margin: 11px 0 0; }
      .stage11b-kor-action-card { display: grid; gap: 13px; }
      .stage11b-kor-action-heading strong { font-size: 17px; }
      .stage11b-kor-action-heading small { color: var(--kor-accent-bright); }
      .stage11b-kor-target-tray { display: flex; flex-wrap: wrap; gap: 7px; }
      .stage11b-kor-target-chip { appearance: none; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.05); color: var(--kor-ink); border-radius: 10px; padding: 9px 11px; cursor: pointer; min-width: 88px; text-align: left; transition: border-color .16s ease, background .16s ease, transform .16s ease; }
      .stage11b-kor-target-chip:hover { transform: translateY(-1px); border-color: rgba(255,186,104,.62); }
      .stage11b-kor-target-chip.is-selected { border-color: var(--kor-accent-bright); background: rgba(172, 74, 45, .35); box-shadow: inset 0 0 0 1px rgba(255,186,104,.18); }
      .stage11b-kor-target-chip strong, .stage11b-kor-target-chip small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .stage11b-kor-target-chip strong { font-size: 12px; }
      .stage11b-kor-target-chip small { color: var(--kor-muted); font-size: 8px; letter-spacing: .1em; margin-top: 3px; }
      .stage11b-kor-target-select { display: none; width: 100%; border: 1px solid rgba(255,255,255,.16); background: #242730; color: var(--kor-ink); border-radius: 10px; padding: 10px; }
      .stage11b-kor-pass-button { appearance: none; border: 0; border-radius: 12px; cursor: pointer; color: #21150e; background: linear-gradient(135deg, #ffce7a, #e66f48); padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; gap: 10px; box-shadow: 0 7px 20px rgba(226, 88, 54, .2); }
      .stage11b-kor-pass-button:hover:not(:disabled) { filter: brightness(1.08); }
      .stage11b-kor-pass-button:disabled { cursor: not-allowed; opacity: .42; filter: saturate(.55); }
      .stage11b-kor-pass-button strong { font-size: 13px; letter-spacing: .04em; }
      .stage11b-kor-pass-button span { font-size: 18px; line-height: 1; }
      .stage11b-kor-action-note { color: var(--kor-muted); font-size: 10px; line-height: 1.35; margin: -4px 0 0; min-height: 14px; }
      .stage11b-kor-action-note.is-confirmed { color: #a8d6ac; }
      .stage11b-kor-action-note.is-error { color: #ffb39b; }
      .stage11b-kor-spectator-note { color: var(--kor-muted); line-height: 1.4; font-size: 11px; margin: 0; }
      .stage11b-kor-results { display: grid; gap: 12px; border-color: rgba(239,108,70,.35); }
      .stage11b-kor-results-title span, .stage11b-kor-results-title strong { display: block; }
      .stage11b-kor-results-title span { color: var(--kor-accent-bright); font-size: 9px; letter-spacing: .16em; font-weight: 800; }
      .stage11b-kor-results-title strong { font-size: 20px; margin-top: 3px; }
      .stage11b-kor-results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .stage11b-kor-result-card { padding: 11px; border-radius: 12px; background: rgba(255,255,255,.055); min-width: 0; }
      .stage11b-kor-result-card.is-danger { background: rgba(151, 51, 34, .25); border: 1px solid rgba(239,108,70,.28); }
      .stage11b-kor-result-card small, .stage11b-kor-result-card strong, .stage11b-kor-result-card b, .stage11b-kor-result-card span { display: block; }
      .stage11b-kor-result-card small { color: var(--kor-muted); font-size: 8px; letter-spacing: .14em; }
      .stage11b-kor-result-card strong { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 6px 0 5px; }
      .stage11b-kor-result-card b { color: var(--kor-accent-bright); font-size: 22px; letter-spacing: -.04em; }
      .stage11b-kor-result-card span { color: var(--kor-muted); font-size: 9px; margin-top: 1px; }
      .stage11b-kor-result-footnote { color: #ffc084; font-size: 10px; text-align: right; }
      .stage11b-kor-portrait-overlay { display: none; }
      @keyframes stage11b-kor-pulse { from { opacity: .55; transform: scale(.9); } to { opacity: 1; transform: scale(1.12); } }
      @media (max-width: 760px) and (orientation: landscape) {
        .stage11b-kor-stage { padding: 10px; }
        .stage11b-kor-layout { grid-template-columns: minmax(230px, .95fr) minmax(270px, 1.05fr); gap: 10px; }
        .stage11b-kor-bomb-deck { min-height: 230px; border-radius: 18px; }
        .stage11b-kor-left { gap: 8px; }
        .stage11b-kor-title-row h1 { font-size: 25px; }
        .stage11b-kor-title-row { align-items: center; }
        .stage11b-kor-timeline, .stage11b-kor-action-card, .stage11b-kor-results { padding: 10px; border-radius: 14px; }
      }
      @media (orientation: portrait) {
        .stage11b-kor-layout { opacity: .18; filter: blur(1px); pointer-events: none; }
        .stage11b-kor-portrait-overlay { display: grid; position: absolute; inset: 14px; place-items: center; z-index: 3; border: 1px solid rgba(255,186,104,.33); border-radius: 18px; background: rgba(11,12,16,.86); text-align: center; padding: 20px; }
        .stage11b-kor-portrait-overlay strong { display: block; color: var(--kor-accent-bright); letter-spacing: .12em; font-size: 12px; }
        .stage11b-kor-portrait-overlay span { display: block; color: var(--kor-muted); font-size: 11px; margin-top: 7px; }
      }
      @media (max-width: 540px) and (orientation: landscape) {
        .stage11b-kor-title-row h1 { font-size: 20px; }
        .stage11b-kor-kicker { font-size: 8px; }
        .stage11b-kor-status { font-size: 9px; }
        .stage11b-kor-status strong { font-size: 11px; }
        .stage11b-kor-bomb-deck { min-height: 190px; }
        .stage11b-kor-bomb-illustration { width: 96%; }
        .stage11b-kor-target-chip { min-width: 76px; padding: 7px 8px; }
      }
      @media (pointer: coarse) and (max-width: 760px) {
        .stage11b-kor-target-select { display: block; }
        .stage11b-kor-target-tray { display: none; }
      }
    `}</style>
  );
}

export function KorBombaStage({
  publicState: publicStateInput,
  ownState: ownStateInput,
  players,
  selfPlayerId,
  now,
  isSpectator,
  onSubmit
}: KorBombaStageProps): JSX.Element {
  const publicState = readPublicState(publicStateInput);
  const ownState = !isSpectator ? readOwnState(ownStateInput) : null;
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [noticeKind, setNoticeKind] = useState<"confirmed" | "error" | "neutral">("neutral");
  const lastPassCountRef = useRef<number | null>(null);

  const livePlayers = useMemo(() => players.filter(isLivePlayer), [players]);
  const livePlayerIds = useMemo(() => new Set(livePlayers.map((player) => player.id)), [livePlayers]);
  const validTargets = useMemo(() => {
    if (isSpectator || !ownState || !selfPlayerId) return [];
    const privateTargets = new Set(ownState.targetPlayerIds);
    return livePlayers.filter((player) => player.id !== selfPlayerId && privateTargets.has(player.id));
  }, [isSpectator, livePlayers, ownState, selfPlayerId]);

  const typedPassCount = safePassCount(publicState?.passCount ?? 0);
  const isFinished = Boolean(publicState?.finished);
  const hasBomb = Boolean(!isSpectator && ownState?.hasBomb && selfPlayerId && livePlayerIds.has(selfPlayerId));
  const canPass = Boolean(hasBomb && ownState?.canPass && validTargets.length > 0 && !isFinished);
  const selectedTarget = validTargets.find((player) => player.id === selectedTargetId) ?? null;
  const holderId = publicState?.bombHolderId ?? null;
  const holderName = playerName(players, holderId);
  const tensionPulse = Math.floor(now / 650) % 2 === 0;

  useEffect(() => {
    if (!selectedTargetId || !validTargets.some((player) => player.id === selectedTargetId)) {
      setSelectedTargetId(validTargets[0]?.id ?? null);
    }
  }, [selectedTargetId, validTargets]);

  useEffect(() => {
    if (lastPassCountRef.current === null) {
      lastPassCountRef.current = typedPassCount;
      return;
    }

    if (typedPassCount > lastPassCountRef.current) {
      const acknowledgedTargetId = pendingTargetId;
      setPendingTargetId(null);
      setNoticeKind("confirmed");
      setActionNotice(acknowledgedTargetId && publicState?.bombHolderId === acknowledgedTargetId
        ? `${playerName(players, acknowledgedTargetId)} hedefine pas onaylandı.`
        : "Pas onaylandı; taşıyıcı güncellendi.");
    }

    lastPassCountRef.current = typedPassCount;
  }, [pendingTargetId, players, publicState?.bombHolderId, typedPassCount]);

  useEffect(() => {
    if (!pendingTargetId) return undefined;
    const timeout = window.setTimeout(() => {
      setPendingTargetId(null);
      setNoticeKind("error");
      setActionNotice("Onay gelmedi; hedefi değiştirip yeniden deneyebilirsin.");
    }, 2400);
    return () => window.clearTimeout(timeout);
  }, [pendingTargetId]);

  useEffect(() => {
    if (isFinished && pendingTargetId) {
      setPendingTargetId(null);
      setNoticeKind("neutral");
      setActionNotice("Tur sonuçlandı.");
    }
  }, [isFinished, pendingTargetId]);

  const handleSelectTarget = (targetPlayerId: string): void => {
    if (isSpectator || !canPass || targetPlayerId === selfPlayerId || !validTargets.some((player) => player.id === targetPlayerId)) return;
    setSelectedTargetId(targetPlayerId);
    setActionNotice(null);
    setNoticeKind("neutral");
  };

  const handlePass = (): void => {
    if (isSpectator || !canPass || !selectedTargetId || selectedTargetId === selfPlayerId) return;
    if (!validTargets.some((player) => player.id === selectedTargetId)) return;
    setPendingTargetId(selectedTargetId);
    setNoticeKind("neutral");
    setActionNotice("Pas gönderiliyor; hedef seçimi açık.");
    onSubmit({ kind: "bomb-pass", targetPlayerId: selectedTargetId });
  };

  if (!publicState) {
    return <div className="stage11b-kor-stage"><StageStyles /><div className="stage11b-kor-action-card">Oyun sahnesi hazırlanıyor…</div></div>;
  }

  return (
    <div className="stage11b-kor-stage" aria-label="Kör Bomba oyun sahnesi">
      <StageStyles />
      <div className="stage11b-kor-layout">
        <main className="stage11b-kor-left">
          <div className="stage11b-kor-title-row">
            <div><span className="stage11b-kor-kicker">STAGE 11.8B / KOR BOMBA</span><h1>Fısıltıyla pasla.</h1></div>
            <div className="stage11b-kor-status"><strong>{isFinished ? "PATLAMA KİLİTLENDİ" : "SÜRE GİZLİ"}</strong>{isFinished ? "Son taşıyıcı açıklandı." : "Gerilim görünür, fuse zamanı değil."}</div>
          </div>
          <section className="stage11b-kor-bomb-deck" aria-label={isFinished ? "Patlama sonucu" : "Kapalı bomba ve kablo"}>
            <BombIllustration tense={!isFinished && tensionPulse} exploded={isFinished} />
          </section>
          <div className="stage11b-kor-tension-line"><span>SEALED CHAMBER</span><strong>{isFinished ? "RESULT LOCK" : "NO COUNTDOWN"}</strong></div>
          <PassTimeline passCount={typedPassCount} holderName={holderName} />
        </main>

        <aside className="stage11b-kor-right">
          <HolderBadge name={holderName} active={!isFinished && Boolean(holderId)} exploded={isFinished} />
          {isFinished ? <ResultsPanel publicState={publicState} players={players} passCount={typedPassCount} /> : isSpectator ? (
            <section className="stage11b-kor-action-card" aria-live="polite">
              <div className="stage11b-kor-action-heading"><strong>İzleyici modu</strong><small>PUBLIC VIEW</small></div>
              <p className="stage11b-kor-spectator-note">Bomba taşıyıcısı ve pas ritmi görünür. Hedef seçimi yalnızca aktif taşıyıcının özel ekranında açılır.</p>
            </section>
          ) : hasBomb ? (
            <section className="stage11b-kor-action-card" aria-live="polite">
              <div className="stage11b-kor-action-heading"><strong>Hedef tepsisi</strong><small>{pendingTargetId ? "PASS PENDING" : "REPEATABLE PASS"}</small></div>
              <p className="stage11b-kor-spectator-note">Kendini seçemezsin. Bağlantısı kopan veya elenen hedefler otomatik çıkarılır.</p>
              <div className="stage11b-kor-target-tray" role="listbox" aria-label="Canlı hedefler">
                {validTargets.map((player) => (
                  <button
                    className={`stage11b-kor-target-chip ${player.id === selectedTargetId ? "is-selected" : ""}`}
                    key={player.id}
                    type="button"
                    role="option"
                    aria-selected={player.id === selectedTargetId}
                    onClick={() => handleSelectTarget(player.id)}
                  >
                    <strong>{player.nickname}</strong><small>{player.id === pendingTargetId ? "GÖNDERİLİYOR" : "CANLI HEDEF"}</small>
                  </button>
                ))}
              </div>
              <select className="stage11b-kor-target-select" aria-label="Bomba pas hedefi" value={selectedTargetId ?? ""} disabled={!canPass} onChange={(event) => handleSelectTarget(event.target.value)}>
                <option value="" disabled>Hedef seç</option>
                {validTargets.map((player) => <option key={player.id} value={player.id}>{player.nickname}</option>)}
              </select>
              <button className="stage11b-kor-pass-button" type="button" disabled={!canPass || !selectedTarget} onClick={handlePass}>
                <strong>{pendingTargetId ? "YENİDEN PASLA" : "BOMBAYI PASLA"}</strong><span aria-hidden="true">→</span>
              </button>
              <p className={`stage11b-kor-action-note ${noticeKind === "confirmed" ? "is-confirmed" : noticeKind === "error" ? "is-error" : ""}`} aria-live="polite">
                {actionNotice ?? (validTargets.length > 0 ? `${selectedTarget?.nickname ?? "Bir hedef"} seçili.` : "Uygun canlı hedef yok.")}
              </p>
            </section>
          ) : (
            <section className="stage11b-kor-action-card" aria-live="polite">
              <div className="stage11b-kor-action-heading"><strong>Bekle ve izle.</strong><small>NOT YOUR TURN</small></div>
              <p className="stage11b-kor-spectator-note">Aktif taşıyıcı hedef tepsisini görür. Senin ekranında fuse süresi veya özel değer yok.</p>
            </section>
          )}
        </aside>
      </div>
      <div className="stage11b-kor-portrait-overlay" aria-live="polite"><div><strong>YATAY GÖRÜNÜM GEREKLİ</strong><span>Bu sahneyi görmek için cihazı yatay çevir.</span></div></div>
    </div>
  );
}

export default KorBombaStage;
