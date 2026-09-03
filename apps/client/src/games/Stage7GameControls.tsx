import { useEffect, useState } from "react";
import type { JSX } from "react";
import type {
  AcgozlulukOwnState,
  AcgozlulukPublicState,
  AsiriYuklemeOwnState,
  AsiriYuklemePublicState,
  CaprazAtesOwnState,
  CaprazAtesPublicState,
  CizgiyiGecmeOwnState,
  CizgiyiGecmePublicState,
  GizliAlisverisOwnState,
  GizliAlisverisPublicState,
  GizliHirsizOwnState,
  GizliHirsizPublicState,
  GizliKarelerOwnState,
  GizliKarelerPublicState,
  JsonValue,
  KorBombaOwnState,
  KorBombaPublicState,
  KorKronometreOwnState,
  KorKronometrePublicState,
  MatchPlayerState,
  OrtalamaninYarisiOwnState,
  OrtalamaninYarisiPublicState,
  Stage7GameId,
  Stage7OwnState,
  Stage7PublicState
} from "@glix/shared";

interface Stage7GameControlsProps {
  readonly gameId: Stage7GameId;
  readonly publicState: unknown;
  readonly ownState: unknown;
  readonly selfPlayerId: string | null;
  readonly players: readonly MatchPlayerState[];
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStage7PublicState(value: unknown): value is Stage7PublicState {
  return isRecord(value) && typeof value.gameId === "string" && typeof value.kind === "string";
}

function isStage7OwnState(value: unknown): value is Stage7OwnState {
  return isRecord(value) && typeof value.gameId === "string" && typeof value.kind === "string";
}

function playerName(players: readonly MatchPlayerState[], playerId: string | null): string {
  return players.find((player) => player.id === playerId)?.nickname ?? "Oyuncu";
}

function secondsLeft(deadline: number | null, now: number): number {
  return deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));
}

function scoreText(points: number): string {
  return `${points > 0 ? "+" : ""}${points}`;
}

export function Stage7GameControls({
  gameId,
  publicState,
  ownState,
  selfPlayerId,
  players,
  now,
  onSubmit
}: Stage7GameControlsProps): JSX.Element {
  if (!isStage7PublicState(publicState) || !isStage7OwnState(ownState)) {
    return <div className="stage7-controls stage7-empty-state">Oyun sahnesi hazırlanıyor…</div>;
  }

  if (gameId === "gizli-hirsiz" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return <GizliHirsizControls publicState={publicState as GizliHirsizPublicState} ownState={ownState as GizliHirsizOwnState} now={now} onSubmit={onSubmit} />;
  }

  if (gameId === "kor-kronometre" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return <KorKronometreControls publicState={publicState as KorKronometrePublicState} ownState={ownState as KorKronometreOwnState} now={now} onSubmit={onSubmit} />;
  }

  if (gameId === "kor-bomba" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return <KorBombaControls publicState={publicState as KorBombaPublicState} ownState={ownState as KorBombaOwnState} players={players} now={now} onSubmit={onSubmit} />;
  }

  if (gameId === "acgozluluk-limiti" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return <AcgozlulukControls publicState={publicState as AcgozlulukPublicState} ownState={ownState as AcgozlulukOwnState} now={now} onSubmit={onSubmit} />;
  }

  if (gameId === "ortalamanin-yarisi" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return <OrtalamaninYarisiControls publicState={publicState as OrtalamaninYarisiPublicState} ownState={ownState as OrtalamaninYarisiOwnState} now={now} onSubmit={onSubmit} />;
  }

  if (gameId === "gizli-kareler" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return <GizliKarelerControls publicState={publicState as GizliKarelerPublicState} ownState={ownState as GizliKarelerOwnState} now={now} onSubmit={onSubmit} />;
  }

  if (gameId === "cizgiyi-gecme" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return <CizgiyiGecmeControls publicState={publicState as CizgiyiGecmePublicState} ownState={ownState as CizgiyiGecmeOwnState} now={now} onSubmit={onSubmit} />;
  }

  if (gameId === "gizli-alisveris" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return <GizliAlisverisControls publicState={publicState as GizliAlisverisPublicState} ownState={ownState as GizliAlisverisOwnState} now={now} onSubmit={onSubmit} />;
  }

  if (gameId === "asiri-yukleme" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return <AsiriYuklemeControls publicState={publicState as AsiriYuklemePublicState} ownState={ownState as AsiriYuklemeOwnState} onSubmit={onSubmit} />;
  }

  if (gameId === "capraz-ates" && publicState.gameId === gameId && ownState.gameId === gameId) {
    return <CaprazAtesControls publicState={publicState as CaprazAtesPublicState} ownState={ownState as CaprazAtesOwnState} players={players} selfPlayerId={selfPlayerId} now={now} onSubmit={onSubmit} />;
  }

  return <div className="stage7-controls stage7-empty-state">Bu sahne senkronize ediliyor…</div>;
}

