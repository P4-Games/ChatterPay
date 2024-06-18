import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'

import { presetOptions } from 'src/theme/options/presets'

import Image from 'src/components/image'
import Iconify from 'src/components/iconify'
import { useSettingsContext } from 'src/components/settings'
import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeColorPresets() {
  const settings = useSettingsContext()

  const renderDescription = (
    <Stack spacing={3} sx={{ textAlign: 'center' }}>
      <m.div variants={varFade().inDown}>
        <Typography component='div' variant='overline' sx={{ color: 'text.disabled' }}>
          choose your style
        </Typography>
      </m.div>

      <m.div variants={varFade().inDown}>
        <Typography variant='h2'> Color Presets </Typography>
      </m.div>

      <m.div variants={varFade().inDown}>
        <Typography sx={{ color: 'text.secondary' }}>
          Express your own style with just one click
        </Typography>
      </m.div>
    </Stack>
  )

  const renderContent = (
    <Box sx={{ position: 'relative' }}>
      <Image disabledEffect alt='grid' src='/assets/images/home/presets/grid.webp' />

      <Box sx={{ position: 'absolute', top: 0 }}>
        <m.div variants={varFade().inUp}>
          <Image
            disabledEffect
            alt='screen'
            src={`/assets/images/home/presets/screen_${settings.themeColorPresets}.webp`}
          />
        </m.div>
      </Box>

      <Box sx={{ position: 'absolute', top: 0 }}>
        <m.div variants={varFade().inDown}>
          <m.div animate={{ y: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity }}>
            <Image
              disabledEffect
              alt='sidebar'
              src={`/assets/images/home/presets/block_${settings.themeColorPresets}.webp`}
            />
          </m.div>
        </m.div>
      </Box>

      <Box sx={{ position: 'absolute', top: 0 }}>
        <m.div variants={varFade().inDown}>
          <m.div animate={{ y: [-5, 10, -5] }} transition={{ duration: 8, repeat: Infinity }}>
            <Image
              disabledEffect
              alt='chart'
              src={`/assets/images/home/presets/chart_${settings.themeColorPresets}.webp`}
            />
          </m.div>
        </m.div>
      </Box>

      <Box sx={{ position: 'absolute', top: 0 }}>
        <m.div variants={varFade().inDown}>
          <m.div animate={{ y: [-25, 5, -25] }} transition={{ duration: 10, repeat: Infinity }}>
            <Image
              disabledEffect
              alt='sidebar'
              src={`/assets/images/home/presets/sidebar_${settings.themeColorPresets}.webp`}
            />
          </m.div>
        </m.div>
      </Box>
    </Box>
  )

  const renderOptions = (
    <m.div variants={varFade().inDown}>
      <Stack
        alignItems='center'
        justifyContent='center'
        sx={{
          my: 5,
          width: 100,
          height: 88,
          mx: 'auto',
          position: 'relative'
        }}
      >
        {presetOptions.map((color, index) => {
          const { name, value } = color

          const selected = settings.themeColorPresets === name

          return (
            <CardActionArea
              key={name}
              onClick={() => settings.onUpdate('themeColorPresets', name)}
              sx={{
                width: 24,
                height: 24,
                bgcolor: value,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                position: 'absolute',
                color: 'common.white',
                ...(index === 0 && { bottom: 0 }),
                ...(index === 1 && { left: 19 }),
                ...(index === 2 && { right: 19 }),
                ...(index === 3 && { top: 0, left: 0 }),
                ...(index === 4 && { top: 0 }),
                ...(index === 5 && { top: 0, right: 0 })
              }}
            >
              {selected && <Iconify icon='eva:color-picker-fill' width={16} />}
            </CardActionArea>
          )
        })}
      </Stack>
    </m.div>
  )

  return (
    <Container
      component={MotionViewport}
      sx={{
        position: 'relative',
        py: { xs: 10, md: 15 }
      }}
    >
      {renderDescription}

      {renderOptions}

      {renderContent}
    </Container>
  )
}
