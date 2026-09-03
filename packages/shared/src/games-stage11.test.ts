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
