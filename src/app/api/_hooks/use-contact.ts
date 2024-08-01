import { endpoints } from 'src/app/api/_hooks/api-resolver'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export function useGetContact(contactId: string) {
  return useGetCommon(endpoints.dashboard.user.id(contactId))
}
