'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'

import { LogoWithName } from 'src/components/logo'

import { HEADER } from 'src/layouts/config-layout'
import LanguagePopover from 'src/layouts/common/language-popover'
import SettingsModeButton from 'src/layouts/common/settings-mode-button'

// ----------------------------------------------------------------------

export default function DepositHeader() {
  return (
    <AppBar>
      <Toolbar disableGutters sx={{ height: { xs: HEADER.H_MOBILE, md: HEADER.H_DESKTOP } }}>
        <Box
          sx={{
            pl: 2,
            pr: 2,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <LogoWithName sx={{ height: { xs: 28, md: 40 } }} />

          <Stack spacing={1} direction='row'>
            <LanguagePopover />
            <SettingsModeButton />
          </Stack>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
