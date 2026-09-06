import { useEffect, useState } from "react";
import type { JSX } from "react";
import type {
  ButonaBasOwnState,
  ButonaBasPublicState,
  JsonValue,
  MatchPlayerState,
  MemoryColor,
  MemoryOwnState,
  MemoryPublicState,
  SizmaOwnState,
  SizmaPublicState,
  Stage6OwnState,
  Stage6PublicState,
  Stage6GameId
} from "@glix/shared";

interface Stage6GameControlsProps {
  readonly gameId: Stage6GameId;
  readonly publicState: unknown;
  readonly ownState: unknown;
  readonly selfPlayerId: string | null;
  readonly players: readonly MatchPlayerState[];
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}

const MEMORY_COLOR_LABELS = {
  cyan: "TURKUAZ",
  magenta: "PEMBE",
  amber: "AMBER",
  lime: "YEŞİL"
} as const;

const MEMORY_COLORS = ["cyan", "magenta", "amber", "lime"] as const;

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  return players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function secondsLeft(deadline: number | null, now: number): number {
  return deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));
}

function isStage6PublicState(value: unknown): value is Stage6PublicState {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

  return Boolean(
    record &&
      typeof record.gameId === "string" &&
      typeof record.kind === "string"
  );
}

function isStage6OwnState(value: unknown): value is Stage6OwnState {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

  return Boolean(
    record &&
      typeof record.gameId === "string" &&
      typeof record.kind === "string"
  );
}

export function Stage6GameControls({
  gameId,
  publicState,
  ownState,
  selfPlayerId,
  players,
  now,
  onSubmit
}: Stage6GameControlsProps): JSX.Element {
  if (!isStage6PublicState(publicState) || !isStage6OwnState(ownState)) {
    return <div className="stage6-controls stage6-empty-state">Oyun sahnesi hazırlanıyor…</div>;
  }

  if (gameId === "butona-bas" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return (
      <ButonaBasControls
        publicState={publicState as ButonaBasPublicState}
        ownState={ownState as ButonaBasOwnState}
        now={now}
        onSubmit={onSubmit}
      />
    );
  }

  if (gameId === "sizma" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return (
      <SizmaControls
        publicState={publicState as SizmaPublicState}
        ownState={ownState as SizmaOwnState}
        players={players}
        now={now}
        onSubmit={onSubmit}
      />
    );
  }

  if (gameId === "zaman-bombasi-hafizasi" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return (
      <MemoryControls
        publicState={publicState as MemoryPublicState}
        ownState={ownState as MemoryOwnState}
        selfPlayerId={selfPlayerId}
        players={players}
        now={now}
        onSubmit={onSubmit}
      />
    );
  }

  return <div className="stage6-controls stage6-empty-state">Bu sahne senkronize ediliyor…</div>;
}

function ButonaBasControls({
  publicState,
  ownState,
  now,
  onSubmit
}: {
  readonly publicState: ButonaBasPublicState;
  readonly ownState: ButonaBasOwnState;
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  const remainingMs = publicState.currentWindowEndsAt === null
    ? 0
    : Math.max(0, publicState.currentWindowEndsAt - now);
  const windowProgress = publicState.finished
    ? 1
    : Math.max(0, Math.min(1, 1 - remainingMs / publicState.windowMs));

  return (
    <div className="stage6-controls stage6-button-controls" aria-live="polite">
      <div className="stage6-stat-strip">
        <span><small>PENCERE</small><b>{publicState.windowIndex + 1}<em>/{publicState.windowCount}</em></b></span>
        <span><small>0,3 SANİYE</small><b className="stage6-window-pulse">{remainingMs > 0 ? `${(remainingMs / 1000).toFixed(2)} sn` : "BİTTİ"}</b></span>
        <span><small>SENİN MİNİ SKORUN</small><b className={ownState.miniScore < 0 ? "negative-score" : ""}>{ownState.miniScore > 0 ? "+" : ""}{ownState.miniScore}</b></span>
      </div>
      <div className="stage6-window-meter" aria-hidden="true"><span style={{ width: `${Math.round(windowProgress * 100)}%` }} /></div>
      <button
        className="pressure-button"
        type="button"
        disabled={publicState.finished}
        onPointerDown={(event) => {
          event.preventDefault();
          onSubmit({ kind: "button-tap" });
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSubmit({ kind: "button-tap" });
          }
        }}
      >
        <span className="pressure-button-halo" />
        <span className="pressure-button-cap">BAS</span>
        <small>{ownState.lastTapWindowIndex === publicState.windowIndex ? "BU PENCEREDE VARSIN" : "AYNI ANDA YAKALA"}</small>
      </button>
      <p className="stage6-rule-note">Aynı 0,3 saniyeye en az iki kişi düşerse basanlar +1 alır. Tek kalırsan −1.</p>
    </div>
  );
}

