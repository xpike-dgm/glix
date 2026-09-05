import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createStage6GameAdapter,
  type MemoryPublicState,
  type SizmaPublicState,
  type Stage6GameAdapter
} from "./games.js";
import {
  createStage7GameAdapter,
  type CaprazAtesPublicState,
  type KorBombaPublicState,
  type Stage7GameAdapter
} from "./games-stage7.js";
import {
  createStage8GameAdapter,
  type ZehirliKadehPublicState,
  type Stage8GameAdapter
} from "./games-stage8.js";
import {
  createStage9GameAdapter,
  type RusRuletiPublicState,
  type Stage9GameAdapter
} from "./games-stage9.js";
import { deriveSubmissionStatus, reduceClientActionState } from "./contracts.js";
import type { JsonValue } from "./index.js";

function stage6Submit(adapter: Stage6GameAdapter, playerId: string, payload: JsonValue, now: number): void {
  assert.deepEqual(adapter.submit(playerId, payload, now), { accepted: true });
}

function stage7Submit(adapter: Stage7GameAdapter, playerId: string, payload: JsonValue, now: number): void {
  assert.deepEqual(adapter.submit(playerId, payload, now), { accepted: true });
}

function stage8Submit(adapter: Stage8GameAdapter, playerId: string, payload: JsonValue, now: number): void {
  assert.deepEqual(adapter.submit(playerId, payload, now), { accepted: true });
}

function stage9Submit(adapter: Stage9GameAdapter, playerId: string, payload: JsonValue, now: number): void {
  assert.deepEqual(adapter.submit(playerId, payload, now), { accepted: true });
}

test("11.8B Sızma clue tokenlarını kamusal, kelime ve rol atamasını özel tutar", () => {
  const adapter = createStage6GameAdapter("sizma", ["a", "b", "c"], () => 0);
  adapter.start(0);

  assert.deepEqual(adapter.submit("a", { kind: "clue-complete" }, 1), { accepted: false, reason: "invalid" });
  assert.deepEqual(adapter.submit("a", { kind: "clue-complete", clueText: "   " }, 2), { accepted: false, reason: "invalid" });

  const own = adapter.getOwnState("a", 1) as { assignedWord: string; role: string };
  const before = adapter.getPublicState(1) as SizmaPublicState;
  assert.equal(before.clueTokens.length, 0);
  assert.equal(JSON.stringify(before).includes(own.assignedWord), false);
  assert.equal("role" in before, false);

  let now = 100;
  for (const round of [1, 2] as const) {
    while ((adapter.getPublicState(now) as SizmaPublicState).subPhase === "clue") {
      const state = adapter.getPublicState(now) as SizmaPublicState;
      if (state.clueRound !== round) break;
      const playerId = state.clueTurnPlayerId;
      assert.ok(playerId);
      stage6Submit(adapter, playerId, { kind: "clue-complete", clueText: `tur ${round} oyuncu ${playerId}` }, now);
      now += 1;
    }
  }

  const clueState = adapter.getPublicState(now) as SizmaPublicState;
  assert.equal(clueState.subPhase, "ready-for-vote");
  assert.equal(clueState.clueTokens.length, 6);
  for (const playerId of adapter.playerIds) {
    stage6Submit(adapter, playerId, { kind: "vote-ready" }, now);
  }
  const voteState = adapter.getPublicState(now) as SizmaPublicState;
  assert.equal(voteState.subPhase, "vote");
  assert.deepEqual(voteState.votedPlayerIds, []);
  for (const playerId of adapter.playerIds) {
    stage6Submit(adapter, playerId, { kind: "vote", targetPlayerId: playerId }, now + 1);
  }

  const voteEndsAt = (adapter.getPublicState(now + 1) as SizmaPublicState).voteEndsAt;
  assert.ok(voteEndsAt !== null);
  adapter.advance(voteEndsAt + 1);
  const result = adapter.getPublicState(voteEndsAt + 1) as SizmaPublicState;
  assert.equal(result.finished, true);
  assert.equal(result.voteCounts?.length, 3);
  assert.equal(result.outsiderPlayerId !== null, true);
  assert.equal(result.commonWord !== null, true);
  assert.equal(result.outsiderWord !== null, true);
});

