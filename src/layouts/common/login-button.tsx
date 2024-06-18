import Button from '@mui/material/Button'
import { Theme, SxProps } from '@mui/material/styles'

import { RouterLink } from 'src/routes/components'

import { PATH_AFTER_LOGIN } from 'src/config-global'

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>
}

export default function LoginButton({ sx }: Props) {
  return (
    <Button component={RouterLink} href={PATH_AFTER_LOGIN} variant='outlined' sx={{ mr: 1, ...sx }}>
      My Wallet
    </Button>
  )
}
