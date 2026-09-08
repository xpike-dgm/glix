import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createStage8GameAdapter,
  type CagrisimAgiOwnState,
  type CagrisimAgiPublicState,
  type DrawingStroke,
  type IttifakOwnState,
  type IttifakPublicState,
  type KaralamaDefteriOwnState,
  type KaralamaDefteriPublicState,
  type RusvetDarbeOwnState,
  type RusvetDarbePublicState,
  type SozlukBlofuOwnState,
  type SozlukBlofuPublicState,
  type Stage8GameAdapter,
  type YaziYazOwnState,
  type YaziYazPublicState
} from "./games-stage8.js";
import { PROTOCOL_VERSION } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function submit(adapter: Stage8GameAdapter, playerId: string, payload: Record<string, unknown>, now: number) {
  return adapter.submit(playerId, payload as never, now);
}

function score(adapter: Stage8GameAdapter, playerId: string): number {
  return adapter.getMiniGameScores().get(playerId) ?? 0;
}

// ---------------------------------------------------------------------------
// 1. Yazı Yaz Tests
// ---------------------------------------------------------------------------
test("Yazı Yaz — game loop, secret roles, duplicate defense, target validation and scoring", () => {
  const adapter = createStage8GameAdapter("yazi-yaz", ["p1", "p2", "p3"], () => 0);
  adapter.start(0);

  // Subphase: write
  const public1 = adapter.getPublicState(1) as YaziYazPublicState;
  assert.equal(public1.subPhase, "write");
  assert.equal(public1.writerPlayerIds, null, "Writer IDs must remain hidden during write");
  assert.equal(public1.entries, null, "Entries must be null during write");

  // Retrieve roles
  const writerPlayerIds = ["p1", "p2", "p3"].filter((id) => (adapter.getOwnState(id, 1) as YaziYazOwnState).role === "writer");
  const innocentPlayerIds = ["p1", "p2", "p3"].filter((id) => (adapter.getOwnState(id, 1) as YaziYazOwnState).role === "innocent");

  assert.equal(writerPlayerIds.length, 2);
  assert.equal(innocentPlayerIds.length, 1);

  // Innocent cannot submit yazi-word
  const innocentId = innocentPlayerIds[0]!;
  assert.deepEqual(submit(adapter, innocentId, { kind: "yazi-word", word: "KELİME" }, 10), { accepted: false, reason: "invalid" });
  assert.deepEqual(submit(adapter, innocentId, { kind: "yazi-masum" }, 20), { accepted: true });

  // Innocent duplicate submit
  assert.deepEqual(submit(adapter, innocentId, { kind: "yazi-masum" }, 25), { accepted: false, reason: "duplicate" });

  // Writers submit words
  const w1 = writerPlayerIds[0]!;
  const w2 = writerPlayerIds[1]!;
  assert.deepEqual(submit(adapter, w1, { kind: "yazi-word", word: "KİTAP" }, 30), { accepted: true });
  // Duplicate rejection for writer
  assert.deepEqual(submit(adapter, w1, { kind: "yazi-word", word: "DEFTER" }, 35), { accepted: false, reason: "duplicate" });
  assert.deepEqual(submit(adapter, w2, { kind: "yazi-word", word: "KALEM" }, 40), { accepted: true });

  // Advance to discussion
  adapter.advance(30_000);
  const publicDisc = adapter.getPublicState(30_001) as YaziYazPublicState;
  assert.equal(publicDisc.subPhase, "discussion");
  assert.equal(publicDisc.writerPlayerIds, null, "Writer IDs must still be secret during discussion");

  // Advance to guess
  adapter.advance(90_000);
  const publicGuess = adapter.getPublicState(90_001) as YaziYazPublicState;
  assert.equal(publicGuess.subPhase, "guess");

  // Target validations in guess phase
  // Self guess rejection
  assert.deepEqual(submit(adapter, w1, { kind: "yazi-guess", targetWriterId: w1, targetWord: "KALEM" }, 90_010), { accepted: false, reason: "invalid" });
  // Guessing innocent as writer rejection
  assert.deepEqual(submit(adapter, w1, { kind: "yazi-guess", targetWriterId: innocentId, targetWord: "KALEM" }, 90_020), { accepted: false, reason: "invalid" });

  // Valid guess by w1 targeting w2 with correct word KALEM
  assert.deepEqual(submit(adapter, w1, { kind: "yazi-guess", targetWriterId: w2, targetWord: "KALEM" }, 90_030), { accepted: true });
  // Duplicate guess rejection
  assert.deepEqual(submit(adapter, w1, { kind: "yazi-guess", targetWriterId: w2, targetWord: "KALEM" }, 90_040), { accepted: false, reason: "duplicate" });

  // Innocent guesses w1 correctly with correct word KİTAP
  assert.deepEqual(submit(adapter, innocentId, { kind: "yazi-guess", targetWriterId: w1, targetWord: "KİTAP" }, 90_050), { accepted: true });

  // w2 guesses w1 with wrong word
  assert.deepEqual(submit(adapter, w2, { kind: "yazi-guess", targetWriterId: w1, targetWord: "YANLIŞ" }, 90_060), { accepted: true });

  // Advance to results
  adapter.advance(120_000);
  assert.equal(adapter.isFinished, true);
  const finalPublic = adapter.getPublicState(120_001) as YaziYazPublicState;
  assert.equal(finalPublic.subPhase, "results");
  assert.ok(finalPublic.writerPlayerIds);
  assert.equal(finalPublic.writerPlayerIds.length, 2);

  // w1 got person (+1) and word (+1) = 2
  assert.equal(score(adapter, w1), 2);
  // innocent got person (+1) and word (+1) = 2
  assert.equal(score(adapter, innocentId), 2);
  // w2 got person (+1) only = 1
  assert.equal(score(adapter, w2), 1);
});

