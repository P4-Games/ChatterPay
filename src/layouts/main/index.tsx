'use client'

import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'

import { usePathname } from 'src/routes/hooks'

import i18n from 'src/locales/i18n'

import Footer from './footer'
import Header from './header'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  const pathname = usePathname()
  const homePage = pathname === '/'
  const [ready, setReady] = useState(i18n.isInitialized)

  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.on('initialized', () => setReady(true))
    }
  }, [])

  if (!ready) return null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Header />

      <Box
        component='main'
        sx={{
          flexGrow: 1,
          ...(!homePage && {
            pt: { xs: 8, md: 10 }
          })
        }}
      >
        {children}
      </Box>

      <Footer simple={false} />
    </Box>
  )
}
