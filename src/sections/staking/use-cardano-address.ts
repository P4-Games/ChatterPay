'use client'

import { useMemo } from 'react'

import { useAuthContext } from 'src/auth/hooks'
import { useGetWalletBalance } from 'src/app/api/hooks'

import type { AuthUserType } from 'src/auth/types'

// ----------------------------------------------------------------------

/**
 * The authenticated user's Cardano address.
 *
 * Read from the balances the backend returns for the session, the same place the dashboard finds it, so
 * neither staking page can be pointed at somebody else's address. A Cardano address is one with a
 * Cardano prefix; the backend derives it from the user's identity, so it exists before the user has
 * ever touched the chain.
 *
 * @returns The address, `undefined` while the balances load or when the user has none, and whether
 *   the balances are still loading, so a page can tell "not yet known" from "there is none".
 */
export function useCardanoAddress(): { address: string | undefined; loading: boolean } {
  const { user }: { user: AuthUserType } = useAuthContext()
  const { data: balances, isLoading } = useGetWalletBalance(user?.wallet) as {
    data?: { wallets?: string[] }
    isLoading: boolean
  }

  const address = useMemo<string | undefined>(
    () =>
      (balances?.wallets ?? []).find(
        (entry) => entry.startsWith('addr1') || entry.startsWith('addr_test1')
      ),
    [balances]
  )

  return { address, loading: isLoading }
}
