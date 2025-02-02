import { post, endpoints } from 'src/app/api/_hooks/api-resolver'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export function useGetContact(contactId: string) {
  return useGetCommon(endpoints.dashboard.user.id(contactId))
}

export async function updateContact(userId: string, data: { name: string }) {
  const res = await post(endpoints.dashboard.user.update(userId), data, {
    headers: getAuthorizationHeader()
  })
  return res
}
