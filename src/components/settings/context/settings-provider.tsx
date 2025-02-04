'use client'

import isEqual from 'lodash/isEqual'
import { useMemo, useState, useEffect, useCallback } from 'react'

import { getStorageItem, useLocalStorage } from 'src/hooks/use-local-storage'

import { STORAGE_KEY_SETTINGS } from 'src/config-global'

import { SettingsValueProps } from '../types'
import { SettingsContext } from './settings-context'

// ----------------------------------------------------------------------

type SettingsProviderProps = {
  children: React.ReactNode
  defaultSettings: SettingsValueProps
}

export function SettingsProvider({ children, defaultSettings }: SettingsProviderProps) {
  const { state, update, reset } = useLocalStorage(
    STORAGE_KEY_SETTINGS,
    defaultSettings,
    defaultSettings,
    true
  )

  const [openDrawer, setOpenDrawer] = useState(false)

  const isArabic = getStorageItem('i18nextLng') === 'ar'

  useEffect(() => {
    if (isArabic) {
      onChangeDirectionByLang('ar')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArabic])

  // Direction by lang
  const onChangeDirectionByLang = useCallback(
    (lang: string) => {
      update('themeDirection', lang === 'ar' ? 'rtl' : 'ltr')
    },
    [update]
  )

  // Drawer
  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev)
  }, [])

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false)
  }, [])

  const canReset = !isEqual(state, defaultSettings)

  const memoizedValue = useMemo(
    () => ({
      ...state,
      onUpdate: update,
      // Direction
      onChangeDirectionByLang,
      // Reset
      canReset,
      onReset: reset,
      // Drawer
      open: openDrawer,
      onToggle: onToggleDrawer,
      onClose: onCloseDrawer
    }),
    [
      reset,
      update,
      state,
      canReset,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
      onChangeDirectionByLang
    ]
  )

  // @ts-expect-error 'expected-error'
  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>
}
