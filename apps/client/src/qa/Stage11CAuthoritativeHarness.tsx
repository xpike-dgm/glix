import { useState, useEffect, type JSX } from "react";
import {
  createStage7GameAdapter,
  reduceClientActionState,
  type MatchPlayerState,
  type ClientActionState,
  type ClientActionScope,
  type SubmissionStatus
} from "@glix/shared";
import { GameViewport } from "../visuals/viewport/GameViewport";
import { GameHUD } from "../visuals/hud/GameHUD";
import { Stage11CStage, type Stage11CGameId } from "../visuals/games/stage11c/Stage11CStage";

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

export function Stage11CAuthoritativeHarness(): JSX.Element {
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
  const isRejected = scene === "rejected";
  const isAccepted = scene === "accepted" || scene === "submitted";
  const isInteraction = scene === "interaction";

  const players = isDensity8 ? BASE_PLAYERS_8 : BASE_PLAYERS_4;
  const playerIds = players.map((p) => p.id);
  const selfPlayerId = isSpectator ? "spec-observer" : "p1";
  const selfPlayer = isSpectator
    ? { id: "spec-observer", nickname: "İzleyici", score: 0, miniGameScore: 0, connected: true, currentGameParticipant: false, eliminated: false }
    : players.find((p) => p.id === selfPlayerId);
  const now = clock;

  const actionScope: ClientActionScope = {
    sessionId: "qa-session",
    matchId: "qa-match",
    gameId: game,
    phaseIndex: 1,
    actionScope: "playing",
    spectator: isSpectator
  };

  let publicState: any = null;
  let ownState: any = null;
  let actionState: ClientActionState | null = null;
  let gameTitle = "GLIX OYUNU";

  if (game === "acgozluluk-limiti") {
    gameTitle = "Açgözlülük Limiti";
    const adapter = createStage7GameAdapter("acgozluluk-limiti", playerIds);
    adapter.start(100);

    if (isResult) {
      if (isDensity8) {
        // 8 players: Limit is 43, maxChoice is 8.
        // Choices: 6, 5, 7, 4, 6, 5, 4, 5 -> Total = 42 <= 43
        adapter.submit("p1", { kind: "limit-value", value: 6 }, 100);
        adapter.submit("p2", { kind: "limit-value", value: 5 }, 100);
        adapter.submit("p3", { kind: "limit-value", value: 7 }, 100);
        adapter.submit("p4", { kind: "limit-value", value: 4 }, 100);
        adapter.submit("p5", { kind: "limit-value", value: 6 }, 100);
        adapter.submit("p6", { kind: "limit-value", value: 5 }, 100);
        adapter.submit("p7", { kind: "limit-value", value: 4 }, 100);
        adapter.submit("p8", { kind: "limit-value", value: 5 }, 100);
      } else {
        // 4 players: Limit is 11, maxChoice is 4.
        // Choices: 3, 2, 4, 2 -> Total = 11 <= 11
        adapter.submit("p1", { kind: "limit-value", value: 3 }, 100);
        adapter.submit("p2", { kind: "limit-value", value: 2 }, 100);
        adapter.submit("p3", { kind: "limit-value", value: 4 }, 100);
        adapter.submit("p4", { kind: "limit-value", value: 2 }, 100);
      }
      adapter.advance(25_000);
      publicState = adapter.getPublicState(25_000);
      ownState = adapter.getOwnState("p1", 25_000);
    } else {
      if (isAccepted) {
        adapter.submit("p1", { kind: "limit-value", value: isDensity8 ? 6 : 3 }, 150);
        ownState = adapter.getOwnState("p1", 150);
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: true, stateVersion: 2 });
      } else if (isRejected) {
        // User submitted out of range (value > maxChoice)
        ownState = {
          gameId: "acgozluluk-limiti",
          kind: "acgozluluk-limiti",
          selectedValue: 0,
          hasSubmitted: false,
          finished: false
        };
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: false, stateVersion: 1, reason: "Değer sınırı aşıldı (maksimum " + (isDensity8 ? 8 : 4) + ")" });
      } else {
        // Playing or Interaction
        const initialVal = isInteraction ? (isDensity8 ? 6 : 3) : 0;
        ownState = isSpectator ? null : {
          gameId: "acgozluluk-limiti",
          kind: "acgozluluk-limiti",
          selectedValue: initialVal,
          hasSubmitted: false,
          finished: false
        };
      }
      publicState = adapter.getPublicState(100);
    }
  } else if (game === "ortalamanin-yarisi") {
    gameTitle = "Ortalamanın Yarısı";
    const mockRandom = () => 0.65; // generates 65 for missing input
    const adapter = createStage7GameAdapter("ortalamanin-yarisi", playerIds, mockRandom);
    adapter.start(100);

    if (isResult) {
      if (isDensity8) {
        adapter.submit("p1", { kind: "average-value", value: 23 }, 100);
        adapter.submit("p2", { kind: "average-value", value: 18 }, 100);
        adapter.submit("p3", { kind: "average-value", value: 34 }, 100);
        adapter.submit("p4", { kind: "average-value", value: 45 }, 100);
        adapter.submit("p5", { kind: "average-value", value: 20 }, 100);
        adapter.submit("p6", { kind: "average-value", value: 55 }, 100);
        // p7 missing (auto 65)
        adapter.submit("p8", { kind: "average-value", value: 12 }, 100);
      } else {
        adapter.submit("p1", { kind: "average-value", value: 23 }, 100);
        adapter.submit("p2", { kind: "average-value", value: 18 }, 100);
        adapter.submit("p3", { kind: "average-value", value: 50 }, 100);
        // p4 missing (auto 65)
      }
      adapter.advance(25_000);
      publicState = adapter.getPublicState(25_000);
      ownState = adapter.getOwnState("p1", 25_000);
    } else {
      if (isAccepted) {
        adapter.submit("p1", { kind: "average-value", value: 23 }, 150);
        ownState = adapter.getOwnState("p1", 150);
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: true, stateVersion: 2 });
      } else if (isRejected) {
        ownState = {
          gameId: "ortalamanin-yarisi",
          kind: "ortalamanin-yarisi",
          selectedValue: null,
          hasSubmitted: false,
          finished: false
        };
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: false, stateVersion: 1, reason: "0 ile 100 arasında bir sayı girilmelidir" });
      } else {
        ownState = isSpectator ? null : {
          gameId: "ortalamanin-yarisi",
          kind: "ortalamanin-yarisi",
          selectedValue: isInteraction ? 23 : null,
          hasSubmitted: false,
          finished: false
        };
      }
      publicState = adapter.getPublicState(100);
    }
  } else if (game === "gizli-kareler") {
    gameTitle = "Gizli Kareler";
    const adapter = createStage7GameAdapter("gizli-kareler", playerIds);
    adapter.start(100);

    if (isResult) {
      if (isDensity8) {
        // Round 1
        adapter.submit("p1", { kind: "grid-cell", cell: 4 }, 100);
        adapter.submit("p2", { kind: "grid-cell", cell: 4 }, 100); // collision on 4
        adapter.submit("p3", { kind: "grid-cell", cell: 0 }, 100); // solo
        adapter.submit("p4", { kind: "grid-cell", cell: 15 }, 100); // solo
        adapter.submit("p5", { kind: "grid-cell", cell: 7 }, 100);
        adapter.submit("p6", { kind: "grid-cell", cell: 7 }, 100); // collision on 7
        adapter.submit("p7", { kind: "grid-cell", cell: 10 }, 100); // solo
        adapter.submit("p8", { kind: "grid-cell", cell: 12 }, 100); // solo
        adapter.advance(21_000);

        // Round 2
        adapter.submit("p3", { kind: "grid-cell", cell: 2 }, 22_000);
        adapter.submit("p4", { kind: "grid-cell", cell: 5 }, 22_000);
        adapter.submit("p7", { kind: "grid-cell", cell: 9 }, 22_000);
        adapter.submit("p8", { kind: "grid-cell", cell: 14 }, 22_000);
        adapter.advance(45_000);
      } else {
        // Round 1: p1 and p2 collide on 4, p3 on 0, p4 on 8
        adapter.submit("p1", { kind: "grid-cell", cell: 4 }, 100);
        adapter.submit("p2", { kind: "grid-cell", cell: 4 }, 100);
        adapter.submit("p3", { kind: "grid-cell", cell: 0 }, 100);
        adapter.submit("p4", { kind: "grid-cell", cell: 8 }, 100);
        adapter.advance(21_000);

        // Round 2: p3 on 2, p4 on 6
        adapter.submit("p3", { kind: "grid-cell", cell: 2 }, 22_000);
        adapter.submit("p4", { kind: "grid-cell", cell: 6 }, 22_000);
        adapter.advance(45_000);
      }
      publicState = adapter.getPublicState(50_000);
      ownState = adapter.getOwnState("p1", 50_000);
    } else {
      if (isAccepted) {
        adapter.submit("p1", { kind: "grid-cell", cell: 4 }, 150);
        ownState = adapter.getOwnState("p1", 150);
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: true, stateVersion: 2 });
      } else if (isRejected) {
        ownState = {
          gameId: "gizli-kareler",
          kind: "gizli-kareler",
          selectedCell: null,
          canSelect: true,
          eliminated: false,
          finished: false
        };
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: false, stateVersion: 1, reason: "Geçersiz kare seçimi yapıldı" });
      } else {
        ownState = isSpectator ? null : {
          gameId: "gizli-kareler",
          kind: "gizli-kareler",
          selectedCell: isInteraction ? 4 : null,
          canSelect: true,
          eliminated: false,
          finished: false
        };
      }
      publicState = adapter.getPublicState(100);
    }
  } else if (game === "cizgiyi-gecme") {
    gameTitle = "Çizgiyi Geçme";
    const adapter = createStage7GameAdapter("cizgiyi-gecme", playerIds);
    adapter.start(100);

    if (isResult) {
      if (isDensity8) {
        adapter.submit("p1", { kind: "risk-value", value: 73 }, 100); // bucket 7
        adapter.submit("p2", { kind: "risk-value", value: 78 }, 100); // bucket 7 (collision)
        adapter.submit("p3", { kind: "risk-value", value: 85 }, 100); // bucket 8 (unique second +1)
        adapter.submit("p4", { kind: "risk-value", value: 94 }, 100); // bucket 9 (unique highest +2)
        adapter.submit("p5", { kind: "risk-value", value: 100 }, 100); // bucket 10
        adapter.submit("p6", { kind: "risk-value", value: 100 }, 100); // bucket 10 (collision)
        adapter.submit("p7", { kind: "risk-value", value: 45 }, 100);
        adapter.submit("p8", { kind: "risk-value", value: 22 }, 100);
      } else {
        adapter.submit("p1", { kind: "risk-value", value: 73 }, 100); // bucket 7
        adapter.submit("p2", { kind: "risk-value", value: 78 }, 100); // bucket 7 (collision)
        adapter.submit("p3", { kind: "risk-value", value: 85 }, 100); // bucket 8 (unique second +1)
        adapter.submit("p4", { kind: "risk-value", value: 92 }, 100); // bucket 9 (unique highest +2)
      }
      adapter.advance(35_000);
      publicState = adapter.getPublicState(35_000);
      ownState = adapter.getOwnState("p1", 35_000);
    } else {
      if (isAccepted) {
        adapter.submit("p1", { kind: "risk-value", value: 73 }, 150);
        ownState = adapter.getOwnState("p1", 150);
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: true, stateVersion: 2 });
      } else if (isRejected) {
        ownState = {
          gameId: "cizgiyi-gecme",
          kind: "cizgiyi-gecme",
          selectedValue: null,
          hasSubmitted: false,
          finished: false
        };
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "single", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: false, stateVersion: 1, reason: "Geçersiz değer (0-100 aralığında olmalı)" });
      } else {
        ownState = isSpectator ? null : {
          gameId: "cizgiyi-gecme",
          kind: "cizgiyi-gecme",
          selectedValue: isInteraction ? 73 : null,
          hasSubmitted: false,
          finished: false
        };
      }
      publicState = adapter.getPublicState(100);
    }
  } else if (game === "gizli-alisveris") {
    gameTitle = "Gizli Alışveriş";
    const adapter = createStage7GameAdapter("gizli-alisveris", playerIds);
    adapter.start(100);

    if (isResult) {
      if (isDensity8) {
        adapter.submit("p1", { kind: "shopping-toggle", productId: "hologram-sticker" }, 100);
        adapter.submit("p1", { kind: "shopping-toggle", productId: "enerji-icecegi" }, 100);
        adapter.submit("p1", { kind: "shopping-toggle", productId: "neon-rozet" }, 100);

        adapter.submit("p2", { kind: "shopping-toggle", productId: "hologram-sticker" }, 100);
        adapter.submit("p2", { kind: "shopping-toggle", productId: "retro-kartus" }, 100);

        adapter.submit("p3", { kind: "shopping-toggle", productId: "mini-hoparlor" }, 100);
        adapter.submit("p4", { kind: "shopping-toggle", productId: "arcade-eldiveni" }, 100);
        adapter.submit("p5", { kind: "shopping-toggle", productId: "hologram-sticker" }, 100);
        adapter.submit("p6", { kind: "shopping-toggle", productId: "piksel-kamera" }, 100);
        adapter.submit("p7", { kind: "shopping-toggle", productId: "jet-canta" }, 100);
        adapter.submit("p8", { kind: "shopping-toggle", productId: "enerji-icecegi" }, 100);
      } else {
        adapter.submit("p1", { kind: "shopping-toggle", productId: "hologram-sticker" }, 100);
        adapter.submit("p1", { kind: "shopping-toggle", productId: "enerji-icecegi" }, 100);
        adapter.submit("p1", { kind: "shopping-toggle", productId: "neon-rozet" }, 100);

        adapter.submit("p2", { kind: "shopping-toggle", productId: "hologram-sticker" }, 100);
        adapter.submit("p2", { kind: "shopping-toggle", productId: "retro-kartus" }, 100);

        adapter.submit("p3", { kind: "shopping-toggle", productId: "mini-hoparlor" }, 100);
        adapter.submit("p4", { kind: "shopping-toggle", productId: "arcade-eldiveni" }, 100);
      }
      adapter.advance(35_000);
      publicState = adapter.getPublicState(35_000);
      ownState = adapter.getOwnState("p1", 35_000);
    } else {
      if (isAccepted) {
        adapter.submit("p1", { kind: "shopping-toggle", productId: "hologram-sticker" }, 100);
        adapter.submit("p1", { kind: "shopping-toggle", productId: "enerji-icecegi" }, 100);
        ownState = adapter.getOwnState("p1", 100);
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "repeatable", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: true, stateVersion: 2 });
      } else if (isRejected) {
        // User attempted to add item that exceeds budget
        adapter.submit("p1", { kind: "shopping-toggle", productId: "gizli-sandik" }, 100); // 36
        adapter.submit("p1", { kind: "shopping-toggle", productId: "mini-drone" }, 100); // 32 -> 36+32 = 68 > 60
        ownState = adapter.getOwnState("p1", 100);
        let act = reduceClientActionState(null, { type: "scope", scope: actionScope, stateVersion: 1, mode: "repeatable", completed: false });
        act = reduceClientActionState(act, { type: "submit", actionId: "a1", observedStateVersion: 1 });
        actionState = reduceClientActionState(act, { type: "ack", actionId: "a1", accepted: false, stateVersion: 1, reason: "Bütçe aşıldı! Maksimum 60 Kredi" });
      } else {
        if (isInteraction) {
          adapter.submit("p1", { kind: "shopping-toggle", productId: "hologram-sticker" }, 100);
          adapter.submit("p1", { kind: "shopping-toggle", productId: "enerji-icecegi" }, 100);
        }
        ownState = isSpectator ? null : adapter.getOwnState("p1", 100);
      }
      publicState = adapter.getPublicState(100);
    }
  }

  const submissionStatus: SubmissionStatus = {
    mode: game === "gizli-alisveris" ? "repeatable" : "single",
    canAct: !isResult && !isSpectator,
    completed: isAccepted || isResult,
    acceptedActionCount: isAccepted ? 1 : 0,
    locked: isAccepted || isResult
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
              ownHasSubmitted={isAccepted}
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
              ownState={ownState}
              selfPlayerId={selfPlayerId}
              players={players}
              now={now}
              isSpectator={isSpectator}
              isReady={true}
              actionState={actionState}
              onReady={() => {}}
              onSubmit={(payload) => {
                console.log("[Authoritative QA] onSubmit:", payload);
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