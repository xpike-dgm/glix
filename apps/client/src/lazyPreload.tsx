import type { JSX } from "react";
import type { GameId } from "@glix/shared";
import { pwaService } from "./pwa";

export function safeLazy<T>(importer: () => Promise<T>): () => Promise<T> {
  return async () => {
    try {
      return await importer();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const isChunkLoadError =
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("Importing a module script failed") ||
        msg.includes("Loading chunk") ||
        msg.includes("error loading dynamically imported module");

      if (isChunkLoadError) {
        pwaService.triggerChunkLoadRecovery();
      }
      throw error;
    }
  };
}

const gameLoaders: Partial<Record<GameId, () => Promise<unknown>>> = {
  // Stage 11.8B six games
  "sizma": () => import("./visuals/games/stage11-8b/SizmaStage"),
  "rus-ruleti": () => import("./visuals/games/stage11-8b/RusRuletiStage"),
  "kor-bomba": () => import("./visuals/games/stage11-8b/KorBombaStage"),
  "zehirli-kadeh": () => import("./visuals/games/stage11-8b/ZehirliKadehStage"),
  "capraz-ates": () => import("./visuals/games/stage11-8b/CaprazAtesStage"),
  "zaman-bombasi-hafizasi": () => import("./visuals/games/stage11-8b/MemoryStage"),
  // Stage 11.8A timing pressure games
  "butona-bas": () => import("./visuals/games/Stage11ATimingPressureStage"),
  "gizli-hirsiz": () => import("./visuals/games/Stage11ATimingPressureStage"),
  "kor-kronometre": () => import("./visuals/games/Stage11ATimingPressureStage"),
  "asiri-yukleme": () => import("./visuals/games/Stage11ATimingPressureStage"),
  "son-kisi": () => import("./visuals/games/Stage11ATimingPressureStage"),
  // Stage 11.8C numeric density games
  "acgozluluk-limiti": () => import("./visuals/games/stage11c/Stage11CStage"),
  "ortalamanin-yarisi": () => import("./visuals/games/stage11c/Stage11CStage"),
  "gizli-kareler": () => import("./visuals/games/stage11c/Stage11CStage"),
  "cizgiyi-gecme": () => import("./visuals/games/stage11c/Stage11CStage"),
  "gizli-alisveris": () => import("./visuals/games/stage11c/Stage11CStage"),
  // Stage 11.8D social / creative games
  "yazi-yaz": () => import("./visuals/games/stage11-8d/Stage11DStage"),
  "sozluk-blofu": () => import("./visuals/games/stage11-8d/Stage11DStage"),
  "cagrisim-agi": () => import("./visuals/games/stage11-8d/Stage11DStage"),
  "rusvet-darbe": () => import("./visuals/games/stage11-8d/Stage11DStage"),
  "karalama-defteri": () => import("./visuals/games/stage11-8d/Stage11DStage"),
  "ittifak": () => import("./visuals/games/stage11-8d/Stage11DStage"),
  // Immersive games
  "kontrol-paneli-kaosu": () => import("./visuals/games/kontrol-paneli-kaosu/KpkStage"),
  "kendim": () => import("./visuals/games/kendim/KendimStage")
};


const preloadedGames = new Set<string>();

export function preloadGameStage(gameId: GameId): void {
  if (preloadedGames.has(gameId)) return;
  const loader = gameLoaders[gameId];
  if (loader) {
    preloadedGames.add(gameId);
    loader().catch(() => {
      preloadedGames.delete(gameId);
    });
  }
}

export function preloadNextScheduledGame(gameIds: readonly GameId[] | undefined, currentIndex: number): void {
  if (!gameIds || currentIndex < 0 || currentIndex + 1 >= gameIds.length) return;
  const nextGameId = gameIds[currentIndex + 1];
  if (nextGameId) {
    preloadGameStage(nextGameId);
  }
}

export function StageLoadingFallback({ gameName }: { readonly gameName: string }): JSX.Element {
  return (
    <div className="glix-stage-loading-card" role="status" aria-live="polite">
      <div className="glix-stage-loading-spinner" aria-hidden="true" />
      <div className="glix-stage-loading-info">
        <span className="glix-stage-loading-kicker">GLIX // SAHNE YÜKLENİYOR</span>
        <strong>{gameName}</strong>
        <small>Bileşenler hazırlanıyor...</small>
      </div>
    </div>
  );
}
