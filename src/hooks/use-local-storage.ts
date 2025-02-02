import NodeCache from 'node-cache'
import { useState, useEffect, useCallback } from 'react'

import { STORAGE_OPTION } from 'src/config-global'

// ----------------------------------------------------------------------

const memoryCache = new NodeCache()
type StorageType = Storage | NodeCache
type StorageOptionType = 'local' | 'session'
function localStorageAvailable(): boolean {
  try {
    const key = '__some_random_key_you_are_not_going_to_use__'
    window.localStorage.setItem(key, key)
    window.localStorage.removeItem(key)
    return true
  } catch (error) {
    return false
  }
}

function sessionStorageAvailable(): boolean {
  try {
    const key = '__some_random_key_you_are_not_going_to_use__'
    window.sessionStorage.setItem(key, key)
    window.sessionStorage.removeItem(key)
    return true
  } catch (error) {
    return false
  }
}

function getStorageObject(): StorageType {
  if ((STORAGE_OPTION as StorageOptionType) === 'local' && localStorageAvailable()) {
    return window.localStorage
  }
  if ((STORAGE_OPTION as StorageOptionType) === 'session' && sessionStorageAvailable()) {
    return window.sessionStorage
  }
  return memoryCache
}

// ----------------------------------------------------------------------
export function useLocalStorage<T>(
  key: string,
  initialState: T,
  defaultValue: T = {} as T,
  asJson: boolean = false
) {
  const [state, setState] = useState<T>(initialState)

  useEffect(() => {
    const restored = getStorageItem<T>(key, defaultValue, asJson)
    if (restored) {
      setState((prev) => ({ ...prev, ...restored }))
    }
  }, [asJson, defaultValue, key])

  const updateState = useCallback(
    (updateValue: Partial<T>) => {
      setState((prev) => {
        const newState = { ...prev, ...updateValue }
        setStorageItem(key, newState, asJson)
        return newState
      })
    },
    [key, asJson]
  )

  const update = useCallback(
    (name: keyof T, updateValue: any) => {
      updateState({ [name]: updateValue } as Partial<T>)
    },
    [updateState]
  )

  const reset = useCallback(() => {
    removeStorageItem(key)
    setState(initialState)
  }, [initialState, key])

  return { state, update, reset }
}

export const getStorageItem = <T>(
  key: string,
  defaultValue: T = {} as T,
  asJson: boolean = false
): T => {
  try {
    const storage = getStorageObject()
    const result = storage instanceof Storage ? storage.getItem(key) : storage.get(key)
    return asJson && result ? JSON.parse(result as string) : ((result || defaultValue) as T)
  } catch (error) {
    console.error(error.message)
    return defaultValue
  }
}

export const setStorageItem = <T>(key: string, value: T, asJson: boolean = false): void => {
  try {
    const storage = getStorageObject()
    const data = asJson ? JSON.stringify(value) : (value as unknown as string)

    if (storage instanceof Storage) {
      storage.setItem(key, data)
    } else {
      storage.set(key, data)
    }
  } catch (error) {
    console.warn('setStorageItem', key, error.message)
  }
}

export const removeStorageItem = (key: string): void => {
  try {
    const storage = getStorageObject()
    if (storage instanceof Storage) {
      storage.removeItem(key)
    } else {
      storage.del(key)
    }
  } catch (error) {
    console.error(error.message)
  }
}
