import assert from "node:assert/strict";
import test from "node:test";
import {
  createStage7GameAdapter,
  type AsiriYuklemePublicState,
  type GizliAlisverisPublicState,
  type KorBombaOwnState,
  type KorBombaPublicState,
  type OrtalamaninYarisiPublicState,
  type Stage7GameAdapter,
  KOR_BOMBA_HARD_CAP_MS
} from "./games-stage7.js";

function submit(
  adapter: Stage7GameAdapter,
  playerId: string,
  payload: Record<string, string | number>,
  now: number
): void {
  assert.deepEqual(adapter.submit(playerId, payload, now), { accepted: true });
}

function score(adapter: Stage7GameAdapter, playerId: string): number {
  return adapter.getMiniGameScores().get(playerId) ?? 0;
}

test("Gizli Hırsız tek basanı ödüllendirir, çoklu basışı cezalandırır", () => {
  const adapter = createStage7GameAdapter("gizli-hirsiz", ["a", "b", "c"]);
  adapter.start(0);
  submit(adapter, "a", { kind: "steal" }, 2_000);
  adapter.advance(30_000);
  assert.equal(score(adapter, "a"), 1);
  assert.equal(adapter.isFinished, true);
});

test("Kör Kronometre hedefe yakınlığı 2 ve 1 puanla sıralar", () => {
  const adapter = createStage7GameAdapter("kor-kronometre", ["a", "b", "c"]);
  adapter.start(0);
  submit(adapter, "a", { kind: "stopwatch-stop" }, 10_000);
  submit(adapter, "b", { kind: "stopwatch-stop" }, 9_000);
  adapter.advance(18_000);
  assert.equal(score(adapter, "a"), 2);
  assert.equal(score(adapter, "b"), 1);
  assert.equal(score(adapter, "c"), 0);
});

test("Kör Bomba pasla süreyi uzatır ve son taşıyıcıyı eksiye düşürür", () => {
  const adapter = createStage7GameAdapter("kor-bomba", ["a", "b"], () => 0);
  adapter.start(0);
  const publicState = adapter.getPublicState(1) as KorBombaPublicState;
  assert.equal(publicState.bombHolderId, "a");
  submit(adapter, "a", { kind: "bomb-pass", targetPlayerId: "b" }, 1_000);
  const carrierState = adapter.getOwnState("b", 5_000) as KorBombaOwnState;
  const observerState = adapter.getOwnState("a", 5_000) as KorBombaOwnState;
  assert.equal(carrierState.visibleRemainingMs, null);
  assert.equal(observerState.visibleRemainingMs, null);
  adapter.advance(16_000);
  assert.equal(score(adapter, "b"), -1);
  assert.equal(adapter.isFinished, true);
});

test("Kör Bomba tekrar tekrar paslansa bile 45 saniyelik hard cap'te çözülür", () => {
  const adapter = createStage7GameAdapter("kor-bomba", ["a", "b"], () => 0.999999);
  adapter.start(0);

  for (let pass = 0; pass < 10; pass += 1) {
    const holder = (adapter.getPublicState(1_000 + pass * 1_000) as KorBombaPublicState).bombHolderId!;
    const target = holder === "a" ? "b" : "a";
    assert.deepEqual(adapter.submit(holder, { kind: "bomb-pass", targetPlayerId: target }, 1_000 + pass * 1_000), { accepted: true });
  }

  const previousHolder = (adapter.getPublicState(11_000) as KorBombaPublicState).bombHolderId!;
  const replacementHolder = previousHolder === "a" ? "b" : "a";
  adapter.setConnectedPlayerIds?.([replacementHolder]);
  assert.equal((adapter.getPublicState(11_000) as KorBombaPublicState).bombHolderId, replacementHolder);
  assert.equal((adapter.getPublicState(KOR_BOMBA_HARD_CAP_MS - 1) as KorBombaPublicState).finished, false);
  assert.equal(adapter.advance(KOR_BOMBA_HARD_CAP_MS), true);
  assert.equal(adapter.isFinished, true);
  assert.equal((adapter.getOwnState("a", KOR_BOMBA_HARD_CAP_MS) as KorBombaOwnState).visibleRemainingMs, 0);
});