// ---------------------------------------------------------------------------
// 2. Sözlük Blöfü Tests
// ---------------------------------------------------------------------------
test("Sözlük Blöfü — game loop, secret bluffs, own definition guard, and bluff points", () => {
  const adapter = createStage8GameAdapter("sozluk-blofu", ["p1", "p2", "p3"], () => 0);
  adapter.start(0);

  const publicWrite = adapter.getPublicState(1) as SozlukBlofuPublicState;
  assert.equal(publicWrite.subPhase, "write");
  assert.ok(publicWrite.word, "Word must be present");
  assert.equal(publicWrite.definitions, null, "Definitions must be hidden during write");

  // Submit bluffs
  assert.deepEqual(submit(adapter, "p1", { kind: "dictionary-bluff", text: "P1 uydurma tanım" }, 10), { accepted: true });
  assert.deepEqual(submit(adapter, "p1", { kind: "dictionary-bluff", text: "İkinci tanım" }, 15), { accepted: false, reason: "duplicate" });
  assert.deepEqual(submit(adapter, "p2", { kind: "dictionary-bluff", text: "P2 uydurma tanım" }, 20), { accepted: true });
  assert.deepEqual(submit(adapter, "p3", { kind: "dictionary-bluff", text: "P3 uydurma tanım" }, 30), { accepted: true });

  // Advance to choose
  adapter.advance(50_000);
  const publicChoose = adapter.getPublicState(50_001) as SozlukBlofuPublicState;
  assert.equal(publicChoose.subPhase, "choose");
  assert.ok(publicChoose.definitions);
  // Should have real definition + 3 player bluffs = 4 definitions
  assert.equal(publicChoose.definitions.length, 4);

  // Check that public state in choose phase hides isReal and ownerId
  for (const def of publicChoose.definitions) {
    assert.equal(def.isReal, null, "isReal must be hidden during choose phase");
    assert.equal(def.ownerId, null, "ownerId must be hidden during choose phase");
  }

  // Find own definition ID for p1 from private lookup (by text)
  const p1Def = publicChoose.definitions.find((d) => d.text === "P1 uydurma tanım")!;
  const realDef = publicChoose.definitions.find((d) => d.text !== "P1 uydurma tanım" && d.text !== "P2 uydurma tanım" && d.text !== "P3 uydurma tanım")!;

  // Guard: player cannot choose their own bluff definition
  assert.deepEqual(submit(adapter, "p1", { kind: "dictionary-choice", definitionId: p1Def.id }, 50_010), { accepted: false, reason: "invalid" });

  // p1 chooses real definition (+1 pt)
  assert.deepEqual(submit(adapter, "p1", { kind: "dictionary-choice", definitionId: realDef.id }, 50_020), { accepted: true });
  // Duplicate choice
  assert.deepEqual(submit(adapter, "p1", { kind: "dictionary-choice", definitionId: realDef.id }, 50_025), { accepted: false, reason: "duplicate" });

  // p2 chooses p1's bluff (+1 pt to p1)
  assert.deepEqual(submit(adapter, "p2", { kind: "dictionary-choice", definitionId: p1Def.id }, 50_030), { accepted: true });

  // p3 chooses p1's bluff (+1 pt to p1)
  assert.deepEqual(submit(adapter, "p3", { kind: "dictionary-choice", definitionId: p1Def.id }, 50_040), { accepted: true });

  // Advance to results
  adapter.advance(80_000);
  assert.equal(adapter.isFinished, true);

  const finalPublic = adapter.getPublicState(80_001) as SozlukBlofuPublicState;
  assert.equal(finalPublic.subPhase, "results");

  // p1: 1 (found real) + 2 (p2 & p3 chose p1's bluff) = 3
  assert.equal(score(adapter, "p1"), 3);
  // p2: 0
  assert.equal(score(adapter, "p2"), 0);
  // p3: 0
  assert.equal(score(adapter, "p3"), 0);
});

