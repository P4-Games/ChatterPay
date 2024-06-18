'use client'

import { useState, useCallback } from 'react'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Container from '@mui/material/Container'

import { paths } from 'src/routes/paths'

import Iconify from 'src/components/iconify'
import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import AccountGeneral from '../account-general'
import AccountNotifications from '../account-notifications'
import AccountChangePassword from '../account-change-password'

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon='solar:user-id-bold' width={24} />
  },

  {
    value: 'notifications',
    label: 'Notifications',
    icon: <Iconify icon='solar:bell-bing-bold' width={24} />
  },

  {
    value: 'security',
    label: 'Security',
    icon: <Iconify icon='ic:round-vpn-key' width={24} />
  }
]

// ----------------------------------------------------------------------

export default function AccountView() {
  const settings = useSettingsContext()

  const [currentTab, setCurrentTab] = useState('general')

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue)
  }, [])

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Account'
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: 'Account' }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'general' && <AccountGeneral />}

      {currentTab === 'notifications' && <AccountNotifications />}

      {currentTab === 'security' && <AccountChangePassword />}
    </Container>
  )
}
