import Button from '@mui/material/Button'
import { Theme, SxProps } from '@mui/material/styles'

import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'

import { useTranslate } from 'src/locales'
import { PATH_AFTER_LOGIN } from 'src/config-global'

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>
}

export default function LoginButton({ sx }: Props) {
  const { t } = useTranslate()

  return (
    <>
      <Button
        component={RouterLink}
        href={paths.auth.jwt.register}
        variant='contained'
        sx={{ mr: 1, ...sx }}
      >
        {t('home.header.sign-up')}
      </Button>
      <Button component={RouterLink} href={PATH_AFTER_LOGIN} variant='soft' sx={{ mr: 1, ...sx }}>
        {t('home.header.sign-in')}
      </Button>
    </>
  )
}