// ---------------------------------------------------------------------------
// 3. Çağrışım Ağı Tests
// ---------------------------------------------------------------------------
test("Çağrışım Ağı — prompt display, hidden answers until results, cluster scoring", () => {
  const adapter = createStage8GameAdapter("cagrisim-agi", ["p1", "p2", "p3", "p4"], () => 0);
  adapter.start(0);

  const publicInitial = adapter.getPublicState(1) as CagrisimAgiPublicState;
  assert.equal(publicInitial.subPhase, "answer");
  assert.ok(publicInitial.mainWord, "Prompt mainWord must be revealed");
  assert.equal(publicInitial.groups, null, "Groups must be hidden during answer phase");

  // p1 and p2 submit matching answer: "GÜNEŞ"
  assert.deepEqual(submit(adapter, "p1", { kind: "association", answer: "GÜNEŞ" }, 10), { accepted: true });
  // Duplicate rejection
  assert.deepEqual(submit(adapter, "p1", { kind: "association", answer: "AY" }, 15), { accepted: false, reason: "duplicate" });
  assert.deepEqual(submit(adapter, "p2", { kind: "association", answer: "güneş" }, 20), { accepted: true });

  // p3 and p4 submit unique answers
  assert.deepEqual(submit(adapter, "p3", { kind: "association", answer: "YILDIZ" }, 30), { accepted: true });
  assert.deepEqual(submit(adapter, "p4", { kind: "association", answer: "BULUT" }, 40), { accepted: true });

  // Advance to results
  adapter.advance(30_000);
  assert.equal(adapter.isFinished, true);

  const finalPublic = adapter.getPublicState(30_001) as CagrisimAgiPublicState;
  assert.equal(finalPublic.subPhase, "results");
  assert.ok(finalPublic.groups);

  // Group of size 2 ("GÜNEŞ") yields 2 points each
  assert.equal(score(adapter, "p1"), 2);
  assert.equal(score(adapter, "p2"), 2);
  // Solo answers yield 0
  assert.equal(score(adapter, "p3"), 0);
  assert.equal(score(adapter, "p4"), 0);
});

