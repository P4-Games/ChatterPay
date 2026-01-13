import axios from 'axios'

import { UI_BASE_URL, BACKEND_API_URL, BACKEND_API_TOKEN } from 'src/config-global'

// ----------------------------------------------------------------------

type BackendResponseSuccess<TData extends object> = {
  status: 'success'
  data: TData
  timestamp: string
}

type BackendResponseError = {
  status: 'error'
  data: {
    code: number
    message: string
  }
  timestamp: string
}

type BackendResponse<TData extends object> = BackendResponseSuccess<TData> | BackendResponseError

export type ReferralCodeWithUsageCount = {
  referralCode: string
  referredUsersCount: number
}

export type ReferralByCode = {
  referralByCode: string
}

export type SubmitReferralByCodeResult =
  | { ok: true; updated: boolean; message: string }
  | { ok: false; message: string }

// ----------------------------------------------------------------------

export async function getReferralCodeWithUsageCount(
  phoneNumber: string
): Promise<ReferralCodeWithUsageCount | null> {
  const response = await axios.post<
    BackendResponse<{ referral_code: string; referred_users_count: number }>
  >(
    `${BACKEND_API_URL}/get_referral_code_with_usage_count/`,
    { channel_user_id: phoneNumber },
    {
      headers: {
        Origin: UI_BASE_URL,
        Authorization: `Bearer ${BACKEND_API_TOKEN}`
      }
    }
  )

  if (response.data.status !== 'success') return null

  return {
    referralCode: response.data.data.referral_code,
    referredUsersCount: response.data.data.referred_users_count
  }
}

export async function getReferralByCode(phoneNumber: string): Promise<ReferralByCode> {
  const response = await axios.post<BackendResponse<{ referral_by_code: string }>>(
    `${BACKEND_API_URL}/get_referral_by_code/`,
    { channel_user_id: phoneNumber },
    {
      headers: {
        Origin: UI_BASE_URL,
        Authorization: `Bearer ${BACKEND_API_TOKEN}`
      }
    }
  )

  if (response.data.status !== 'success') {
    return { referralByCode: '' }
  }

  return { referralByCode: response.data.data.referral_by_code }
}

export async function submitReferralByCode(
  phoneNumber: string,
  referralByCode: string
): Promise<SubmitReferralByCodeResult> {
  const response = await axios.post<BackendResponse<{ updated: boolean }>>(
    `${BACKEND_API_URL}/submit_referral_by_code/`,
    { channel_user_id: phoneNumber, referral_by_code: referralByCode },
    {
      headers: {
        Origin: UI_BASE_URL,
        Authorization: `Bearer ${BACKEND_API_TOKEN}`
      }
    }
  )

  if (response.data.status !== 'success') {
    return { ok: false, message: response.data.data.message }
  }

  return {
    ok: true,
    updated: response.data.data.updated,
    message: 'Referral_by_code stored successfully'
  }
}
