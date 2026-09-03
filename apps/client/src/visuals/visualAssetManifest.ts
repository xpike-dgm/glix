export type PremiumAssetLoading = "eager" | "lazy";
export type PremiumAssetKind = "brand" | "stage-pack" | "game-pack" | "avatar" | "shared-ui";

export interface PremiumVisualAsset {
  readonly id: string;
  readonly kind: PremiumAssetKind;
  readonly loading: PremiumAssetLoading;
  readonly src?: string;
  readonly maxTextureEdge?: number;
}

export interface PremiumAvatarPipAsset extends PremiumVisualAsset {
  readonly accent: string;
  readonly glyph: string;
}

/**
 * All production asset paths live here so the shell, HUD, and compatibility
 * scene cannot drift into separate magic-string inventories.
 */
export const PREMIUM_ASSET_PATHS = {
  stage: {
    portrait: "/assets/stage/portrait-arena-deck-v1.webp",
    landscape: "/assets/stage/landscape-arena-deck-v1.webp"
  },
  avatars: {
    hudPips: [
      "/assets/avatars/hud-pips/p1-cyan-arrow.svg",
      "/assets/avatars/hud-pips/p2-magenta-heart.svg",
      "/assets/avatars/hud-pips/p3-amber-bolt.svg",
      "/assets/avatars/hud-pips/p4-lime-bars.svg",
      "/assets/avatars/hud-pips/p5-violet-wave.svg",
      "/assets/avatars/hud-pips/p6-orange-hazard.svg",
      "/assets/avatars/hud-pips/p7-emerald-gem.svg",
      "/assets/avatars/hud-pips/p8-cobalt-cross.svg"
    ],
    full: [
      "/assets/avatars/full/p1-cyan-full-v1.webp",
      "/assets/avatars/full/p2-magenta-full-v1.webp",
      "/assets/avatars/full/p3-amber-full-v1.webp",
      "/assets/avatars/full/p4-lime-full-v1.webp",
      "/assets/avatars/full/p5-violet-full-v1.webp",
      "/assets/avatars/full/p6-orange-full-v1.webp",
      "/assets/avatars/full/p7-emerald-full-v1.webp",
      "/assets/avatars/full/p8-cobalt-full-v1.webp"
    ]
  },
  common: {
    timerBezel: "/assets/common/hud/timer-bezel-v1.svg",
    connectionRadar: "/assets/common/icons/connection-radar-v1.svg",
    rotatePhoneIcon: "/assets/common/overlays/rotate-phone-icon-v1.svg",
    snipsReticle: "/assets/common/icons/snips-reticle-v1.svg"
  },
  games: {
    kontrolPaneliKaosu: {
      chassis: "/assets/games/kontrol-paneli-kaosu/kpk-console-chassis-v1.webp",
      sparks: "/assets/games/kontrol-paneli-kaosu/kpk-cut-sparks-atlas-v1.webp",
      wires: [
        "/assets/games/kontrol-paneli-kaosu/kpk-wire-blue-v1.webp",
        "/assets/games/kontrol-paneli-kaosu/kpk-wire-green-v1.webp",
        "/assets/games/kontrol-paneli-kaosu/kpk-wire-red-v1.webp",
        "/assets/games/kontrol-paneli-kaosu/kpk-wire-yellow-v1.webp"
      ]
    },
    cagrisimAgi: {
      reactor: "/assets/games/cagrisim-agi/cagrisim-reactor-core-v1.webp",
      pedestal: "/assets/games/cagrisim-agi/cagrisim-token-pedestal-v1.svg"
    }
  }
} as const;

/**
 * The visual core is intentionally CSS/SVG-first. The manifest is the seam for
 * future illustrated packs without making every game's asset eager.
 */
