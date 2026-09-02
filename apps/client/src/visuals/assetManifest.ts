export type VisualAssetKind = "background" | "roster-reference" | "game-prop";

export interface VisualAsset {
  readonly src: string;
  readonly kind: VisualAssetKind;
  readonly critical: boolean;
  readonly loading: "eager" | "lazy";
  readonly maxTextureEdge: number;
}

export const NEON_TOYBOX_ASSETS = {
  stageBackdrop: {
    src: "/assets/stage/neon-toybox-arcade-deck-v1.png",
    kind: "background",
    critical: true,
    loading: "eager",
    maxTextureEdge: 2048
  },
  characterRosterReference: {
    src: "/assets/characters/neon-toybox-roster-v1.png",
    kind: "roster-reference",
    critical: false,
    loading: "lazy",
    maxTextureEdge: 2048
  },
  gameProps: {
    butonaBas: {
      src: "/assets/games/butona-bas-neon-toybox-v1.png",
      kind: "game-prop",
      critical: false,
      loading: "eager",
      maxTextureEdge: 2048
    },
    sizma: {
      src: "/assets/games/sizma-neon-toybox-v1.png",
      kind: "game-prop",
      critical: false,
      loading: "eager",
      maxTextureEdge: 2048
    },
    memory: {
      src: "/assets/games/zaman-bombasi-hafizasi-neon-toybox-v1.png",
      kind: "game-prop",
      critical: false,
      loading: "eager",
      maxTextureEdge: 2048
    }
  }
} as const;

export const NEON_TOYBOX_SCENE_LAYERS = [
  "backdrop",
  "atmosphere",
  "parallax-grid",
  "stage-deck",
  "characters",
  "foreground-fx",
  "html-ui"
] as const;

export const NEON_TOYBOX_CHARACTER_STYLES = [
  { id: "pulse", accent: "#72f4ff", shape: "runner" },
  { id: "byte", accent: "#ff55d8", shape: "bot" },
  { id: "volt", accent: "#ffc857", shape: "visor" },
  { id: "moss", accent: "#a8f46a", shape: "cat" },
  { id: "nova", accent: "#a594ff", shape: "orb" },
  { id: "flare", accent: "#ff6f91", shape: "dj" },
  { id: "wave", accent: "#72a5ff", shape: "slime" },
  { id: "ember", accent: "#ff9f5a", shape: "fire" }
] as const;

type LoadedVisualAsset = HTMLImageElement;

const loadedAssets = new Map<string, Promise<LoadedVisualAsset>>();

function loadVisualAsset(asset: VisualAsset): Promise<LoadedVisualAsset> {
  const cached = loadedAssets.get(asset.src);

  if (cached) {
    return cached;
  }

  const promise = new Promise<LoadedVisualAsset>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.loading = asset.loading;
    image.setAttribute("fetchpriority", asset.critical ? "high" : "low");
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", () => reject(new Error(`Görsel yüklenemedi: ${asset.src}`)), { once: true });
    image.src = asset.src;
  });

  loadedAssets.set(asset.src, promise);
  return promise;
}

export function preloadCriticalVisualAssets(): Promise<readonly LoadedVisualAsset[]> {
  if (typeof window === "undefined") {
    return Promise.resolve([]);
  }

  const criticalAssets = [NEON_TOYBOX_ASSETS.stageBackdrop].filter((asset) => asset.critical);
  return Promise.all(criticalAssets.map(loadVisualAsset));
}