function GameTimer({ deadline, now }: { readonly deadline: number | null; readonly now: number }): JSX.Element {
  return <span className="stage7-game-timer"><small>SÜRE</small><b>{secondsLeft(deadline, now)}<em> sn</em></b></span>;
}

function GizliHirsizControls({
  publicState,
  ownState,
  now,
  onSubmit
}: {
  readonly publicState: GizliHirsizPublicState;
  readonly ownState: GizliHirsizOwnState;
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  const winner = publicState.pressedPlayerIds?.length === 1;
  return (
    <div className="stage7-controls stage7-steal-controls" aria-live="polite">
      <div className="stage7-game-heading"><div><span className="stage7-eyebrow">GİZLİ HAMLE</span><strong>Çekirdek açık mı?</strong></div><GameTimer deadline={publicState.endsAt} now={now} /></div>
      <div className="steal-core"><span className="steal-core-ring" /><span className="steal-core-light" /><strong>{publicState.finished ? winner ? "ÇALINDI" : "ALARM" : "BEKLE"}</strong></div>
      <button className="stage7-action-button steal-button" type="button" disabled={ownState.hasPressed || publicState.finished} onClick={() => onSubmit({ kind: "steal" })}>
        <span className="action-button-icon">✦</span><strong>{ownState.hasPressed ? "HAMLE GİZLENDİ" : "ÇAL"}</strong><small>{ownState.hasPressed ? "SONUCU BEKLE" : "TEK HAK"}</small>
      </button>
      <p className="stage7-rule-note">Tek kalan hırsız +1 alır. Birden fazla kişi basarsa basanların her biri −1 alır.</p>
      {publicState.finished && <ResultPills points={publicState.resultPoints ?? []} />}
    </div>
  );
}

function KorKronometreControls({
  publicState,
  ownState,
  now,
  onSubmit
}: {
  readonly publicState: KorKronometrePublicState;
  readonly ownState: KorKronometreOwnState;
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  return (
    <div className="stage7-controls stage7-stopwatch-controls" aria-live="polite">
      <div className="stage7-game-heading"><div><span className="stage7-eyebrow">KÖR KRONOMETRE</span><strong>İçinden say.</strong></div><GameTimer deadline={publicState.endsAt} now={now} /></div>
      <div className="blind-dial"><span className="blind-dial-tick tick-one" /><span className="blind-dial-tick tick-two" /><span className="blind-dial-pulse" /><strong>{publicState.finished ? "SONUÇ" : "?"}</strong><small>{publicState.finished ? "HEDEF: 10,00 SN" : "HEDEF GİZLİ"}</small></div>
      <button className="stage7-action-button stopwatch-button" type="button" disabled={ownState.hasTapped || publicState.finished} onPointerDown={(event) => { event.preventDefault(); onSubmit({ kind: "stopwatch-stop" }); }}>
        <span className="action-button-icon">◉</span><strong>{ownState.hasTapped ? "DURDURULDU" : "ŞİMDİ"}</strong><small>{ownState.hasTapped ? "TEK HAK KULLANILDI" : "10. SANİYEYİ YAKALA"}</small>
      </button>
      <p className="stage7-rule-note">Sayaç görünmez. En yakına +2, ikinci yakına +1 genel skor gider.</p>
    </div>
  );
}

function KorBombaControls({
  publicState,
  ownState,
  players,
  now,
  onSubmit
}: {
  readonly publicState: KorBombaPublicState;
  readonly ownState: KorBombaOwnState;
  readonly players: readonly MatchPlayerState[];
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  return (
    <div className={`stage7-controls stage7-bomb-controls ${ownState.hasBomb ? "is-carrier" : "is-observer"}`} aria-live="polite">
      <div className="stage7-game-heading"><div><span className="stage7-eyebrow">KÖR BOMBA</span><strong>{publicState.finished ? "Patlama oldu." : `${playerName(players, publicState.bombHolderId)} taşıyor`}</strong></div><span className="stage7-pass-count">PAS {publicState.passCount}</span></div>
      <div className="bomb-orb"><span className="bomb-orb-core" /><span className="bomb-orb-ring" /><strong>{publicState.finished ? "BOOM" : ownState.hasBomb ? "?" : "?"}</strong><small>{ownState.hasBomb ? "ZAMANI GÖREMİYORSUN" : publicState.finished ? "SONUÇ" : "FÜZ GİZLİ"}</small></div>
      {ownState.hasBomb ? (
        <div className="bomb-pass-panel"><p>Bombayı hayatta olan başka birine aktar.</p><div className="target-chip-grid">{ownState.targetPlayerIds.filter((playerId) => players.some((player) => player.id === playerId && player.connected && player.currentGameParticipant && !player.eliminated)).map((playerId) => <button className="target-chip" key={playerId} type="button" onClick={() => onSubmit({ kind: "bomb-pass", targetPlayerId: playerId })}>{playerName(players, playerId)}<small>PASLA</small></button>)}</div></div>
      ) : <p className="stage7-rule-note">Taşıyıcının zamanı görmediğini unutma. Konuşarak yönlendirebilirsin.</p>}
      {publicState.finished && <ResultPills points={publicState.resultPoints ?? []} />}
    </div>
  );
}

function AcgozlulukControls({
  publicState,
  ownState,
  now,
  onSubmit
}: {
  readonly publicState: AcgozlulukPublicState;
  readonly ownState: AcgozlulukOwnState;
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  return (
    <div className="stage7-controls stage7-number-controls" aria-live="polite">
      <div className="stage7-game-heading"><div><span className="stage7-eyebrow">AÇGÖZLÜLÜK LİMİTİ</span><strong>Ne kadar risk?</strong></div><GameTimer deadline={publicState.endsAt} now={now} /></div>
      <div className="limit-meter"><span style={{ width: `${Math.min(100, (ownState.selectedValue / Math.max(1, publicState.maxChoice)) * 100)}%` }} /><i style={{ left: `${Math.min(100, (publicState.limit / Math.max(1, publicState.maxChoice)) * 100)}%` }} /></div>
      <div className="number-choice-heading"><span>SEÇİMİN</span><strong>{ownState.selectedValue}</strong><small>ORTAK LİMİT {publicState.limit}</small></div>
      <div className="number-choice-grid">{Array.from({ length: publicState.maxChoice + 1 }, (_, value) => <button className={`number-choice ${ownState.hasSubmitted && ownState.selectedValue === value ? "is-selected" : ""}`} type="button" key={value} disabled={ownState.hasSubmitted || publicState.finished} onClick={() => onSubmit({ kind: "limit-value", value })}>{value}</button>)}</div>
      <p className="stage7-rule-note">Toplam limit aşılmazsa yazdığın kadar puan alırsın. Aşılırsa herkes 0 alır.</p>
    </div>
  );
}

function NumberSlider({
  label,
  value,
  setValue,
  disabled
}: {
  readonly label: string;
  readonly value: number;
  readonly setValue: (value: number) => void;
  readonly disabled: boolean;
}): JSX.Element {
  return <label className="number-slider"><span><small>{label}</small><b>{value}</b></span><input type="range" min="0" max="100" step="1" value={value} disabled={disabled} onChange={(event) => setValue(Number(event.target.value))} /><span className="slider-scale"><i>0</i><i>50</i><i>100</i></span></label>;
}

function OrtalamaninYarisiControls({
  publicState,
  ownState,
  now,
  onSubmit
}: {
  readonly publicState: OrtalamaninYarisiPublicState;
  readonly ownState: OrtalamaninYarisiOwnState;
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  const [value, setValue] = useState(ownState.selectedValue ?? 50);
  useEffect(() => { if (ownState.selectedValue !== null) setValue(ownState.selectedValue); }, [ownState.selectedValue]);
  return (
    <div className="stage7-controls stage7-average-controls" aria-live="polite">
      <div className="stage7-game-heading"><div><span className="stage7-eyebrow">ORTALAMANIN YARISI</span><strong>Hedefi sez.</strong></div><GameTimer deadline={publicState.endsAt} now={now} /></div>
      <NumberSlider label="GİZLİ SAYIN" value={value} setValue={setValue} disabled={ownState.hasSubmitted || publicState.finished} />
      <button className="stage7-primary-button" type="button" disabled={ownState.hasSubmitted || publicState.finished} onClick={() => onSubmit({ kind: "average-value", value })}>{ownState.hasSubmitted ? "SAYI GÖNDERİLDİ" : "SAYIYI KİLİTLE"}</button>
      <p className="stage7-rule-note">Sistem ortalamanın yarısını hedef yapar. En yakına +2, ikinci yakına +1.</p>
    </div>
  );
}

function GizliKarelerControls({
  publicState,
  ownState,
  now,
  onSubmit
}: {
  readonly publicState: GizliKarelerPublicState;
  readonly ownState: GizliKarelerOwnState;
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  return (
    <div className="stage7-controls stage7-grid-controls" aria-live="polite">
      <div className="stage7-game-heading"><div><span className="stage7-eyebrow">GİZLİ KARELER</span><strong>Tek kare seç.</strong></div><span className="stage7-round-chip">RAUNT {publicState.round}/2</span></div>
      <div className="grid-round-line"><span className="grid-round-dot is-live" /><strong>{secondsLeft(publicState.roundEndsAt, now)} sn</strong><small>{publicState.gridSize}×{publicState.gridSize} ızgara · seçimler gizli</small></div>
      {ownState.eliminated ? <div className="stage7-spectator-card">BU RAUNTTAN ELENDİN<small>Diğer oyuncuların hamlesini izliyorsun.</small></div> : <div className={`secret-grid secret-grid-${publicState.gridSize}`}>{Array.from({ length: publicState.cellCount }, (_, cell) => <button className={`secret-grid-cell ${ownState.selectedCell === cell ? "is-selected" : ""}`} type="button" key={cell} disabled={!ownState.canSelect || publicState.finished} onClick={() => onSubmit({ kind: "grid-cell", cell })}><span /></button>)}</div>}
      <p className="stage7-rule-note">Aynı kareye basanlar elenir. Her rauntta tek kalan oyuncu +1 alır.</p>
    </div>
  );
}

function CizgiyiGecmeControls({
  publicState,
  ownState,
  now,
  onSubmit
}: {
  readonly publicState: CizgiyiGecmePublicState;
  readonly ownState: CizgiyiGecmeOwnState;
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  const [value, setValue] = useState(70);
  useEffect(() => { if (ownState.selectedValue !== null) setValue(ownState.selectedValue); }, [ownState.selectedValue]);
  return (
    <div className="stage7-controls stage7-risk-controls" aria-live="polite">
      <div className="stage7-game-heading"><div><span className="stage7-eyebrow">ÇİZGİYİ GEÇME</span><strong>Riskini seç.</strong></div><GameTimer deadline={publicState.endsAt} now={now} /></div>
      <NumberSlider label="GİZLİ RİSK DEĞERİN" value={value} setValue={setValue} disabled={ownState.hasSubmitted || publicState.finished} />
      <div className="risk-track"><span /><i /><b>100</b></div>
      <button className="stage7-primary-button" type="button" disabled={ownState.hasSubmitted || publicState.finished} onClick={() => onSubmit({ kind: "risk-value", value })}>{ownState.hasSubmitted ? "RİSK KİLİTLENDİ" : "RİSKİ KİLİTLE"}</button>
      <p className="stage7-rule-note">Aynı onluk bölgeye girenler pasif kalır. Benzersiz en yüksek risk +2 alır.</p>
    </div>
  );
}

function GizliAlisverisControls({
  publicState,
  ownState,
  now,
  onSubmit
}: {
  readonly publicState: GizliAlisverisPublicState;
  readonly ownState: GizliAlisverisOwnState;
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  const selected = new Set(ownState.cartProductIds);
  return (
    <div className="stage7-controls stage7-shop-controls" aria-live="polite">
      <div className="stage7-game-heading"><div><span className="stage7-eyebrow">GİZLİ ALIŞVERİŞ</span><strong>Sepetini kur.</strong></div><span className="shop-budget"><b>{ownState.remainingBudget}</b><small>/ 60 KREDİ</small></span></div>
      <div className="shop-progress"><span style={{ width: `${Math.min(100, (ownState.spent / publicState.budget) * 100)}%` }} /></div>
      <div className="shop-product-grid">{publicState.products.map((product) => { const isSelected = selected.has(product.id); const canAdd = isSelected || ownState.remainingBudget >= product.price; return <button className={`shop-product ${isSelected ? "is-selected" : ""}`} type="button" key={product.id} disabled={publicState.finished || !canAdd} onClick={() => onSubmit({ kind: "shopping-toggle", productId: product.id })}><span className="product-glyph">✦</span><strong>{product.name}</strong><small>{product.price} KREDİ</small><i>{isSelected ? "SEPETTE" : "EKLE"}</i></button>; })}</div>
      <p className="stage7-rule-note">Ürünler tur sonunda açılır. Az kişinin aldığı ürün sepetinde daha değerli olur.</p>
      <GameTimer deadline={publicState.endsAt} now={now} />
    </div>
  );
}

function AsiriYuklemeControls({
  publicState,
  ownState,
  onSubmit
}: {
  readonly publicState: AsiriYuklemePublicState;
  readonly ownState: AsiriYuklemeOwnState;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  return (
    <div className={`stage7-controls stage7-overload-controls ${publicState.armed ? "is-armed" : ""}`} aria-live="polite">
      <div className="stage7-game-heading"><div><span className="stage7-eyebrow">AŞIRI YÜKLEME</span><strong>{publicState.armed ? "Çekirdek tetikte." : "Ortak enerjiyi doldur."}</strong></div><span className="overload-count"><b>{ownState.clickCount}</b><small>SENİN TIKIN</small></span></div>
      <div className="overload-reactor"><span className="overload-reactor-ring" /><span className="overload-reactor-core" /><strong>{publicState.finished ? publicState.explodedPlayerId ? "PATLADI" : "KAPANDI" : publicState.armed ? "100" : `${publicState.energy}`}</strong><small>{publicState.armed ? "GİZLİ TEHLİKE" : "ENERJİ"}</small></div>
      <div className="overload-meter"><span style={{ width: `${publicState.energy}%` }} /></div>
      <button className="stage7-action-button overload-button" type="button" disabled={publicState.finished || ownState.exploded} onPointerDown={(event) => { event.preventDefault(); onSubmit({ kind: "overload-click" }); }}><span className="action-button-icon">+</span><strong>{ownState.exploded ? "PATLADIN" : "TIKLA"}</strong><small>{publicState.armed ? "BİR TIK FAZLA" : "SINIRI ZORLA"}</small></button>
      <p className="stage7-rule-note">100'e ulaştıktan sonra görünmeyen 3 saniyelik tehlike başlar. Fazla tıklayan patlar.</p>
    </div>
  );
}

function CaprazAtesControls({
  publicState,
  ownState,
  players,
  selfPlayerId,
  now,
  onSubmit
}: {
  readonly publicState: CaprazAtesPublicState;
  readonly ownState: CaprazAtesOwnState;
  readonly players: readonly MatchPlayerState[];
  readonly selfPlayerId: string | null;
  readonly now: number;
  readonly onSubmit: (payload: JsonValue) => void;
}): JSX.Element {
  return (
    <div className="stage7-controls stage7-crossfire-controls" aria-live="polite">
      <div className="stage7-game-heading"><div><span className="stage7-eyebrow">ÇAPRAZ ATEŞ</span><strong>{ownState.hasSubmitted ? "Hedef kilitli." : "Bir hedef seç."}</strong></div><GameTimer deadline={publicState.endsAt} now={now} /></div>
      <div className="crosshair-core"><span /><strong>{ownState.hasSubmitted ? "KİLİTLİ" : "HEDEF"}</strong><small>HEDEFLER GİZLİ</small></div>
      <div className="crossfire-target-grid">{ownState.availableTargetIds.filter((playerId) => players.some((player) => player.id === playerId && player.connected && player.currentGameParticipant && !player.eliminated)).map((playerId) => <button className={`crossfire-target ${ownState.selectedTargetId === playerId ? "is-selected" : ""}`} type="button" key={playerId} disabled={ownState.hasSubmitted || publicState.finished} onClick={() => onSubmit({ kind: "crossfire-target", targetPlayerId: playerId })}><span>{playerName(players, playerId).slice(0, 1).toUpperCase()}</span><strong>{playerName(players, playerId)}</strong><small>{ownState.selectedTargetId === playerId ? "HEDEF" : "SEÇ"}</small></button>)}</div>
      {!ownState.hasSubmitted && <button className="crossfire-miss-button" type="button" disabled={publicState.finished} onClick={() => onSubmit({ kind: "crossfire-miss" })}>BOŞA SIK</button>}
      <p className="stage7-rule-note">Karşılıklı hedeflerde mermiler çarpışır. Hedeflenmeyen saldırgan +1, hedeflenen oyuncu −1.</p>
      <span className="crossfire-self-note">{selfPlayerId ? "KENDİNİ HEDEFLEYEMEZSİN" : "HEDEFLER GİZLİ"}</span>
    </div>
  );
}

function ResultPills({ points }: { readonly points: readonly { readonly playerId: string; readonly points: number }[] }): JSX.Element {
  return <div className="stage7-result-pills">{points.map((entry) => <span key={entry.playerId}><b>{scoreText(entry.points)}</b></span>)}</div>;
}
