export type PremiumAssetLoading = "eager" | "lazy";
export type PremiumAssetKind = "brand" | "stage-pack" | "game-pack";

export interface PremiumVisualAsset {
  readonly id: string;
  readonly kind: PremiumAssetKind;
  readonly loading: PremiumAssetLoading;
  readonly src?: string;
  readonly maxTextureEdge?: number;
}

/**
 * The visual core is intentionally CSS/SVG-first. The manifest is the seam for
 * future illustrated packs without making every game's asset eager.
 */
export const PREMIUM_VISUAL_ASSETS = {
  brand: [
    { id: "glix-wordmark", kind: "brand", loading: "eager" }
  ],
  sharedStage: [
    { id: "portrait-grid", kind: "stage-pack", loading: "eager" },
    { id: "landscape-grid", kind: "stage-pack", loading: "eager" }
  ],
  games: {
    "kontrol-paneli-kaosu": [
      { id: "kpk-console", kind: "game-pack", loading: "lazy", maxTextureEdge: 1920 }
    ],
    "cagrisim-agi": [
      { id: "cagrisim-reactor", kind: "game-pack", loading: "lazy", maxTextureEdge: 1024 }
    ]
  }
} as const satisfies Record<string, unknown>;

const loadedAssets = new Map<string, Promise<void>>();

function loadAsset(asset: PremiumVisualAsset): Promise<void> {
  const cached = loadedAssets.get(asset.id);

  if (cached) {
    return cached;
  }

  if (!asset.src || typeof window === "undefined") {
    const ready = Promise.resolve();
    loadedAssets.set(asset.id, ready);
    return ready;
  }

  const promise = new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.loading = asset.loading;
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => resolve(), { once: true });
    image.src = asset.src!;
  });

  loadedAssets.set(asset.id, promise);
  return promise;
}

export function preloadPremiumBrandAssets(): Promise<readonly void[]> {
  const assets = [
    ...PREMIUM_VISUAL_ASSETS.brand,
    ...PREMIUM_VISUAL_ASSETS.sharedStage
  ] as readonly PremiumVisualAsset[];

  return Promise.all(assets.map(loadAsset));
}

export function preloadPremiumGamePack(gameId: string): Promise<readonly void[]> {
  const assets = (PREMIUM_VISUAL_ASSETS.games as Record<string, readonly PremiumVisualAsset[]>)[gameId] ?? [];
  return Promise.all(assets.map(loadAsset));
}
