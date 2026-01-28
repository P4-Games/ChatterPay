import Avvvatars from 'avvvatars-react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useAuthContext } from 'src/auth/hooks'

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  const { user } = useAuthContext()

  return (
    <Stack
      sx={{
        px: 2,
        py: 5,
        textAlign: 'center'
      }}
    >
      <Stack alignItems='center'>
        <Box sx={{ position: 'relative' }}>
          <Avvvatars
            value={user?.phoneNumber || user?.displayName || ''}
            displayValue={user?.displayName?.substring(0, 2).toUpperCase()}
            style='shape'
            size={48}
          />
        </Box>

        <Stack spacing={0.5} sx={{ mb: 2, mt: 1.5, width: 1 }}>
          <Typography variant='subtitle2' noWrap>
            {user?.displayName}
          </Typography>

          <Typography variant='body2' noWrap sx={{ color: 'text.disabled' }}>
            {user?.phoneNumber}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}
