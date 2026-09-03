'use client'

import Box from '@mui/material/Box'

import { usePathname } from 'src/routes/hooks'

import { useHasActiveNews, NEWS_BANNER_HEIGHT_COMPACT } from 'src/components/news-banner'

import Footer from './footer'
import Header from './header'
import BaseLayout from '../baseLayout'
import { HEADER } from '../config-layout'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  const pathname = usePathname()
  const fullBleedHero = pathname === '/' || pathname.startsWith('/products/b2b')

  // The banner rides inside the fixed header, so pages that start below the header have to account
  // for it too. Full-bleed heroes are meant to run under the header, banner included.
  const hasNews = useHasActiveNews('landing')
  const newsOffset = hasNews ? NEWS_BANNER_HEIGHT_COMPACT : 0

  return (
    <BaseLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
        <Header />

        <Box
          component='main'
          sx={{
            flexGrow: 1,
            ...(!fullBleedHero && {
              pt: {
                xs: `${HEADER.H_MOBILE + newsOffset}px`,
                md: `${HEADER.H_DESKTOP + newsOffset}px`
              }
            })
          }}
        >
          {children}
        </Box>

        <Footer simple={false} />
      </Box>
    </BaseLayout>
  )
}
