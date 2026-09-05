import assert from "node:assert/strict";
import test from "node:test";
import {
  createStage6GameAdapter,
  type SizmaPublicState,
  type Stage6GameAdapter
} from "./games.js";

function publicState(adapter: Stage6GameAdapter, now = 0): SizmaPublicState {
  return adapter.getPublicState(now) as SizmaPublicState;
}

function completeClue(adapter: Stage6GameAdapter, playerId: string, now: number): void {
  assert.deepEqual(
    adapter.submit(playerId, { kind: "clue-complete", clueText: `ipucu ${playerId}` }, now),
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
