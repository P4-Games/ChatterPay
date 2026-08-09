export type IncludeKind = 'games' | 'operations' | 'social' | 'prizes'

export type GameType = 'WORDLE' | 'HANGMAN' | string
export type SocialPlatform = 'X' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | string

export interface UserHistoryFilters {
  include?: IncludeKind[]
  from?: string | Date
  to?: string | Date
  gameTypes?: GameType[]
  gameIds?: string[]
  platforms?: SocialPlatform[]
}

export interface UserGamePlay {
  cycleId: string
  periodId: string
  gameId: string
  gameType: GameType
  at: string // ISO
  guess?: string
  result?: string
  points: number
  won: boolean
}

export interface UserOperationEntry {
  cycleId: string
  type: string
  amount: number
  userLevel?: string
  points: number
  at: string // ISO
}

export interface UserSocialAction {
  cycleId: string
  platform: SocialPlatform
  action: string
  points: number
  at: string // ISO
}

export interface UserPrize {
  cycleId: string
  rank: number // 1..3
  prize: number
  totalPoints: number
  endAt: string // ISO
}

export interface ChatterpointsHistoryResult {
  status?: 'ok' | 'error'
  include: IncludeKind[]
  window: { from: string; to: string }
  games?: UserGamePlay[]
  operations?: UserOperationEntry[]
  social?: UserSocialAction[]
  prizes?: UserPrize[]
  totals: {
    games: number
    operations: number
    social: number
    grandTotal: number
  }
}