// ---------------------------------------------------------------------------
// 4. Rüşvet ve Darbe Tests
// ---------------------------------------------------------------------------
test("Rüşvet ve Darbe — election, president budget distribution conservation, and score deltas", () => {
  const adapter = createStage8GameAdapter("rusvet-darbe", ["p1", "p2", "p3", "p4"], () => 0);
  adapter.start(0);

  const initial = adapter.getPublicState(1) as RusvetDarbePublicState;
  assert.equal(initial.subPhase, "election");

  // Election votes: p2, p3, p4 vote for p1 -> p1 gets 3 votes (president)
  // Self vote rejection
  assert.deepEqual(submit(adapter, "p1", { kind: "president-vote", targetPlayerId: "p1" }, 10), { accepted: false, reason: "invalid" });
  assert.deepEqual(submit(adapter, "p1", { kind: "president-vote", targetPlayerId: "p2" }, 15), { accepted: true });
  assert.deepEqual(submit(adapter, "p1", { kind: "president-vote", targetPlayerId: "p3" }, 18), { accepted: false, reason: "duplicate" });

  assert.deepEqual(submit(adapter, "p2", { kind: "president-vote", targetPlayerId: "p1" }, 20), { accepted: true });
  assert.deepEqual(submit(adapter, "p3", { kind: "president-vote", targetPlayerId: "p1" }, 25), { accepted: true });
  assert.deepEqual(submit(adapter, "p4", { kind: "president-vote", targetPlayerId: "p1" }, 30), { accepted: true });

  // Advance election -> distribution (p1 has 3 votes, p2 has 1)
  adapter.advance(20_000);
  const distPublic = adapter.getPublicState(20_001) as RusvetDarbePublicState;
  assert.equal(distPublic.subPhase, "distribution");
  assert.equal(distPublic.presidentId, "p1");

  const p1Own = adapter.getOwnState("p1", 20_001) as RusvetDarbeOwnState;
  assert.equal(p1Own.isPresident, true);
  assert.equal(p1Own.remainingDistributionPoints, 3);

  // Non-president distribution rejection
  assert.deepEqual(submit(adapter, "p2", { kind: "president-distribution", allocations: [{ targetPlayerId: "p3", points: 1 }] }, 20_010), { accepted: false, reason: "phase-locked" });

  // President allocating to self rejection
  assert.deepEqual(submit(adapter, "p1", { kind: "president-distribution", allocations: [{ targetPlayerId: "p1", points: 2 }] }, 20_020), { accepted: false, reason: "invalid" });

  // President allocating > budget (total 4 > 3) rejection
  assert.deepEqual(submit(adapter, "p1", { kind: "president-distribution", allocations: [{ targetPlayerId: "p2", points: 2 }, { targetPlayerId: "p3", points: 2 }] }, 20_030), { accepted: false, reason: "invalid" });

  // President allocating invalid point value (e.g. 3) rejection
  assert.deepEqual(submit(adapter, "p1", { kind: "president-distribution", allocations: [{ targetPlayerId: "p2", points: 3 }] }, 20_035), { accepted: false, reason: "invalid" });

  // Valid distribution: 2 points to p2, 1 point to p3 (total 3 = budget)
  assert.deepEqual(submit(adapter, "p1", {
    kind: "president-distribution",
    allocations: [
      { targetPlayerId: "p2", points: 2 },
      { targetPlayerId: "p3", points: 1 }
    ]
  }, 20_040), { accepted: true });

  // Duplicate distribution rejection
  assert.deepEqual(submit(adapter, "p1", {
    kind: "president-distribution",
    allocations: [{ targetPlayerId: "p2", points: 1 }]
  }, 20_045), { accepted: false, reason: "duplicate" });

  // Advance to results
  adapter.advance(45_000);
  assert.equal(adapter.isFinished, true);

  // p1 gets 1 (president bonus)
  assert.equal(score(adapter, "p1"), 1);
  // p2 gets 2 (bribe)
  assert.equal(score(adapter, "p2"), 2);
  // p3 gets 1 (bribe)
  assert.equal(score(adapter, "p3"), 1);
  // p4 gets 0
  assert.equal(score(adapter, "p4"), 0);
});

