'use client'

import { useState, useEffect, useCallback } from 'react'

import { useAuthContext } from 'src/auth/hooks'
import { polymarketAccountStatus } from 'src/app/api/hooks'

import type { IPolymarketAccountStatus } from 'src/types/polymarket'

// ----------------------------------------------------------------------

/**
 * Fetches the user's Polymarket account status and derives whether the
 * terms-acceptance overlay must be shown.
 * @returns {object} `accountStatus`, `statusLoading`, `showTermsOverlay` and a
 * `checkAccountStatus` refresher (call it after the user accepts the terms).
 */
export function usePolymarketAccountStatus() {
  const { user } = useAuthContext()

  const [accountStatus, setAccountStatus] = useState<IPolymarketAccountStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)

  const checkAccountStatus = useCallback(async () => {
    try {
      const result = await polymarketAccountStatus()
      if (result.ok && result.data) {
        setAccountStatus(result.data)
      }
    } catch {
      // Silently fail — don't block the page
    } finally {
      setStatusLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      checkAccountStatus()
    } else {
      setStatusLoading(false)
    }
  }, [user?.id, checkAccountStatus])

  const showTermsOverlay =
    !statusLoading && !!user?.id && !!accountStatus && !accountStatus.account?.terms_accepted

  return { accountStatus, statusLoading, showTermsOverlay, checkAccountStatus }
}
