import Button from '@mui/material/Button'
import { Theme, SxProps } from '@mui/material/styles'

import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'

import { useTranslate } from 'src/locales'
import { fromICP } from 'src/config-global'

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>
}

export default function LoginButton({ sx }: Props) {
  const { t } = useTranslate()

  return (
    <>
      <Button
        component={fromICP ? 'a' : RouterLink}
        href={paths.auth.jwt.register}
        variant='contained'
        sx={{ mr: 1, ...sx }}
      >
        {t('home.header.sign-up')}
      </Button>
      <Button
        component={fromICP ? 'a' : RouterLink}
        href={paths.auth.jwt.login}
        variant='soft'
        sx={{ mr: 1, ...sx }}
      >
        {t('home.header.sign-in')}
      </Button>
    </>
  )
}
