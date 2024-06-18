'use client'

import Container from '@mui/material/Container'

import { paths } from 'src/routes/paths'

import { _userList } from 'src/app/api/_data/_mock'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import UserNewEditForm from '../user-new-edit-form'

// ----------------------------------------------------------------------

type Props = {
  id: string
}

export default function UserEditView({ id }: Props) {
  const settings = useSettingsContext()

  const currentUser = _userList.find((user) => user.id === id)

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Edit'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root
          },
          {
            name: 'User',
            href: paths.dashboard.user.root
          },
          { name: currentUser?.name }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <UserNewEditForm currentUser={currentUser} />
    </Container>
  )
}
