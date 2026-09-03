import type { PanelColor } from "@glix/shared";
import { PREMIUM_ASSET_PATHS } from "../../visualAssetManifest";

export interface WireDefinition {
  readonly color: PanelColor;
  readonly label: string;
  readonly slotIndex: number;
  readonly assetSrc: string;
  readonly accentColor: string;
  readonly glowColor: string;
}

export const KPK_WIRE_CONFIG: Record<PanelColor, {
  readonly label: string;
  readonly assetIndex: number;
  readonly accentColor: string;
  readonly glowColor: string;
}> = {
  mavi: {
    label: "MAVİ",
    assetIndex: 0,
    accentColor: "#00f5ff",
    glowColor: "rgba(0, 245, 255, 0.45)"
  },
  yeşil: {
    label: "YEŞİL",
    assetIndex: 1,
    accentColor: "#00ff88",
    glowColor: "rgba(0, 255, 136, 0.45)"
  },
  kırmızı: {
    label: "KIRMIZI",
    assetIndex: 2,
    accentColor: "#ff0055",
    glowColor: "rgba(255, 0, 85, 0.45)"
  },
  sarı: {
    label: "SARI",
    assetIndex: 3,
    accentColor: "#ffd700",
    glowColor: "rgba(255, 215, 0, 0.45)"
  }
};

export const KPK_SLOT_GEOMETRY = [
  { left: "26.67%", width: "9.17%" },
  { left: "39.06%", width: "9.17%" },
  { left: "51.77%", width: "9.17%" },
  { left: "64.17%", width: "9.17%" }
] as const;

export const KPK_CORRIDOR_VERTICAL = {
  top: "19.44%",
  height: "63.33%"
} as const;

export const DEFAULT_SPECTATOR_COLORS: readonly PanelColor[] = [
  "mavi",
  "yeşil",
  "kırmızı",
  "sarı"
];

export function getWireAsset(color: PanelColor): string {
  const index = KPK_WIRE_CONFIG[color]?.assetIndex ?? 0;
  return PREMIUM_ASSET_PATHS.games.kontrolPaneliKaosu.wires[index] ?? PREMIUM_ASSET_PATHS.games.kontrolPaneliKaosu.wires[0];
}
