import assert from "node:assert/strict";
import test from "node:test";
import {
  createStage6GameAdapter,
  type ButonaBasOwnState,
  type ButonaBasPublicState,
  type SizmaPublicState,
  type Stage6GameAdapter
} from "./games.js";
import {
  createStage7GameAdapter,
  type AsiriYuklemePublicState,
  type GizliHirsizPublicState,
  type KorKronometreOwnState,
  type KorKronometrePublicState,
  type Stage7GameAdapter
} from "./games-stage7.js";
import {
  createStage9GameAdapter,
  type SonKisiOwnState,
  type SonKisiPublicState,
  type Stage9GameAdapter
} from "./games-stage9.js";

function publicState(adapter: Stage6GameAdapter, now = 0): SizmaPublicState {
  return adapter.getPublicState(now) as SizmaPublicState;
}

function completeClue(adapter: Stage6GameAdapter, playerId: string, now: number): void {
  assert.deepEqual(
    adapter.submit(playerId, { kind: "clue-complete" }, now),
    { accepted: true }
  );
}

function readyAndVote(adapter: Stage6GameAdapter, now: number): void {
  const state = publicState(adapter, now);
  assert.equal(state.subPhase, "ready-for-vote");
  const targetPlayerId = adapter.playerIds[0];
  assert.ok(targetPlayerId);

  for (const playerId of adapter.playerIds) {
    assert.deepEqual(
      adapter.submit(playerId, { kind: "vote-ready" }, now),
      { accepted: true }
    );
  }

  assert.equal(publicState(adapter, now).subPhase, "vote");

  for (const playerId of adapter.playerIds) {
    assert.deepEqual(
      adapter.submit(playerId, { kind: "vote", targetPlayerId } as const, now + 1),
      { accepted: true }
    );
  }

  adapter.advance(now + 30_001);
  assert.equal(adapter.isFinished, true);
}

test("R7 — Sızma aktif sıradaki oyuncu çıkarılınca kalan sıra geçerli kalır", () => {
  const adapter = createStage6GameAdapter("sizma", ["a", "b", "c"], () => 0);
  adapter.start(0);

  assert.equal(publicState(adapter).clueTurnPlayerId, "a");
  adapter.removePlayer("a");

  assert.deepEqual(adapter.playerIds, ["b", "c"]);
  assert.equal(publicState(adapter).clueTurnPlayerId, "b");

  for (const round of [1, 2]) {
    for (const playerId of ["b", "c"]) {
      const state = publicState(adapter, round * 100 + playerId.charCodeAt(0));
      assert.equal(state.clueRound, round);
      assert.equal(state.clueTurnPlayerId, playerId);
      completeClue(adapter, playerId, round * 100 + playerId.charCodeAt(0));
    }
  }

  readyAndVote(adapter, 1_000);
});

test("Sızma grace-disconnected aktif ipucu koltuğunu skor uydurmadan atlar", () => {
  const adapter = createStage6GameAdapter("sizma", ["a", "b", "c"], () => 0);
  adapter.start(0);
  const before = publicState(adapter, 1).clueTurnPlayerId;
  adapter.setConnectedPlayerIds?.(["b", "c"], 2);
  const after = publicState(adapter, 2);
  assert.notEqual(after.clueTurnPlayerId, before);
  assert.equal(adapter.getScoreDeltas().length, 0);
});

test("Memory grace-disconnected aktif koltuğu elenme veya gizli dizi sızıntısı olmadan atlar", () => {
  const adapter = createStage6GameAdapter("zaman-bombasi-hafizasi", ["a", "b", "c"], () => 0);
  adapter.start(0);
  const before = adapter.getPublicState(1) as { activePlayerId: string | null };
  const remaining = ["a", "b", "c"].filter((playerId) => playerId !== before.activePlayerId);
  adapter.setConnectedPlayerIds?.(remaining, 2);
  const after = adapter.getPublicState(2) as { activePlayerId: string | null; sequence: readonly string[]; subPhase: string };
  assert.notEqual(after.activePlayerId, before.activePlayerId);
  assert.deepEqual(adapter.eliminatedPlayerIds, []);
  if (after.subPhase !== "display") assert.deepEqual(after.sequence, []);
});

test("Sızma tüm katılımcılar grace-disconnected iken fazı ve skoru dondurur", () => {
  const adapter = createStage6GameAdapter("sizma", ["a", "b", "c"], () => 0);
  adapter.start(0);
  adapter.setConnectedPlayerIds?.([], 10);
  const frozen = publicState(adapter, 40_000);
  adapter.advance(40_000);
  assert.deepEqual(publicState(adapter, 40_000), frozen);
  assert.equal(adapter.isFinished, false);
  assert.deepEqual(adapter.getScoreDeltas(), []);
});

