import assert from "node:assert/strict";
import test from "node:test";
import { GAME_CATALOG, type GameId } from "./index.js";
import {
  MiniGameEngine,
  applyScoreDeltas,
  awardMapToDeltas,
  createMiniGameDefinition,
  createRankAwards,
  rankScores,
  type GamePhaseDefinition
} from "./engine.js";

const demoGame = GAME_CATALOG.find((game) => game.id === "butona-bas")!;

function createTestDefinition(overrides: Partial<Parameters<typeof createMiniGameDefinition>[1]> = {}) {
  const phases: readonly GamePhaseDefinition[] = [
    { id: "tutorial", durationMs: 100, advance: "timer" },
    { id: "preparing", durationMs: 500, advance: "all-ready-or-timeout" },
    { id: "playing", durationMs: 300, advance: "timer" },
    { id: "results", durationMs: 100, advance: "timer" },
    { id: "transition", durationMs: 100, advance: "timer" }
  ];

  return createMiniGameDefinition(demoGame, {
    phases,
    ...overrides
  });
}

test("faz makinesi zamanla ilerler ve hazırlanma fazında herkes hazır olduğunda açılır", () => {
  const engine = new MiniGameEngine(createTestDefinition(), ["a", "b"], 1_000);

  assert.equal(engine.snapshot(1_099).phase, "tutorial");
  assert.equal(engine.advance(1_100).phase, "preparing");
  assert.equal(engine.markReady("a", 1_150), true);
  assert.equal(engine.snapshot(1_150).phase, "preparing");
  assert.equal(engine.markReady("b", 1_150), true);
  assert.equal(engine.snapshot(1_150).phase, "playing");
  assert.equal(engine.snapshot(1_150).phaseStartedAt, 1_150);
});

test("tekil, boş ve geç hamleler ortak sözleşmeye göre kabul edilir veya reddedilir", () => {
  const engine = new MiniGameEngine(createTestDefinition(), ["a", "b"], 1_000);
  engine.advance(1_100);
  engine.markReady("a", 1_150);
  engine.markReady("b", 1_150);

  const first = engine.submitInput("a", { action: "tap" }, 1_200, 1_199);
  assert.equal(first.accepted, true);
  assert.equal(engine.submitInput("a", { action: "again" }, 1_210).accepted, false);
  assert.equal(
    engine.submitInput("a", null, 1_220).accepted,
    false,
    "tekil oyuncunun ikinci hamlesi boş olsa bile tekrar sayılmalı"
  );

  const empty = engine.submitInput("b", null, 1_250);
  assert.equal(empty.accepted, true);
  assert.equal(empty.accepted && empty.record.empty, true);

  const late = engine.submitInput("b", { action: "late" }, 1_450);
  assert.deepEqual(late, { accepted: false, reason: "late" });
  assert.equal(engine.snapshot(1_450).phase, "results");
  assert.deepEqual(
    engine.submitInput("a", { action: "locked" }, 1_460),
    { accepted: false, reason: "phase-locked" }
  );
});

test("gizli hamleler yalnız sahibine görünür ve eşzamanlı sıra sunucu dizisiyle sabittir", () => {
  const engine = new MiniGameEngine(createTestDefinition(), ["a", "b"], 1_000);
  engine.advance(1_100);
  engine.markReady("a", 1_150);
  engine.markReady("b", 1_150);
  engine.submitInput("b", { secret: "B" }, 1_200);
  engine.submitInput("a", { secret: "A" }, 1_200);

  assert.deepEqual(engine.getVisibleInputs("a").map((input) => input.payload), [
    { secret: "A" }
  ]);
  assert.deepEqual(engine.getVisibleInputs("b").map((input) => input.payload), [
    { secret: "B" }
  ]);
  assert.deepEqual(engine.getAllInputs().map((input) => input.playerId), ["b", "a"]);
  assert.deepEqual(engine.getAllInputs().map((input) => input.sequence), [1, 2]);
});

test("eliminasyon oyuncuyu seyirciye çevirir ve boş hamle politikası uygulanır", () => {
  const engine = new MiniGameEngine(
    createTestDefinition({ allowEmptyInput: false }),
    ["a", "b"],
    1_000
  );
  engine.advance(1_100);
  engine.markReady("a", 1_150);
  engine.markReady("b", 1_150);
  engine.eliminatePlayer("b");

  assert.deepEqual(engine.submitInput("b", { action: "spectator" }, 1_200), {
    accepted: false,
    reason: "spectator"
  });
  assert.deepEqual(engine.submitInput("a", null, 1_200), {
    accepted: false,
    reason: "empty-not-allowed"
  });
});

test("sıralama ödülü lider eşitliğini ve sonraki dereceyi deterministik hesaplar", () => {
  assert.deepEqual(rankScores({ a: 5, b: 3, c: 3 }), [
    { playerId: "a", score: 5, rank: 1 },
    { playerId: "b", score: 3, rank: 2 },
    { playerId: "c", score: 3, rank: 2 }
  ]);

  assert.deepEqual(
    createRankAwards(
      { a: 5, b: 3, c: 3 },
      { uniqueLeaderPoints: 2, nextRankPoints: 1, tiedLeaderPoints: 1, awardAllTiedNextRank: true }
    ),
    { a: 2, b: 1, c: 1 }
  );

  assert.deepEqual(
    createRankAwards(
      { a: 5, b: 5, c: 2 },
      { uniqueLeaderPoints: 2, nextRankPoints: 1, tiedLeaderPoints: 1 }
    ),
    { a: 1, b: 1 }
  );

  const awards = createRankAwards(
    { a: 5, b: 5, c: 2 },
    { uniqueLeaderPoints: 2, nextRankPoints: 1, tiedLeaderPoints: 1 }
  );
  assert.deepEqual(awardMapToDeltas(awards, "eşit lider"), [
    { playerId: "a", points: 1, reason: "eşit lider" },
    { playerId: "b", points: 1, reason: "eşit lider" }
  ]);
  assert.deepEqual(applyScoreDeltas({ a: 4, b: 0 } as Record<GameId | string, number>, [
    { playerId: "a", points: 1, reason: "test" },
    { playerId: "b", points: 2, reason: "test" }
  ]), { a: 5, b: 2 });
});