test("Kör Bomba bağlı olmayan oyuncuyu hedef havuzundan çıkarır", () => {
  const adapter = createStage7GameAdapter("kor-bomba", ["a", "b", "c"], () => 0);
  adapter.start(0);
  adapter.setConnectedPlayerIds?.(["a", "b"]);
  assert.deepEqual((adapter.getOwnState("a", 1) as KorBombaOwnState).targetPlayerIds, ["b"]);
  assert.deepEqual(adapter.submit("a", { kind: "bomb-pass", targetPlayerId: "c" }, 1_000), { accepted: false, reason: "invalid" });
});

test("Açgözlülük Limiti toplam limit altında kalan seçimleri doğrudan puanlar", () => {
  const adapter = createStage7GameAdapter("acgozluluk-limiti", ["a", "b", "c"]);
  adapter.start(0);
  submit(adapter, "a", { kind: "limit-value", value: 2 }, 1_000);
  submit(adapter, "b", { kind: "limit-value", value: 2 }, 1_000);
  submit(adapter, "c", { kind: "limit-value", value: 2 }, 1_000);
  adapter.advance(20_000);
  assert.deepEqual([score(adapter, "a"), score(adapter, "b"), score(adapter, "c")], [2, 2, 2]);
});

test("Açgözlülük Limiti ilk geçerli seçimi korur ve tekrarı reddeder", () => {
  const adapter = createStage7GameAdapter("acgozluluk-limiti", ["a", "b", "c"]);
  adapter.start(0);
  submit(adapter, "a", { kind: "limit-value", value: 1 }, 1_000);
  assert.deepEqual(adapter.submit("a", { kind: "limit-value", value: 3 }, 1_001), { accepted: false, reason: "duplicate" });
  submit(adapter, "b", { kind: "limit-value", value: 2 }, 1_000);
  submit(adapter, "c", { kind: "limit-value", value: 2 }, 1_000);
  assert.equal((adapter.getOwnState("a", 1_001) as { selectedValue: number }).selectedValue, 1);
  adapter.advance(20_000);
  assert.deepEqual([score(adapter, "a"), score(adapter, "b"), score(adapter, "c")], [1, 2, 2]);
});

test("Ortalamaya En Yakın eksik cevabı üretir ve yarım ortalamaya göre sıralar", () => {
  const adapter = createStage7GameAdapter("ortalamanin-yarisi", ["a", "b", "c"], () => 0);
  adapter.start(0);
  submit(adapter, "a", { kind: "average-value", value: 50 }, 1_000);
  submit(adapter, "b", { kind: "average-value", value: 50 }, 1_000);
  adapter.advance(20_000);
  assert.equal(score(adapter, "c"), 2);
  assert.equal(score(adapter, "a"), 1);
  assert.equal(score(adapter, "b"), 1);
  const publicState = adapter.getPublicState(20_000) as OrtalamaninYarisiPublicState;
  assert.equal(publicState.results?.find((entry) => entry.playerId === "c")?.generatedForMissingInput, true);
});

test("Ortalamaya En Yakın ilk geçerli sayıyı korur ve tekrarı reddeder", () => {
  const adapter = createStage7GameAdapter("ortalamanin-yarisi", ["a", "b", "c"], () => 0);
  adapter.start(0);
  submit(adapter, "a", { kind: "average-value", value: 25 }, 1_000);
  assert.deepEqual(adapter.submit("a", { kind: "average-value", value: 80 }, 1_001), { accepted: false, reason: "duplicate" });
  submit(adapter, "b", { kind: "average-value", value: 0 }, 1_000);
  submit(adapter, "c", { kind: "average-value", value: 100 }, 1_000);
  adapter.advance(20_000);
  const results = (adapter.getPublicState(20_000) as OrtalamaninYarisiPublicState).results!;
  assert.equal(results.find((entry) => entry.playerId === "a")?.value, 25);
  assert.equal(score(adapter, "a"), 2);
  assert.equal(score(adapter, "b"), 1);
  assert.equal(score(adapter, "c"), 0);
});