test("Memory tüm katılımcılar grace-disconnected iken bitmez ve reconnect deadline'ı öteler", () => {
  const adapter = createStage6GameAdapter("zaman-bombasi-hafizasi", ["a", "b", "c"], () => 0);
  adapter.start(0);
  const before = adapter.getPublicState(1) as { activePlayerId: string | null; displayUntil: number | null };
  adapter.setConnectedPlayerIds?.([], 10);
  assert.equal(adapter.advance(50_000), false);
  assert.equal(adapter.isFinished, false);
  adapter.setConnectedPlayerIds?.(["a", "b", "c"], 50_010);
  const resumed = adapter.getPublicState(50_010) as { activePlayerId: string | null; displayUntil: number | null };
  assert.equal(resumed.activePlayerId, before.activePlayerId);
  assert.ok((resumed.displayUntil ?? 0) > 50_010);
});

test("Memory tek tek reconnect olurken bağlı ilk koltuğa deterministik geçer ve skor yazmaz", () => {
  const adapter = createStage6GameAdapter("zaman-bombasi-hafizasi", ["a", "b", "c"], () => 0);
  adapter.start(0);
  const original = adapter.getPublicState(1) as { activePlayerId: string | null };
  const firstReconnect = ["a", "b", "c"].find((id) => id !== original.activePlayerId)!;
  adapter.setConnectedPlayerIds?.([], 10);
  adapter.setConnectedPlayerIds?.([firstReconnect], 50_010);
  const resumed = adapter.getPublicState(50_010) as { activePlayerId: string | null };
  assert.equal(resumed.activePlayerId, firstReconnect);
  assert.equal(adapter.isFinished, false);
  assert.deepEqual(adapter.getScoreDeltas(), []);
});

test("R7 — Sızma son aktif ipucu oyuncusu çıkarılınca oyun out-of-range sırada kilitlenmez", () => {
  const adapter = createStage6GameAdapter("sizma", ["a", "b", "c"], () => 0);
  adapter.start(0);

  completeClue(adapter, "a", 101);
  completeClue(adapter, "b", 102);
  assert.equal(publicState(adapter).clueTurnPlayerId, "c");

  adapter.removePlayer("c");

  assert.deepEqual(adapter.playerIds, ["a", "b"]);
  const afterRemoval = publicState(adapter, 200);

  // A valid implementation may advance directly to the ready barrier when
  // removing the final turn of a clue round. If it remains in clue, it must
  // expose a real remaining player rather than an out-of-range index.
  assert.ok(
    afterRemoval.subPhase === "ready-for-vote" ||
      (afterRemoval.subPhase === "clue" &&
        afterRemoval.clueTurnPlayerId !== null &&
        adapter.playerIds.includes(afterRemoval.clueTurnPlayerId) &&
        afterRemoval.clueTurnIndex < adapter.playerIds.length),
    "Sızma removal sonrası geçerli bir ipucu sırası veya hazır bariyeri bekleniyordu."
  );

  let now = 300;
  let guard = 0;
  while (publicState(adapter, now).subPhase === "clue") {
    guard += 1;
    assert.ok(guard <= adapter.playerIds.length * 2, "Sızma clue fazı ilerlemeyi bıraktı.");
    const state = publicState(adapter, now);
    const turnPlayerId = state.clueTurnPlayerId;
    assert.ok(turnPlayerId !== null);
    assert.ok(adapter.playerIds.includes(turnPlayerId));
    completeClue(adapter, turnPlayerId, now);
    now += 1;
  }

  readyAndVote(adapter, now + 1);
});

test("R7 — Sızma hazır bariyerindeki oyuncu çıkarılınca kalan hazır oyuncular oylamaya geçer", () => {
  const adapter = createStage6GameAdapter("sizma", ["a", "b", "c"], () => 0);
  adapter.start(0);

  let now = 100;
  for (const round of [1, 2] as const) {
    for (const playerId of ["a", "b", "c"]) {
      assert.equal(publicState(adapter, now).clueRound, round);
      completeClue(adapter, playerId, now);
      now += 1;
    }
  }

  assert.equal(publicState(adapter, now).subPhase, "ready-for-vote");
  assert.deepEqual(adapter.submit("a", { kind: "vote-ready" }, now), { accepted: true });
  assert.deepEqual(adapter.submit("b", { kind: "vote-ready" }, now), { accepted: true });
  assert.equal(publicState(adapter, now).subPhase, "ready-for-vote");

  adapter.removePlayer("c");
  const afterRemoval = publicState(adapter, now);
  assert.deepEqual(adapter.playerIds, ["a", "b"]);
  assert.equal(afterRemoval.subPhase, "vote");
  assert.ok(afterRemoval.voteEndsAt !== null);

  for (const playerId of adapter.playerIds) {
    assert.deepEqual(
      adapter.submit(playerId, { kind: "vote", targetPlayerId: "a" }, now + 1),
      { accepted: true }
    );
  }

  adapter.advance((afterRemoval.voteEndsAt ?? now) + 1);
  assert.equal(adapter.isFinished, true);
});

