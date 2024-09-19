'use client'

import axios from 'axios'
import { useMemo, useEffect, useReducer, useCallback } from 'react'

import { STORAGE_KEY_TOKEN } from 'src/config-global'
import { post, fetcher, endpoints } from 'src/app/api/_hooks/api-resolver'

import { AuthContext } from './auth-context'
import { jwtDecode, setSession, isValidToken } from './utils'
import { AuthUserType, ActionMapType, AuthStateType, AuthUserCodeType } from '../../types'

// ----------------------------------------------------------------------
enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  GENERATE_CODE = 'GENERATE_CODE',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT'
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType
  }
  [Types.LOGIN]: {
    user: AuthUserType
  }
  [Types.GENERATE_CODE]: {
    user: AuthUserCodeType
  }
  [Types.REGISTER]: {
    user: AuthUserType
  }
  [Types.LOGOUT]: undefined
}

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>]

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true
}

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      loading: false,
      user: action.payload.user
    }
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      user: action.payload.user
    }
  }

  if (action.type === Types.GENERATE_CODE) {
    return {
      ...state,
      user: null
    }
  }

  if (action.type === Types.REGISTER) {
    return {
      ...state,
      user: action.payload.user
    }
  }

  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null
    }
  }
  return state
}

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const initialize = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY_TOKEN)

      if (accessToken && isValidToken(accessToken)) {
        const decodedToken = jwtDecode(accessToken)
        const res = await fetcher(endpoints.dashboard.user.id(decodedToken.user.phone_number))
        const user = res

        dispatch({
          type: Types.INITIAL,
          payload: {
            user: {
              ...user,
              accessToken
            }
          }
        })
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            user: null
          }
        })
      }
    } catch (error) {
      console.error(error)
      dispatch({
        type: Types.INITIAL,
        payload: {
          user: null
        }
      })
    }
  }, [])

  useEffect(() => {
    initialize()
  }, [initialize])

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    const data = {
      email,
      password
    }

    const res = await axios.post(endpoints.auth.login(), data)

    const user = res.data

    const accessToken = 'dummyToken'

    setSession(accessToken)

    dispatch({
      type: Types.LOGIN,
      payload: {
        user: {
          ...user,
          accessToken
        }
      }
    })
  }, [])

  // Generate whatsapp Code
  const generateCode = useCallback(
    async (phone: string, codeMsg: string, recaptchaToken: string) => {
      const data = {
        phone,
        codeMsg,
        recaptchaToken
      }
      await post(endpoints.auth.code(), data)
      dispatch({
        type: Types.GENERATE_CODE,
        payload: {
          user: null
        }
      })
    },
    []
  )

  // LOGIN With Code
  const loginWithCode = useCallback(async (phone: string, code: string, recaptchaToken: string) => {
    const data = {
      phone,
      code,
      recaptchaToken
    }
    const res = await post(endpoints.auth.login(), data)

    const { user, accessToken } = res
    setSession(accessToken)

    dispatch({
      type: Types.LOGIN,
      payload: {
        user: {
          ...user,
          accessToken
        }
      }
    })
  }, [])

  // REGISTER

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      /*
      const data = {
        email,
        password,
        firstName,
        lastName
      }
      */

      // const res = await axios.post(endpoints.auth.register, data)

      // const { accessToken, user } = res.data

      const accessToken = 'dummyToken'

      sessionStorage.setItem(STORAGE_KEY_TOKEN, accessToken)

      dispatch({
        type: Types.REGISTER,
        payload: {
          user: {
            undefined, // ...user,
            accessToken
          }
        }
      })
    },
    []
  )

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null)
    dispatch({
      type: Types.LOGOUT
    })
  }, [])

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated'

  const status = state.loading ? 'loading' : checkAuthenticated

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      loginWithCode,
      generateCode,
      register,
      logout
    }),
    [generateCode, login, loginWithCode, logout, register, state.user, status]
  )

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>
}
