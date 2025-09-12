import { paths } from 'src/routes/paths'

import { getStorageItem, setStorageItem, removeStorageItem } from 'src/hooks/use-local-storage'

import { STORAGE_KEY_TOKEN } from 'src/config-global'
import axiosInstance from 'src/app/api/hooks/api-resolver'

// ----------------------------------------------------------------------

export function jwtDecode(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

    const jsonPayload =
      typeof window === 'undefined'
        ? Buffer.from(base64, 'base64').toString('utf-8')
        : decodeURIComponent(
            window
              .atob(base64)
              .split('')
              .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
              .join('')
          )

    return JSON.parse(jsonPayload)
  } catch {
    return {}
  }
}

// ----------------------------------------------------------------------

export const isValidToken = (jwtToken: string) => {
  if (typeof jwtToken !== 'string' || !jwtToken.trim()) return false
  const decoded: { exp?: number } = jwtDecode(jwtToken)
  if (!decoded.exp) return false
  const now = Math.floor(Date.now() / 1000)
  const SKEW = 60 // tolerance
  return decoded.exp > now + SKEW
}

// ----------------------------------------------------------------------

const handleTokenExpiration = () => {
  alert('Token expired')
  removeStorageItem(STORAGE_KEY_TOKEN)
  delete axiosInstance.defaults.headers.common.Authorization
  window.location.href = paths.auth.jwt.login
}

export const tokenExpired = (exp: number) => {
  const timeLeft = exp * 1000 - Date.now()
  if (timeLeft <= 0) {
    handleTokenExpiration()
    return
  }
  setTimeout(handleTokenExpiration, timeLeft)
}

// ----------------------------------------------------------------------

export const setSession = (jwtToken: string | null) => {
  if (jwtToken) {
    setStorageItem(STORAGE_KEY_TOKEN, jwtToken)
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${jwtToken}`
  } else {
    removeStorageItem(STORAGE_KEY_TOKEN)
    delete axiosInstance.defaults.headers.common.Authorization
  }
}

// ----------------------------------------------------------------------

export const getAuthorizationHeader = () => ({
  Authorization: `Bearer ${getStorageItem(STORAGE_KEY_TOKEN)}`
})