test("11.8B Hafıza tek ACK ile batch diziyi kabul eder ve sonucu yasal ekranda tekrarlar", () => {
  const adapter = createStage6GameAdapter("zaman-bombasi-hafizasi", ["a", "b"], () => 0);
  adapter.start(0);
  const firstDisplay = adapter.getPublicState(0) as MemoryPublicState;
  assert.deepEqual(firstDisplay.sequence, ["cyan", "cyan"]);
  assert.equal(firstDisplay.sequenceLength, 2);

  adapter.advance(firstDisplay.displayUntil ?? 1_500);
  const inputState = adapter.getPublicState(1_500) as MemoryPublicState;
  assert.equal(inputState.subPhase, "input");
  assert.deepEqual(inputState.sequence, []);
  const active = inputState.activePlayerId;
  assert.ok(active);
  assert.deepEqual(adapter.submit(active, { kind: "memory-color", color: "cyan" }, 1_500), { accepted: false, reason: "invalid" });
  stage6Submit(adapter, active, { kind: "memory-sequence", sequence: ["cyan", "cyan"] }, 1_501);

  const nextDisplay = adapter.getPublicState(1_501) as MemoryPublicState;
  assert.equal(nextDisplay.subPhase, "display");
  assert.equal(nextDisplay.sequenceLength, 3);
  assert.deepEqual(nextDisplay.resultSequence, []);

  adapter.advance(nextDisplay.displayUntil ?? 3_001);
  const nextInput = adapter.getPublicState(3_001) as MemoryPublicState;
  assert.equal(nextInput.subPhase, "input");
  assert.ok(nextInput.activePlayerId);
  stage6Submit(adapter, nextInput.activePlayerId, { kind: "memory-sequence", sequence: ["magenta", "magenta", "magenta"] }, 3_002);

  const result = adapter.getPublicState(3_002) as MemoryPublicState;
  assert.equal(result.finished, true);
  assert.equal(result.subPhase, "results");
  assert.deepEqual(result.sequence, []);
  assert.equal(result.resultSequence.length, 3);
  assert.equal(result.mistakeCount, 1);
  assert.equal(result.eliminatedPlayerIds.length, 1);
});

test("11.8B hedef matrisi self-target istisnasını ve bağlı hedef şartını adapter sınırında uygular", () => {
  const russian = createStage9GameAdapter("rus-ruleti", ["a", "b"], () => 0.99);
  russian.start(0);
  const holder = (russian.getPublicState(1) as RusRuletiPublicState).currentHolderId;
  assert.ok(holder);
  stage9Submit(russian, holder, { kind: "russian-shot", targetPlayerId: holder }, 1_000);

  const bomb = createStage7GameAdapter("kor-bomba", ["a", "b"], () => 0);
  bomb.start(0);
  assert.deepEqual(bomb.submit("a", { kind: "bomb-pass", targetPlayerId: "a" }, 1_000), { accepted: false, reason: "invalid" });
  stage7Submit(bomb, "a", { kind: "bomb-pass", targetPlayerId: "b" }, 1_001);
  assert.deepEqual(bomb.submit("b", { kind: "bomb-pass", targetPlayerId: "a" }, 1_002), { accepted: true });

  const glass = createStage8GameAdapter("zehirli-kadeh", ["a", "b", "c"], () => 0);
  glass.start(0);
  assert.deepEqual(glass.submit("a", { kind: "glass-trade", targetPlayerId: "a" }, 1_000), { accepted: false, reason: "invalid" });
  glass.setConnectedPlayerIds?.(["a", "b"], 1_000);
  assert.deepEqual(glass.submit("a", { kind: "glass-trade", targetPlayerId: "c" }, 1_001), { accepted: false, reason: "invalid" });
  stage8Submit(glass, "a", { kind: "glass-trade", targetPlayerId: "b" }, 1_002);

  const crossfire = createStage7GameAdapter("capraz-ates", ["a", "b", "c"]);
  crossfire.start(0);
  assert.deepEqual(crossfire.submit("a", { kind: "crossfire-target", targetPlayerId: "a" }, 1_000), { accepted: false, reason: "invalid" });
  assert.deepEqual(crossfire.submit("a", { kind: "crossfire-miss" }, 1_001), { accepted: true });
  assert.deepEqual(crossfire.submit("a", { kind: "crossfire-miss" }, 1_002), { accepted: false, reason: "duplicate" });
  crossfire.setConnectedPlayerIds?.(["a", "b"], 1_003);
  assert.deepEqual(crossfire.submit("b", { kind: "crossfire-target", targetPlayerId: "c" }, 1_004), { accepted: false, reason: "invalid" });
});