test("Stage 11.8A timing adapters preserve their single/repeatable contracts", () => {
  const button = createStage6GameAdapter("butona-bas", ["a", "b"]);
  button.start(0);
  assert.deepEqual(button.submit("a", { kind: "button-tap" }, 1), { accepted: true });
  assert.deepEqual(button.submit("a", { kind: "button-tap" }, 2), { accepted: true });
  assert.deepEqual(button.submit("a", { kind: "button-tap" }, 45_000), { accepted: false, reason: "late" });
  assert.equal((button.getPublicState(45_000) as ButonaBasPublicState).finished, true);

  const thief = createStage7GameAdapter("gizli-hirsiz", ["a", "b"]);
  thief.start(0);
  assert.deepEqual(thief.submit("a", { kind: "steal" }, 100), { accepted: true });
  assert.deepEqual(thief.submit("a", { kind: "steal" }, 101), { accepted: false, reason: "duplicate" });
  const privateThiefState = thief.getPublicState(101) as GizliHirsizPublicState;
  assert.equal(privateThiefState.pressCount, null);
  assert.equal(privateThiefState.pressedPlayerIds, null);

  const stopwatch = createStage7GameAdapter("kor-kronometre", ["a", "b"]);
  stopwatch.start(0);
  assert.deepEqual(stopwatch.submit("a", { kind: "stopwatch-stop" }, 9_500), { accepted: true });
  assert.equal((stopwatch.getOwnState("a", 9_500) as KorKronometreOwnState).elapsedMs, 9_500);
  const privateStopwatchState = stopwatch.getPublicState(9_500) as KorKronometrePublicState;
  assert.equal(privateStopwatchState.endsAt, null);
  assert.equal(privateStopwatchState.targetMs, null);
  assert.equal(privateStopwatchState.results, null);

  const overload = createStage7GameAdapter("asiri-yukleme", ["a", "b"]);
  overload.start(0);
  for (let click = 0; click < 100; click += 1) {
    assert.deepEqual(overload.submit("a", { kind: "overload-click" }, click), { accepted: true });
  }
  const armed = overload.getPublicState(100) as AsiriYuklemePublicState;
  assert.equal(armed.armed, true);
  assert.doesNotMatch(JSON.stringify(armed), /armingEndsAt|arm.*time|3000/);
  assert.equal(overload.advance(3_099), true);
  assert.equal((overload.getPublicState(3_099) as AsiriYuklemePublicState).finished, true);
});

test("Stage 11.8A Butona Bas publishes an authoritative window and combo summary", () => {
  const adapter = createStage6GameAdapter("butona-bas", ["a", "b"]);
  adapter.start(0);

  assert.deepEqual(adapter.submit("a", { kind: "button-tap" }, 1), { accepted: true });
  assert.deepEqual(adapter.submit("a", { kind: "button-tap" }, 2), { accepted: true });
  assert.deepEqual(adapter.submit("a", { kind: "button-tap" }, 301), { accepted: true });
  assert.deepEqual(adapter.submit("b", { kind: "button-tap" }, 302), { accepted: true });

  adapter.advance(45_000);
  const result = adapter.getPublicState(45_000) as ButonaBasPublicState;
  assert.deepEqual(result.resultSummary, {
    acceptedWindowCount: 2,
    singletonWindowCount: 1,
    multiPlayerWindowCount: 1,
    emptyWindowCount: 148,
    longestWindowCombo: 2
  });

  const ownResult = adapter.getOwnState("a", 45_000) as ButonaBasOwnState;
  assert.equal(ownResult.acceptedWindowCount, 2);
  assert.equal(ownResult.longestWindowCombo, 2);
});

