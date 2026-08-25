'use client'

import { createContext } from 'react'

import type { JWTContextType } from '../../types'

// ----------------------------------------------------------------------

export const AuthContext = createContext({} as JWTContextType)
