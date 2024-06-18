import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

import { useMockedUser } from 'src/hooks/use-mocked-user'

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  const { user } = useMockedUser()

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
          <Avatar src={user?.photoURL} alt={user?.displayName} sx={{ width: 48, height: 48 }}>
            {user?.displayName?.charAt(0).toUpperCase()}
          </Avatar>
        </Box>

        <Stack spacing={0.5} sx={{ mb: 2, mt: 1.5, width: 1 }}>
          <Typography variant='subtitle2' noWrap>
            {user?.displayName}
          </Typography>

          <Typography variant='body2' noWrap sx={{ color: 'text.disabled' }}>
            {user?.email}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}