test("Rüşvet ve Darbe — tie triggers RPS duel loop until winner emerges", () => {
  const adapter = createStage8GameAdapter("rusvet-darbe", ["p1", "p2", "p3", "p4"], () => 0);
  adapter.start(0);

  // Election tie: p1 -> p4, p2 -> p3, p3 -> p4, p4 -> p3 -> p3 and p4 tie with 2 votes each (no self votes)
  assert.deepEqual(submit(adapter, "p1", { kind: "president-vote", targetPlayerId: "p4" }, 10), { accepted: true });
  assert.deepEqual(submit(adapter, "p2", { kind: "president-vote", targetPlayerId: "p3" }, 10), { accepted: true });
  assert.deepEqual(submit(adapter, "p3", { kind: "president-vote", targetPlayerId: "p4" }, 10), { accepted: true });
  assert.deepEqual(submit(adapter, "p4", { kind: "president-vote", targetPlayerId: "p3" }, 10), { accepted: true });

  adapter.advance(20_000);
  const rpsPublic = adapter.getPublicState(20_001) as RusvetDarbePublicState;
  assert.equal(rpsPublic.subPhase, "rps", "Tie must trigger RPS sub-phase");
  assert.deepEqual(rpsPublic.rpsCandidateIds, ["p3", "p4"]);

  // Non-candidate submitting rps-choice rejection
  assert.deepEqual(submit(adapter, "p1", { kind: "rps-choice", choice: "rock" }, 20_010), { accepted: false, reason: "invalid" });

  // Candidate choice
  assert.deepEqual(submit(adapter, "p3", { kind: "rps-choice", choice: "rock" }, 20_020), { accepted: true });
  // Duplicate choice
  assert.deepEqual(submit(adapter, "p3", { kind: "rps-choice", choice: "paper" }, 20_025), { accepted: false, reason: "duplicate" });

  // p4 chooses scissors -> rock beats scissors -> p3 wins president
  assert.deepEqual(submit(adapter, "p4", { kind: "rps-choice", choice: "scissors" }, 20_030), { accepted: true });

  const afterRps = adapter.getPublicState(20_031) as RusvetDarbePublicState;
  assert.equal(afterRps.subPhase, "distribution");
  assert.equal(afterRps.presidentId, "p3");
});

