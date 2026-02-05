'use client'

import { useMemo, useEffect, useReducer, useCallback } from 'react'

import { post, fetcher, endpoints } from 'src/app/api/hooks/api-resolver'
import { useLocales } from 'src/locales'
import { setSession } from 'src/auth/context/jwt/utils'

import { AuthContext } from './auth-context'
import type { AuthUserType, ActionMapType, AuthStateType, AuthUserCodeType } from '../../types'

// ----------------------------------------------------------------------
enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  UPDATE_EMAIL = 'UPDATE_EMAIL',
  GENERATE_CODE_LOGIN = 'GENERATE_CODE_LOGIN',
  GENERATE_CODE_EMAIL = 'GENERATE_CODE_EMAIL',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
  UPDATE_USER = 'UPDATE_USER'
}

type Payload = {
  [Types.INITIAL]: { user: AuthUserType | null }
  [Types.LOGIN]: { user: AuthUserType }
  [Types.GENERATE_CODE_LOGIN]: { user: AuthUserCodeType | null }
  [Types.GENERATE_CODE_EMAIL]: { user: AuthUserCodeType | null }
  [Types.UPDATE_EMAIL]: { user: AuthUserCodeType }
  [Types.REGISTER]: { user: AuthUserType }
  [Types.LOGOUT]: undefined
  [Types.UPDATE_USER]: { user: AuthUserType }
}

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>]

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true
}

const reducer = (state: AuthStateType, action: ActionsType) => {
  switch (action.type) {
    case Types.INITIAL:
      return { loading: false, user: action.payload.user }
    case Types.LOGIN:
      return { ...state, user: action.payload.user }
    case Types.GENERATE_CODE_LOGIN:
      return { ...state, user: null }
    case Types.GENERATE_CODE_EMAIL:
      return { ...state, user: action.payload.user }
    case Types.UPDATE_EMAIL:
      return { ...state, user: action.payload.user }
    case Types.REGISTER:
      return { ...state, user: action.payload.user }
    case Types.LOGOUT:
      return { ...state, user: null }
    case Types.UPDATE_USER:
      return { ...state, user: action.payload.user }
    default:
      return state
  }
}

// ----------------------------------------------------------------------

type Props = { children: React.ReactNode }

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { currentLang } = useLocales()

  const initialize = useCallback(async () => {
    try {
      const res = await fetcher([endpoints.auth.me(), {}])
      dispatch({ type: Types.INITIAL, payload: { user: res?.user || null } })
    } catch (err: any) {
      const status = err?.response?.status
      const message = err?.message || ''

      if (status === 401 || message.includes('401')) {
        // expected: no session, user not logged in
        dispatch({ type: Types.INITIAL, payload: { user: null } })
      } else {
        console.warn('initialize error', err?.message ?? err)
        dispatch({ type: Types.INITIAL, payload: { user: null } })
      }
    }
  }, [])

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleUnauthorized = () => {
      setSession(null)
      dispatch({ type: Types.LOGOUT })
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const generate2faCodeLogin = useCallback(
    async (phone: string, codeMsg: string, recaptchaToken: string) => {
      await post(endpoints.auth.code(), {
        phone,
        codeMsg,
        recaptchaToken,
        preferred_language: normalizePreferredLanguage(currentLang?.value)
      })
      dispatch({ type: Types.GENERATE_CODE_LOGIN, payload: { user: null } })
    },
    [currentLang?.value]
  )

  const generate2faCodeEmail = useCallback(
    async (id: string, phone: string, codeMsg: string) => {
      await post(endpoints.dashboard.user.code(id), { phone, codeMsg })
      dispatch({ type: Types.GENERATE_CODE_EMAIL, payload: { user: state.user } })
    },
    [state]
  )

  const loginWithCode = useCallback(async (phone: string, code: string, recaptchaToken: string) => {
    const res = await post(endpoints.auth.login(), { phone, code, recaptchaToken })
    // backend sets cookie, response still returns user
    const { user } = res
    dispatch({ type: Types.LOGIN, payload: { user } })
  }, [])

  const updateEmail = useCallback(
    async (phone: string, code: string, email: string, id: string) => {
      const res = await post(endpoints.dashboard.user.updateEmail(id), { phone, code, email })
      const baseUser = state.user ?? {}
      const updatedUser = res?.user ? res.user : { ...baseUser, email }
      dispatch({ type: Types.UPDATE_EMAIL, payload: { user: updatedUser } })
    },
    [state]
  )

  const register = useCallback(async () => {
    // implement properly when registration endpoint is ready
    const user = { id: 'dummy' } as AuthUserType
    dispatch({ type: Types.REGISTER, payload: { user } })
  }, [])

  const logout = useCallback(async (id: string) => {
    try {
      await post(endpoints.dashboard.user.logout(id), {})
    } catch (error) {
      console.error('logout error:', (error as any)?.message)
    } finally {
      dispatch({ type: Types.LOGOUT })
    }
  }, [])

  const updateUser = useCallback((user: AuthUserType) => {
    dispatch({ type: Types.UPDATE_USER, payload: { user } })
  }, [])

  // ----------------------------------------------------------------------

  const checkAuthenticated =
    state.user?.id && state.user.id.trim() !== '' ? 'authenticated' : 'unauthenticated'

  const status = state.loading ? 'loading' : checkAuthenticated

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      loginWithCode,
      generate2faCodeLogin,
      generate2faCodeEmail,
      updateEmail,
      register,
      logout,
      updateUser
    }),
    [
      loginWithCode,
      generate2faCodeLogin,
      generate2faCodeEmail,
      updateEmail,
      register,
      logout,
      updateUser,
      state.user,
      status
    ]
  )

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>
}

function normalizePreferredLanguage(langValue?: string): 'es' | 'pt' | 'en' {
  const normalized = (langValue || '').trim().toLowerCase()

  if (normalized.startsWith('es')) return 'es'
  if (normalized.startsWith('pt') || normalized.startsWith('br')) return 'pt'
  if (normalized.startsWith('en')) return 'en'

  return 'en'
}
