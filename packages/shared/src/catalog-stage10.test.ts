import assert from "node:assert/strict";
import test from "node:test";
import {
  GAME_CATALOG,
  getAvailableGames,
  getUnavailableGames,
  type GameId
} from "./index.js";
import {
  createStage6GameAdapter,
  isStage6Game,
  STAGE6_GAME_IDS,
  type Stage6GameAdapter
} from "./games.js";
import {
  createStage7GameAdapter,
  isStage7Game,
  STAGE7_GAME_IDS,
  type Stage7GameAdapter
} from "./games-stage7.js";
import {
  createStage8GameAdapter,
  isStage8Game,
  STAGE8_GAME_IDS,
  type Stage8GameAdapter
} from "./games-stage8.js";
import {
  createStage9GameAdapter,
  isStage9Game,
  STAGE9_GAME_IDS,
  type Stage9GameAdapter
} from "./games-stage9.js";

type CatalogAdapter =
  | Stage6GameAdapter
  | Stage7GameAdapter
  | Stage8GameAdapter
  | Stage9GameAdapter;

const EXPECTED_GAME_IDS = [
  "yazi-yaz",
  "kendim",
  "sizma",
  "sozluk-blofu",
  "cagrisim-agi",
  "butona-bas",
  "rus-ruleti",
  "gizli-hirsiz",
  "kor-kronometre",
  "kor-bomba",
  "rusvet-darbe",
  "acgozluluk-limiti",
  "ortalamanin-yarisi",
  "gizli-kareler",
  "karalama-defteri",
  "ittifak",
  "son-kisi",
  "cizgiyi-gecme",
  "gizli-alisveris",
  "asiri-yukleme",
  "kontrol-paneli-kaosu",
  "zehirli-kadeh",
  "capraz-ates",
  "zaman-bombasi-hafizasi"
] as const satisfies readonly GameId[];

const EXPECTED_MIN_PLAYERS: Record<GameId, number> = {
  "yazi-yaz": 3,
  kendim: 3,
  sizma: 3,
  "sozluk-blofu": 3,
  "cagrisim-agi": 2,
  "butona-bas": 2,
  "rus-ruleti": 2,
  "gizli-hirsiz": 2,
  "kor-kronometre": 2,
  "kor-bomba": 2,
  "rusvet-darbe": 3,
  "acgozluluk-limiti": 3,
  "ortalamanin-yarisi": 3,
  "gizli-kareler": 2,
  "karalama-defteri": 3,
  ittifak: 3,
  "son-kisi": 2,
  "cizgiyi-gecme": 2,
  "gizli-alisveris": 3,
  "asiri-yukleme": 2,
  "kontrol-paneli-kaosu": 2,
  "zehirli-kadeh": 2,
  "capraz-ates": 3,
  "zaman-bombasi-hafizasi": 2
};

const PLAYER_IDS = ["oyuncu-1", "oyuncu-2", "oyuncu-3", "oyuncu-4", "oyuncu-5", "oyuncu-6", "oyuncu-7", "oyuncu-8"] as const;
const DETERMINISTIC_RANDOM = () => 0;

function playersFor(minPlayers: number): readonly string[] {
  return PLAYER_IDS.slice(0, minPlayers);
}

function createCatalogAdapter(gameId: GameId, playerIds: readonly string[]): CatalogAdapter {
  if (isStage6Game(gameId)) {
    return createStage6GameAdapter(gameId, playerIds, DETERMINISTIC_RANDOM);
  }

  if (isStage7Game(gameId)) {
    return createStage7GameAdapter(gameId, playerIds, DETERMINISTIC_RANDOM);
  }

  if (isStage8Game(gameId)) {
    return createStage8GameAdapter(gameId, playerIds, DETERMINISTIC_RANDOM);
  }

  if (isStage9Game(gameId)) {
    return createStage9GameAdapter(gameId, playerIds, DETERMINISTIC_RANDOM);
  }

  throw new Error(`Katalog oyunu için adapter bulunamadı: ${gameId}`);
}

function idsOf<T extends readonly string[]>(ids: T): readonly string[] {
  return ids;
}

test("katalog 24 oyunun tamamını, tekrar ve eksik kimlik olmadan içerir", () => {
  const catalogIds = GAME_CATALOG.map((game) => game.id);

  assert.equal(GAME_CATALOG.length, 24);
  assert.deepEqual(catalogIds, EXPECTED_GAME_IDS);
  assert.equal(new Set(catalogIds).size, catalogIds.length);
  assert.equal(new Set(EXPECTED_GAME_IDS).size, EXPECTED_GAME_IDS.length);
});

