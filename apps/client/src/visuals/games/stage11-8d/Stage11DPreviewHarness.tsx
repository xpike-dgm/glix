import { useMemo, useState } from "react";
import type { JSX } from "react";
import {
  type ClientActionState,
  type DrawingStroke,
  type JsonValue,
  type MatchPlayerState
} from "@glix/shared";
import { GameViewport } from "../../viewport/GameViewport";
import { GameHUD } from "../../hud/GameHUD";
import { isStage11DGameId, Stage11DStage, type Stage11DGameId } from "./Stage11DStage";

const BASE_4_PLAYERS: readonly MatchPlayerState[] = [
  { id: "p1", nickname: "Barış", score: 14, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p2", nickname: "Selin", score: 18, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p3", nickname: "Emre", score: 11, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p4", nickname: "Zeynep", score: 16, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false }
];

const BASE_8_PLAYERS: readonly MatchPlayerState[] = [
  ...BASE_4_PLAYERS,
  { id: "p5", nickname: "Can", score: 9, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p6", nickname: "Deniz", score: 13, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p7", nickname: "Mert", score: 8, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false },
  { id: "p8", nickname: "Ece", score: 15, miniGameScore: 0, connected: true, currentGameParticipant: true, eliminated: false }
];

const SAMPLE_STROKES: readonly DrawingStroke[] = [
  {
    color: "cyan",
    size: 6,
    points: [
      { x: 0.2, y: 0.3 },
      { x: 0.35, y: 0.2 },
      { x: 0.5, y: 0.2 },
      { x: 0.65, y: 0.3 },
      { x: 0.7, y: 0.45 },
      { x: 0.65, y: 0.6 },
      { x: 0.5, y: 0.7 },
      { x: 0.35, y: 0.7 },
      { x: 0.2, y: 0.6 },
      { x: 0.2, y: 0.3 }
    ]
  },
  {
    color: "pink",
    size: 10,
    points: [
      { x: 0.35, y: 0.45 },
      { x: 0.4, y: 0.45 }
    ]
  },
  {
    color: "pink",
    size: 10,
    points: [
      { x: 0.6, y: 0.45 },
      { x: 0.65, y: 0.45 }
    ]
  },
  {
    color: "yellow",
    size: 8,
    points: [
      { x: 0.35, y: 0.58 },
      { x: 0.5, y: 0.65 },
      { x: 0.65, y: 0.58 }
    ]
  }
];

export function Stage11DPreviewHarness({ gameId: rawGameId }: { readonly gameId: string }): JSX.Element {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const subPhaseParam = search.get("subPhase");
  const isSpectator = search.get("spectator") === "1";
  const is8Players = search.get("density") === "8";
  const stateStr = search.get("state") || "idle";

  const [now] = useState(1700000000000);
  const players = is8Players ? BASE_8_PLAYERS : BASE_4_PLAYERS;
  const selfPlayerId = "p1";
  const selfPlayer = players.find((p) => p.id === selfPlayerId) ?? undefined;

  const validGameId: Stage11DGameId = isStage11DGameId(rawGameId as never) ? (rawGameId as Stage11DGameId) : "yazi-yaz";

  const { publicState, ownState, gameName } = useMemo(() => {
    switch (validGameId) {
      case "yazi-yaz": {
        const subPhase = (subPhaseParam || "write") as "write" | "discussion" | "guess" | "results";
        const pub = {
          gameId: "yazi-yaz",
          kind: "yazi-yaz",
          subPhase,
          phaseEndsAt: now + 24_000,
          finished: subPhase === "results",
          writerPlayerIds: subPhase === "results" ? ["p1", "p3"] : null,
          entries: subPhase === "results" ? [
            { playerId: "p1", role: "writer", word: "KÖPRÜ" },
            { playerId: "p2", role: "innocent", word: null },
            { playerId: "p3", role: "writer", word: "KÖPRÜ" },
            { playerId: "p4", role: "innocent", word: null }
          ] : null,
          guesses: subPhase === "results" ? [
            { playerId: "p1", targetWriterId: "p3", targetWord: "KÖPRÜ", personCorrect: true, wordCorrect: true, points: 2 },
            { playerId: "p2", targetWriterId: "p1", targetWord: "KÖPRÜ", personCorrect: true, wordCorrect: true, points: 2 },
            { playerId: "p3", targetWriterId: "p1", targetWord: "KÖPRÜ", personCorrect: true, wordCorrect: true, points: 2 },
            { playerId: "p4", targetWriterId: "p2", targetWord: "GEMİ", personCorrect: false, wordCorrect: false, points: 0 }
          ] : null,
          resultPoints: subPhase === "results" ? [
            { playerId: "p1", points: 2 },
            { playerId: "p2", points: 2 },
            { playerId: "p3", points: 2 },
            { playerId: "p4", points: 0 }
          ] : null
        };
        const own = {
          gameId: "yazi-yaz",
          kind: "yazi-yaz",
          role: "writer",
          assignedWord: "KÖPRÜ",
          canGuess: subPhase === "guess",
          hasWritten: stateStr === "accepted",
          guessTargetPlayerIds: ["p2", "p3", "p4"],
          hasGuessed: subPhase === "results" || stateStr === "accepted",
          finished: subPhase === "results"
        };
        return { publicState: pub, ownState: own, gameName: "Yazı Yaz" };
      }

      case "sozluk-blofu": {
        const subPhase = (subPhaseParam || "write") as "write" | "choose" | "results";
        const pub = {
          gameId: "sozluk-blofu",
          kind: "sozluk-blofu",
          subPhase,
          phaseEndsAt: now + 30_000,
          finished: subPhase === "results",
          word: "AGORA",
          definitions: subPhase === "write" ? null : [
            { id: "def-1", text: "Antik Yunan kentlerinde halk meydanı ve pazar yeri.", ownerId: null, isReal: subPhase === "results" ? true : null, selectedByPlayerIds: subPhase === "results" ? ["p1", "p3"] : [] },
            { id: "def-2", text: "Deniz kabuklularından elde edilen kırmızı renkli boyar madde.", ownerId: subPhase === "results" ? "p1" : null, isReal: subPhase === "results" ? false : null, selectedByPlayerIds: subPhase === "results" ? ["p2"] : [] },
            { id: "def-3", text: "Dağ yamaçlarında rüzgâr erozyonunu önleyen taş teras.", ownerId: subPhase === "results" ? "p2" : null, isReal: subPhase === "results" ? false : null, selectedByPlayerIds: subPhase === "results" ? ["p4"] : [] },
            { id: "def-4", text: "Eski çağlarda zeytinyağı depolamak için kullanılan toprak kap.", ownerId: subPhase === "results" ? "p4" : null, isReal: subPhase === "results" ? false : null, selectedByPlayerIds: [] }
          ],
          resultPoints: subPhase === "results" ? [
            { playerId: "p1", points: 3 },
            { playerId: "p2", points: 1 },
            { playerId: "p3", points: 1 },
            { playerId: "p4", points: 0 }
          ] : null
        };
        const own = {
          gameId: "sozluk-blofu",
          kind: "sozluk-blofu",
          hasWritten: subPhase !== "write" || stateStr === "accepted",
          bluff: "Deniz kabuklularından elde edilen kırmızı renkli boyar madde.",
          hasChosen: subPhase === "results" || stateStr === "accepted",
          chosenDefinitionId: "def-1",
          finished: subPhase === "results"
        };
        return { publicState: pub, ownState: own, gameName: "Sözlük Blöfü" };
      }

      case "cagrisim-agi": {
        const subPhase = (subPhaseParam || "answer") as "answer" | "results";
        const pub = {
          gameId: "cagrisim-agi",
          kind: "cagrisim-agi",
          subPhase,
          phaseEndsAt: now + 18_000,
          finished: subPhase === "results",
          mainWord: "OKYANUS",
          groups: subPhase === "results" ? [
            { answer: "DERİNLİK", playerIds: ["p1", "p2", "p3"], points: 3 },
            { answer: "DALGA", playerIds: ["p4"], points: 0 }
          ] : null,
          resultPoints: subPhase === "results" ? [
            { playerId: "p1", points: 3 },
            { playerId: "p2", points: 3 },
            { playerId: "p3", points: 3 },
            { playerId: "p4", points: 0 }
          ] : null
        };
        const own = {
          gameId: "cagrisim-agi",
          kind: "cagrisim-agi",
          hasSubmitted: subPhase === "results" || stateStr === "accepted",
          answer: "DERİNLİK",
          finished: subPhase === "results"
        };
        return { publicState: pub, ownState: own, gameName: "Çağrışım Ağı" };
      }

      case "rusvet-darbe": {
        const subPhase = (subPhaseParam || "election") as "election" | "rps" | "distribution" | "results";
        const pub = {
          gameId: "rusvet-darbe",
          kind: "rusvet-darbe",
          subPhase,
          phaseEndsAt: now + 20_000,
          finished: subPhase === "results",
          presidentId: subPhase === "election" ? null : "p1",
          presidentVoteCount: subPhase === "results" ? 3 : null,
          rpsCandidateIds: subPhase === "rps" ? ["p1", "p2"] : [],
          rpsRound: 1,
          voteCounts: subPhase === "results" ? [
            { playerId: "p1", votes: 3 },
            { playerId: "p2", votes: 1 },
            { playerId: "p3", votes: 0 },
            { playerId: "p4", votes: 0 }
          ] : null,
          allocations: subPhase === "results" ? [
            { targetPlayerId: "p2", points: 2 },
            { targetPlayerId: "p3", points: 1 }
          ] : null,
          resultPoints: subPhase === "results" ? [
            { playerId: "p1", points: 1 },
            { playerId: "p2", points: 2 },
            { playerId: "p3", points: 1 },
            { playerId: "p4", points: 0 }
          ] : null
        };
        const own = {
          gameId: "rusvet-darbe",
          kind: "rusvet-darbe",
          hasVoted: subPhase !== "election" || stateStr === "accepted",
          isPresident: subPhase === "distribution" || (subPhase === "results" && pub.presidentId === "p1"),
          canChooseRps: subPhase === "rps",
          hasChosenRps: stateStr === "accepted",
          rpsCandidateIds: ["p1", "p2"],
          remainingDistributionPoints: subPhase === "distribution" ? 3 : 0,
          submittedAllocations: subPhase === "results" ? [
            { targetPlayerId: "p2", points: 2 },
            { targetPlayerId: "p3", points: 1 }
          ] : [],
          hasSubmittedDistribution: subPhase === "results" || stateStr === "accepted",
          finished: subPhase === "results"
        };
        return { publicState: pub, ownState: own, gameName: "Rüşvet ve Darbe" };
      }

      case "karalama-defteri": {
        const subPhase = (subPhaseParam || "draw") as "draw" | "vote" | "results";
        const pub = {
          gameId: "karalama-defteri",
          kind: "karalama-defteri",
          subPhase,
          phaseEndsAt: now + 45_000,
          finished: subPhase === "results",
          drawings: subPhase === "draw" ? null : [
            { playerId: "p1", strokes: SAMPLE_STROKES },
            { playerId: "p2", strokes: SAMPLE_STROKES },
            { playerId: "p3", strokes: SAMPLE_STROKES },
            { playerId: "p4", strokes: [] }
          ],
          voteCounts: subPhase === "results" ? [
            { playerId: "p1", votes: 0 },
            { playerId: "p2", votes: 0 },
            { playerId: "p3", votes: 0 },
            { playerId: "p4", votes: 3 }
          ] : null,
          outsiderPlayerId: subPhase === "results" ? "p4" : null,
          commonWord: subPhase === "results" ? "KAHVE" : null,
          outsiderWord: subPhase === "results" ? "ÇAY" : null,
          outsiderCaught: subPhase === "results" ? true : null,
          resultPoints: subPhase === "results" ? [
            { playerId: "p1", points: 1 },
            { playerId: "p2", points: 1 },
            { playerId: "p3", points: 1 },
            { playerId: "p4", points: 0 }
          ] : null
        };
        const own = {
          gameId: "karalama-defteri",
          kind: "karalama-defteri",
          role: "informed",
          assignedWord: "KAHVE",
          hasDrawing: true,
          hasVoted: subPhase === "results" || stateStr === "accepted",
          finished: subPhase === "results"
        };
        return { publicState: pub, ownState: own, gameName: "Karalama Defteri" };
      }

      case "ittifak": {
        const subPhase = (subPhaseParam || "bargain") as "bargain" | "vote" | "results";
        const pub = {
          gameId: "ittifak",
          kind: "ittifak",
          subPhase,
          phaseEndsAt: now + 25_000,
          finished: subPhase === "results",
          voteCounts: subPhase === "results" ? [
            { playerId: "p1", votes: 2 },
            { playerId: "p2", votes: 2 },
            { playerId: "p3", votes: 1 },
            { playerId: "p4", votes: 0 }
          ] : null,
          resultPoints: subPhase === "results" ? [
            { playerId: "p1", points: 2 },
            { playerId: "p2", points: 2 },
            { playerId: "p3", points: 1 },
            { playerId: "p4", points: 0 }
          ] : null
        };
        const own = {
          gameId: "ittifak",
          kind: "ittifak",
          hasVoted: subPhase === "results" || stateStr === "accepted",
          finished: subPhase === "results"
        };
        return { publicState: pub, ownState: own, gameName: "İttifak" };
      }

      default:
        return { publicState: null, ownState: null, gameName: validGameId };
    }
  }, [now, stateStr, subPhaseParam, validGameId]);

  const mockActionState: ClientActionState | null = stateStr === "pending"
    ? ({
        status: "pending",
        scope: { matchId: "m1", gameId: validGameId, phaseIndex: 1, actionScope: "subPhase", sessionId: "s1", spectator: isSpectator },
        authoritativeVersion: 1,
        mode: "single",
        actionId: "act-1",
        observedStateVersion: 1
      } as ClientActionState)
    : stateStr === "accepted"
      ? ({
          status: "accepted",
          scope: { matchId: "m1", gameId: validGameId, phaseIndex: 1, actionScope: "subPhase", sessionId: "s1", spectator: isSpectator },
          authoritativeVersion: 1,
          mode: "single",
          actionId: "act-1",
          ackStateVersion: 1
        } as ClientActionState)
      : null;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <GameViewport
        gameId={validGameId}
        gameName={gameName}
        phase="playing"
        requiresLandscape={false}
        roomCode="STAGE"
        connection="connected"
        hud={
          <GameHUD
            gameId={validGameId}
            gameName={gameName}
            category="sosyal"
            gameIndex={1}
            gameTotal={5}
            phase="playing"
            phaseLabel="OYUN"
            deadline={now + 24_000}
            now={now}
            totalDurationSeconds={30}
            players={players}
            selfPlayer={selfPlayer}
            selfPlayerId={selfPlayerId}
            readyPlayerIds={["p1", "p2", "p3", "p4"]}
            ownHasSubmitted={stateStr === "accepted"}
            submissionStatus={{ mode: "single", canAct: stateStr !== "accepted", completed: stateStr === "accepted", acceptedActionCount: stateStr === "accepted" ? 1 : 0, locked: false }}
            connection="connected"
            onLeave={() => {}}
          />
        }
        stage={
          <Stage11DStage
            gameId={validGameId}
            gameName={gameName}
            phase="playing"
            publicState={publicState}
            ownState={ownState as unknown as JsonValue}
            selfPlayerId={selfPlayerId}
            players={players}
            now={now}
            isSpectator={isSpectator}
            isReady={true}
            actionState={mockActionState}
            onReady={() => {}}
            onSubmit={(payload) => console.log("Preview submit:", payload)}
          />
        }
      />
    </div>
  );
}
