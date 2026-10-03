'use client'

import { useState, useEffect, useCallback } from 'react'

import { getStorageItem, setStorageItem } from 'src/hooks/use-local-storage'

// ----------------------------------------------------------------------

export type StakingMode = 'simple' | 'advanced'

const STORAGE_KEY = 'staking-mode'

const isMode = (value: unknown): value is StakingMode => value === 'simple' || value === 'advanced'

/**
 * The layout the user picked for the staking section.
 *
 * Staking and governance are separate routes, so component state would reset to the summary every time
 * the user switches tab. The choice is kept in storage instead, and restored after mount rather than
 * read during render so the server-rendered markup and the first client render agree.
 *
 * @returns The current mode and a setter that also stores it.
 */
export function useStakingMode(): [StakingMode, (mode: StakingMode) => void] {
  const [mode, setMode] = useState<StakingMode>('simple')

  useEffect(() => {
    const stored = getStorageItem<string | null>(STORAGE_KEY, null)
    if (isMode(stored)) setMode(stored)
  }, [])

  const change = useCallback((next: StakingMode) => {
    setMode(next)
    setStorageItem(STORAGE_KEY, next)
  }, [])

  return [mode, change]
}
