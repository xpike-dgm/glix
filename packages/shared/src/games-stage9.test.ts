import assert from "node:assert/strict";
import test from "node:test";
import { PROTOCOL_VERSION } from "./index.js";
import {
  createStage9GameAdapter,
  type RusRuletiOwnState,
  type RusRuletiPublicState,
  type SonKisiPublicState,
  type Stage9GameAdapter
} from "./games-stage9.js";

function submit(adapter: Stage9GameAdapter, playerId: string, payload: Record<string, string>, now: number): void {
  assert.deepEqual(adapter.submit(playerId, payload, now), { accepted: true });
}

function score(adapter: Stage9GameAdapter, playerId: string): number {
  return adapter.getMiniGameScores().get(playerId) ?? 0;
}

test("Rus Ruleti patlamada hedefi eler, yarı eşiğinde hayatta kalanları ödüllendirir", () => {
  const adapter = createStage9GameAdapter("rus-ruleti", ["a", "b", "c"], () => 0);
  adapter.start(0);

  const initial = adapter.getPublicState(1) as RusRuletiPublicState;
  assert.equal(initial.currentHolderId, "a");
  submit(adapter, "a", { kind: "russian-shot", targetPlayerId: "b" }, 1_000);
  assert.deepEqual(adapter.eliminatedPlayerIds, ["b"]);
  assert.equal(score(adapter, "a"), 0);

  submit(adapter, "a", { kind: "russian-shot", targetPlayerId: "c" }, 2_000);
  assert.equal(adapter.isFinished, true);
  assert.equal(score(adapter, "a"), 1);
  assert.deepEqual(adapter.getScoreDeltas(), [{ playerId: "a", points: 1, reason: "rus-ruleti:hayatta-kalan" }]);
});

test("Rus Ruleti güvenli atışta hedefe geçer ve riski 76 ile sınırlar", () => {
  const rolls = [0, 0.99];
  let rollIndex = 0;
  const adapter = createStage9GameAdapter("rus-ruleti", ["a", "b"], () => rolls[Math.min(rollIndex++, rolls.length - 1)] ?? 0);
  adapter.start(0);
  submit(adapter, "a", { kind: "russian-shot", targetPlayerId: "b" }, 1_000);

  const holderState = adapter.getOwnState("b", 1_000) as RusRuletiOwnState;
  const publicState = adapter.getPublicState(1_000) as RusRuletiPublicState;
  assert.equal(holderState.isHolder, true);
  assert.equal(holderState.riskPercent, 26);
  assert.equal("riskPercent" in (publicState.lastShot ?? {}), false);
  assert.doesNotMatch(JSON.stringify(publicState.lastShot), /riskPercent/);
  assert.equal(adapter.isFinished, false);
});

test("Stage 11.7.1 wire sözleşmesi action correlation için protocol v3'ü ilan eder", () => {
  assert.equal(PROTOCOL_VERSION, 3);
});

test("Rus Ruleti yalnızca silah sahibinin ve hayatta olan hedefin atışını kabul eder", () => {
  const adapter = createStage9GameAdapter("rus-ruleti", ["a", "b"], () => 0);
  adapter.start(0);

  assert.deepEqual(adapter.submit("b", { kind: "russian-shot", targetPlayerId: "a" }, 1_000), { accepted: false, reason: "phase-locked" });
  assert.deepEqual(adapter.submit("a", { kind: "russian-shot", targetPlayerId: "missing" }, 1_000), { accepted: false, reason: "invalid" });
});

test("Rus Ruleti bağlı olmayan hayatta hedefi kabul etmez ve rastgele atışa katmaz", () => {
  const adapter = createStage9GameAdapter("rus-ruleti", ["a", "b", "c"], () => 0);
  adapter.start(0);
  adapter.setConnectedPlayerIds?.(["a", "b"]);
  assert.deepEqual(adapter.submit("a", { kind: "russian-shot", targetPlayerId: "c" }, 1_000), { accepted: false, reason: "invalid" });
});

test("Rus Ruleti patlama sonrası taşıyıcıyı yalnızca bağlı hayatta kalanlardan seçer", () => {
  const rolls = [0, 0, 0.999999];
  let rollIndex = 0;
  const adapter = createStage9GameAdapter(
    "rus-ruleti",
    ["a", "b", "c"],
    () => rolls[Math.min(rollIndex++, rolls.length - 1)] ?? 0
  );
  adapter.start(0);
  adapter.setConnectedPlayerIds?.(["a", "b"]);

  submit(adapter, "a", { kind: "russian-shot", targetPlayerId: "b" }, 1_000);

  const state = adapter.getPublicState(1_000) as RusRuletiPublicState;
  assert.equal(state.currentHolderId, "a");
});

test("Rus Ruleti tüm katılımcılar grace-disconnected iken kararı ve skoru dondurur", () => {
  const adapter = createStage9GameAdapter("rus-ruleti", ["a", "b", "c"], () => 0.99);
  adapter.start(0);
  adapter.setConnectedPlayerIds?.([], 1_000);
  assert.equal(adapter.advance(100_000), false);
  assert.equal(adapter.isFinished, false);
  assert.deepEqual(adapter.getScoreDeltas(), []);
  adapter.setConnectedPlayerIds?.(["b", "c"], 101_000);
  assert.equal(adapter.advance(101_001), false);
  assert.ok(["b", "c"].includes((adapter.getPublicState(101_001) as { currentHolderId: string | null }).currentHolderId ?? ""));
});

test("Son Kişi gizli bitişten önceki son kaçanı ödüllendirir", () => {
  const adapter = createStage9GameAdapter("son-kisi", ["a", "b", "c"], () => 0);
  adapter.start(0);
  submit(adapter, "a", { kind: "escape" }, 2_000);
  submit(adapter, "b", { kind: "escape" }, 7_000);
  adapter.advance(10_000);

  assert.equal(adapter.isFinished, true);
  assert.equal(score(adapter, "a"), 0);
  assert.equal(score(adapter, "b"), 1);
  assert.equal(score(adapter, "c"), -1);

  const result = adapter.getPublicState(10_000) as SonKisiPublicState;
  assert.equal(result.durationMs, 10_000);
  assert.deepEqual(result.results?.map((entry) => [entry.playerId, entry.elapsedMs, entry.points]), [["a", 2_000, 0], ["b", 7_000, 1], ["c", null, -1]]);
});

test("Son Kişi aynı milisaniyeyi paylaşan son kaçanların hepsine +1 verir", () => {
  const adapter = createStage9GameAdapter("son-kisi", ["a", "b"], () => 0.99);
  adapter.start(0);
  submit(adapter, "a", { kind: "escape" }, 5_000);
  submit(adapter, "b", { kind: "escape" }, 5_000);
  adapter.advance(20_000);

  assert.equal(score(adapter, "a"), 1);
  assert.equal(score(adapter, "b"), 1);
});

test("Son Kişi bitişten sonra gelen kaçışı reddeder", () => {
  const adapter = createStage9GameAdapter("son-kisi", ["a", "b"], () => 0);
  adapter.start(0);

  assert.deepEqual(adapter.submit("a", { kind: "escape" }, 10_000), { accepted: false, reason: "late" });
  assert.equal(adapter.isFinished, true);
  assert.equal(score(adapter, "a"), -1);
  assert.equal(score(adapter, "b"), -1);
});