test("11.8B risk, fuse, poison ve input dizisi sonuçtan önce private kalır", () => {
  const russian = createStage9GameAdapter("rus-ruleti", ["a", "b"], () => 0.99);
  russian.start(0);
  const russianPublic = russian.getPublicState(1) as RusRuletiPublicState;
  assert.equal(JSON.stringify(russianPublic).includes("riskPercent"), false);

  const bomb = createStage7GameAdapter("kor-bomba", ["a", "b"], () => 0);
  bomb.start(0);
  const bombPublic = bomb.getPublicState(1) as KorBombaPublicState;
  const bombOwn = bomb.getOwnState("a", 1) as { visibleRemainingMs: number | null };
  assert.equal(JSON.stringify(bombPublic).includes("explosionAt"), false);
  assert.equal(bombOwn.visibleRemainingMs, null);

  const glass = createStage8GameAdapter("zehirli-kadeh", ["a", "b", "c"], () => 0);
  glass.start(0);
  const glassPublic = glass.getPublicState(1) as ZehirliKadehPublicState;
  assert.equal(glassPublic.poisonedPlayerIds, null);
  assert.equal((glass.getOwnState("a", 1) as { poisoned: boolean | null }).poisoned, null);

  const memory = createStage6GameAdapter("zaman-bombasi-hafizasi", ["a", "b"], () => 0);
  memory.start(0);
  const display = memory.getPublicState(0) as MemoryPublicState;
  memory.advance(display.displayUntil ?? 1_500);
  assert.deepEqual((memory.getPublicState(1_500) as MemoryPublicState).sequence, []);
});

