import { paths } from 'src/routes/paths'

import { getStorageItem, setStorageItem, removeStorageItem } from 'src/hooks/use-local-storage'

import { STORAGE_KEY_TOKEN } from 'src/config-global'
import axiosInstance from 'src/app/api/hooks/api-resolver'

// ----------------------------------------------------------------------

export function jwtDecode(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  )

  return JSON.parse(jsonPayload)
}

// ----------------------------------------------------------------------

export const isValidToken = (jwtToken: string) => {
  if (!jwtToken) {
    return false
  }

  try {
    const decoded: { exp?: number } = jwtDecode(jwtToken)
    if (!decoded.exp) {
      return false
    }

    const currentTime = Date.now() / 1000

    return decoded.exp > currentTime
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return false
  }
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
    setStorageItem(STORAGE_KEY_TOKEN, jwtToken, false)
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${jwtToken}`

    // This function below will handle when token is expired
    const { exp } = jwtDecode(jwtToken)
    tokenExpired(exp)
  } else {
    removeStorageItem(STORAGE_KEY_TOKEN)
    delete axiosInstance.defaults.headers.common.Authorization
  }
}

// ----------------------------------------------------------------------

export const getAuthorizationHeader = () => ({
  Authorization: `Bearer ${getStorageItem(STORAGE_KEY_TOKEN)}`
})