function SizmaControls({
  publicState,
  ownState,
  players,
  now,
  onSubmit
}: {
  readonly publicState: SizmaPublicState;
  readonly ownState: SizmaOwnState;
  readonly players: readonly MatchPlayerState[];
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  const turnName = playerName(players, publicState.clueTurnPlayerId);
  const outsiderName = playerName(players, publicState.outsiderPlayerId);
  const topNames = (publicState.topVotedPlayerIds ?? []).map((id) => playerName(players, id));

  return (
    <div className={`stage6-controls stage6-sizma-controls sizma-${publicState.subPhase}`} aria-live="polite">
      <div className="secret-word-card">
        <span className="secret-word-eyebrow">SADECE SENİN TELEFONUNDA</span>
        <strong>{ownState.assignedWord}</strong>
        <small>{ownState.role === "outsider" ? "SIZMA KELİMESİ" : "ORTAK KELİME"}</small>
      </div>

      {publicState.subPhase === "clue" && (
        <div className="sizma-phase-panel">
          <div className="phase-panel-heading">
            <span className="phase-panel-index">{publicState.clueRound}/2</span>
            <div><small>SESLİ İPUCU TURU</small><strong>{turnName} konuşuyor</strong></div>
          </div>
          <p>Kelimenle ilişkili tek bir ipucunu masada sesli söyle. Sonra telefondan turu devret.</p>
          <button className="stage6-primary-button" type="button" disabled={!ownState.canCompleteClue} onClick={() => onSubmit({ kind: "clue-complete" })}>
            {ownState.canCompleteClue ? "İPUCUMU VERDİM" : `${turnName.toUpperCase()} SÖYLÜYOR`}
          </button>
          <span className="phase-panel-progress">{publicState.clueTurnsCompleted} / {publicState.totalClueTurns} ipucu tamamlandı</span>
        </div>
      )}

      {publicState.subPhase === "ready-for-vote" && (
        <div className="sizma-phase-panel">
          <div className="phase-panel-heading"><span className="phase-panel-index">✓</span><div><small>İPUÇLARI TAMAM</small><strong>Oylamaya hazırlan</strong></div></div>
          <p>Herkes iki ipucunu verdi. Masadaki tartışmayı bitirince herkes kendi telefonundan hazır olsun.</p>
          <button className="stage6-primary-button" type="button" disabled={!ownState.canReadyForVote} onClick={() => onSubmit({ kind: "vote-ready" })}>
            {ownState.canReadyForVote ? "OYLAMAYA GEÇ" : "HAZIR OLDU"}
          </button>
          <span className="phase-panel-progress">{publicState.readyPlayerIds.length} / {players.length} oyuncu hazır</span>
        </div>
      )}

      {publicState.subPhase === "vote" && (
        <div className="sizma-phase-panel vote-panel">
          <div className="phase-panel-heading"><span className="phase-panel-index">{secondsLeft(publicState.voteEndsAt, now)}</span><div><small>30 SANİYELİK OYLAMA</small><strong>Sence kim sızma?</strong></div></div>
          <p>Bir kişiye oy ver. Kendi adına oy vermek de serbest.</p>
          <div className="vote-grid">
            {players.filter((player) => player.connected && player.currentGameParticipant && !player.eliminated).map((player) => (
              <button className={`vote-player-button ${ownState.hasVoted ? "is-locked" : ""}`} type="button" key={player.id} disabled={ownState.hasVoted} onClick={() => onSubmit({ kind: "vote", targetPlayerId: player.id })}>
                <span className="vote-avatar">{player.nickname.slice(0, 1).toUpperCase()}</span>
                <strong>{player.nickname}</strong>
                <small>OY VER</small>
              </button>
            ))}
          </div>
          {ownState.hasVoted && <span className="phase-panel-progress">Oyun kaydedildi. Diğer oyları bekliyoruz.</span>}
        </div>
      )}

      {publicState.subPhase === "results" && (
        <div className="sizma-phase-panel result-panel">
          <div className="phase-panel-heading"><span className="phase-panel-index">★</span><div><small>SIZMA SONUCU</small><strong>{publicState.outsiderCaught ? "Sızma yakalandı" : "Sızma masadan sıyrıldı"}</strong></div></div>
          <p>{publicState.outsiderCaught ? `${outsiderName} bulundu; normal oyuncular +1 aldı.` : `${outsiderName} sızmaydı ve +2 aldı.`}</p>
          <div className="result-word-pair"><span>ORTAK <b>{publicState.commonWord}</b></span><span>SIZMA <b>{publicState.outsiderWord}</b></span></div>
          {topNames.length > 0 && <small className="phase-panel-progress">En çok oy: {topNames.join(", ")}</small>}
        </div>
      )}
    </div>
  );
}

function MemoryControls({
  publicState,
  ownState,
  selfPlayerId,
  players,
  now,
  onSubmit
}: {
  readonly publicState: MemoryPublicState;
  readonly ownState: MemoryOwnState;
  readonly selfPlayerId: string | null;
  readonly players: readonly MatchPlayerState[];
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  const activeName = playerName(players, publicState.activePlayerId);
  const isOwnTurn = publicState.activePlayerId === selfPlayerId && ownState.isActive;
  const [selectedSequence, setSelectedSequence] = useState<MemoryColor[]>([]);

  useEffect(() => {
    setSelectedSequence([]);
  }, [publicState.activePlayerId, publicState.sequenceLength, publicState.subPhase]);

  const progress = publicState.sequenceLength === 0 ? 0 : Math.round((selectedSequence.length / publicState.sequenceLength) * 100);

  return (
    <div className={`stage6-controls stage6-memory-controls memory-${publicState.subPhase}`} aria-live="polite">
      <div className="memory-status-strip">
        <span><small>SIRA</small><b>{activeName}</b></span>
        <span><small>DİZİ UZUNLUĞU</small><b>{publicState.sequenceLength}</b></span>
        <span><small>ELENME EŞİĞİ</small><b>{publicState.eliminatedPlayerIds.length}/{publicState.eliminationThreshold}</b></span>
      </div>

      {publicState.subPhase === "display" && (
        <div className="memory-display-panel">
          <span className="memory-panel-kicker">DİZİYİ İZLE</span>
          <strong>{activeName} için sıra yanıyor</strong>
          <div className="memory-sequence-display">
            {publicState.sequence.map((color, index) => <span className={`memory-sequence-light memory-${color}`} key={`${color}-${index}`} style={{ animationDelay: `${index * 120}ms` }} aria-label={MEMORY_COLOR_LABELS[color]} />)}
          </div>
          <small>Herkes izlesin. Sonra yalnızca sıradaki oyuncu cevap verecek.</small>
        </div>
      )}

      {publicState.subPhase === "input" && (
        <div className="memory-input-panel">
          <div className="memory-input-heading">
            <div><span className="memory-panel-kicker">DİZİYİ HATIRLA</span><strong>{isOwnTurn ? "Sıra sende" : `${activeName} cevaplıyor`}</strong></div>
            <b className="memory-countdown">{secondsLeft(ownState.inputDeadline ?? publicState.inputDeadline, now)}<small>sn</small></b>
          </div>
          <div className="memory-masked-sequence" aria-label="Hatırlanacak dizi">
            {Array.from({ length: publicState.sequenceLength }, (_, index) => <span className={index < selectedSequence.length ? "is-done" : index === selectedSequence.length && isOwnTurn ? "is-current" : ""} key={index}>{index < selectedSequence.length ? MEMORY_COLOR_LABELS[selectedSequence[index]!] : "•"}</span>)}
          </div>
          <div className="memory-pad-grid">
            {MEMORY_COLORS.map((color) => (
              <button className={`memory-pad memory-${color}`} type="button" key={color} disabled={!isOwnTurn || selectedSequence.length >= publicState.sequenceLength} onClick={() => setSelectedSequence((current) => current.length >= publicState.sequenceLength ? current : [...current, color])}>
                <span /><strong>{MEMORY_COLOR_LABELS[color]}</strong>
              </button>
            ))}
          </div>
          {!isOwnTurn && <small className="phase-panel-progress">Telefonlar aynı sahneyi izliyor. Sıra sende değil.</small>}
          {isOwnTurn && <button className="memory-submit-button" type="button" disabled={selectedSequence.length !== publicState.sequenceLength} onClick={() => onSubmit({ kind: "memory-sequence", sequence: selectedSequence })}>DİZİYİ KİLİTLE</button>}
          {isOwnTurn && <div className="memory-input-progress"><span style={{ width: `${progress}%` }} /></div>}
        </div>
      )}

      {publicState.subPhase === "results" && (
        <div className="memory-display-panel result-panel">
          <span className="memory-panel-kicker">BOMBA DURDU</span>
          <strong>{playerName(players, publicState.lastFailedPlayerId)} elendi</strong>
          <p>Hata yapan −1 aldı; o anda hayatta kalan diğer oyuncular +1 aldı.</p>
          <small>{publicState.eliminatedPlayerIds.length} / {publicState.eliminationThreshold} oyuncu elendi.</small>
        </div>
      )}

      {ownState.eliminated && <div className="spectator-banner">ELENDİN · SAHNEYİ İZLİYORSUN</div>}
    </div>
  );
}
