import { post, endpoints } from 'src/app/api/hooks/api-resolver'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

type ReferralCodeWithUsageCountResponse = {
  referralCode: string
  referredUsersCount: number
}

type ReferralByCodeResponse = {
  referralByCode: string
}

type SubmitReferralByCodeResponse =
  | { ok: true; updated: boolean; message: string }
  | { ok: false; message: string }

// ----------------------------------------------------------------------

export function useReferralCodeWithUsageCount(userId?: string) {
  return useGetCommon(
    userId ? endpoints.dashboard.user.referral.codeWithUsageCount(userId) : null,
    userId ? { headers: getAuthorizationHeader() } : {}
  ) as {
    data?: ReferralCodeWithUsageCountResponse
    isLoading: boolean
    error: unknown
    isValidating: boolean
    empty: boolean
  }
}

export const referralCodeWithUsageCountSWRKey = (userId: string) =>
  [
    endpoints.dashboard.user.referral.codeWithUsageCount(userId),
    { headers: getAuthorizationHeader() }
  ] as const

export function useReferralByCode(userId?: string) {
  return useGetCommon(
    userId ? endpoints.dashboard.user.referral.byCode(userId) : null,
    userId ? { headers: getAuthorizationHeader() } : {}
  ) as {
    data?: ReferralByCodeResponse
    isLoading: boolean
    error: unknown
    isValidating: boolean
    empty: boolean
  }
}

export const referralByCodeSWRKey = (userId: string) =>
  [endpoints.dashboard.user.referral.byCode(userId), { headers: getAuthorizationHeader() }] as const

export async function submitReferralByCode(userId: string, referralByCode: string) {
  const res = (await post(
    endpoints.dashboard.user.referral.submitByCode(userId),
    { referralByCode },
    {
      headers: getAuthorizationHeader()
    }
  )) as SubmitReferralByCodeResponse

  return res
}
