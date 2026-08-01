import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useResponsive } from 'src/hooks/use-responsive'

import { bgGradient } from 'src/theme/css'
import { useTranslate } from 'src/locales'

import { LogoWithName } from 'src/components/logo'

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

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 600,
        px: { xs: 2, md: 5 },
        pt: { xs: 2, md: 5 },
        pb: { xs: 15, md: 0 }
      }}
    >
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        sx={{ mb: { xs: 10, md: 13 } }}
      >
        <LogoWithName sx={{ height: { xs: 28, md: 36 } }} />
        <LanguagePopover />
      </Stack>

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
        bgcolor: 'background.default',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Box
        component='img'
        alt='auth'
        src={
          image ||
          'https://storage.googleapis.com/chatbot-multimedia/chatterpay/images/login_graphic.webp'
        }
        sx={{
          width: '100%',
          height: '100vh',
          maxHeight: '100vh',
          objectFit: 'cover'
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
        {renderContent}

        {mdUp && renderSection}
      </Stack>
    </BaseLayout>
  )
}
