import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BriefingScreen } from "../apps/client/src/visuals/briefing/BriefingScreen.tsx";

const players = [
  { id: "p1", nickname: "Host", score: 0, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p2", nickname: "Guest", score: 0, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false }
];

function renderReady({ canReady = true, isReady = false, readyPlayerIds = [] } = {}) {
  const html = renderToStaticMarkup(createElement(BriefingScreen, {
    gameName: "Butona Bas",
    steps: ["Eş zamanlı bas."],
    readyCount: readyPlayerIds.length,
    eligibleCount: 2,
    readyPlayerIds,
    players,
    selfPlayerId: "p1",
    isReady,
    canReady,
    onReady: () => {}
  }));
  const button = html.match(/<button[^>]*class="glix-btn-ready[^"]*"[^>]*>/)?.[0] ?? "";
  assert.ok(button, "Ready button is present");
  return { html, button };
}

test("Stage 1: active participant sees an enabled briefing ready button", () => {
  const { button, html } = renderReady();
  assert.ok(!button.includes("disabled"), "Active participant should be able to mark ready");
  assert.match(html, /Hazırım!/);
});

test("Stage 1: ready participant cannot submit duplicate ready", () => {
  const { button, html } = renderReady({ isReady: true, readyPlayerIds: ["p1"] });
  assert.match(button, /disabled/);
  assert.match(html, /Hazırsın/);
});

test("Stage 1: spectator/offline readiness is disabled", () => {
  const { button } = renderReady({ canReady: false });
  assert.match(button, /disabled/);
});

test("Stage 1: runtime MatchScreen wires eligible ready and host kick", async () => {
  const app = await readFile(new URL("../apps/client/src/App.tsx", import.meta.url), "utf8");
  assert.match(app, /canReady=\{!isSpectator && !ready && connection === "connected"\}/);
  assert.match(app, /onKickPlayer=\{handleKickPlayer\}/);
  assert.match(app, /type: "client:room:kick"/);
  assert.match(app, /eligibleCount=\{state\.players\.filter\(\(p\) => p\.connected && p\.currentGameParticipant && !p\.eliminated\)\.length\}/);
});
