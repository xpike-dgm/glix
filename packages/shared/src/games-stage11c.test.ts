import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  createStage7GameAdapter,
  GIZLI_ALISVERIS_PRODUCTS,
  type AcgozlulukPublicState,
  type CizgiyiGecmePublicState,
  type GizliAlisverisPublicState,
  type GizliKarelerPublicState,
  type OrtalamaninYarisiPublicState,
  type Stage7GameAdapter
} from "./games-stage7.js";
import {
  deriveActionScope,
  deriveSubmissionStatus,
  reduceClientActionState
} from "./contracts.js";
import type { JsonValue } from "./index.js";

function stage7Submit(adapter: Stage7GameAdapter, playerId: string, payload: JsonValue, now: number): void {
  assert.deepEqual(adapter.submit(playerId, payload, now), { accepted: true });
}

function score(adapter: Stage7GameAdapter, playerId: string): number {
  return adapter.getMiniGameScores().get(playerId) ?? 0;
}

test("11.8C Acgozluluk Limiti 3-8 oyuncu limit tablosunu ve 0..N araligini dogrular", () => {
  const expectedLimits: Record<number, number> = {
    3: 6,
    4: 11,
    5: 17,
    6: 24,
    7: 33,
    8: 43
  };

  for (const count of [3, 4, 5, 6, 7, 8]) {
    const players = Array.from({ length: count }, (_, i) => "p" + (i + 1));
    const adapter = createStage7GameAdapter("acgozluluk-limiti", players);
    adapter.start(0);
    const pub = adapter.getPublicState(0) as AcgozlulukPublicState;
    assert.equal(pub.limit, expectedLimits[count]);
    assert.equal(pub.maxChoice, count);

    // Value cannot exceed count
    assert.deepEqual(
      adapter.submit(players[0]!, { kind: "limit-value", value: count + 1 }, 10),
      { accepted: false, reason: "invalid" }
    );
    // Value cannot be negative
    assert.deepEqual(
      adapter.submit(players[0]!, { kind: "limit-value", value: -1 }, 10),
      { accepted: false, reason: "invalid" }
    );
  }
});

test("11.8C Acgozluluk Limiti limit asiminda herkese 0 verir, asilmadiginda kendi secimini puanlar", () => {
  const adapterPass = createStage7GameAdapter("acgozluluk-limiti", ["a", "b", "c", "d"]);
  adapterPass.start(0);
  stage7Submit(adapterPass, "a", { kind: "limit-value", value: 3 }, 100);
  stage7Submit(adapterPass, "b", { kind: "limit-value", value: 2 }, 100);
  stage7Submit(adapterPass, "c", { kind: "limit-value", value: 4 }, 100);
  stage7Submit(adapterPass, "d", { kind: "limit-value", value: 2 }, 100);
  adapterPass.advance(20_000);
  const pubPass = adapterPass.getPublicState(20_000) as AcgozlulukPublicState;
  assert.equal(pubPass.total, 11);
  assert.equal(pubPass.withinLimit, true);
  assert.equal(score(adapterPass, "a"), 3);
  assert.equal(score(adapterPass, "b"), 2);
  assert.equal(score(adapterPass, "c"), 4);
  assert.equal(score(adapterPass, "d"), 2);

  const adapterFail = createStage7GameAdapter("acgozluluk-limiti", ["a", "b", "c", "d"]);
  adapterFail.start(0);
  stage7Submit(adapterFail, "a", { kind: "limit-value", value: 4 }, 100);
  stage7Submit(adapterFail, "b", { kind: "limit-value", value: 4 }, 100);
  stage7Submit(adapterFail, "c", { kind: "limit-value", value: 3 }, 100);
  stage7Submit(adapterFail, "d", { kind: "limit-value", value: 1 }, 100);
  adapterFail.advance(20_000);
  const pubFail = adapterFail.getPublicState(20_000) as AcgozlulukPublicState;
  assert.equal(pubFail.total, 12);
  assert.equal(pubFail.withinLimit, false);
  assert.equal(score(adapterFail, "a"), 0);
  assert.equal(score(adapterFail, "b"), 0);
  assert.equal(score(adapterFail, "c"), 0);
  assert.equal(score(adapterFail, "d"), 0);
});