// ---------------------------------------------------------------------------
// 5. Karalama Defteri Tests
// ---------------------------------------------------------------------------
test("Karalama Defteri — stroke bounds, secret outsider role, drawing vote and scoring", () => {
  const adapter = createStage8GameAdapter("karalama-defteri", ["p1", "p2", "p3"], () => 0);
  adapter.start(0);

  const initial = adapter.getPublicState(1) as KaralamaDefteriPublicState;
  assert.equal(initial.subPhase, "draw");
  assert.equal(initial.drawings, null, "Drawings must be hidden in public state during draw phase");
  assert.equal(initial.outsiderPlayerId, null, "Outsider identity must be hidden");

  const outsiderId = ["p1", "p2", "p3"].find((id) => (adapter.getOwnState(id, 1) as KaralamaDefteriOwnState).role === "ignorant")!;
  const informedIds = ["p1", "p2", "p3"].filter((id) => id !== outsiderId);

  // Submit valid strokes
  const validStrokes: DrawingStroke[] = [
    {
      color: "cyan",
      size: 10,
      points: [
        { x: 0.1, y: 0.1 },
        { x: 0.5, y: 0.5 }
      ]
    }
  ];

  assert.deepEqual(submit(adapter, "p1", { kind: "drawing-save", strokes: validStrokes }, 10), { accepted: true });

  // Reject invalid stroke color (not in DRAWING_COLORS)
  const invalidStrokes = [
    {
      color: "black",
      size: 10,
      points: [
        { x: 0.1, y: 0.1 },
        { x: 0.5, y: 0.5 }
      ]
    }
  ];
  assert.deepEqual(submit(adapter, "p1", { kind: "drawing-save", strokes: invalidStrokes }, 20), { accepted: false, reason: "invalid" });

  // Advance to vote phase
  adapter.advance(75_000);
  const votePublic = adapter.getPublicState(75_001) as KaralamaDefteriPublicState;
  assert.equal(votePublic.subPhase, "vote");
  assert.ok(votePublic.drawings, "Drawings become visible in vote phase");

  // Voting: non-self target
  assert.deepEqual(submit(adapter, "p1", { kind: "drawing-vote", targetPlayerId: "p1" }, 75_010), { accepted: false, reason: "invalid" });

  // All players vote for outsider -> outsider caught!
  informedIds.forEach((id) => {
    assert.deepEqual(submit(adapter, id, { kind: "drawing-vote", targetPlayerId: outsiderId }, 75_020), { accepted: true });
  });
  // Outsider votes for one of informed
  submit(adapter, outsiderId, { kind: "drawing-vote", targetPlayerId: informedIds[0]! }, 75_030);

  // Advance to results
  adapter.advance(95_000);
  assert.equal(adapter.isFinished, true);

  const finalPublic = adapter.getPublicState(95_001) as KaralamaDefteriPublicState;
  assert.equal(finalPublic.subPhase, "results");
  assert.equal(finalPublic.outsiderCaught, true);

  // Informed players get 1 point each, outsider gets 0
  informedIds.forEach((id) => assert.equal(score(adapter, id), 1));
  assert.equal(score(adapter, outsiderId), 0);
});

// ---------------------------------------------------------------------------
// 6. İttifak Tests
// ---------------------------------------------------------------------------
test("İttifak — bargain phase lock, mutual alliance vote resolution and points", () => {
  const adapter = createStage8GameAdapter("ittifak", ["p1", "p2", "p3"], () => 0);
  adapter.start(0);

  const initial = adapter.getPublicState(1) as IttifakPublicState;
  assert.equal(initial.subPhase, "bargain");

  // In bargain phase, submit is phase-locked
  assert.deepEqual(submit(adapter, "p1", { kind: "alliance-vote", targetPlayerId: "p2" }, 10), { accepted: false, reason: "phase-locked" });

  // Advance to vote phase
  adapter.advance(60_000);
  const votePublic = adapter.getPublicState(60_001) as IttifakPublicState;
  assert.equal(votePublic.subPhase, "vote");
  assert.equal(votePublic.voteCounts, null, "Votes must be secret during vote phase");

  // Self vote rejection
  assert.deepEqual(submit(adapter, "p1", { kind: "alliance-vote", targetPlayerId: "p1" }, 60_010), { accepted: false, reason: "invalid" });

  // Mutual votes: p1 votes p2, p2 votes p1
  assert.deepEqual(submit(adapter, "p1", { kind: "alliance-vote", targetPlayerId: "p2" }, 60_020), { accepted: true });
  // Duplicate vote rejection
  assert.deepEqual(submit(adapter, "p1", { kind: "alliance-vote", targetPlayerId: "p3" }, 60_025), { accepted: false, reason: "duplicate" });

  assert.deepEqual(submit(adapter, "p2", { kind: "alliance-vote", targetPlayerId: "p1" }, 60_030), { accepted: true });

  // p3 votes p1
  assert.deepEqual(submit(adapter, "p3", { kind: "alliance-vote", targetPlayerId: "p1" }, 60_040), { accepted: true });

  // Advance to results
  adapter.advance(75_000);
  assert.equal(adapter.isFinished, true);

  // p1 received 2 votes -> 2 points
  // p2 received 1 vote -> 1 point
  // p3 received 0 votes -> 0 points
  assert.equal(score(adapter, "p1"), 2);
  assert.equal(score(adapter, "p2"), 1);
  assert.equal(score(adapter, "p3"), 0);
});

