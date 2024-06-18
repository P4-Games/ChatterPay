import { paths } from 'src/routes/paths'

// ----------------------------------------------------------------------

// environment: server-side
export const { APP_ENV } = process.env || 'development'
export const { NODE_ENV } = process.env || 'development'
export const { MONGODB } = process.env
export const { BOT_API_TOKEN } = process.env

// environment: client-side
export const UI_API_URL = process.env.NEXT_PUBLIC_UI_URL
export const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL
export const USE_MOCK = (process.env.NEXT_PUBLIC_USE_MOCK || 'true') === 'true'
export const ALLOWED_ORIGINS = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || '*'

// internal
export const PATH_AFTER_LOGIN = paths.dashboard.root
