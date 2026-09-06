import { useState, useEffect, type JSX } from "react";
import {
  reduceClientActionState,
  type MatchPlayerState,
  type ClientActionState,
  type ClientActionScope,
  type SubmissionStatus,
  type AcgozlulukPublicState,
  type AcgozlulukOwnState,
  type OrtalamaninYarisiPublicState,
  type OrtalamaninYarisiOwnState,
  type GizliKarelerPublicState,
  type GizliKarelerOwnState,
  type CizgiyiGecmePublicState,
  type CizgiyiGecmeOwnState,
  type GizliAlisverisPublicState,
  type GizliAlisverisOwnState,
  type ShoppingProduct
} from "@glix/shared";
import { GameViewport } from "../../viewport/GameViewport";
import { GameHUD } from "../../hud/GameHUD";
import { Stage11CStage, type Stage11CGameId } from "./Stage11CStage";

const BASE_PLAYERS_4: readonly MatchPlayerState[] = [
  { id: "p1", nickname: "Deniz", score: 24, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p2", nickname: "Barış", score: 18, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p3", nickname: "Zeynep", score: 29, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p4", nickname: "Kaan", score: 15, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false }
];

const BASE_PLAYERS_8: readonly MatchPlayerState[] = [
  ...BASE_PLAYERS_4,
  { id: "p5", nickname: "Selin", score: 21, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p6", nickname: "Mert", score: 14, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p7", nickname: "Elif", score: 27, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p8", nickname: "Can", score: 19, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false }
];

const SHOPPING_PRODUCTS: readonly ShoppingProduct[] = [
  { id: "elmas", name: "Elmas Kolye", price: 30 },
  { id: "vr-kask", name: "VR Kask", price: 25 },
  { id: "drone", name: "Holo Drone", price: 20 },
  { id: "saat", name: "Altın Saat", price: 20 },
  { id: "kahve", name: "Kahve Robotu", price: 15 },
  { id: "kulaklik", name: "Neon Kulaklık", price: 15 },
  { id: "spor-ayakkabi", name: "Siber Ayakkabı", price: 12 },
  { id: "lamba", name: "Akıllı Plazma", price: 10 },
  { id: "canta", name: "Holografik Çanta", price: 10 },
  { id: "termos", name: "Kuantum Termos", price: 8 },
  { id: "gozluk", name: "Siber Vizör", price: 6 },
  { id: "sapka", name: "Retro Kasket", price: 5 }
];

export function Stage11CQAHarness(): JSX.Element {
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  const params = new URLSearchParams(window.location.search);
  const game = (params.get("game") ?? "acgozluluk-limiti") as Stage11CGameId;
  const scene = params.get("scene") ?? "playing";
  const isDensity8 = scene === "density8" || params.get("density") === "8";
  const isSpectator = scene === "spectator" || params.get("spectator") === "true";
  const isResult = scene === "result";

  const players = isDensity8 ? BASE_PLAYERS_8 : BASE_PLAYERS_4;
  const selfPlayerId = isSpectator ? "spec-observer" : "p1";
  const selfPlayer = isSpectator
    ? { id: "spec-observer", nickname: "İzleyici", score: 0, miniGameScore: 0, connected: true, currentGameParticipant: false, eliminated: false }
    : players.find((p) => p.id === selfPlayerId);
  const now = clock;

  let publicState: unknown = null;
  let ownState: unknown = null;
  let actionState: ClientActionState | null = null;
  let gameTitle = "GLIX OYUNU";

  const actionScope: ClientActionScope = {
    sessionId: "qa-session",
    matchId: "qa-match",
    gameId: game,
    phaseIndex: 1,
    actionScope: "playing",
    spectator: isSpectator
  };

  if (game === "acgozluluk-limiti") {
    gameTitle = "Açgözlülük Limiti";
    const limit = isDensity8 ? 100 : 55;
    const maxChoice = 15;

    if (isResult) {
      const choices = isDensity8
        ? [
            { playerId: "p1", value: 12 },
            { playerId: "p2", value: 11 },
            { playerId: "p3", value: 14 },
            { playerId: "p4", value: 9 },
            { playerId: "p5", value: 13 },
            { playerId: "p6", value: 10 },
            { playerId: "p7", value: 11 },
            { playerId: "p8", value: 12 }
          ]
        : [
            { playerId: "p1", value: 11 },
            { playerId: "p2", value: 9 },
            { playerId: "p3", value: 14 },
            { playerId: "p4", value: 10 }
          ];
      const total = choices.reduce((acc, c) => acc + c.value, 0);
      const withinLimit = total <= limit;
      const resultPoints = choices.map((c) => ({ playerId: c.playerId, points: withinLimit ? c.value : 0 }));

      publicState = {
        gameId: "acgozluluk-limiti",
        kind: "acgozluluk-limiti",
        started: true,
        endsAt: now - 1000,
        limit,
        maxChoice,
        finished: true,
        choices,
        total,
        withinLimit,
        resultPoints
      } satisfies AcgozlulukPublicState;

      ownState = {
        gameId: "acgozluluk-limiti",
        kind: "acgozluluk-limiti",
        selectedValue: 11,
        hasSubmitted: true,
        finished: true
      } satisfies AcgozlulukOwnState;
    } else {
      const hasSub = scene === "submitted";
      const selVal = scene === "interaction" ? 11 : hasSub ? 11 : 0;

      publicState = {
        gameId: "acgozluluk-limiti",
        kind: "acgozluluk-limiti",
        started: true,
        endsAt: now + 18000,
        limit,
        maxChoice,
        finished: false,
        choices: null,
        total: null,
        withinLimit: null,
        resultPoints: null
      } satisfies AcgozlulukPublicState;

      ownState = isSpectator
        ? null
        : ({
            gameId: "acgozluluk-limiti",
            kind: "acgozluluk-limiti",
            selectedValue: selVal,
            hasSubmitted: hasSub,
            finished: false
          } satisfies AcgozlulukOwnState);

      if (hasSub) {
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: true, stateVersion: 2 });
      }
    }
  } else if (game === "ortalamanin-yarisi") {
    gameTitle = "Ortalamanın Yarısı";

    if (isResult) {
      const results = isDensity8
        ? [
            { playerId: "p1", value: 23, distanceMs: 0.75, generatedForMissingInput: false },
            { playerId: "p2", value: 18, distanceMs: 4.25, generatedForMissingInput: false },
            { playerId: "p3", value: 34, distanceMs: 11.75, generatedForMissingInput: false },
            { playerId: "p4", value: 45, distanceMs: 22.75, generatedForMissingInput: false },
            { playerId: "p5", value: 20, distanceMs: 2.25, generatedForMissingInput: false },
            { playerId: "p6", value: 55, distanceMs: 32.75, generatedForMissingInput: false },
            { playerId: "p7", value: 65, distanceMs: 42.75, generatedForMissingInput: true },
            { playerId: "p8", value: 12, distanceMs: 10.25, generatedForMissingInput: false }
          ]
        : [
            { playerId: "p1", value: 23, distanceMs: 0.75, generatedForMissingInput: false },
            { playerId: "p2", value: 18, distanceMs: 4.25, generatedForMissingInput: false },
            { playerId: "p3", value: 50, distanceMs: 27.75, generatedForMissingInput: false },
            { playerId: "p4", value: 87, distanceMs: 64.75, generatedForMissingInput: true }
          ];

      publicState = {
        gameId: "ortalamanin-yarisi",
        kind: "ortalamanin-yarisi",
        started: true,
        endsAt: now - 1000,
        finished: true,
        average: 44.5,
        target: 22.25,
        results,
        resultPoints: [
          { playerId: "p1", points: 3 },
          { playerId: "p2", points: 1 },
          { playerId: "p3", points: 0 },
          { playerId: "p4", points: 0 }
        ]
      } satisfies OrtalamaninYarisiPublicState;

      ownState = {
        gameId: "ortalamanin-yarisi",
        kind: "ortalamanin-yarisi",
        selectedValue: 23,
        hasSubmitted: true,
        finished: true
      } satisfies OrtalamaninYarisiOwnState;
    } else {
      const hasSub = scene === "submitted";
      const selVal = scene === "interaction" ? 36 : hasSub ? 36 : null;

      publicState = {
        gameId: "ortalamanin-yarisi",
        kind: "ortalamanin-yarisi",
        started: true,
        endsAt: now + 18000,
        finished: false,
        target: null,
        average: null,
        results: null,
        resultPoints: null
      } satisfies OrtalamaninYarisiPublicState;

      ownState = isSpectator
        ? null
        : ({
            gameId: "ortalamanin-yarisi",
            kind: "ortalamanin-yarisi",
            selectedValue: selVal,
            hasSubmitted: hasSub,
            finished: false
          } satisfies OrtalamaninYarisiOwnState);

      if (hasSub) {
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: true, stateVersion: 2 });
      }
    }
  } else if (game === "gizli-kareler") {
    gameTitle = "Gizli Kareler";
    const gridSize = isDensity8 ? 4 : 3;
    const cellCount = gridSize * gridSize;

    if (isResult) {
      const round1Selections = isDensity8
        ? [
            { playerId: "p1", cell: 4 },
            { playerId: "p2", cell: 4 },
            { playerId: "p3", cell: 0 },
            { playerId: "p4", cell: 15 },
            { playerId: "p5", cell: 7 },
            { playerId: "p6", cell: 7 },
            { playerId: "p7", cell: 10 },
            { playerId: "p8", cell: 12 }
          ]
        : [
            { playerId: "p1", cell: 4 },
            { playerId: "p2", cell: 4 },
            { playerId: "p3", cell: 0 },
            { playerId: "p4", cell: 8 }
          ];

      const round2Selections = isDensity8
        ? [
            { playerId: "p3", cell: 2 },
            { playerId: "p4", cell: 5 },
            { playerId: "p7", cell: 9 },
            { playerId: "p8", cell: 14 }
          ]
        : [
            { playerId: "p3", cell: 2 },
            { playerId: "p4", cell: 6 }
          ];

      publicState = {
        gameId: "gizli-kareler",
        kind: "gizli-kareler",
        started: true,
        round: 2,
        roundEndsAt: now - 1000,
        gridSize,
        cellCount,
        finished: true,
        earlyFinish: false,
        eliminatedPlayerIds: isDensity8 ? ["p1", "p2", "p5", "p6"] : ["p1", "p2"],
        results: [
          {
            round: 1,
            selections: round1Selections,
            soloPlayerIds: isDensity8 ? ["p3", "p4", "p7", "p8"] : ["p3", "p4"],
            collidedPlayerIds: isDensity8 ? ["p1", "p2", "p5", "p6"] : ["p1", "p2"]
          },
          {
            round: 2,
            selections: round2Selections,
            soloPlayerIds: isDensity8 ? ["p3", "p4", "p7", "p8"] : ["p3", "p4"],
            collidedPlayerIds: []
          }
        ],
        resultPoints: isDensity8
          ? [
              { playerId: "p3", points: 2 },
              { playerId: "p4", points: 2 },
              { playerId: "p7", points: 2 },
              { playerId: "p8", points: 2 },
              { playerId: "p1", points: 0 },
              { playerId: "p2", points: 0 },
              { playerId: "p5", points: 0 },
              { playerId: "p6", points: 0 }
            ]
          : [
              { playerId: "p3", points: 2 },
              { playerId: "p4", points: 2 },
              { playerId: "p1", points: 0 },
              { playerId: "p2", points: 0 }
            ]
      } satisfies GizliKarelerPublicState;

      ownState = {
        gameId: "gizli-kareler",
        kind: "gizli-kareler",
        selectedCell: 4,
        canSelect: false,
        eliminated: true,
        finished: true
      } satisfies GizliKarelerOwnState;
    } else {
      const hasSub = scene === "submitted";
      const selCell = scene === "interaction" ? 4 : hasSub ? 4 : null;

      publicState = {
        gameId: "gizli-kareler",
        kind: "gizli-kareler",
        started: true,
        round: 1,
        roundEndsAt: now + 15000,
        gridSize,
        cellCount,
        finished: false,
        earlyFinish: false,
        eliminatedPlayerIds: [],
        results: null,
        resultPoints: null
      } satisfies GizliKarelerPublicState;

      ownState = isSpectator
        ? null
        : ({
            gameId: "gizli-kareler",
            kind: "gizli-kareler",
            selectedCell: selCell,
            canSelect: !hasSub,
            eliminated: false,
            finished: false
          } satisfies GizliKarelerOwnState);

      if (hasSub) {
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: true, stateVersion: 2 });
      }
    }
  } else if (game === "cizgiyi-gecme") {
    gameTitle = "Çizgiyi Geçme";

    if (isResult) {
      const results = isDensity8
        ? [
            { playerId: "p1", value: 73, bucket: 7, evaluated: true, points: 0 },
            { playerId: "p2", value: 78, bucket: 7, evaluated: true, points: 0 },
            { playerId: "p3", value: 85, bucket: 8, evaluated: true, points: 1 },
            { playerId: "p4", value: 94, bucket: 9, evaluated: true, points: 3 },
            { playerId: "p5", value: 100, bucket: 10, evaluated: true, points: 0 },
            { playerId: "p6", value: 100, bucket: 10, evaluated: true, points: 0 },
            { playerId: "p7", value: 45, bucket: 4, evaluated: true, points: 0 },
            { playerId: "p8", value: 22, bucket: 2, evaluated: true, points: 0 }
          ]
        : [
            { playerId: "p1", value: 73, bucket: 7, evaluated: true, points: 0 },
            { playerId: "p2", value: 78, bucket: 7, evaluated: true, points: 0 },
            { playerId: "p3", value: 85, bucket: 8, evaluated: true, points: 1 },
            { playerId: "p4", value: 92, bucket: 9, evaluated: true, points: 3 }
          ];

      publicState = {
        gameId: "cizgiyi-gecme",
        kind: "cizgiyi-gecme",
        started: true,
        endsAt: now - 1000,
        finished: true,
        results,
        resultPoints: [
          { playerId: "p4", points: 3 },
          { playerId: "p3", points: 1 },
          { playerId: "p1", points: 0 },
          { playerId: "p2", points: 0 }
        ]
      } satisfies CizgiyiGecmePublicState;

      ownState = {
        gameId: "cizgiyi-gecme",
        kind: "cizgiyi-gecme",
        selectedValue: 73,
        hasSubmitted: true,
        finished: true
      } satisfies CizgiyiGecmeOwnState;
    } else {
      const hasSub = scene === "submitted";
      const selVal = scene === "interaction" ? 73 : hasSub ? 73 : null;

      publicState = {
        gameId: "cizgiyi-gecme",
        kind: "cizgiyi-gecme",
        started: true,
        endsAt: now + 18000,
        finished: false,
        results: null,
        resultPoints: null
      } satisfies CizgiyiGecmePublicState;

      ownState = isSpectator
        ? null
        : ({
            gameId: "cizgiyi-gecme",
            kind: "cizgiyi-gecme",
            selectedValue: selVal,
            hasSubmitted: hasSub,
            finished: false
          } satisfies CizgiyiGecmeOwnState);

      if (hasSub) {
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: true, stateVersion: 2 });
      }
    }
  } else if (game === "gizli-alisveris") {
    gameTitle = "Gizli Alışveriş";

    if (isResult) {
      const productBuyerCounts: Record<string, number> = {
        elmas: 2,
        "vr-kask": 1,
        termos: 3,
        drone: 2,
        saat: 1,
        kulaklik: 2
      };

      const results = isDensity8
        ? [
            { playerId: "p1", basketValue: 42, productIds: ["elmas", "vr-kask", "termos"] },
            { playerId: "p2", basketValue: 35, productIds: ["elmas", "drone", "kulaklik"] },
            { playerId: "p3", basketValue: 28, productIds: ["saat", "termos"] },
            { playerId: "p4", basketValue: 20, productIds: ["vr-kask"] },
            { playerId: "p5", basketValue: 30, productIds: ["drone", "termos"] },
            { playerId: "p6", basketValue: 15, productIds: ["kulaklik"] },
            { playerId: "p7", basketValue: 10, productIds: ["saat"] },
            { playerId: "p8", basketValue: 8, productIds: ["termos"] }
          ]
        : [
            { playerId: "p1", basketValue: 42, productIds: ["elmas", "vr-kask", "termos"] },
            { playerId: "p2", basketValue: 35, productIds: ["elmas", "drone", "kulaklik"] },
            { playerId: "p3", basketValue: 28, productIds: ["saat", "termos"] },
            { playerId: "p4", basketValue: 15, productIds: ["vr-kask"] }
          ];

      publicState = {
        gameId: "gizli-alisveris",
        kind: "gizli-alisveris",
        started: true,
        endsAt: now - 1000,
        budget: 60,
        products: SHOPPING_PRODUCTS,
        finished: true,
        productBuyerCounts,
        results,
        resultPoints: [
          { playerId: "p1", points: 42 },
          { playerId: "p2", points: 35 },
          { playerId: "p3", points: 28 },
          { playerId: "p4", points: 15 }
        ]
      } satisfies GizliAlisverisPublicState;

      ownState = {
        gameId: "gizli-alisveris",
        kind: "gizli-alisveris",
        cartProductIds: ["elmas", "vr-kask", "termos"],
        spent: 53,
        remainingBudget: 7,
        finished: true
      } satisfies GizliAlisverisOwnState;
    } else {
      const hasSub = scene === "submitted";
      const cart = scene === "interaction" || hasSub ? ["elmas", "vr-kask", "termos"] : [];
      const spent = cart.length > 0 ? 53 : 0;
      const remainingBudget = 60 - spent;

      publicState = {
        gameId: "gizli-alisveris",
        kind: "gizli-alisveris",
        started: true,
        endsAt: now + 20000,
        budget: 60,
        products: SHOPPING_PRODUCTS,
        finished: false,
        productBuyerCounts: null,
        results: null,
        resultPoints: null
      } satisfies GizliAlisverisPublicState;

      ownState = isSpectator
        ? null
        : ({
            gameId: "gizli-alisveris",
            kind: "gizli-alisveris",
            cartProductIds: cart,
            spent,
            remainingBudget,
            finished: false
          } satisfies GizliAlisverisOwnState);

      if (hasSub) {
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "repeatable", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: true, stateVersion: 2 });
      }
    }
  }

  const submissionStatus: SubmissionStatus = {
    mode: game === "gizli-alisveris" ? "repeatable" : "single",
    canAct: !isResult && !isSpectator,
    completed: scene === "submitted" || isResult,
    acceptedActionCount: scene === "submitted" ? 1 : 0,
    locked: scene === "submitted" || isResult
  };

  return (
    <main className="glix-app glix-mobile-shell" data-screen="match">
      <section className="glix-screen glix-match-screen is-active" aria-labelledby="match-title">
        <GameViewport
          gameId={game}
          gameName={gameTitle}
          phase={isResult ? "results" : "playing"}
          requiresLandscape={false}
          roomCode="TEST1"
          connection="connected"
          hud={
            <GameHUD
              gameId={game}
              gameName={gameTitle}
              category="Sayısal / Yoğunluk"
              gameIndex={1}
              gameTotal={5}
              phase={isResult ? "results" : "playing"}
              phaseLabel={isResult ? "SONUÇLAR" : "HAMLE ANI"}
              deadline={isResult ? null : now + 15000}
              now={now}
              totalDurationSeconds={20}
              players={players}
              selfPlayer={selfPlayer}
              selfPlayerId={selfPlayerId}
              readyPlayerIds={players.map((p) => p.id)}
              ownHasSubmitted={scene === "submitted"}
              submissionStatus={submissionStatus}
              connection="connected"
              onLeave={() => {}}
            />
          }
          stage={
            <Stage11CStage
              gameId={game}
              gameName={gameTitle}
              phase={isResult ? "results" : "playing"}
              publicState={publicState}
              ownState={ownState as any}
              selfPlayerId={selfPlayerId}
              players={players}
              now={now}
              isSpectator={isSpectator}
              isReady={true}
              actionState={actionState}
              onReady={() => {}}
              onSubmit={(payload) => {
                console.log("[QA Harness] onSubmit:", payload);
              }}
            />
          }
        >
          <footer className="glix-match-footer">
            <span>ODA TEST1</span>
            <span>SYNC AKTİF</span>
          </footer>
        </GameViewport>
      </section>
    </main>
  );
}