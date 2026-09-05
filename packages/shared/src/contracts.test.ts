import assert from "node:assert/strict";
import test from "node:test";
import { createMiniGameDefinition, MiniGameEngine } from "./engine.js";
import { areExtractedTargetsEligible, deriveActionScope, deriveSubmissionStatus, extractGameTargets, reduceClientActionState } from "./contracts.js";
import { getGameDefinition } from "./index.js";

test("adapter contract extracts single and batch targets and rejects malformed target payloads", () => {
  assert.deepEqual(extractGameTargets("sizma", { kind: "vote", targetPlayerId: "b" }), { kind: "targets", targetPlayerIds: ["b"] });
  assert.deepEqual(extractGameTargets("kendim", { kind: "kendim-matches", matches: [{ cardId: "c1", targetPlayerId: "b" }, { cardId: "c2", targetPlayerId: "c" }] }), { kind: "targets", targetPlayerIds: ["b", "c"] });
  assert.deepEqual(extractGameTargets("kendim", { kind: "kendim-matches", matches: [{ cardId: "c1" }] }), { kind: "malformed" });
  assert.deepEqual(extractGameTargets("butona-bas", { kind: "button-tap" }), { kind: "none" });
});

test("all target-bearing game contracts extract their declared player ids", () => {
  const cases = [
    ["yazi-yaz", { kind: "yazi-guess", targetWriterId: "b" }],
    ["sizma", { kind: "vote", targetPlayerId: "b" }],
    ["rus-ruleti", { kind: "russian-shot", targetPlayerId: "b" }],
    ["kor-bomba", { kind: "bomb-pass", targetPlayerId: "b" }],
    ["rusvet-darbe", { kind: "president-vote", targetPlayerId: "b" }],
    ["karalama-defteri", { kind: "drawing-vote", targetPlayerId: "b" }],
    ["ittifak", { kind: "alliance-vote", targetPlayerId: "b" }],
    ["zehirli-kadeh", { kind: "glass-trade", targetPlayerId: "b" }],
    ["capraz-ates", { kind: "crossfire-target", targetPlayerId: "b" }]
  ] as const;
  for (const [gameId, payload] of cases) {
    assert.deepEqual(extractGameTargets(gameId, payload), { kind: "targets", targetPlayerIds: ["b"] });
  }
});

test("shared live-roster eligibility rejects disconnected, eliminated, stale and spectator seats", () => {
  const extraction = { kind: "targets", targetPlayerIds: ["b"] } as const;
  const seat = { id: "b", connected: true, currentGameParticipant: true, eliminated: false };
  assert.equal(areExtractedTargetsEligible(extraction, [seat]), true);
  assert.equal(areExtractedTargetsEligible(extraction, [{ ...seat, connected: false }]), false);
  assert.equal(areExtractedTargetsEligible(extraction, [{ ...seat, eliminated: true }]), false);
  assert.equal(areExtractedTargetsEligible(extraction, [{ ...seat, currentGameParticipant: false }]), false);
  assert.equal(areExtractedTargetsEligible(extraction, []), false);
});

test("adapter action scopes fence internal rounds and semantic status follows the current Yazı Yaz step", () => {
  assert.notEqual(deriveActionScope("gizli-kareler", { round: 1 }), deriveActionScope("gizli-kareler", { round: 2 }));
  const own = { hasWritten: true, hasGuessed: false, canGuess: true, role: "writer", finished: false };
  assert.deepEqual(deriveSubmissionStatus("yazi-yaz", own, { subPhase: "guess" }, true), {
    mode: "turn", canAct: true, completed: false, acceptedActionCount: 0, locked: false
  });
});

test("phase scoped reducer ignores stale and unrelated ACKs after newer authoritative state", () => {
  const scope = { matchId: "m", gameId: "kontrol-paneli-kaosu" as const, phaseIndex: 2, actionScope: "[]", sessionId: "s", spectator: false };
  let state = reduceClientActionState(null, { type: "scope", scope, stateVersion: 4, mode: "single", completed: false });
  state = reduceClientActionState(state, { type: "submit", actionId: "a2", observedStateVersion: 4 });
  const unrelated = reduceClientActionState(state, { type: "ack", actionId: "a1", accepted: false, stateVersion: 4 });
  assert.equal(unrelated.status, "pending");
  state = reduceClientActionState(state, { type: "scope", scope, stateVersion: 5, mode: "single", completed: true });
  assert.equal(state.status, "accepted");
  const stale = reduceClientActionState(state, { type: "ack", actionId: "a2", accepted: false, stateVersion: 4 });
  assert.equal(stale.status, "accepted");
  const staleSnapshot = reduceClientActionState(state, { type: "scope", scope, stateVersion: 3, mode: "single", completed: false });
  assert.equal(staleSnapshot.status, "accepted");
  assert.equal(staleSnapshot.authoritativeVersion, 5);
});

test("scope changes clear pending and repeatable actions can start a new sequence", () => {
  const scope = { matchId: "m", gameId: "butona-bas" as const, phaseIndex: 2, actionScope: "[[\"windowIndex\",1]]", sessionId: "s1", spectator: false };
  let state = reduceClientActionState(null, { type: "scope", scope, stateVersion: 1, mode: "repeatable", completed: false });
  state = reduceClientActionState(state, { type: "submit", actionId: "a1", observedStateVersion: 1 });
  state = reduceClientActionState(state, { type: "ack", actionId: "a1", accepted: true, stateVersion: 2 });
  state = reduceClientActionState(state, { type: "submit", actionId: "a2", observedStateVersion: 2 });
  assert.equal(state.status, "pending");
  assert.equal(state.actionId, "a2");
  state = reduceClientActionState(state, { type: "scope", scope: { ...scope, sessionId: "s2" }, stateVersion: 2, mode: "repeatable", completed: false });
  assert.equal(state.status, "editable");
});

test("prepared engine input is side-effect free until commit", () => {
  const definition = createMiniGameDefinition(getGameDefinition("gizli-hirsiz"), { phases: [{ id: "playing", durationMs: 1000, advance: "timer" }], inputPolicy: "single", allowEmptyInput: false });
  const engine = new MiniGameEngine(definition, ["a"], 0);
  const prepared = engine.prepareInput("a", { kind: "steal" }, 1);
  assert.equal(prepared.accepted, true);
  assert.equal(engine.snapshot(1).inputCount, 0);
  if (prepared.accepted) engine.commitPreparedInput(prepared.prepared);
  assert.equal(engine.snapshot(1).inputCount, 1);
  assert.deepEqual(engine.prepareInput("a", { kind: "steal" }, 2), { accepted: false, reason: "duplicate" });
});