// ---------------------------------------------------------------------------
// 7. Disconnect and Reconnect Handling
// ---------------------------------------------------------------------------
test("Batch D Disconnect Policies — skip-disconnected and neutral-missing contracts", () => {
  // yazi-yaz has skip-disconnected policy
  const yazi = createStage8GameAdapter("yazi-yaz", ["p1", "p2", "p3"], () => 0);
  yazi.start(0);
  yazi.setConnectedPlayerIds?.(["p1", "p2"], 10);
  // Disconnected p3 cannot submit
  assert.deepEqual(yazi.submit("p3", { kind: "yazi-masum" }, 15), { accepted: false, reason: "invalid" });

  // rusvet-darbe has skip-disconnected policy
  const rusvet = createStage8GameAdapter("rusvet-darbe", ["p1", "p2", "p3"], () => 0);
  rusvet.start(0);
  rusvet.setConnectedPlayerIds?.(["p1", "p2"], 10);
  // Cannot vote for disconnected target
  assert.deepEqual(rusvet.submit("p1", { kind: "president-vote", targetPlayerId: "p3" }, 15), { accepted: false, reason: "invalid" });

  // karalama-defteri has skip-disconnected policy
  const karalama = createStage8GameAdapter("karalama-defteri", ["p1", "p2", "p3"], () => 0);
  karalama.start(0);
  karalama.advance(75_000); // go to vote
  karalama.setConnectedPlayerIds?.(["p1", "p2"], 75_010);
  // Cannot vote for disconnected player
  assert.deepEqual(karalama.submit("p1", { kind: "drawing-vote", targetPlayerId: "p3" }, 75_015), { accepted: false, reason: "invalid" });
});

// ---------------------------------------------------------------------------
// 8. Protocol v4 Action Correlation & ACK Verification
// ---------------------------------------------------------------------------
test("Protocol v4 action correlation version declaration", () => {
  assert.equal(PROTOCOL_VERSION, 4);
});

