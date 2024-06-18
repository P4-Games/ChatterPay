'use client'

import { useState, useCallback } from 'react'

import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import Container from '@mui/material/Container'
import Tabs, { tabsClasses } from '@mui/material/Tabs'

import { paths } from 'src/routes/paths'

import { useMockedUser } from 'src/hooks/use-mocked-user'

import {
  _userAbout,
  _userFeeds,
  _userFriends,
  _userGallery,
  _userFollowers
} from 'src/app/api/_data/_mock'

import Iconify from 'src/components/iconify'
import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import ProfileHome from '../profile-home'
import ProfileCover from '../profile-cover'
import ProfileFriends from '../profile-friends'
import ProfileGallery from '../profile-gallery'
import ProfileFollowers from '../profile-followers'

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'profile',
    label: 'Profile',
    icon: <Iconify icon='solar:user-id-bold' width={24} />
  },
  {
    value: 'followers',
    label: 'Followers',
    icon: <Iconify icon='solar:heart-bold' width={24} />
  },
  {
    value: 'friends',
    label: 'Friends',
    icon: <Iconify icon='solar:users-group-rounded-bold' width={24} />
  },
  {
    value: 'gallery',
    label: 'Gallery',
    icon: <Iconify icon='solar:gallery-wide-bold' width={24} />
  }
]

// ----------------------------------------------------------------------

export default function UserProfileView() {
  const settings = useSettingsContext()

  const { user } = useMockedUser()

  const [searchFriends, setSearchFriends] = useState('')

  const [currentTab, setCurrentTab] = useState('profile')

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue)
  }, [])

  const handleSearchFriends = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFriends(event.target.value)
  }, [])

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Profile'
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: user?.displayName }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <Card
        sx={{
          mb: 3,
          height: 290
        }}
      >
        <ProfileCover
          role={_userAbout.role}
          name={user?.displayName}
          avatarUrl={user?.photoURL}
          coverUrl={_userAbout.coverUrl}
        />

        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            position: 'absolute',
            bgcolor: 'background.paper',
            [`& .${tabsClasses.flexContainer}`]: {
              pr: { md: 3 },
              justifyContent: {
                sm: 'center',
                md: 'flex-end'
              }
            }
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Card>

      {currentTab === 'profile' && <ProfileHome info={_userAbout} posts={_userFeeds} />}

      {currentTab === 'followers' && <ProfileFollowers followers={_userFollowers} />}

      {currentTab === 'friends' && (
        <ProfileFriends
          friends={_userFriends}
          searchFriends={searchFriends}
          onSearchFriends={handleSearchFriends}
        />
      )}

      {currentTab === 'gallery' && <ProfileGallery gallery={_userGallery} />}
    </Container>
  )
}
