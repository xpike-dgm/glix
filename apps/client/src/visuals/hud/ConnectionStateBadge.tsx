import type { JSX } from "react";
import type { VisualConnectionState } from "../types";
import { PREMIUM_VISUAL_ASSETS } from "../visualAssetManifest";

interface ConnectionStateBadgeProps {
  readonly connection: VisualConnectionState;
  readonly compact?: boolean;
}

const LABELS: Record<VisualConnectionState, string> = {
  connected: "BAĞLI",
  connecting: "BAĞLANIYOR",
  offline: "KOPTU"
};

export function ConnectionStateBadge({ connection, compact = false }: ConnectionStateBadgeProps): JSX.Element {
  return (
    <span className={`glix-connection-badge is-${connection} ${compact ? "is-compact" : ""}`} role="status">
      <span className="glix-connection-beacon" aria-hidden="true">
        <img className="glix-connection-radar" src={PREMIUM_VISUAL_ASSETS.common.connectionRadar.src} alt="" decoding="async" loading="eager" />
        <i />
      </span>
      <span>{LABELS[connection]}</span>
    </span>
  );
}