// ---------------------------------------------------------------------------
// 9. Static DOM Privacy Leak Verification
// ---------------------------------------------------------------------------
test("Batch D Stage Components — Zero DOM leaks of secrets in className, id, data-*, or aria-label", () => {
  const stageFiles = [
    "YaziYazStage.tsx",
    "SozlukBlofuStage.tsx",
    "CagrisimAgiStage.tsx",
    "RusvetDarbeStage.tsx",
    "KaralamaDefteriStage.tsx",
    "IttifakStage.tsx"
  ];

  const clientDir = resolve(__dirname, "../../../apps/client/src/visuals/games/stage11-8d");

  // Regex patterns that would indicate leaking secret state variables into DOM attributes
  const forbiddenAttrPatterns = [
    /(?:id|className|data-[a-z0-9-]+|aria-label)\s*=\s*\{[^}]*\b(?:ownState\.(?:role|assignedWord|secretWord|isOutsider|bluffText|entry))\b[^}]*\}/i,
    /(?:id|className|data-[a-z0-9-]+|aria-label)\s*=\s*\{[^}]*\b(?:assignedWord|secretWord|bluffText)\b[^}]*\}/i
  ];

  for (const file of stageFiles) {
    const filePath = resolve(clientDir, file);
    const content = readFileSync(filePath, "utf-8");

    for (const pattern of forbiddenAttrPatterns) {
      const match = pattern.exec(content);
      assert.equal(
        match,
        null,
        `DOM privacy violation in ${file}: matched forbidden pattern ${pattern} -> "${match?.[0]}"`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 10. Regression — Production Application Graph Rejects Preview Harness / Routes
// ---------------------------------------------------------------------------
test("Regression — Production application graph strictly rejects Stage11DPreviewHarness, stage11d_preview, and preview inputs", () => {
  const prodFiles = [
    resolve(__dirname, "../../../apps/client/src/App.tsx"),
    resolve(__dirname, "../../../apps/client/src/main.tsx"),
    resolve(__dirname, "../../../apps/client/index.html")
  ];

  for (const filePath of prodFiles) {
    const content = readFileSync(filePath, "utf-8");
    assert.ok(
      !content.includes("Stage11DPreviewHarness"),
      `Production file ${filePath} must not import or reference Stage11DPreviewHarness`
    );
    assert.ok(
      !content.includes("stage11d_preview"),
      `Production file ${filePath} must not reference query parameter or route stage11d_preview`
    );
  }

  // Verify normal vite.config.ts has no devPreview production input
  const viteConfigPath = resolve(__dirname, "../../../apps/client/vite.config.ts");
  const viteConfigContent = readFileSync(viteConfigPath, "utf-8");
  assert.ok(
    !viteConfigContent.includes("devPreview"),
    "Production vite.config.ts must not configure devPreview rollup input"
  );
  assert.ok(
    !viteConfigContent.includes("dev-stage11d"),
    "Production vite.config.ts must not reference dev-stage11d.html"
  );

  // Verify QA config is isolated in vite.config.qa.ts
  const viteQaConfigPath = resolve(__dirname, "../../../apps/client/vite.config.qa.ts");
  assert.ok(existsSync(viteQaConfigPath), "Dedicated QA vite configuration vite.config.qa.ts must exist");
  const viteQaConfigContent = readFileSync(viteQaConfigPath, "utf-8");
  assert.ok(
    viteQaConfigContent.includes("dist-qa"),
    "QA vite configuration must output to isolated dist-qa directory"
  );
  assert.ok(
    viteQaConfigContent.includes("dev-stage11d.html"),
    "QA vite configuration must target dev-stage11d.html"
  );

  // If production dist exists, assert zero preview artifacts or strings inside it
  const distDir = resolve(__dirname, "../../../apps/client/dist");
  if (existsSync(distDir)) {
    assert.ok(
      !existsSync(resolve(distDir, "dev-stage11d.html")),
      "Production dist must not contain dev-stage11d.html"
    );

    function scanDir(dir: string) {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = resolve(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.isFile()) {
          assert.ok(
            !entry.name.includes("devPreview"),
            `Production dist file name must not include devPreview: ${entry.name}`
          );
          if (entry.name.endsWith(".js") || entry.name.endsWith(".html") || entry.name.endsWith(".json")) {
            const fileContent = readFileSync(full, "utf-8");
            assert.ok(
              !fileContent.includes("Stage11DPreviewHarness"),
              `Production dist file ${entry.name} must not contain Stage11DPreviewHarness`
            );
            assert.ok(
              !fileContent.includes("stage11d_preview"),
              `Production dist file ${entry.name} must not contain stage11d_preview`
            );
          }
        }
      }
    }
    scanDir(distDir);
  }
});

// ---------------------------------------------------------------------------
// 11. Privacy & Secret State Audit Across Stage Components
// ---------------------------------------------------------------------------
test("Batch D Privacy Audit — Secret roles, words, votes, and authors never leaked outside results", () => {
  const stageFiles = [
    "YaziYazStage.tsx",
    "SozlukBlofuStage.tsx",
    "CagrisimAgiStage.tsx",
    "RusvetDarbeStage.tsx",
    "KaralamaDefteriStage.tsx",
    "IttifakStage.tsx"
  ];

  const clientDir = resolve(__dirname, "../../../apps/client/src/visuals/games/stage11-8d");

  for (const file of stageFiles) {
    const filePath = resolve(clientDir, file);
    const content = readFileSync(filePath, "utf-8");

    // Must not expose secrets via global window object or console
    assert.ok(!content.includes("window.__"), `${file} must not write to window.__`);
    assert.ok(!content.includes("console.log("), `${file} must not log to console`);

    // Must not attach secrets as dataset attributes
    assert.ok(!content.includes("data-role"), `${file} must not leak role in data-role`);
    assert.ok(!content.includes("data-word"), `${file} must not leak word in data-word`);
    assert.ok(!content.includes("data-author"), `${file} must not leak author in data-author`);
    assert.ok(!content.includes("data-vote"), `${file} must not leak vote in data-vote`);
  }
});