export const PREMIUM_VISUAL_ASSETS = {
  brand: [
    { id: "glix-wordmark", kind: "brand", loading: "eager" }
  ],
  sharedStage: [
    { id: "portrait-arena-deck", kind: "stage-pack", loading: "eager", src: PREMIUM_ASSET_PATHS.stage.portrait, maxTextureEdge: 2048 },
    { id: "landscape-arena-deck", kind: "stage-pack", loading: "eager", src: PREMIUM_ASSET_PATHS.stage.landscape, maxTextureEdge: 2048 }
  ],
  common: {
    timerBezel: { id: "timer-bezel", kind: "shared-ui", loading: "eager", src: PREMIUM_ASSET_PATHS.common.timerBezel, maxTextureEdge: 64 },
    connectionRadar: { id: "connection-radar", kind: "shared-ui", loading: "eager", src: PREMIUM_ASSET_PATHS.common.connectionRadar, maxTextureEdge: 32 },
    rotatePhoneIcon: { id: "rotate-phone-icon", kind: "shared-ui", loading: "eager", src: PREMIUM_ASSET_PATHS.common.rotatePhoneIcon, maxTextureEdge: 64 },
    snipsReticle: { id: "snips-reticle", kind: "shared-ui", loading: "lazy", src: PREMIUM_ASSET_PATHS.common.snipsReticle, maxTextureEdge: 64 }
  },
  avatarPips: [
    { id: "avatar-pip-1", kind: "avatar", loading: "eager", src: PREMIUM_ASSET_PATHS.avatars.hudPips[0], maxTextureEdge: 48, accent: "#72f4ff", glyph: "▲" },
    { id: "avatar-pip-2", kind: "avatar", loading: "eager", src: PREMIUM_ASSET_PATHS.avatars.hudPips[1], maxTextureEdge: 48, accent: "#ff55d8", glyph: "♥" },
    { id: "avatar-pip-3", kind: "avatar", loading: "eager", src: PREMIUM_ASSET_PATHS.avatars.hudPips[2], maxTextureEdge: 48, accent: "#ffc857", glyph: "⚡" },
    { id: "avatar-pip-4", kind: "avatar", loading: "eager", src: PREMIUM_ASSET_PATHS.avatars.hudPips[3], maxTextureEdge: 48, accent: "#a8f46a", glyph: "≡" },
    { id: "avatar-pip-5", kind: "avatar", loading: "eager", src: PREMIUM_ASSET_PATHS.avatars.hudPips[4], maxTextureEdge: 48, accent: "#9a7bff", glyph: "∿" },
    { id: "avatar-pip-6", kind: "avatar", loading: "eager", src: PREMIUM_ASSET_PATHS.avatars.hudPips[5], maxTextureEdge: 48, accent: "#ff8b5d", glyph: "⚠" },
    { id: "avatar-pip-7", kind: "avatar", loading: "eager", src: PREMIUM_ASSET_PATHS.avatars.hudPips[6], maxTextureEdge: 48, accent: "#00ff88", glyph: "◆" },
    { id: "avatar-pip-8", kind: "avatar", loading: "eager", src: PREMIUM_ASSET_PATHS.avatars.hudPips[7], maxTextureEdge: 48, accent: "#4f8cff", glyph: "✚" }
  ],
  games: {
    "kontrol-paneli-kaosu": [
      { id: "kpk-console-chassis", kind: "game-pack", loading: "lazy", src: PREMIUM_ASSET_PATHS.games.kontrolPaneliKaosu.chassis, maxTextureEdge: 1920 },
      { id: "kpk-cut-sparks", kind: "game-pack", loading: "lazy", src: PREMIUM_ASSET_PATHS.games.kontrolPaneliKaosu.sparks, maxTextureEdge: 512 },
      ...PREMIUM_ASSET_PATHS.games.kontrolPaneliKaosu.wires.map((src, index) => ({ id: `kpk-wire-${index + 1}`, kind: "game-pack" as const, loading: "lazy" as const, src, maxTextureEdge: 512 }))
    ],
    "cagrisim-agi": [
      { id: "cagrisim-reactor", kind: "game-pack", loading: "lazy", src: PREMIUM_ASSET_PATHS.games.cagrisimAgi.reactor, maxTextureEdge: 1024 },
      { id: "cagrisim-pedestal", kind: "game-pack", loading: "lazy", src: PREMIUM_ASSET_PATHS.games.cagrisimAgi.pedestal, maxTextureEdge: 256 }
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
    ...PREMIUM_VISUAL_ASSETS.sharedStage,
    PREMIUM_VISUAL_ASSETS.common.timerBezel,
    PREMIUM_VISUAL_ASSETS.common.connectionRadar,
    PREMIUM_VISUAL_ASSETS.common.rotatePhoneIcon,
    ...PREMIUM_VISUAL_ASSETS.avatarPips
  ] as readonly PremiumVisualAsset[];

  return Promise.all(assets.map(loadAsset));
}

export function preloadPremiumGamePack(gameId: string): Promise<readonly void[]> {
  const assets = (PREMIUM_VISUAL_ASSETS.games as Record<string, readonly PremiumVisualAsset[]>)[gameId] ?? [];
  return Promise.all(assets.map(loadAsset));
}