test("11.8C Acgozluluk Limiti oyun sirasinda secimleri gizler ve tek hak kuralini uygular", () => {
  const adapter = createStage7GameAdapter("acgozluluk-limiti", ["a", "b", "c"]);
  adapter.start(0);
  stage7Submit(adapter, "a", { kind: "limit-value", value: 2 }, 100);

  const pub = adapter.getPublicState(100) as AcgozlulukPublicState;
  assert.equal(pub.choices, null);
  assert.equal(pub.total, null);
  assert.equal(pub.withinLimit, null);
  assert.equal(pub.resultPoints, null);

  assert.deepEqual(
    adapter.submit("a", { kind: "limit-value", value: 1 }, 150),
    { accepted: false, reason: "duplicate" }
  );

  const ownA = adapter.getOwnState("a", 100) as unknown as { selectedValue: number; hasSubmitted: boolean };
  assert.equal(ownA.selectedValue, 2);
  assert.equal(ownA.hasSubmitted, true);

  const ownB = adapter.getOwnState("b", 100) as unknown as { selectedValue: number; hasSubmitted: boolean };
  assert.equal(ownB.selectedValue, 0);
  assert.equal(ownB.hasSubmitted, false);
});

test("11.8C Ortalamaya En Yakin 0..100 araligini, yarim ortalamayi ve eksik girdi etiketini dogrular", () => {
  // random() returns [0, 1). To get index 40 from length 101, return 40 / 101
  const randomMock = () => 40 / 101;
  const adapter = createStage7GameAdapter("ortalamanin-yarisi", ["a", "b", "c"], randomMock);
  adapter.start(0);

  assert.deepEqual(
    adapter.submit("a", { kind: "average-value", value: -1 }, 10),
    { accepted: false, reason: "invalid" }
  );
  assert.deepEqual(
    adapter.submit("a", { kind: "average-value", value: 101 }, 10),
    { accepted: false, reason: "invalid" }
  );

  stage7Submit(adapter, "a", { kind: "average-value", value: 20 }, 100);
  stage7Submit(adapter, "b", { kind: "average-value", value: 60 }, 100);

  const midPub = adapter.getPublicState(100) as OrtalamaninYarisiPublicState;
  assert.equal(midPub.average, null);
  assert.equal(midPub.target, null);
  assert.equal(midPub.results, null);

  adapter.advance(20_000);
  const endPub = adapter.getPublicState(20_000) as OrtalamaninYarisiPublicState;
  assert.equal(endPub.average, 40);
  assert.equal(endPub.target, 20);

  const resC = endPub.results?.find((r) => r.playerId === "c");
  assert.equal(resC?.generatedForMissingInput, true);
  assert.equal(resC?.value, 40);

  const resA = endPub.results?.find((r) => r.playerId === "a");
  assert.equal(resA?.generatedForMissingInput, false);
  assert.equal(resA?.value, 20);
  assert.equal(resA?.distanceMs, 0);

  assert.equal(score(adapter, "a"), 2);
  assert.equal(score(adapter, "c"), 1);
  assert.equal(score(adapter, "b"), 0);
});