test("Stage 11.8A result views expose server ordering and rank without client re-ranking", () => {
  const button = createStage6GameAdapter("butona-bas", ["a", "b"]);
  button.start(0);
  assert.deepEqual(button.submit("a", { kind: "button-tap" }, 1), { accepted: true });
  assert.deepEqual(button.submit("b", { kind: "button-tap" }, 2), { accepted: true });
  assert.deepEqual(button.submit("a", { kind: "button-tap" }, 301), { accepted: true });
  button.advance(45_000);
  assert.deepEqual((button.getPublicState(45_000) as ButonaBasPublicState).results, [
    { playerId: "b", score: 1, rank: 1 },
    { playerId: "a", score: 0, rank: 2 }
  ]);

  const stopwatch = createStage7GameAdapter("kor-kronometre", ["a", "b"]);
  stopwatch.start(0);
  assert.deepEqual(stopwatch.submit("a", { kind: "stopwatch-stop" }, 9_500), { accepted: true });
  stopwatch.advance(18_000);
  assert.deepEqual((stopwatch.getPublicState(18_000) as KorKronometrePublicState).results, [
    { playerId: "a", elapsedMs: 9_500, distanceMs: 500, tapped: true, rank: 1, points: 2 },
    { playerId: "b", elapsedMs: 18_000, distanceMs: 8_000, tapped: false, rank: 2, points: 1 }
  ]);

  const overload = createStage7GameAdapter("asiri-yukleme", ["a", "b"]);
  overload.start(0);
  for (let click = 0; click < 100; click += 1) {
    assert.deepEqual(overload.submit("a", { kind: "overload-click" }, click), { accepted: true });
  }
  overload.advance(3_099);
  assert.deepEqual((overload.getPublicState(3_099) as AsiriYuklemePublicState).results, [
    { playerId: "a", clickCount: 100, rank: 1, points: 2, exploded: false },
    { playerId: "b", clickCount: 0, rank: 2, points: 1, exploded: false }
  ]);

  const lastPerson = createStage9GameAdapter("son-kisi", ["a", "b"], () => 0.99);
  lastPerson.start(0);
  assert.deepEqual(lastPerson.submit("b", { kind: "escape" }, 1_000), { accepted: true });
  assert.deepEqual(lastPerson.submit("a", { kind: "escape" }, 2_000), { accepted: true });
  lastPerson.advance(20_000);
  assert.deepEqual((lastPerson.getPublicState(20_000) as SonKisiPublicState).results, [
    { playerId: "b", escaped: true, elapsedMs: 1_000, points: 0 },
    { playerId: "a", escaped: true, elapsedMs: 2_000, points: 1 }
  ]);
});

function assertStage11ALiveRoster(
  adapter: Stage6GameAdapter | Stage7GameAdapter | Stage9GameAdapter,
  payload: { readonly kind: string }
): void {
  adapter.start(0);
  adapter.setConnectedPlayerIds?.(["a"], 1);
  assert.deepEqual(adapter.submit("b", payload, 2), { accepted: false, reason: "invalid" });
  assert.deepEqual(adapter.submit("outsider", payload, 2), { accepted: false, reason: "invalid" });

  adapter.setConnectedPlayerIds?.(["a", "b"], 3);
  assert.deepEqual(adapter.submit("b", payload, 4), { accepted: true });
}

test("Stage 11.8A action adapters reject disconnected seats and accept them after reconnect", () => {
  assertStage11ALiveRoster(
    createStage6GameAdapter("butona-bas", ["a", "b"]),
    { kind: "button-tap" }
  );
  assertStage11ALiveRoster(
    createStage7GameAdapter("gizli-hirsiz", ["a", "b"]),
    { kind: "steal" }
  );
  assertStage11ALiveRoster(
    createStage7GameAdapter("kor-kronometre", ["a", "b"]),
    { kind: "stopwatch-stop" }
  );
  assertStage11ALiveRoster(
    createStage7GameAdapter("asiri-yukleme", ["a", "b"]),
    { kind: "overload-click" }
  );
  assertStage11ALiveRoster(
    createStage9GameAdapter("son-kisi", ["a", "b"], () => 0.99),
    { kind: "escape" }
  );
});

test("Stage 11.8A Son Kişi keeps escape choices private until the authoritative result", () => {
  const adapter = createStage9GameAdapter("son-kisi", ["a", "b"], () => 0.99);
  adapter.start(0);
  assert.deepEqual(adapter.submit("a", { kind: "escape" }, 2_000), { accepted: true });

  const publicDuringPlay = adapter.getPublicState(2_000) as SonKisiPublicState;
  assert.equal(publicDuringPlay.escapeCount, 0);
  assert.deepEqual(publicDuringPlay.escapedPlayerIds, []);
  assert.equal(publicDuringPlay.durationMs, null);
  assert.equal((adapter.getOwnState("a", 2_000) as SonKisiOwnState).escapedAt, 2_000);

  adapter.advance(20_000);
  const result = adapter.getPublicState(20_000) as SonKisiPublicState;
  assert.equal(result.escapeCount, 1);
  assert.deepEqual(result.escapedPlayerIds, ["a"]);
  assert.equal(result.durationMs, 20_000);
});
