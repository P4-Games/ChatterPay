'use client'

import { useMemo, useEffect, useReducer, useCallback } from 'react'

import { getStorageItem } from 'src/hooks/use-local-storage'

import { STORAGE_KEY_TOKEN } from 'src/config-global'
import { post, fetcher, endpoints } from 'src/app/api/hooks/api-resolver'

import { JwtPayload, jwtPayloadUser } from 'src/types/jwt'

import { AuthContext } from './auth-context'
import { jwtDecode, setSession, isValidToken, getAuthorizationHeader } from './utils'
import { AuthUserType, ActionMapType, AuthStateType, AuthUserCodeType } from '../../types'

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
  [Types.INITIAL]: {
    user: AuthUserType
  }
  [Types.LOGIN]: {
    user: AuthUserType
  }
  [Types.GENERATE_CODE_LOGIN]: {
    user: AuthUserCodeType
  }
  [Types.GENERATE_CODE_EMAIL]: {
    user: AuthUserCodeType
  }
  [Types.UPDATE_EMAIL]: {
    user: AuthUserCodeType
  }
  [Types.REGISTER]: {
    user: AuthUserType
  }
  [Types.LOGOUT]: undefined
  [Types.UPDATE_USER]: {
    user: AuthUserType
  }
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
      return {
        loading: false,
        user: action.payload.user
      }
    case Types.LOGIN:
      return {
        ...state,
        user: action.payload.user
      }
    case Types.GENERATE_CODE_LOGIN:
      return {
        ...state,
        user: null
      }
    case Types.GENERATE_CODE_EMAIL:
      return {
        ...state,
        user: action.payload.user
      }
    case Types.UPDATE_EMAIL:
      return {
        ...state,
        user: action.payload.user
      }
    case Types.REGISTER:
      return {
        ...state,
        user: action.payload.user
      }
    case Types.LOGOUT:
      return {
        ...state,
        user: null
      }
    case Types.UPDATE_USER:
      return {
        ...state,
        user: action.payload.user
      }
    default:
      return state
  }
}

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const initialize = useCallback(async () => {
    try {
      const jwtToken: string = getStorageItem(STORAGE_KEY_TOKEN)

      if (jwtToken && isValidToken(jwtToken)) {
        setSession(jwtToken)
        const decodedToken: JwtPayload = jwtDecode(jwtToken)
        const tokenUser: jwtPayloadUser = decodedToken.user

        const res = await fetcher([
          endpoints.dashboard.user.id(tokenUser.id),
          { headers: getAuthorizationHeader() }
        ])
        const user = res

        dispatch({
          type: Types.INITIAL,
          payload: {
            user: {
              ...user,
              jwtToken
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
      console.error(error && error.message ? error.message : error)
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

  const generate2faCodeLogin = useCallback(
    async (phone: string, codeMsg: string, recaptchaToken: string) => {
      const data = {
        phone,
        codeMsg,
        recaptchaToken
      }
      await post(endpoints.auth.code(), data, { headers: getAuthorizationHeader() })

      dispatch({
        type: Types.GENERATE_CODE_LOGIN,
        payload: {
          user: null
        }
      })
    },
    []
  )

  const generate2faCodeEmail = useCallback(
    async (id: string, phone: string, codeMsg: string) => {
      const data = {
        phone,
        codeMsg
      }

      await post(endpoints.dashboard.user.code(id), data, { headers: getAuthorizationHeader() })
      dispatch({
        type: Types.GENERATE_CODE_EMAIL,
        payload: {
          user: state.user
        }
      })
    },
    [state]
  )

  const loginWithCode = useCallback(async (phone: string, code: string, recaptchaToken: string) => {
    const data = {
      phone,
      code,
      recaptchaToken
    }
    const res = await post(endpoints.auth.login(), data)

    const { user, jwtToken } = res
    setSession(jwtToken)

    dispatch({
      type: Types.LOGIN,
      payload: {
        user: {
          ...user,
          jwtToken
        }
      }
    })
  }, [])

  const updateEmail = useCallback(
    async (phone: string, code: string, email: string, id: string) => {
      const data = {
        phone,
        code,
        email
      }
      await post(endpoints.dashboard.user.updateEmail(id), data, {
        headers: getAuthorizationHeader()
      })

      const updatedUser = { ...state.user, email }
      dispatch({
        type: Types.UPDATE_EMAIL,
        payload: {
          user: updatedUser
        }
      })
    },
    [state]
  )

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

      // const { jwtToken, user } = res.data

      const jwtToken = 'dummyToken'

      setSession(jwtToken)
      // setStorageItem(STORAGE_KEY_TOKEN, jwtToken)

      dispatch({
        type: Types.REGISTER,
        payload: {
          user: {
            undefined, // ...user,
            jwtToken
          }
        }
      })
    },
    []
  )

  const logout = useCallback(async (id: string) => {
    try {
      await post(endpoints.dashboard.user.logout(id), {}, { headers: getAuthorizationHeader() })
    } catch (error) {
      // avoid throw error in logout
      console.error('logout', error.message)
    }
    setSession(null)
    dispatch({
      type: Types.LOGOUT
    })
  }, [])

  const updateUser = useCallback((user: AuthUserType) => {
    dispatch({
      type: Types.UPDATE_USER,
      payload: {
        user
      }
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
