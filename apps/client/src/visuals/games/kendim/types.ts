import type { MatchPlayerState } from "@glix/shared";
import { PREMIUM_ASSET_PATHS } from "../../visualAssetManifest";

export interface KendimPlayerMapping {
  readonly cardId: string;
  readonly targetPlayerId: string;
}

export function getPlayerAvatarUrl(index: number): string {
  const fullAvatars = PREMIUM_ASSET_PATHS.avatars.full;
  return fullAvatars[index % fullAvatars.length] ?? fullAvatars[0];
}

export function getPlayerPipUrl(index: number): string {
  const pips = PREMIUM_ASSET_PATHS.avatars.hudPips;
  return pips[index % pips.length] ?? pips[0];
}

export function findActivePlayer(
  players: readonly MatchPlayerState[],
  playerId: string | null | undefined
): MatchPlayerState | undefined {
  if (!playerId) return undefined;
  return players.find((player) => player.id === playerId);
}

export function isEligibleTarget(player: MatchPlayerState): boolean {
  return Boolean(player.connected && player.currentGameParticipant && !player.eliminated);
}
