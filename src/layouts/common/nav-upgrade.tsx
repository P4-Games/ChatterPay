import Avvvatars from 'avvvatars-react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useAuthContext } from 'src/auth/hooks'

// ----------------------------------------------------------------------

type Props = {
  collapsed?: boolean
}

export default function NavUpgrade({ collapsed }: Props) {
  const { user } = useAuthContext()

  return (
    <Stack
      direction='row'
      alignItems='center'
      spacing={1.5}
      sx={{
        px: '16px',
        py: 2.5,
        flexShrink: 0,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ flexShrink: 0, display: 'inline-flex' }}>
        <Avvvatars
          value={user?.phoneNumber || user?.displayName || ''}
          displayValue={user?.displayName?.substring(0, 2).toUpperCase()}
          style='shape'
          size={40}
        />
      </Box>

      <Box
        sx={{
          minWidth: 0,
          opacity: collapsed ? 0 : 1,
          transition: (theme) =>
            theme.transitions.create('opacity', {
              duration: collapsed ? 100 : 150,
              delay: collapsed ? 0 : 100
            })
        }}
      >
        <Typography variant='subtitle2' noWrap>
          {user?.displayName}
        </Typography>

        <Typography variant='body2' noWrap sx={{ color: 'text.disabled' }}>
          {user?.phoneNumber}
        </Typography>
      </Box>
    </Stack>
  )
}
