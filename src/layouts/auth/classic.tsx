import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useResponsive } from 'src/hooks/use-responsive'

import { bgGradient } from 'src/theme/css'
import { useTranslate } from 'src/locales'

import Logo from 'src/components/logo'

import BaseLayout from '../baseLayout'
import LanguagePopover from '../common/language-popover'

// ----------------------------------------------------------------------

type Props = {
  title?: string
  image?: string
  children: React.ReactNode
}

export default function AuthClassicLayout({ children, image, title }: Props) {
  const { t } = useTranslate()
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

  const renderLanguagePopover = (
    <Box
      sx={{
        zIndex: 9,
        position: 'absolute',
        top: 0,
        right: 0,
        m: { xs: 2, md: 5 }
      }}
    >
      <LanguagePopover />
    </Box>
  )

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 480,
        px: { xs: 2, md: 5 },
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
          imgUrl: '/assets/images/background/overlay_2.jpg'
        })
      }}
    >
      <Box
        component='img'
        alt='auth'
        src={image || '/assets/images/illustrations/dashboard.png'}
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
    <BaseLayout>
      <Stack
        component='main'
        direction='row'
        sx={{
          minHeight: '100vh'
        }}
      >
        {renderLogo}

        {renderContent}

        {mdUp && renderSection}

        {renderLanguagePopover}
      </Stack>
    </BaseLayout>
  )
}
