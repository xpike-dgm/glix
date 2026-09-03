import assert from "node:assert/strict";
import test from "node:test";
import {
  getAvailableGames,
  getConnectedPlayerCount,
  type GameDefinition,
  type PlayerSummary
} from "./index.js";

function availabilityForPlayers(
  players: readonly Pick<PlayerSummary, "connected">[]
): readonly GameDefinition[] {
  return getAvailableGames(getConnectedPlayerCount(players));
}

function roster(thirdConnected: boolean): readonly PlayerSummary[] {
  return [
    { id: "a", nickname: "A", score: 0, connected: true },
    { id: "b", nickname: "B", score: 0, connected: true },
    { id: "c", nickname: "C", score: 0, connected: thirdConnected }
  ];
}

test("R3 — üç oda üyesi ve iki bağlı oyuncuda yalnızca 2 kişilik oyunlar uygundur", () => {
  const members = roster(false);
  const available = availabilityForPlayers(members);
  const availableIds = new Set(available.map((game) => game.id));

  assert.equal(members.length, 3, "Oda roster'ı disconnected üyeyi korumalıdır.");
  assert.equal(available.length, 13, "2 bağlı oyuncuda random havuzu 13 oyun olmalıdır.");
  assert.ok(availableIds.has("butona-bas"));
  assert.ok(availableIds.has("cagrisim-agi"));
  assert.ok(availableIds.has("rus-ruleti"));
  assert.ok(!availableIds.has("yazi-yaz"));
  assert.ok(!availableIds.has("kendim"));
  assert.ok(!availableIds.has("sizma"));
  assert.equal(available.length, 13, "Random maksimumu connected availability uzunluğu olmalıdır.");
});

test("R3 — aynı roster uzunluğunda reconnect availability havuzunu 13'ten 24'e geri getirir", () => {
  const disconnectedRoster = roster(false);
  const reconnectedRoster = roster(true);

  assert.equal(disconnectedRoster.length, reconnectedRoster.length);
  assert.equal(availabilityForPlayers(disconnectedRoster).length, 13);

  const availableAfterReconnect = availabilityForPlayers(reconnectedRoster);
  const availableIds = new Set(availableAfterReconnect.map((game) => game.id));

  assert.equal(availableAfterReconnect.length, 24);
  assert.ok(availableIds.has("yazi-yaz"));
  assert.ok(availableIds.has("kendim"));
  assert.ok(availableIds.has("sizma"));
});