test("11.8C Gizli Kareler 3x3 ve 4x4 boyutlarini, cakisma/solo mantigini ve erken bitisleri dogrular", () => {
  const adapterSmall = createStage7GameAdapter("gizli-kareler", ["a", "b", "c"]);
  adapterSmall.start(0);
  const pubSmall = adapterSmall.getPublicState(0) as GizliKarelerPublicState;
  assert.equal(pubSmall.gridSize, 3);
  assert.equal(pubSmall.cellCount, 9);

  const adapterLarge = createStage7GameAdapter("gizli-kareler", ["a", "b", "c", "d", "e"]);
  adapterLarge.start(0);
  const pubLarge = adapterLarge.getPublicState(0) as GizliKarelerPublicState;
  assert.equal(pubLarge.gridSize, 4);
  assert.equal(pubLarge.cellCount, 16);

  assert.deepEqual(
    adapterSmall.submit("a", { kind: "grid-cell", cell: 9 }, 10),
    { accepted: false, reason: "invalid" }
  );
  assert.deepEqual(
    adapterSmall.submit("a", { kind: "grid-cell", cell: -1 }, 10),
    { accepted: false, reason: "invalid" }
  );

  const adapterAllSame = createStage7GameAdapter("gizli-kareler", ["a", "b", "c"]);
  adapterAllSame.start(0);
  stage7Submit(adapterAllSame, "a", { kind: "grid-cell", cell: 4 }, 100);
  stage7Submit(adapterAllSame, "b", { kind: "grid-cell", cell: 4 }, 100);
  stage7Submit(adapterAllSame, "c", { kind: "grid-cell", cell: 4 }, 100);
  const stateAllSame = adapterAllSame.getPublicState(100) as GizliKarelerPublicState;
  assert.equal(stateAllSame.earlyFinish, true);
  assert.equal(stateAllSame.finished, true);
  assert.equal(score(adapterAllSame, "a"), 0);
  assert.equal(score(adapterAllSame, "b"), 0);
  assert.equal(score(adapterAllSame, "c"), 0);

  const adapterOneAlive = createStage7GameAdapter("gizli-kareler", ["a", "b", "c"]);
  adapterOneAlive.start(0);
  stage7Submit(adapterOneAlive, "a", { kind: "grid-cell", cell: 0 }, 100);
  stage7Submit(adapterOneAlive, "b", { kind: "grid-cell", cell: 0 }, 100);
  stage7Submit(adapterOneAlive, "c", { kind: "grid-cell", cell: 1 }, 100);
  adapterOneAlive.advance(20_000);
  assert.equal(adapterOneAlive.isFinished, true);
  assert.equal(score(adapterOneAlive, "c"), 2);
  assert.equal(score(adapterOneAlive, "a"), 0);
  assert.equal(score(adapterOneAlive, "b"), 0);

  const adapterTwoRounds = createStage7GameAdapter("gizli-kareler", ["a", "b", "c", "d"]);
  adapterTwoRounds.start(0);
  stage7Submit(adapterTwoRounds, "a", { kind: "grid-cell", cell: 0 }, 100);
  stage7Submit(adapterTwoRounds, "d", { kind: "grid-cell", cell: 0 }, 100);
  stage7Submit(adapterTwoRounds, "b", { kind: "grid-cell", cell: 1 }, 100);
  stage7Submit(adapterTwoRounds, "c", { kind: "grid-cell", cell: 2 }, 100);
  adapterTwoRounds.advance(20_000);

  const stateR2 = adapterTwoRounds.getPublicState(20_000) as GizliKarelerPublicState;
  assert.equal(stateR2.round, 2);
  assert.equal(stateR2.finished, false);
  assert.deepEqual(stateR2.eliminatedPlayerIds.slice().sort(), ["a", "d"]);

  assert.deepEqual(
    adapterTwoRounds.submit("a", { kind: "grid-cell", cell: 3 }, 20_100),
    { accepted: false, reason: "spectator" }
  );

  stage7Submit(adapterTwoRounds, "b", { kind: "grid-cell", cell: 3 }, 20_100);
  stage7Submit(adapterTwoRounds, "c", { kind: "grid-cell", cell: 4 }, 20_100);
  adapterTwoRounds.advance(40_000);

  assert.equal(adapterTwoRounds.isFinished, true);
  assert.equal(score(adapterTwoRounds, "b"), 2);
  assert.equal(score(adapterTwoRounds, "c"), 2);
  assert.equal(score(adapterTwoRounds, "a"), 0);
  assert.equal(score(adapterTwoRounds, "d"), 0);
});

test("11.8C Cizgiyi Gecme 100->10 sinir eslemesini, benzersiz serit puanlamasini ve pasif bolgeleri dogrular", () => {
  const adapter = createStage7GameAdapter("cizgiyi-gecme", ["a", "b", "c", "d", "e"]);
  adapter.start(0);

  assert.deepEqual(
    adapter.submit("a", { kind: "risk-value", value: -1 }, 10),
    { accepted: false, reason: "invalid" }
  );
  assert.deepEqual(
    adapter.submit("a", { kind: "risk-value", value: 101 }, 10),
    { accepted: false, reason: "invalid" }
  );

  stage7Submit(adapter, "a", { kind: "risk-value", value: 100 }, 100);
  stage7Submit(adapter, "b", { kind: "risk-value", value: 92 }, 100);
  stage7Submit(adapter, "c", { kind: "risk-value", value: 52 }, 100);
  stage7Submit(adapter, "d", { kind: "risk-value", value: 58 }, 100);
  stage7Submit(adapter, "e", { kind: "risk-value", value: 15 }, 100);

  const pubMid = adapter.getPublicState(100) as CizgiyiGecmePublicState;
  assert.equal(pubMid.results, null);

  adapter.advance(30_000);
  const pubEnd = adapter.getPublicState(30_000) as CizgiyiGecmePublicState;

  const resA = pubEnd.results?.find((r) => r.playerId === "a");
  assert.equal(resA?.bucket, 10);
  assert.equal(resA?.evaluated, true);
  assert.equal(resA?.points, 2);

  const resB = pubEnd.results?.find((r) => r.playerId === "b");
  assert.equal(resB?.bucket, 9);
  assert.equal(resB?.evaluated, true);
  assert.equal(resB?.points, 1);

  const resC = pubEnd.results?.find((r) => r.playerId === "c");
  assert.equal(resC?.bucket, 5);
  assert.equal(resC?.evaluated, false);
  assert.equal(resC?.points, 0);

  const resD = pubEnd.results?.find((r) => r.playerId === "d");
  assert.equal(resD?.bucket, 5);
  assert.equal(resD?.evaluated, false);
  assert.equal(resD?.points, 0);

  const resE = pubEnd.results?.find((r) => r.playerId === "e");
  assert.equal(resE?.bucket, 1);
  assert.equal(resE?.evaluated, true);
  assert.equal(resE?.points, 0);

  assert.equal(score(adapter, "a"), 2);
  assert.equal(score(adapter, "b"), 1);
  assert.equal(score(adapter, "c"), 0);
  assert.equal(score(adapter, "d"), 0);
  assert.equal(score(adapter, "e"), 0);
});