test("11.8B UI private values do not enter DOM identity or accessibility sinks", () => {
  const uiFiles = [
    "SizmaStage.tsx",
    "RusRuletiStage.tsx",
    "KorBombaStage.tsx",
    "ZehirliKadehStage.tsx",
    "CaprazAtesStage.tsx",
    "MemoryStage.tsx",
  ];
  const privateSink =
    /(?:className|id|aria-label|data-[A-Za-z0-9_-]+)\s*=\s*\{[^}\n]*(?:assignedWord|riskPercent|poisonedPlayerIds|poisoned|\.role)\b/;

  for (const fileName of uiFiles) {
    const source = readFileSync(
      new URL(`../../../apps/client/src/visuals/games/stage11-8b/${fileName}`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(source, privateSink, `${fileName} leaks a private value through a DOM sink`);
    assert.doesNotMatch(source, /dangerouslySetInnerHTML|window\.__[A-Za-z0-9_]+|data-(?:secret|risk|poison|role)/i);
  }
});

test("11.8B Sızma kalıcı ayrılan koltuğu sonuç skoru ve outsider hedefinden çıkarır", () => {
  const adapter = createStage6GameAdapter("sizma", ["a", "b", "c"], () => 0);
  adapter.start(0);
  adapter.removePlayer("a");
  let now = 100;
  while ((adapter.getPublicState(now) as SizmaPublicState).subPhase === "clue") {
    const state = adapter.getPublicState(now) as SizmaPublicState;
    const playerId = state.clueTurnPlayerId;
    assert.ok(playerId);
    stage6Submit(adapter, playerId, { kind: "clue-complete", clueText: "açık kanal" }, now);
    now += 1;
  }
  for (const playerId of adapter.playerIds) stage6Submit(adapter, playerId, { kind: "vote-ready" }, now);
  for (const playerId of adapter.playerIds) stage6Submit(adapter, playerId, { kind: "vote", targetPlayerId: "b" }, now + 1);
  const voteEndsAt = (adapter.getPublicState(now + 1) as SizmaPublicState).voteEndsAt;
  assert.ok(voteEndsAt !== null);
  adapter.advance(voteEndsAt + 1);
  const result = adapter.getPublicState(voteEndsAt + 1) as SizmaPublicState;
  assert.equal(result.outsiderPlayerId, null);
  assert.equal(adapter.getMiniGameScores().has("a"), false);
  assert.equal(adapter.getScoreDeltas().some((delta) => delta.playerId === "a"), false);
});

test("11.8B holder/active disconnectleri oyunu skor uydurmadan deterministic ilerletir", () => {
  const russian = createStage9GameAdapter("rus-ruleti", ["a", "b", "c"], () => 0.99);
  russian.start(0);
  russian.setConnectedPlayerIds?.(["b", "c"], 2_000);
  assert.equal(["b", "c"].includes((russian.getPublicState(2_000) as RusRuletiPublicState).currentHolderId ?? ""), true);
  assert.deepEqual(russian.getScoreDeltas(), []);

  const bomb = createStage7GameAdapter("kor-bomba", ["a", "b", "c"], () => 0);
  bomb.start(0);
  bomb.setConnectedPlayerIds?.(["b", "c"], 2_000);
  assert.equal((bomb.getPublicState(2_000) as KorBombaPublicState).bombHolderId, "b");
  assert.deepEqual(bomb.getScoreDeltas(), []);

  const memory = createStage6GameAdapter("zaman-bombasi-hafizasi", ["a", "b", "c"], () => 0);
  memory.start(0);
  const before = memory.getPublicState(1) as MemoryPublicState;
  memory.setConnectedPlayerIds?.(memory.playerIds.filter((playerId) => playerId !== before.activePlayerId), 2);
  const after = memory.getPublicState(2) as MemoryPublicState;
  assert.notEqual(after.activePlayerId, before.activePlayerId);
  assert.deepEqual(memory.eliminatedPlayerIds, []);
  assert.deepEqual(memory.getScoreDeltas(), []);
});

test("11.8B tüm bağlılar ayrıldığında zaman tabanlı adapterlar durur ve reconnect süresi öteler", () => {
  const glass = createStage8GameAdapter("zehirli-kadeh", ["a", "b", "c"], () => 0);
  glass.start(0);
  glass.setConnectedPlayerIds?.([], 1_000);
  assert.equal(glass.advance(100_000), false);
  assert.equal(glass.isFinished, false);
  glass.setConnectedPlayerIds?.(["a", "b"], 101_000);
  assert.equal(glass.advance(119_999), false);
  assert.equal(glass.advance(120_000), true);

  const crossfire = createStage7GameAdapter("capraz-ates", ["a", "b", "c"]);
  crossfire.start(0);
  crossfire.setConnectedPlayerIds?.([], 1_000);
  assert.equal(crossfire.advance(100_000), false);
  assert.equal(crossfire.isFinished, false);
  crossfire.setConnectedPlayerIds?.(["a", "b"], 101_000);
  assert.equal(crossfire.advance(124_999), false);
  assert.equal(crossfire.advance(126_000), true);
});

test("11.8B Çapraz Ateş sonucu mutual, non-mutual gelen ve miss ödülünü açıkça ayırır", () => {
  const adapter = createStage7GameAdapter("capraz-ates", ["a", "b", "c", "d"]);
  adapter.start(0);
  stage7Submit(adapter, "a", { kind: "crossfire-target", targetPlayerId: "b" }, 1_000);
  stage7Submit(adapter, "b", { kind: "crossfire-target", targetPlayerId: "a" }, 1_000);
  stage7Submit(adapter, "c", { kind: "crossfire-target", targetPlayerId: "a" }, 1_000);
  stage7Submit(adapter, "d", { kind: "crossfire-miss" }, 1_000);
  adapter.advance(25_000);
  const result = adapter.getPublicState(25_000) as CaprazAtesPublicState;
  assert.deepEqual(result.results?.map((entry) => [entry.playerId, entry.points]), [["a", 0], ["b", 0], ["c", 0], ["d", 1]]);
  assert.deepEqual(adapter.getScoreDeltas(), [{ playerId: "d", points: 1, reason: "capraz-ates:hedef-sonucu" }]);
});

test("11.8B Çapraz Ateş kabul edilmiş kopuk hedefi sonuçtan önce boşa çevirir", () => {
  const adapter = createStage7GameAdapter("capraz-ates", ["a", "b", "c"]);
  adapter.start(0);
  stage7Submit(adapter, "a", { kind: "crossfire-target", targetPlayerId: "b" }, 1_000);

  adapter.setConnectedPlayerIds?.(["a", "c"], 1_001);
  assert.equal((adapter.getOwnState("a", 1_001) as { selectedTargetId: string | null }).selectedTargetId, null);

  adapter.setConnectedPlayerIds?.(["a", "b", "c"], 1_002);
  assert.equal((adapter.getOwnState("a", 1_002) as { selectedTargetId: string | null }).selectedTargetId, null);

  adapter.advance(25_000);
  const result = adapter.getPublicState(25_000) as CaprazAtesPublicState;
  assert.deepEqual(result.results?.find((entry) => entry.playerId === "a"), {
    playerId: "a",
    targetPlayerId: null,
    incomingCount: 0,
    points: 1
  });
  assert.equal(adapter.getMiniGameScores().get("a"), 1);
});

test("11.8B batch status ve reducer stale negative ACK sonrasında editable/accepted stateini korur", () => {
  const own = { isActive: true, eliminated: false, inputDeadline: 5_000, finished: false };
  const status = deriveSubmissionStatus("zaman-bombasi-hafizasi", own, { subPhase: "input" }, true);
  assert.equal(status.mode, "batch");
  assert.equal(status.canAct, true);

  const scope = { matchId: "m", gameId: "zaman-bombasi-hafizasi" as const, phaseIndex: 2, actionScope: "memory", sessionId: "reconnected", spectator: false };
  let state = reduceClientActionState(null, { type: "scope", scope, stateVersion: 8, mode: "batch", completed: false });
  state = reduceClientActionState(state, { type: "submit", actionId: "batch-1", observedStateVersion: 8 });
  state = reduceClientActionState(state, { type: "ack", actionId: "batch-1", accepted: false, stateVersion: 7, reason: "invalid" });
  assert.equal(state.status, "pending");
  state = reduceClientActionState(state, { type: "scope", scope: { ...scope, sessionId: "after-reconnect" }, stateVersion: 9, mode: "batch", completed: false });
  assert.equal(state.status, "editable");
});
