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
    case Types.UPDATE_USER: // <-- Manejar la acción UPDATE_USER
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

  const login = useCallback(async (email: string, password: string) => {
    const data = {
      email,
      password
    }

    const res = await axios.post(endpoints.auth.login(), data)

    const { user } = res.data
    const { accessToken } = res.data

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

  const generate2faCodeLogin = useCallback(
    async (phone: string, codeMsg: string, recaptchaToken: string) => {
      const data = {
        phone,
        codeMsg,
        recaptchaToken
      }
      await post(endpoints.auth.code(), data)
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
      await post(endpoints.dashboard.user.code(id), data)
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

  const updateEmail = useCallback(
    async (phone: string, code: string, email: string, id: string) => {
      const data = {
        phone,
        code,
        email
      }
      await post(endpoints.dashboard.user.updateEmail(id), data)

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

  // update_user
  const updateUser = useCallback((user: AuthUserType) => {
    dispatch({
      type: Types.UPDATE_USER,
      payload: {
        user: updateUser
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
      //
      login,
      loginWithCode,
      generate2faCodeLogin,
      generate2faCodeEmail,
      updateEmail,
      register,
      logout,
      updateUser
    }),
    [
      login,
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