test("11.8C Gizli Alisveris 60 kredi butcesini, tekrarlanabilir ekle/cikar hamlelerini ve sepet bolusumunu dogrular", () => {
  const adapter = createStage7GameAdapter("gizli-alisveris", ["a", "b", "c"]);
  adapter.start(0);

  stage7Submit(adapter, "a", { kind: "shopping-toggle", productId: "gizli-sandik" }, 100);
  let ownA = adapter.getOwnState("a", 100) as unknown as { spent: number; remainingBudget: number; cartProductIds: string[] };
  assert.equal(ownA.spent, 36);
  assert.equal(ownA.remainingBudget, 24);
  assert.deepEqual(ownA.cartProductIds, ["gizli-sandik"]);

  assert.deepEqual(
    adapter.submit("a", { kind: "shopping-toggle", productId: "mini-drone" }, 110),
    { accepted: false, reason: "invalid" }
  );

  stage7Submit(adapter, "a", { kind: "shopping-toggle", productId: "gizli-sandik" }, 120);
  ownA = adapter.getOwnState("a", 120) as unknown as { spent: number; remainingBudget: number; cartProductIds: string[] };
  assert.equal(ownA.spent, 0);
  assert.equal(ownA.remainingBudget, 60);
  assert.deepEqual(ownA.cartProductIds, []);

  stage7Submit(adapter, "a", { kind: "shopping-toggle", productId: "mini-drone" }, 200);
  stage7Submit(adapter, "a", { kind: "shopping-toggle", productId: "jet-canta" }, 210);

  stage7Submit(adapter, "b", { kind: "shopping-toggle", productId: "mini-drone" }, 200);
  stage7Submit(adapter, "b", { kind: "shopping-toggle", productId: "enerji-icecegi" }, 210);

  stage7Submit(adapter, "c", { kind: "shopping-toggle", productId: "holo-kask" }, 200);
  stage7Submit(adapter, "c", { kind: "shopping-toggle", productId: "mini-hoparlor" }, 210);

  const pubMid = adapter.getPublicState(200) as GizliAlisverisPublicState;
  assert.equal(pubMid.productBuyerCounts, null);
  assert.equal(pubMid.results, null);

  adapter.advance(30_000);
  const pubEnd = adapter.getPublicState(30_000) as GizliAlisverisPublicState;
  assert.equal(pubEnd.finished, true);

  const resA = pubEnd.results?.find((r) => r.playerId === "a");
  const resB = pubEnd.results?.find((r) => r.playerId === "b");
  const resC = pubEnd.results?.find((r) => r.playerId === "c");

  assert.equal(Math.round(resA?.basketValue ?? 0), 40);
  assert.equal(Math.round(resB?.basketValue ?? 0), 26);
  assert.equal(Math.round(resC?.basketValue ?? 0), 46);

  assert.equal(score(adapter, "c"), 1);
  assert.equal(score(adapter, "a"), 0);
  assert.equal(score(adapter, "b"), 0);
});

