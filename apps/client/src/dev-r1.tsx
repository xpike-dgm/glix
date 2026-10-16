import { StrictMode, useState, type JSX } from "react";
import { createRoot } from "react-dom/client";
import { HomeScreen } from "./visuals/home/HomeScreen";
import { RoomEntryScreen } from "./visuals/home/RoomEntryScreen";
import { LobbyScreen } from "./visuals/lobby/LobbyScreen";
import { BriefingScreen } from "./visuals/briefing/BriefingScreen";
import { ResultOverlay } from "./visuals/overlays/ResultOverlay";
import { GAME_CATALOG, type GameId, type LobbyState, type MatchPlayerState } from "@glix/shared";
import "./styles.css";
import "./r1-mobile.css";

const query = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
const view = query.get("view") || "home";
const density = query.get("density") || "normal";
const accordionState = query.get("accordion") || "closed";

function R1PreviewHarness(): JSX.Element {
  const [currentMode, setCurrentMode] = useState<"create" | "join">("create");
  const [nick, setNick] = useState("NeonKedi");
  const [code, setCode] = useState("ABCDE");
  const [selectedGames, setSelectedGames] = useState<GameId[]>(GAME_CATALOG.map((g) => g.id));
  const [isReady, setIsReady] = useState(false);

  if (view === "home") {
    return (
      <HomeScreen
        onCreateRoom={() => {}}
        onJoinRoom={() => {}}
      />
    );
  }

  if (view === "entry-create") {
    return (
      <RoomEntryScreen
        mode="create"
        nickname={nick}
        roomCode={code}
        error={null}
        isSubmitting={false}
        onModeChange={setCurrentMode}
        onNicknameChange={setNick}
        onRoomCodeChange={setCode}
        onSubmit={(e) => { e.preventDefault(); }}
        onBack={() => {}}
      />
    );
  }

  if (view === "entry-join") {
    return (
      <RoomEntryScreen
        mode="join"
        nickname={nick}
        roomCode={code}
        error={null}
        isSubmitting={false}
        onModeChange={setCurrentMode}
        onNicknameChange={setNick}
        onRoomCodeChange={setCode}
        onSubmit={(e) => { e.preventDefault(); }}
        onBack={() => {}}
      />
    );
  }

  if (view === "lobby") {
    const playerCount = density === "8players" ? 8 : 2;
    const mockPlayers: MatchPlayerState[] = Array.from({ length: playerCount }, (_, i) => ({
      id: `p-${i + 1}`,
      nickname: i === 0 ? "OdaKrali" : `Oyuncu ${i + 1}`,
      connected: true,
      score: 0,
      miniGameScore: 0,
      currentGameParticipant: true,
      eliminated: false
    }));

    const mockLobbyState: LobbyState = {
      roomCode: "GLIX9",
      hostPlayerId: "p-1",
      players: mockPlayers,
      selectedGameIds: selectedGames,
      selectionMode: "manual" as const,
      randomGameCount: 5,
      phase: "lobby"
    };

    return (
      <div className="glix-app">
        <LobbyScreen
          roomState={mockLobbyState}
          selfPlayerId="p-1"
          canManageGames={true}
          canStartMatch={true}
          availableGameIds={new Set(GAME_CATALOG.map((g) => g.id))}
          availableGameCount={24}
          connectedCount={playerCount}
          connection="connected"
          error={null}
          notice={null}
          initialAccordionOpen={accordionState === "open"}
          onCopyRoomCode={() => {}}
          onLeaveRoom={() => {}}
          onStartMatch={() => {}}
          onSwitchSelectionMode={() => {}}
          onToggleGame={(id) => {
            setSelectedGames((prev) =>
              prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
            );
          }}
          onChangeRandomGameCount={() => {}}
        />
      </div>
    );
  }

  if (view === "briefing") {
    const mockPlayers: MatchPlayerState[] = ["NeonKedi", "SiberKurt", "PikselKral"].map((nickname, index) => ({
      id: `p-${index + 1}`,
      nickname,
      score: 0,
      miniGameScore: 0,
      connected: true,
      currentGameParticipant: true,
      eliminated: false
    }));

    return (
      <div className="glix-app" style={{ position: "relative", width: "100%", height: "100dvh" }}>
        <BriefingScreen
          gameName="Refleks Yarışı"
          category="Refleks & Hız"
          steps={[
            "Ekrandaki neon ışığı dikkatle takip et.",
            "Işık yeşile döndüğü an butona en hızlı sen bas.",
            "İlk basan oyuncu en yüksek puanı alır!"
          ]}
          readyCount={isReady ? 2 : 1}
          eligibleCount={3}
          isReady={isReady}
          canReady={true}
          onReady={() => setIsReady(!isReady)}
          readyPlayerIds={isReady ? ["p-1", "p-2"] : ["p-2"]}
          players={mockPlayers}
          selfPlayerId="p-1"
        />
      </div>
    );
  }

  if (view === "result") {
    const mockScores = [
      { id: "p-1", nickname: "NeonKedi", score: 450, miniGameScore: 100, rank: 1 },
      { id: "p-2", nickname: "SiberKurt", score: 380, miniGameScore: 70, rank: 2 },
      { id: "p-3", nickname: "PikselKral", score: 290, miniGameScore: 50, rank: 3 },
      { id: "p-4", nickname: "MegaYildiz", score: 210, miniGameScore: 30, rank: 4 }
    ];

    return (
      <div className="glix-app" style={{ position: "relative", width: "100%", height: "100dvh" }}>
        <ResultOverlay
          gameName="GLIX"
          final={true}
          scores={mockScores}
          winner={{
            id: "p-1",
            nickname: "NeonKedi",
            score: 450,
            miniGameScore: 100,
            rank: 1,
            isWinner: true
          }}
          onReturnLobby={() => {}}
        />
      </div>
    );
  }

  return <div>Bilinmeyen görünüm</div>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <R1PreviewHarness />
  </StrictMode>
);
