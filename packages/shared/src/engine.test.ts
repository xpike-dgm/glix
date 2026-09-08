import assert from "node:assert/strict";
import test from "node:test";
import { GAME_CATALOG, PROTOCOL_VERSION, type GameId } from "./index.js";
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

test("Protocol v4 sürümü doğru tanımlanmıştır", () => {
  assert.equal(PROTOCOL_VERSION, 4);
});

test("brifing fazı süresizdir, zamanla ilerlemez ve hazır bariyeri tamamlanmadan açılmaz", () => {
  const definition = createMiniGameDefinition(demoGame);
  const tutorialPhase = definition.phases.find((p) => p.id === "tutorial");
  assert.equal(tutorialPhase?.durationMs, null, "brifing fazının süresi null olmalı");
  assert.equal(tutorialPhase?.advance, "all-ready", "brifing advance modu all-ready olmalı");

  const engine = new MiniGameEngine(definition, ["a", "b"], 1_000);
  const snap1 = engine.snapshot(1_000);
  assert.equal(snap1.phase, "tutorial");
  assert.equal(snap1.phaseEndsAt, null, "brifing fazında phaseEndsAt null olmalı");

  // Uzun süre geçse bile zamanla ilerlememeli
  assert.equal(engine.advance(999_999).phase, "tutorial");

  // Tek oyuncu hazır olunca ilerlememeli
  assert.equal(engine.markReady("a", 1_050), true);
  assert.equal(engine.snapshot(1_050).phase, "tutorial");
  assert.deepEqual(engine.snapshot(1_050).readyPlayerIds, ["a"]);

  // Aynı oyuncu tekrar hazır derse idempotent olmalı
  assert.equal(engine.markReady("a", 1_060), true);
  assert.equal(engine.snapshot(1_060).phase, "tutorial");

  // Tüm bağlı/uygun oyuncular hazır olunca 0ms preparing köprüsünden doğrudan playing'e geçmeli
  assert.equal(engine.markReady("b", 1_070), true);
  const playingSnap = engine.snapshot(1_070);
  assert.equal(playingSnap.phase, "playing");
  assert.equal(playingSnap.phaseStartedAt, 1_070);
});

test("seyirci ve elenmiş oyuncular hazır bariyerini engelleyemez ve hazır olamaz", () => {
  const definition = createMiniGameDefinition(demoGame);
  const engine = new MiniGameEngine(definition, ["a", "b"], 1_000);

  // Seyirci/bilinmeyen oyuncu hazır olamaz
  assert.equal(engine.markReady("spectator-x", 1_010), false);

  // b elenince hazır bariyerini kilitlemez, yalnızca kalan a'nın hazır olması yeterlidir
  engine.eliminatePlayer("b");
  assert.equal(engine.markReady("b", 1_020), false);
  assert.equal(engine.markReady("a", 1_030), true);

  // a hazır olunca doğrudan playing'e geçer
  assert.equal(engine.snapshot(1_030).phase, "playing");
});

test("bağlantısı kesilen oyuncu hazır bariyerini engellemez", () => {
  const definition = createMiniGameDefinition(demoGame);
  const engine = new MiniGameEngine(definition, ["a", "b"], 1_000);

  // Yalnızca a bağlı
  engine.setConnectedPlayerIds(["a"]);

  // a hazır olunca b kilit oluşturmaz, doğrudan playing'e geçer
  assert.equal(engine.markReady("a", 1_020), true);
  assert.equal(engine.snapshot(1_020).phase, "playing");
});

test("A+B hazır iken C brifing sırasında koparsa kalan uygunların bariyeri anında ilerletir", () => {
  const definition = createMiniGameDefinition(demoGame);
  const engine = new MiniGameEngine(definition, ["a", "b", "c"], 1_000);
  engine.setConnectedPlayerIds(["a", "b", "c"]);

  // A ve B hazır, C henüz hazır değil
  assert.equal(engine.markReady("a", 1_010), true);
  assert.equal(engine.markReady("b", 1_020), true);
  assert.equal(engine.snapshot(1_020).phase, "tutorial");

  // C brifing fazında kopuyor
  engine.setConnectedPlayerIds(["a", "b"]);
  const advancedSnap = engine.advance(1_030);

  // Kalan uygun oyuncuların tamamı hazır olduğundan anında playing'e geçmeli
  assert.equal(advancedSnap.phase, "playing");
  assert.equal(advancedSnap.phaseStartedAt, 1_030);
});

test("sıfır bağlı uygun katılımcı varken faz kesinlikle otomatik başlamaz", () => {
  const definition = createMiniGameDefinition(demoGame);
  const engine = new MiniGameEngine(definition, ["a", "b"], 1_000);

  // Herkes koptu, sıfır bağlı oyuncu var
  engine.setConnectedPlayerIds([]);

  // Motor ilerletilse bile brifingde kalmalı, otomatik başlamamalı
  assert.equal(engine.advance(2_000).phase, "tutorial");
  assert.equal(engine.advance(999_999).phase, "tutorial");
});

test("brifing sırasında yeniden bağlanan oyuncu tutarlı şekilde katılabilir ve hazır olabilir", () => {
  const definition = createMiniGameDefinition(demoGame);
  const engine = new MiniGameEngine(definition, ["a", "b"], 1_000);

  // Başlangıçta a ve b bağlı, a hazır oluyor
  engine.setConnectedPlayerIds(["a", "b"]);
  assert.equal(engine.markReady("a", 1_010), true);
  assert.equal(engine.snapshot(1_010).phase, "tutorial");

  // b geçici olarak koptu
  engine.setConnectedPlayerIds(["a"]);
  // a zaten hazır olduğu için bu noktada tek bağlı oyuncu a olur ve başlardı;
  // Fakat b kopup a henüz hazır değilken reconnect senaryosunu test edelim:
  const engine2 = new MiniGameEngine(definition, ["a", "b"], 1_000);
  engine2.setConnectedPlayerIds(["a"]); // b henüz offline
  // a henüz hazır değil
  assert.equal(engine2.snapshot(1_010).phase, "tutorial");

  // b brifing bitmeden yeniden bağlanıyor
  engine2.setConnectedPlayerIds(["a", "b"]);
  assert.equal(engine2.snapshot(1_020).phase, "tutorial");

  // b artık hazır olabilmeli
  assert.equal(engine2.markReady("b", 1_030), true);
  assert.equal(engine2.snapshot(1_030).phase, "tutorial");

  // a da hazır olunca playing'e geçer
  assert.equal(engine2.markReady("a", 1_040), true);
  assert.equal(engine2.snapshot(1_040).phase, "playing");
});
