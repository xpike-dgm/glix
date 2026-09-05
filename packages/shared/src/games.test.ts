import assert from "node:assert/strict";
import test from "node:test";
import {
  createStage6GameAdapter,
  type MemoryPublicState,
  type SizmaOwnState,
  type SizmaPublicState,
  type Stage6GameAdapter
} from "./games.js";
import type { JsonValue } from "./index.js";

function submit(adapter: Stage6GameAdapter, playerId: string, payload: JsonValue, now: number): void {
  assert.equal(adapter.submit(playerId, payload, now).accepted, true);
}

test("Butona Bas aynı pencere içindeki tekrarları tek oyuncu sayar ve sıralama ödülü üretir", () => {
  const adapter = createStage6GameAdapter("butona-bas", ["a", "b", "c"], () => 0);
  adapter.start(0);

  submit(adapter, "a", { kind: "button-tap" }, 10);
  submit(adapter, "a", { kind: "button-tap" }, 20);
  submit(adapter, "b", { kind: "button-tap" }, 20);
  adapter.advance(300);

  submit(adapter, "c", { kind: "button-tap" }, 310);
  adapter.advance(600);
  adapter.advance(45_000);

  assert.equal(adapter.getMiniGameScores().get("a"), 1);
  assert.equal(adapter.getMiniGameScores().get("b"), 1);
  assert.equal(adapter.getMiniGameScores().get("c"), -1);
  assert.deepEqual(adapter.getScoreDeltas().slice(-2), [
    { playerId: "a", points: 1, reason: "butona-bas:genel-siralama" },
    { playerId: "b", points: 1, reason: "butona-bas:genel-siralama" }
  ]);
});

test("Sızma iki ipucu turunu ve hazır bariyerini tamamlamadan oylamayı açmaz", () => {
  const adapter = createStage6GameAdapter("sizma", ["a", "b", "c"], () => 0);
  adapter.start(0);

  assert.equal((adapter.getOwnState("a", 0) as SizmaOwnState).role, "outsider");
  assert.equal((adapter.getOwnState("a", 0) as SizmaOwnState).assignedWord, "TÜNEL");
  assert.equal((adapter.getPublicState(0) as SizmaPublicState).outsiderPlayerId, null);

  for (const round of [1, 2]) {
    for (const playerId of ["a", "b", "c"]) {
      assert.equal((adapter.getOwnState(playerId, 0) as SizmaOwnState).clueRound, round);
      submit(adapter, playerId, { kind: "clue-complete" }, 100 + round);
    }
  }

  assert.equal((adapter.getPublicState(0) as SizmaPublicState).subPhase, "ready-for-vote");
  submit(adapter, "a", { kind: "vote-ready" }, 200);
  submit(adapter, "b", { kind: "vote-ready" }, 201);
  assert.equal((adapter.getPublicState(201) as SizmaPublicState).subPhase, "ready-for-vote");
  submit(adapter, "c", { kind: "vote-ready" }, 202);
  assert.equal((adapter.getPublicState(202) as SizmaPublicState).subPhase, "vote");

  adapter.setConnectedPlayerIds?.(["a", "b"]);
  assert.deepEqual(adapter.submit("a", { kind: "vote", targetPlayerId: "c" }, 202), { accepted: false, reason: "invalid" });
  adapter.setConnectedPlayerIds?.(["a", "b", "c"]);

  submit(adapter, "a", { kind: "vote", targetPlayerId: "a" }, 203);
  submit(adapter, "b", { kind: "vote", targetPlayerId: "a" }, 204);
  submit(adapter, "c", { kind: "vote", targetPlayerId: "a" }, 205);
  assert.equal(adapter.isFinished, false);
  adapter.advance(30_202);

  assert.equal(adapter.isFinished, true);
  assert.equal((adapter.getPublicState(30_202) as SizmaPublicState).outsiderCaught, true);
  assert.deepEqual(adapter.getMiniGameScores(), new Map([
    ["a", 0],
    ["b", 1],
    ["c", 1]
  ]));
});

test("Zaman Bombası Hafızası diziyi uzatır, yanlışta puan dağıtır ve eşiğe gelince biter", () => {
  let randomCalls = 0;
  const adapter = createStage6GameAdapter(
    "zaman-bombasi-hafizasi",
    ["a", "b"],
    () => (randomCalls++ === 0 ? 0.99 : 0)
  );
  adapter.start(0);

  assert.equal((adapter.getPublicState(0) as MemoryPublicState).sequenceLength, 2);
  const firstSequence = (adapter.getPublicState(0) as MemoryPublicState).sequence;
  assert.equal(firstSequence.length, 2);
  adapter.advance(1_500);
  const inputState = adapter.getPublicState(1_500) as MemoryPublicState;
  assert.equal(inputState.subPhase, "input");
  assert.deepEqual(inputState.sequence, []);

  submit(adapter, "a", { kind: "memory-sequence", sequence: firstSequence }, 1_501);
  const nextDisplay = adapter.getPublicState(1_502) as MemoryPublicState;
  assert.equal(nextDisplay.sequenceLength, 3);
  assert.equal(nextDisplay.activePlayerId, "b");
  assert.deepEqual((adapter.getPublicState(1_502) as MemoryPublicState).resultSequence, []);

  adapter.advance(3_502);
  const wrongSequence = nextDisplay.sequence.map((color, index) => index === 0 ? (color === "cyan" ? "magenta" : "cyan") : color);
  submit(adapter, "b", { kind: "memory-sequence", sequence: wrongSequence }, 3_503);
  assert.equal(adapter.isFinished, true);
  assert.deepEqual(adapter.getMiniGameScores(), new Map([
    ["a", 1],
    ["b", -1]
  ]));
  assert.deepEqual((adapter.getPublicState(3_503) as MemoryPublicState).eliminatedPlayerIds, ["b"]);
});
