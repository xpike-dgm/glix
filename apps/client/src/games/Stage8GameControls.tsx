import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import type {
  CagrisimAgiOwnState,
  CagrisimAgiPublicState,
  DrawingColor,
  DrawingStroke,
  IttifakOwnState,
  IttifakPublicState,
  JsonValue,
  KaralamaDefteriOwnState,
  KaralamaDefteriPublicState,
  KendimOwnState,
  KendimPublicState,
  KontrolPaneliOwnState,
  KontrolPaneliPublicState,
  MatchPlayerState,
  RpsChoice,
  RusvetDarbeOwnState,
  RusvetDarbePublicState,
  SozlukBlofuOwnState,
  SozlukBlofuPublicState,
  Stage8GameId,
  Stage8OwnState,
  Stage8PublicState,
  YaziYazOwnState,
  YaziYazPublicState,
  ZehirliKadehOwnState,
  ZehirliKadehPublicState
} from "@glix/shared";

interface Stage8GameControlsProps {
  readonly gameId: Stage8GameId;
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

function isStage8PublicState(value: unknown): value is Stage8PublicState {
  return isRecord(value) && typeof value.gameId === "string" && typeof value.kind === "string";
}

function isStage8OwnState(value: unknown): value is Stage8OwnState {
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

function GameTimer({ deadline, now }: { readonly deadline: number | null; readonly now: number }): JSX.Element {
  return <span className="stage8-game-timer"><small>SÜRE</small><b>{secondsLeft(deadline, now)}<em> sn</em></b></span>;
}

function GameHeading({ label, title, deadline, now }: { readonly label: string; readonly title: string; readonly deadline: number | null; readonly now: number }): JSX.Element {
  return <div className="stage8-game-heading"><div><span className="stage8-eyebrow">{label}</span><strong>{title}</strong></div><GameTimer deadline={deadline} now={now} /></div>;
}

function ResultPills({ points }: { readonly points: readonly { readonly playerId: string; readonly points: number }[] }): JSX.Element {
  return <div className="stage8-result-pills">{points.map((entry) => <span key={entry.playerId}><b>{scoreText(entry.points)}</b><small>{entry.playerId.slice(0, 4).toUpperCase()}</small></span>)}</div>;
}

function PlayerChoiceGrid({ players, selfPlayerId, disabled, selectedPlayerId, onChoose }: { readonly players: readonly MatchPlayerState[]; readonly selfPlayerId: string | null; readonly disabled: boolean; readonly selectedPlayerId: string | null; readonly onChoose: (playerId: string) => void }): JSX.Element {
  return <div className="stage8-player-choice-grid">{players.filter((player) => player.id !== selfPlayerId && !player.eliminated).map((player, index) => <button className={`stage8-player-choice ${selectedPlayerId === player.id ? "is-selected" : ""}`} type="button" key={player.id} disabled={disabled} onClick={() => onChoose(player.id)}><span className={`avatar avatar-${(index % 8) + 1}`}>{player.nickname.slice(0, 1).toUpperCase()}</span><strong>{player.nickname}</strong></button>)}</div>;
}

export function Stage8GameControls({ gameId, publicState, ownState, selfPlayerId, players, now, onSubmit }: Stage8GameControlsProps): JSX.Element {
  if (!isStage8PublicState(publicState) || !isStage8OwnState(ownState) || publicState.gameId !== gameId || ownState.gameId !== gameId) {
    return <div className="stage8-controls stage8-empty-state">Oyun sahnesi hazırlanıyor…</div>;
  }

  switch (gameId) {
    case "yazi-yaz":
      return <YaziYazControls publicState={publicState as YaziYazPublicState} ownState={ownState as YaziYazOwnState} players={players} now={now} onSubmit={onSubmit} />;
    case "kendim":
      return <KendimControls publicState={publicState as KendimPublicState} ownState={ownState as KendimOwnState} players={players} selfPlayerId={selfPlayerId} now={now} onSubmit={onSubmit} />;
    case "sozluk-blofu":
      return <SozlukControls publicState={publicState as SozlukBlofuPublicState} ownState={ownState as SozlukBlofuOwnState} now={now} onSubmit={onSubmit} />;
    case "cagrisim-agi":
      return <CagrisimControls publicState={publicState as CagrisimAgiPublicState} ownState={ownState as CagrisimAgiOwnState} now={now} onSubmit={onSubmit} />;
    case "rusvet-darbe":
      return <RusvetControls publicState={publicState as RusvetDarbePublicState} ownState={ownState as RusvetDarbeOwnState} players={players} selfPlayerId={selfPlayerId} now={now} onSubmit={onSubmit} />;
    case "karalama-defteri":
      return <KaralamaControls publicState={publicState as KaralamaDefteriPublicState} ownState={ownState as KaralamaDefteriOwnState} players={players} selfPlayerId={selfPlayerId} now={now} onSubmit={onSubmit} />;
    case "ittifak":
      return <IttifakControls publicState={publicState as IttifakPublicState} ownState={ownState as IttifakOwnState} players={players} selfPlayerId={selfPlayerId} now={now} onSubmit={onSubmit} />;
    case "kontrol-paneli-kaosu":
      return <PanelControls publicState={publicState as KontrolPaneliPublicState} ownState={ownState as KontrolPaneliOwnState} now={now} onSubmit={onSubmit} />;
    case "zehirli-kadeh":
      return <GlassControls publicState={publicState as ZehirliKadehPublicState} ownState={ownState as ZehirliKadehOwnState} players={players} selfPlayerId={selfPlayerId} now={now} onSubmit={onSubmit} />;
  }
}

function YaziYazControls({ publicState, ownState, players, now, onSubmit }: { readonly publicState: YaziYazPublicState; readonly ownState: YaziYazOwnState; readonly players: readonly MatchPlayerState[]; readonly now: number; readonly onSubmit: (payload: JsonValue) => void }): JSX.Element {
  const [word, setWord] = useState(ownState.assignedWord ?? "");
  const [targetWriterId, setTargetWriterId] = useState(ownState.guessTargetPlayerIds[0] ?? "");
  const [targetWord, setTargetWord] = useState("");
  const canWrite = publicState.subPhase === "write" && !publicState.finished;
  const canGuess = publicState.subPhase === "guess" && ownState.canGuess;
  return <div className="stage8-controls stage8-yazi-controls" aria-live="polite">
    <GameHeading label="GİZLİ YAZI" title={publicState.subPhase === "discussion" ? "Sözlü tartışma" : publicState.subPhase === "guess" ? "Bir yazan seç" : ownState.role === "writer" ? "Kelime bırak" : "Masum görün"} deadline={publicState.phaseEndsAt} now={now} />
    {canWrite && <div className="stage8-form-panel"><span className="stage8-panel-kicker">{ownState.role === "writer" ? "YAZAN GÖREVİ" : "MASUM GÖREVİ"}</span>{ownState.role === "writer" ? <input className="stage8-text-input" value={word} maxLength={40} placeholder="Kendi kelimeni yaz" onChange={(event) => setWord(event.target.value.toLocaleUpperCase("tr-TR"))} /> : <div className="stage8-secret-chip">MASUM</div>}<button className="stage8-action-button" type="button" disabled={ownState.hasWritten} onClick={() => onSubmit(ownState.role === "writer" ? { kind: "yazi-word", word } : { kind: "yazi-masum" })}>{ownState.hasWritten ? "GİRDİ ALINDI" : "GİZLİCE GÖNDER"}</button></div>}
    {publicState.subPhase === "discussion" && <div className="stage8-discussion-card"><span className="stage8-orbit-mark">✦</span><strong>60 saniye sözlü tartışma</strong><p>Telefonlar ipucu vermez. Kim yazan olabilir, kelimeler ne söylüyor; arkadaşlarınla konuş.</p></div>}
    {canGuess && <div className="stage8-form-panel"><span className="stage8-panel-kicker">TAHMİNİN</span><label className="stage8-field"><small>YAZAN</small><select value={targetWriterId} onChange={(event) => setTargetWriterId(event.target.value)}>{ownState.guessTargetPlayerIds.map((playerId) => <option key={playerId} value={playerId}>{playerName(players, playerId)}</option>)}</select></label><input className="stage8-text-input" value={targetWord} placeholder="O yazanın kelimesi" onChange={(event) => setTargetWord(event.target.value)} /><button className="stage8-action-button" type="button" disabled={!targetWriterId || !targetWord.trim()} onClick={() => onSubmit({ kind: "yazi-guess", targetWriterId, targetWord })}>TAHMİNİ GÖNDER</button></div>}
    {publicState.subPhase === "guess" && !canGuess && <div className="stage8-wait-card">Tahminin gönderildi; sonuç ekranında iki puan ayrı ayrı değerlendirilecek.</div>}
    {publicState.finished && <><div className="stage8-result-list">{(publicState.guesses ?? []).map((guess) => <div className="stage8-result-row" key={guess.playerId}><strong>{playerName(players, guess.playerId)}</strong><span>{guess.personCorrect ? "YAZAN ✓" : "YAZAN —"}</span><span>{guess.wordCorrect ? "KELİME ✓" : "KELİME —"}</span><b>{scoreText(guess.points)}</b></div>)}</div><ResultPills points={publicState.resultPoints ?? []} /></>}
  </div>;
}

function KendimControls({ publicState, ownState, players, selfPlayerId, now, onSubmit }: { readonly publicState: KendimPublicState; readonly ownState: KendimOwnState; readonly players: readonly MatchPlayerState[]; readonly selfPlayerId: string | null; readonly now: number; readonly onSubmit: (payload: JsonValue) => void }): JSX.Element {
  const [word, setWord] = useState(ownState.ownWord ?? "");
  const [matches, setMatches] = useState<Record<string, string>>({});
  const cards = publicState.cards ?? [];
  return <div className="stage8-controls" aria-live="polite">
    <GameHeading label="KELİME KARTLARI" title={publicState.subPhase === "write" ? "Kendini tek kelimeyle anlat" : "Kartları portrelere bağla"} deadline={publicState.phaseEndsAt} now={now} />
    {publicState.subPhase === "write" && <div className="stage8-form-panel"><span className="stage8-panel-kicker">SADECE SEN GÖRÜRSÜN</span><input className="stage8-text-input" value={word} placeholder="Seni anlatan bir kelime" onChange={(event) => setWord(event.target.value)} /><button className="stage8-action-button" type="button" disabled={ownState.hasWritten || !word.trim()} onClick={() => onSubmit({ kind: "kendim-word", word })}>{ownState.hasWritten ? "KELİME KİLİTLENDİ" : "KELİMEYİ GÖNDER"}</button></div>}
    {publicState.subPhase === "match" && <div className="stage8-card-match-list">{cards.map((card) => <label className={`stage8-word-card ${card.cardId === ownState.ownCardId ? "is-own-card" : ""}`} key={card.cardId}><span>{card.word}</span><small>{card.cardId === ownState.ownCardId ? "KENDİ KARTIN" : "KİMİN?"}</small><select value={matches[card.cardId] ?? ""} onChange={(event) => setMatches((previous) => ({ ...previous, [card.cardId]: event.target.value }))}><option value="">Eşleştirme yok</option>{players.filter((player) => !player.eliminated).map((player) => <option key={player.id} value={player.id} disabled={card.cardId === ownState.ownCardId && player.id === selfPlayerId}>{player.nickname}</option>)}</select></label>)}<button className="stage8-action-button" type="button" disabled={ownState.hasSubmittedMatches} onClick={() => onSubmit({ kind: "kendim-matches", matches: Object.entries(matches).filter(([, targetPlayerId]) => targetPlayerId).map(([cardId, targetPlayerId]) => ({ cardId, targetPlayerId })) })}>{ownState.hasSubmittedMatches ? "EŞLEŞTİRMELER ALINDI" : "SEÇİMLERİ GÖNDER"}</button><p className="stage8-rule-note">Kart bırakmak serbest. Kendi kelime kartını kendinle eşleştiremezsin.</p></div>}
    {publicState.finished && <><div className="stage8-result-list">{(publicState.matchResults ?? []).map((result, index) => <div className="stage8-result-row" key={`${result.guesserId}-${result.cardId}-${index}`}><strong>{playerName(players, result.guesserId)}</strong><span>{result.correct ? "DOĞRU" : "YANLIŞ"}</span><b>{scoreText(result.points)}</b></div>)}</div><p className="stage8-rule-note">Tek doğru eşleşen kart sahipleri: {(publicState.ownerBonusPlayerIds ?? []).map((id) => playerName(players, id)).join(", ") || "yok"}.</p><ResultPills points={publicState.resultPoints ?? []} /></>}
  </div>;
}

function SozlukControls({ publicState, ownState, now, onSubmit }: { readonly publicState: SozlukBlofuPublicState; readonly ownState: SozlukBlofuOwnState; readonly now: number; readonly onSubmit: (payload: JsonValue) => void }): JSX.Element {
  const [bluff, setBluff] = useState(ownState.bluffText ?? "");
  const [choice, setChoice] = useState("");
  const choices = publicState.definitions ?? [];
  return <div className="stage8-controls" aria-live="polite">
    <GameHeading label="SÖZLÜK BLÖFÜ" title={publicState.subPhase === "write" ? publicState.word : "Gerçek tanımı bul"} deadline={publicState.phaseEndsAt} now={now} />
    {publicState.subPhase === "write" && <div className="stage8-form-panel"><span className="stage8-panel-kicker">SAHTE TANIM / EN FAZLA 100 KARAKTER</span><textarea className="stage8-text-area" maxLength={100} value={bluff} placeholder="İnandırıcı bir tanım uydur" onChange={(event) => setBluff(event.target.value)} /><div className="stage8-character-count">{bluff.length} / 100</div><button className="stage8-action-button" type="button" disabled={ownState.hasWritten || !bluff.trim()} onClick={() => onSubmit({ kind: "dictionary-bluff", text: bluff })}>{ownState.hasWritten ? "BLÖF KİLİTLENDİ" : "BLÖFÜ GÖNDER"}</button></div>}
    {publicState.subPhase === "choose" && <div className="stage8-definition-list">{choices.map((definition) => <button className={`stage8-definition-card ${choice === definition.id ? "is-selected" : ""}`} type="button" key={definition.id} onClick={() => setChoice(definition.id)}><span>#{definition.id.slice(0, 4).toUpperCase()}</span><strong>{definition.text}</strong></button>)}<button className="stage8-action-button" type="button" disabled={ownState.hasChosen || !choice} onClick={() => onSubmit({ kind: "dictionary-choice", definitionId: choice })}>{ownState.hasChosen ? "SEÇİM ALINDI" : "TANIMI SEÇ"}</button></div>}
    {publicState.finished && <><div className="stage8-definition-list">{choices.map((definition) => <div className={`stage8-definition-card result ${definition.isReal ? "is-real" : ""}`} key={definition.id}><span>{definition.isReal ? "GERÇEK TANIM" : "BLÖF"}</span><strong>{definition.text}</strong><small>{definition.selectedByPlayerIds.map((id) => id.slice(0, 4).toUpperCase()).join(" · ") || "SEÇİLMEDİ"}</small></div>)}</div><ResultPills points={publicState.resultPoints ?? []} /></>}
  </div>;
}

function CagrisimControls({ publicState, ownState, now, onSubmit }: { readonly publicState: CagrisimAgiPublicState; readonly ownState: CagrisimAgiOwnState; readonly now: number; readonly onSubmit: (payload: JsonValue) => void }): JSX.Element {
  const [answer, setAnswer] = useState(ownState.answer ?? "");
  return <div className="stage8-controls stage8-association-controls" aria-live="polite">
    <GameHeading label="ÇAĞRIŞIM AĞI" title={publicState.mainWord} deadline={publicState.phaseEndsAt} now={now} />
    {publicState.subPhase === "answer" && <div className="stage8-form-panel"><span className="stage8-panel-kicker">TEK ÇAĞRIŞIM / ZORUNLU</span><input className="stage8-text-input" value={answer} placeholder="Aklına gelen ilk kelime" onChange={(event) => setAnswer(event.target.value)} /><button className="stage8-action-button" type="button" disabled={ownState.hasSubmitted || !answer.trim()} onClick={() => onSubmit({ kind: "association", answer })}>{ownState.hasSubmitted ? "AĞA EKLENDİ" : "ÇAĞRIŞIMI GÖNDER"}</button></div>}
    {publicState.subPhase === "answer" && ownState.hasSubmitted && <div className="stage8-wait-card">Cevabın gizli tutuluyor. Aynı kelimeyi kimlerin verdiği sonuçta açılacak.</div>}
    {publicState.finished && <><div className="stage8-group-list">{(publicState.groups ?? []).map((group) => <div className={`stage8-group-card ${group.points > 0 ? "is-group" : ""}`} key={group.answer}><strong>{group.answer}</strong><span>{group.playerIds.length} kişi / kişi başı {group.points} puan</span></div>)}</div><ResultPills points={publicState.resultPoints ?? []} /></>}
  </div>;
}

function RusvetControls({ publicState, ownState, players, selfPlayerId, now, onSubmit }: { readonly publicState: RusvetDarbePublicState; readonly ownState: RusvetDarbeOwnState; readonly players: readonly MatchPlayerState[]; readonly selfPlayerId: string | null; readonly now: number; readonly onSubmit: (payload: JsonValue) => void }): JSX.Element {
  const [voteTarget, setVoteTarget] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const candidates = players.filter((player) => player.id !== selfPlayerId && !player.eliminated);
  const allocationTotal = Object.values(allocations).reduce((sum, value) => sum + value, 0);
  const addAllocation = (playerId: string): void => setAllocations((previous) => ({ ...previous, [playerId]: (previous[playerId] ?? 0) >= 2 ? 0 : (previous[playerId] ?? 0) + 1 }));
  return <div className="stage8-controls" aria-live="polite">
    <GameHeading label="RÜŞVET VE DARBE" title={publicState.subPhase === "election" ? "Başkanı seç" : publicState.subPhase === "rps" ? "Darbe düellosu" : ownState.isPresident ? "Jetonlarını dağıt" : publicState.presidentId ? `${playerName(players, publicState.presidentId)} başkan` : "Sonuç bekleniyor"} deadline={publicState.phaseEndsAt} now={now} />
    {publicState.subPhase === "election" && <><PlayerChoiceGrid players={players} selfPlayerId={selfPlayerId} disabled={ownState.hasVoted} selectedPlayerId={voteTarget} onChoose={setVoteTarget} /><button className="stage8-action-button" type="button" disabled={ownState.hasVoted || !voteTarget} onClick={() => voteTarget && onSubmit({ kind: "president-vote", targetPlayerId: voteTarget })}>{ownState.hasVoted ? "OY GİZLENDİ" : "OYUMU VER"}</button><p className="stage8-rule-note">Kendine oy yok. Eksik oylar süre bitince sunucu tarafından rastgele tamamlanır.</p></>}
    {publicState.subPhase === "rps" && <div className="stage8-rps-panel"><span className="stage8-panel-kicker">EŞİT OYLAR / EL {publicState.rpsRound}</span><div className="stage8-rps-grid">{(["rock", "paper", "scissors"] as const).map((choice) => <button className="stage8-rps-button" type="button" key={choice} disabled={!ownState.canChooseRps || ownState.hasChosenRps} onClick={() => onSubmit({ kind: "rps-choice", choice })}>{choice === "rock" ? "✊ TAŞ" : choice === "paper" ? "✋ KAĞIT" : "✌ MAKAS"}</button>)}</div><p className="stage8-rule-note">Adaylar aynı anda taş-kağıt-makas oynar. Sonuç yoksa yeni el açılır.</p></div>}
    {publicState.subPhase === "distribution" && (ownState.isPresident ? <div className="stage8-form-panel"><span className="stage8-panel-kicker">DAĞITILACAK JETON / {ownState.remainingDistributionPoints} KALDI</span><div className="stage8-allocation-grid">{candidates.map((player) => <button className={`stage8-allocation-button ${allocations[player.id] ? "is-selected" : ""}`} type="button" key={player.id} onClick={() => addAllocation(player.id)}><strong>{player.nickname}</strong><small>{allocations[player.id] ?? 0} PUAN</small></button>)}</div><button className="stage8-action-button" type="button" disabled={ownState.submittedAllocations.length > 0 || allocationTotal > ownState.remainingDistributionPoints} onClick={() => onSubmit({ kind: "president-distribution", allocations: Object.entries(allocations).filter(([, points]) => points > 0).map(([targetPlayerId, points]) => ({ targetPlayerId, points })) })}>{ownState.submittedAllocations.length > 0 ? "DAĞITIM ALINDI" : "DAĞITIMI GÖNDER"}</button><p className="stage8-rule-note">Bir oyuncuya en fazla 2 puan. Süre sonunda kalan jetonlar rastgele dağılır.</p></div> : <div className="stage8-wait-card">Başkan rüşvet jetonlarını dağıtıyor. Sonuçlar gizli tutuluyor.</div>)}
    {publicState.finished && <><div className="stage8-result-list">{(publicState.voteCounts ?? []).map((entry) => <div className="stage8-result-row" key={entry.playerId}><strong>{playerName(players, entry.playerId)}</strong><span>{entry.votes} OY</span><b>{publicState.allocations?.filter((allocation) => allocation.targetPlayerId === entry.playerId).reduce((sum, allocation) => sum + allocation.points, 0) ?? 0} JETON</b></div>)}</div><ResultPills points={publicState.resultPoints ?? []} /></>}
  </div>;
}

function DrawingBoard({ strokes, disabled, onSave }: { readonly strokes: readonly DrawingStroke[]; readonly disabled: boolean; readonly onSave?: (strokes: readonly DrawingStroke[]) => void }): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [localStrokes, setLocalStrokes] = useState<DrawingStroke[]>([...strokes]);
  const [activeStroke, setActiveStroke] = useState<DrawingStroke | null>(null);
  const [color, setColor] = useState<DrawingColor>("cyan");
  const [size, setSize] = useState(12);
  const allStrokes = activeStroke ? [...localStrokes, activeStroke] : localStrokes;
  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => { const rect = event.currentTarget.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) }; };
  const repaint = (canvas: HTMLCanvasElement | null, paintStrokes: readonly DrawingStroke[]): void => { if (!canvas) return; const context = canvas.getContext("2d"); if (!context) return; const rect = canvas.getBoundingClientRect(); context.clearRect(0, 0, canvas.width, canvas.height); context.fillStyle = "#070b1e"; context.fillRect(0, 0, canvas.width, canvas.height); paintStrokes.forEach((stroke) => { context.strokeStyle = stroke.color === "cyan" ? "#72f4ff" : stroke.color === "pink" ? "#ff55d8" : stroke.color === "yellow" ? "#ffc857" : stroke.color === "lime" ? "#a8f46a" : stroke.color === "orange" ? "#ff9566" : "#ad8cff"; context.lineWidth = stroke.size * (canvas.width / Math.max(1, rect.width)); context.lineCap = "round"; context.lineJoin = "round"; context.beginPath(); stroke.points.forEach((point, index) => { const x = point.x * canvas.width; const y = point.y * canvas.height; if (index === 0) context.moveTo(x, y); else context.lineTo(x, y); }); context.stroke(); }); };
  useEffect(() => { repaint(canvasRef.current, allStrokes); }, [allStrokes]);
  const finishStroke = (): void => { if (activeStroke && activeStroke.points.length >= 2) setLocalStrokes((previous) => [...previous, activeStroke]); setActiveStroke(null); };
  return <div className="stage8-drawing-pad"><canvas ref={(canvas) => { canvasRef.current = canvas; }} width={720} height={440} className="stage8-drawing-canvas" onPointerDown={(event) => { if (disabled) return; event.currentTarget.setPointerCapture(event.pointerId); setActiveStroke({ color, size, points: [pointFromEvent(event)] }); }} onPointerMove={(event) => { if (!activeStroke || disabled) return; const point = pointFromEvent(event); setActiveStroke((previous) => previous ? { ...previous, points: [...previous.points, point] } : previous); }} onPointerUp={finishStroke} onPointerCancel={finishStroke} />{!disabled && <><div className="stage8-drawing-tools"><button type="button" className="stage8-eraser-button" onClick={() => { setLocalStrokes([]); setActiveStroke(null); }}>SİL</button>{(["cyan", "pink", "yellow", "lime", "orange", "violet"] as const).map((paintColor) => <button type="button" key={paintColor} className={`stage8-color-dot color-${paintColor} ${color === paintColor ? "is-selected" : ""}`} aria-label={paintColor} onClick={() => setColor(paintColor)} />)}<input aria-label="Kalem kalınlığı" type="range" min="4" max="24" value={size} disabled={false} onChange={(event) => setSize(Number(event.target.value))} /></div><button className="stage8-action-button" type="button" onClick={() => onSave?.(localStrokes)}>ÇİZİMİ KAYDET</button></>}</div>;
}

function KaralamaControls({ publicState, ownState, players, selfPlayerId, now, onSubmit }: { readonly publicState: KaralamaDefteriPublicState; readonly ownState: KaralamaDefteriOwnState; readonly players: readonly MatchPlayerState[]; readonly selfPlayerId: string | null; readonly now: number; readonly onSubmit: (payload: JsonValue) => void }): JSX.Element {
  const [strokes, setStrokes] = useState<readonly DrawingStroke[]>([]);
  const [voteTarget, setVoteTarget] = useState<string | null>(null);
  return <div className="stage8-controls stage8-drawing-controls" aria-live="polite">
    <GameHeading label="KARALAMA DEFTERİ" title={publicState.subPhase === "draw" ? ownState.assignedWord ?? "Gizli kelime" : "Bilgisizi bul"} deadline={publicState.phaseEndsAt} now={now} />
    {publicState.subPhase === "draw" && <><div className={`stage8-secret-word ${ownState.role === "ignorant" ? "is-near" : ""}`}><small>{ownState.role === "ignorant" ? "YAKIN KELİME" : "ANA KELİME"}</small><strong>{ownState.assignedWord}</strong></div><DrawingBoard strokes={strokes} disabled={false} onSave={(nextStrokes) => { setStrokes(nextStrokes); onSubmit({ kind: "drawing-save", strokes: nextStrokes.map((stroke) => ({ color: stroke.color, size: stroke.size, points: stroke.points.map((point) => ({ x: point.x, y: point.y })) })) as unknown as JsonValue }); }} /><p className="stage8-rule-note">Kalem, altı renk ve silgi var. Süre bitene kadar çizimini güncelleyebilirsin.</p></>}
    {publicState.subPhase === "vote" && <div className="stage8-gallery">{(publicState.drawings ?? []).map((drawing) => <div className="stage8-gallery-card" key={drawing.playerId}><DrawingBoard strokes={drawing.strokes} disabled /><strong>{playerName(players, drawing.playerId)}</strong></div>)}<PlayerChoiceGrid players={players} selfPlayerId={selfPlayerId} disabled={ownState.hasVoted} selectedPlayerId={voteTarget} onChoose={setVoteTarget} /><button className="stage8-action-button" type="button" disabled={ownState.hasVoted || !voteTarget} onClick={() => voteTarget && onSubmit({ kind: "drawing-vote", targetPlayerId: voteTarget })}>{ownState.hasVoted ? "OY GİZLENDİ" : "BİLGİSİZİ OYLA"}</button></div>}
    {publicState.finished && <><div className="stage8-result-callout"><strong>{publicState.outsiderCaught ? "BİLGİSİZ YAKALANDI" : "BİLGİSİZ KURTULDU"}</strong><span>{publicState.outsiderCaught ? "Ana kelimeyi bilenler +1" : "Bilgisiz oyuncu +1"}</span></div><ResultPills points={publicState.resultPoints ?? []} /></>}
  </div>;
}

function IttifakControls({ publicState, ownState, players, selfPlayerId, now, onSubmit }: { readonly publicState: IttifakPublicState; readonly ownState: IttifakOwnState; readonly players: readonly MatchPlayerState[]; readonly selfPlayerId: string | null; readonly now: number; readonly onSubmit: (payload: JsonValue) => void }): JSX.Element {
  const [target, setTarget] = useState<string | null>(null);
  return <div className="stage8-controls" aria-live="polite">
    <GameHeading label="İTTİFAK" title={publicState.subPhase === "bargain" ? "Oy iste, vaat ver" : "Gizli oyunu kullan"} deadline={publicState.phaseEndsAt} now={now} />
    {publicState.subPhase === "bargain" && <div className="stage8-discussion-card"><span className="stage8-orbit-mark">⇄</span><strong>60 saniye pazarlık</strong><p>Arkadaşlarından oy iste. Sistem teklif veya sözleşme kaydetmez; karar tamamen masadaki konuşmaya bağlı.</p></div>}
    {publicState.subPhase === "vote" && <><PlayerChoiceGrid players={players} selfPlayerId={selfPlayerId} disabled={ownState.hasVoted} selectedPlayerId={target} onChoose={setTarget} /><button className="stage8-action-button" type="button" disabled={ownState.hasVoted || !target} onClick={() => target && onSubmit({ kind: "alliance-vote", targetPlayerId: target })}>{ownState.hasVoted ? "OY GİZLENDİ" : "OYUMU GÖNDER"}</button><p className="stage8-rule-note">Vermediğin oy süre sonunda kendin dışındaki rastgele bir rakibe gider.</p></>}
    {publicState.finished && <><div className="stage8-result-list">{(publicState.voteCounts ?? []).map((entry) => <div className="stage8-result-row" key={entry.playerId}><strong>{playerName(players, entry.playerId)}</strong><span>{entry.votes} OY</span><b>{scoreText(entry.votes)}</b></div>)}</div><ResultPills points={publicState.resultPoints ?? []} /></>}
  </div>;
}

function PanelControls({ publicState, ownState, now, onSubmit }: { readonly publicState: KontrolPaneliPublicState; readonly ownState: KontrolPaneliOwnState; readonly now: number; readonly onSubmit: (payload: JsonValue) => void }): JSX.Element {
  const colorClass = (color: string): string => color === "mavi" ? "blue" : color === "yeşil" ? "green" : color === "kırmızı" ? "red" : "yellow";
  return <div className="stage8-controls stage8-panel-controls" aria-live="polite">
    <GameHeading label="KONTROL PANELİ KAOSU" title="Kendi panelini çöz" deadline={publicState.phaseEndsAt} now={now} />
    {!publicState.finished && <><div className="stage8-wire-panel"><div className="stage8-wire-stack">{ownState.panelColors.map((color, index) => <div className={`stage8-wire-row wire-${colorClass(color)}`} key={`${color}-${index}`}><span>{index + 1}</span><i /><strong>{color.toLocaleUpperCase("tr-TR")}</strong></div>)}</div><div className="stage8-clue-note"><small>GİZLİ İPUCU</small><p>{ownState.clueText}</p></div></div><div className="stage8-panel-cut-grid">{ownState.panelColors.map((color) => <button className={`stage8-cut-button cut-${colorClass(color)}`} type="button" key={color} disabled={ownState.hasCut} onClick={() => onSubmit({ kind: "panel-cut", color })}>KES<br /><b>{color.toLocaleUpperCase("tr-TR")}</b></button>)}</div><p className="stage8-rule-note">İpucu başka bir oyuncunun panelini tarif eder. Hedefi konuşarak çöz; kendi panelinden yalnızca bir kablo kesebilirsin.</p></>}
    {publicState.finished && <><div className="stage8-result-list">{(publicState.results ?? []).map((result) => <div className="stage8-result-row" key={result.playerId}><strong>{result.playerId.slice(0, 4).toUpperCase()}</strong><span>{result.correct ? `${result.correctColor.toLocaleUpperCase("tr-TR")} ✓` : "YANLIŞ / BOŞ"}</span><b>{scoreText(result.points)}</b></div>)}</div><ResultPills points={publicState.resultPoints ?? []} /></>}
  </div>;
}

function GlassControls({ publicState, ownState, players, selfPlayerId, now, onSubmit }: { readonly publicState: ZehirliKadehPublicState; readonly ownState: ZehirliKadehOwnState; readonly players: readonly MatchPlayerState[]; readonly selfPlayerId: string | null; readonly now: number; readonly onSubmit: (payload: JsonValue) => void }): JSX.Element {
  return <div className="stage8-controls stage8-glass-controls" aria-live="polite">
    <GameHeading label="ZEHİRLİ KADEH" title={publicState.finished ? "Kadehler açılıyor" : "Zehir sende olabilir"} deadline={publicState.phaseEndsAt} now={now} />
    {!publicState.finished && <><div className="stage8-glass-orb"><span className="stage8-glass-liquid" /><span className="stage8-glass-shine" /><strong>?</strong><small>{publicState.tradeCount} TAKAS</small></div><p className="stage8-rule-note">Kendi kadehinin zehirli olup olmadığını göremezsin. İstersen tek takas hakkını bir arkadaşınla kullan.</p><div className="stage8-glass-targets">{players.filter((player) => player.id !== selfPlayerId && !player.eliminated).map((player, index) => <button className="stage8-glass-target" type="button" key={player.id} disabled={!ownState.canTrade} onClick={() => onSubmit({ kind: "glass-trade", targetPlayerId: player.id })}><span className={`avatar avatar-${(index % 8) + 1}`}>{player.nickname.slice(0, 1).toUpperCase()}</span><strong>{player.nickname}</strong><small>KADEHİ TAKASLA</small></button>)}</div>{ownState.hasTraded && <div className="stage8-wait-card">Takas hakkın kullanıldı. Süreye 5 saniye eklendi.</div>}</>}
    {publicState.finished && <><div className="stage8-result-callout"><strong>{ownState.poisoned ? "ZEHİRLİ KADEH" : "TEMİZ KADEH"}</strong><span>{ownState.poisoned ? "Bu tur puan yok" : "Genel skora +1"}</span></div><ResultPills points={publicState.resultPoints ?? []} /></>}
  </div>;
}
