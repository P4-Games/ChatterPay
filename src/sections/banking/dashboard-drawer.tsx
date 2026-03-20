'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import Iconify from 'src/components/iconify'
import Scrollbar from 'src/components/scrollbar'

// ----------------------------------------------------------------------

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: number | string
}

export default function DashboardDrawer({ open, onClose, title, children, width = 420 }: Props) {
  const theme = useTheme()

  return (
    <>
      {/* Backdrop with blur */}
      {open && (
        <Box
          onClick={onClose}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: theme.zIndex.drawer,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            backgroundColor: alpha(theme.palette.grey[900], 0.4),
          }}
        />
      )}

      <Drawer
        anchor='right'
        open={open}
        onClose={onClose}
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: width },
            boxShadow: `-40px 40px 80px -8px ${alpha(theme.palette.common.black, 0.24)}`,
          },
        }}
      >
        {/* Header */}
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          sx={{ px: 3, py: 2.5 }}
        >
          <Typography variant='h6' fontWeight={700}>
            {title}
          </Typography>
          <IconButton onClick={onClose} size='small'>
            <Iconify icon='mingcute:close-line' width={20} />
          </IconButton>
        </Stack>

        {/* Content */}
        <Scrollbar sx={{ flex: 1 }}>
          <Stack sx={{ px: 3, pb: 3 }}>
            {children}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  )
}