test("11.8C Protocol v3 submission status ve action state reducer Batch C oyunlarinda dogru calisir", () => {
  const acOwn1 = { hasSubmitted: false, finished: false };
  const acStat1 = deriveSubmissionStatus("acgozluluk-limiti", acOwn1, {}, true);
  assert.equal(acStat1.mode, "single");
  assert.equal(acStat1.canAct, true);
  assert.equal(acStat1.completed, false);

  const acOwn2 = { hasSubmitted: true, finished: false };
  const acStat2 = deriveSubmissionStatus("acgozluluk-limiti", acOwn2, {}, true);
  assert.equal(acStat2.canAct, false);
  assert.equal(acStat2.completed, true);

  const ortOwn = { hasSubmitted: false, finished: false };
  const ortStat = deriveSubmissionStatus("ortalamanin-yarisi", ortOwn, {}, true);
  assert.equal(ortStat.mode, "single");
  assert.equal(ortStat.canAct, true);

  const cizOwn = { hasSubmitted: false, finished: false };
  const cizStat = deriveSubmissionStatus("cizgiyi-gecme", cizOwn, {}, true);
  assert.equal(cizStat.mode, "single");
  assert.equal(cizStat.canAct, true);

  const scopeR1 = deriveActionScope("gizli-kareler", { round: 1 });
  const scopeR2 = deriveActionScope("gizli-kareler", { round: 2 });
  assert.notEqual(scopeR1, scopeR2);

  const kareOwnCan = { selectedCell: null, canSelect: true, eliminated: false, finished: false };
  const kareStatCan = deriveSubmissionStatus("gizli-kareler", kareOwnCan, {}, true);
  assert.equal(kareStatCan.mode, "turn");
  assert.equal(kareStatCan.canAct, true);
  assert.equal(kareStatCan.completed, false);

  const kareOwnDone = { selectedCell: 3, canSelect: false, eliminated: false, finished: false };
  const kareStatDone = deriveSubmissionStatus("gizli-kareler", kareOwnDone, {}, true);
  assert.equal(kareStatDone.canAct, false);
  assert.equal(kareStatDone.completed, true);

  const kareOwnElim = { selectedCell: null, canSelect: false, eliminated: true, finished: false };
  const kareStatElim = deriveSubmissionStatus("gizli-kareler", kareOwnElim, {}, true);
  assert.equal(kareStatElim.canAct, false);
  assert.equal(kareStatElim.locked, true);

  const shopOwn = { cartProductIds: ["holo-kask"], spent: 28, remainingBudget: 32, finished: false };
  const shopStat = deriveSubmissionStatus("gizli-alisveris", shopOwn, {}, true);
  assert.equal(shopStat.mode, "repeatable");
  assert.equal(shopStat.canAct, true);
  assert.equal(shopStat.completed, false);

  const scope = { matchId: "m1", gameId: "acgozluluk-limiti" as const, phaseIndex: 2, actionScope: "limit", sessionId: "s1", spectator: false };
  let actState = reduceClientActionState(null, { type: "scope", scope, stateVersion: 5, mode: "single", completed: false });
  assert.equal(actState?.status, "editable");
  actState = reduceClientActionState(actState, { type: "submit", actionId: "act-1", observedStateVersion: 5 });
  assert.equal(actState?.status, "pending");
  actState = reduceClientActionState(actState, { type: "ack", actionId: "act-1", accepted: false, stateVersion: 5, reason: "invalid" });
  assert.equal(actState?.status, "rejected");
  assert.equal(actState?.reason, "invalid");
});

test("11.8C Production App and main cannot import or route Stage11C QA harnesses", () => {
  const currentFile = fileURLToPath(import.meta.url);
  const root = path.resolve(path.dirname(currentFile), "../../..");
  const mainPath = path.join(root, "apps", "client", "src", "main.tsx");
  const appPath = path.join(root, "apps", "client", "src", "App.tsx");

  const mainSource = fs.readFileSync(mainPath, "utf8");
  const appSource = fs.readFileSync(appPath, "utf8");

  assert.equal(mainSource.includes("Stage11CQAHarness"), false, "main.tsx must not import Stage11CQAHarness");
  assert.equal(mainSource.includes("Stage11CAuthoritativeHarness"), false, "main.tsx must not import Stage11CAuthoritativeHarness");
  assert.equal(mainSource.includes("qa="), false, "main.tsx must not route via qa query parameter");
  assert.equal(mainSource.includes("?qa"), false, "main.tsx must not contain ?qa hook");

  assert.equal(appSource.includes("Stage11CQAHarness"), false, "App.tsx must not import Stage11CQAHarness");
  assert.equal(appSource.includes("Stage11CAuthoritativeHarness"), false, "App.tsx must not import Stage11CAuthoritativeHarness");
  assert.equal(appSource.includes("qa="), false, "App.tsx must not route via qa query parameter");
});