test("oyun grupları katalogu birebir kapatır ve guardlar yalnızca kendi grubunu tanır", () => {
  const stageIds = [
    ...idsOf(STAGE6_GAME_IDS),
    ...idsOf(STAGE7_GAME_IDS),
    ...idsOf(STAGE8_GAME_IDS),
    ...idsOf(STAGE9_GAME_IDS)
  ];

  assert.deepEqual([...stageIds].sort(), [...EXPECTED_GAME_IDS].sort());
  assert.equal(new Set(stageIds).size, EXPECTED_GAME_IDS.length);
  assert.deepEqual(STAGE6_GAME_IDS, ["butona-bas", "sizma", "zaman-bombasi-hafizasi"]);
  assert.equal(STAGE7_GAME_IDS.length, 10);
  assert.equal(STAGE8_GAME_IDS.length, 9);
  assert.deepEqual(STAGE9_GAME_IDS, ["rus-ruleti", "son-kisi"]);

  for (const gameId of EXPECTED_GAME_IDS) {
    const memberships = [
      isStage6Game(gameId),
      isStage7Game(gameId),
      isStage8Game(gameId),
      isStage9Game(gameId)
    ];

    assert.equal(
      memberships.filter(Boolean).length,
      1,
      `${gameId} birden fazla veya hiçbir adapter grubunda bulunuyor`
    );
  }

  const nonGameId = "katalog-disi-oyun" as GameId;
  assert.equal(isStage6Game(nonGameId), false);
  assert.equal(isStage7Game(nonGameId), false);
  assert.equal(isStage8Game(nonGameId), false);
  assert.equal(isStage9Game(nonGameId), false);
});

test("katalogdaki her oyun gerçek factory dalından çalışır ve başlangıç durumunu üretir", () => {
  for (const definition of GAME_CATALOG) {
    const playerIds = playersFor(definition.minPlayers);
    const adapter = createCatalogAdapter(definition.id, playerIds);

    assert.equal(adapter.gameId, definition.id);
    assert.deepEqual(adapter.playerIds, playerIds);
    assert.equal(adapter.isStarted, false);
    assert.equal(adapter.isFinished, false);
    assert.deepEqual(adapter.eliminatedPlayerIds, []);
    assert.equal(adapter.getMiniGameScores().size, playerIds.length);

    adapter.start(0);

    assert.equal(adapter.isStarted, true, `${definition.id} başlatılamadı`);
    assert.equal(adapter.isFinished, false, `${definition.id} minimum oyuncu sayısında erken bitti`);
    assert.equal(adapter.getPublicState(1).gameId, definition.id);
    assert.equal(adapter.getOwnState(playerIds[0]!, 1).gameId, definition.id);
    assert.equal(adapter.getMiniGameScores().size, playerIds.length);
  }
});

test("katalogdaki minimum oyuncu sınırları tanımlı kurallarla ve erişim filtresiyle uyumludur", () => {
  for (const definition of GAME_CATALOG) {
    const expectedMinPlayers = EXPECTED_MIN_PLAYERS[definition.id];

    assert.equal(definition.minPlayers, expectedMinPlayers, `${definition.id} minimum oyuncu sınırı değişmiş`);
    assert.equal(definition.maxPlayers, 8, `${definition.id} maksimum oyuncu sınırı 8 olmalı`);
    assert.equal(definition.minPlayers >= 2, true, `${definition.id} en az 2 oyuncu istemeli`);
    assert.equal(definition.minPlayers <= definition.maxPlayers, true, `${definition.id} sınırları ters`);

    const availableAtMinimum = getAvailableGames(definition.minPlayers).some((game) => game.id === definition.id);
    assert.equal(availableAtMinimum, true, `${definition.id} minimum oyuncu sayısında seçilebilir değil`);

    const unavailableBelowMinimum = getUnavailableGames(definition.minPlayers - 1).some((game) => game.id === definition.id);
    assert.equal(unavailableBelowMinimum, true, `${definition.id} minimumun altında seçilebilir görünüyor`);

    const unavailableAtMaximum = getUnavailableGames(definition.maxPlayers).some((game) => game.id === definition.id);
    assert.equal(unavailableAtMaximum, false, `${definition.id} 8 oyuncuda kullanılamıyor`);
  }
});
