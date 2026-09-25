import type { StakingActionName } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

/**
 * The icon that stands for each operation.
 *
 * Stated once because two screens draw the same operations: the action buttons offer them, and the
 * history lists what was done. An icon that means "start staking" on one and something else on the
 * other is a worse cue than no icon at all.
 */
export const STAKING_ACTION_ICONS: Record<StakingActionName, string> = {
  register_and_delegate: 'solar:play-circle-bold',
  delegate_vote: 'solar:hand-stars-bold',
  redelegate_pool: 'solar:refresh-circle-bold',
  withdraw_rewards: 'solar:hand-money-bold',
  deregister: 'solar:stop-circle-bold',
  exit_and_send_max: 'solar:square-arrow-right-up-bold'
}

/** Anything the backend records that this release has no icon for. */
const FALLBACK_ICON = 'solar:history-bold'

/**
 * The icon for a recorded operation.
 *
 * The history shows whatever the backend stored, including kinds added after this build, so the
 * lookup takes a string and always answers with something drawable.
 *
 * @param kind - The operation as the backend named it.
 * @returns The iconify name to draw.
 */
export function stakingOperationIcon(kind: string): string {
  return STAKING_ACTION_ICONS[kind as StakingActionName] ?? FALLBACK_ICON
}
