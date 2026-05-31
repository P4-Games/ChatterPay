import type { ReactNode } from 'react'

import Box from '@mui/material/Box'

import BaseLayout from 'src/layouts/baseLayout'

import DepositHeader from './header'

// ----------------------------------------------------------------------

export default function DepositLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
        <DepositHeader />

        <Box
          component='main'
          sx={{
            flexGrow: 1,
            pt: { xs: 8, md: 10 }
          }}
        >
          {children}
        </Box>
      </Box>
    </BaseLayout>
  )
}
