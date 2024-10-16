import { post, endpoints } from 'src/app/api/_hooks/api-resolver'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export function useGetContact(contactId: string) {
  return useGetCommon(endpoints.dashboard.user.id(contactId))
}

export async function updateContact(userId: string, data: { name: string }) {
  const res = await post(endpoints.dashboard.user.update(userId), data, {})
  return res
}
