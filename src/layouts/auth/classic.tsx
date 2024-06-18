import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useResponsive } from 'src/hooks/use-responsive'

import { bgGradient } from 'src/theme/css'

import Logo from 'src/components/logo'

// ----------------------------------------------------------------------

/*
const METHODS = [
  {
    id: 'jwt',
    label: 'Jwt',
    path: paths.auth.jwt.login,
    icon: '/assets/icons/auth/ic_jwt.svg'
  }
]
*/

type Props = {
  title?: string
  image?: string
  children: React.ReactNode
}

export default function AuthClassicLayout({ children, image, title }: Props) {
  // const { method } = useAuthContext()

  const theme = useTheme()

  const mdUp = useResponsive('up', 'md')

  const renderLogo = (
    <Logo
      sx={{
        zIndex: 9,
        position: 'absolute',
        m: { xs: 2, md: 5 }
      }}
    />
  )

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 480,
        px: { xs: 2, md: 8 },
        pt: { xs: 15, md: 20 },
        pb: { xs: 15, md: 0 }
      }}
    >
      {children}
    </Stack>
  )

  const renderSection = (
    <Stack
      flexGrow={1}
      spacing={10}
      alignItems='center'
      justifyContent='center'
      sx={{
        ...bgGradient({
          color: alpha(
            theme.palette.background.default,
            theme.palette.mode === 'light' ? 0.88 : 0.94
          ),
          imgUrl: '/assets/background/overlay_2.jpg'
        })
      }}
    >
      <Typography variant='h3' sx={{ maxWidth: 480, textAlign: 'center' }}>
        {title || 'Hi, Welcome back'}
      </Typography>

      <Box
        component='img'
        alt='auth'
        src={image || '/assets/illustrations/illustration_dashboard.png'}
        sx={{
          maxWidth: {
            xs: 480,
            lg: 560,
            xl: 720
          }
        }}
      />
    </Stack>
  )

  return (
    <Stack
      component='main'
      direction='row'
      sx={{
        minHeight: '100vh'
      }}
    >
      {renderLogo}

      {mdUp && renderSection}

      {renderContent}
    </Stack>
  )
}