test("Gizli Kareler çakışanları eler ve tek kalana ikinci raunt bonusu verir", () => {
  const adapter = createStage7GameAdapter("gizli-kareler", ["a", "b", "c"]);
  adapter.start(0);
  submit(adapter, "a", { kind: "grid-cell", cell: 0 }, 1_000);
  submit(adapter, "b", { kind: "grid-cell", cell: 0 }, 1_000);
  submit(adapter, "c", { kind: "grid-cell", cell: 1 }, 1_000);
  adapter.advance(20_000);
  assert.deepEqual(adapter.eliminatedPlayerIds, ["a", "b"]);
  assert.equal(score(adapter, "c"), 2);
  assert.equal(adapter.isFinished, true);
});

test("Çizgiyi Geçme aynı onluk bölgeyi pasif bırakır", () => {
  const adapter = createStage7GameAdapter("cizgiyi-gecme", ["a", "b", "c"]);
  adapter.start(0);
  submit(adapter, "a", { kind: "risk-value", value: 99 }, 1_000);
  submit(adapter, "b", { kind: "risk-value", value: 50 }, 1_000);
  submit(adapter, "c", { kind: "risk-value", value: 55 }, 1_000);
  adapter.advance(30_000);
  assert.equal(score(adapter, "a"), 2);
  assert.equal(score(adapter, "b"), 0);
  assert.equal(score(adapter, "c"), 0);
});

test("Gizli Alışveriş ürün değerini alıcı sayısına böler ve en değerli sepeti seçer", () => {
  const adapter = createStage7GameAdapter("gizli-alisveris", ["a", "b", "c"]);
  adapter.start(0);
  submit(adapter, "a", { kind: "shopping-toggle", productId: "gizli-sandik" }, 1_000);
  submit(adapter, "b", { kind: "shopping-toggle", productId: "gizli-sandik" }, 1_000);
  submit(adapter, "c", { kind: "shopping-toggle", productId: "mini-drone" }, 1_000);
  submit(adapter, "c", { kind: "shopping-toggle", productId: "jet-canta" }, 1_000);
  adapter.advance(30_000);
  assert.equal(score(adapter, "c"), 1);
  assert.equal(score(adapter, "a"), 0);
  const publicState = adapter.getPublicState(30_000) as GizliAlisverisPublicState;
  assert.equal(publicState.productBuyerCounts?.["gizli-sandik"], 2);
});

test("Aşırı Yükleme taşma tıklamasını patlatır ve patlamayanları sıralar", () => {
  const adapter = createStage7GameAdapter("asiri-yukleme", ["a", "b"]);
  adapter.start(0);
  for (let click = 0; click < 100; click += 1) {
    submit(adapter, "a", { kind: "overload-click" }, click);
  }
  submit(adapter, "b", { kind: "overload-click" }, 1_000);
  assert.equal(adapter.isFinished, true);
  const publicState = adapter.getPublicState(1_000) as AsiriYuklemePublicState;
  assert.equal(publicState.explodedPlayerId, "b");
  assert.equal(score(adapter, "a"), 2);
  assert.equal(score(adapter, "b"), -1);
});

test("Çapraz Ateş karşılıklı hedefleri sıfırlar, diğer hedeflenmeyen saldırganı ödüllendirir", () => {
  const adapter = createStage7GameAdapter("capraz-ates", ["a", "b", "c"]);
  adapter.start(0);
  submit(adapter, "a", { kind: "crossfire-target", targetPlayerId: "b" }, 1_000);
  submit(adapter, "b", { kind: "crossfire-target", targetPlayerId: "a" }, 1_000);
  submit(adapter, "c", { kind: "crossfire-target", targetPlayerId: "a" }, 1_000);
  adapter.advance(25_000);
  assert.equal(score(adapter, "a"), 0);
  assert.equal(score(adapter, "b"), 0);
  assert.equal(score(adapter, "c"), 1);
});

test("Çapraz Ateş bağlı olmayan hedefi hem listeden hem sunucu adapter'ından reddeder", () => {
  const adapter = createStage7GameAdapter("capraz-ates", ["a", "b", "c"]);
  adapter.start(0);
  adapter.setConnectedPlayerIds?.(["a", "b"]);
  assert.deepEqual((adapter.getOwnState("a", 1) as { availableTargetIds: readonly string[] }).availableTargetIds, ["b"]);
  assert.deepEqual(adapter.submit("a", { kind: "crossfire-target", targetPlayerId: "c" }, 1_000), { accepted: false, reason: "invalid" });
});
