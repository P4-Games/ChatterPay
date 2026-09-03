import Box from '@mui/material/Box'

import { useBoolean } from 'src/hooks/use-boolean'
import { useResponsive } from 'src/hooks/use-responsive'

import { NewsBanner } from 'src/components/news-banner'
import { useSettingsContext } from 'src/components/settings'

import Main from './main'
import Header from './header'
import BaseLayout from '../baseLayout'
import NavVertical from './nav-vertical'
import NavHorizontal from './nav-horizontal'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const settings = useSettingsContext()

  const lgUp = useResponsive('up', 'lg')

  const nav = useBoolean()

  const isHorizontal = settings.themeLayout === 'horizontal'

  const renderHorizontal = <NavHorizontal />

  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />

  // Mounted with the layout rather than with the page, so closing it survives navigation inside the
  // dashboard while a fresh entry brings it back.
  const renderNews = (
    <Box sx={{ mb: 3 }}>
      <NewsBanner target='dashboard' dismissible />
    </Box>
  )

  if (isHorizontal) {
    return (
      <BaseLayout>
        <Header onOpenNav={nav.onTrue} />

        {lgUp ? renderHorizontal : renderNavVertical}

        <Main>
          {renderNews}
          {children}
        </Main>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <Header onOpenNav={nav.onTrue} />

      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' }
        }}
      >
        {renderNavVertical}

        <Main>
          {renderNews}
          {children}
        </Main>
      </Box>
    </BaseLayout>
  )
}
