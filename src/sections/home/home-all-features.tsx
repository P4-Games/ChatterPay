import { m } from 'framer-motion'
import { useState, useCallback } from 'react'

import Fab from '@mui/material/Fab'
import Tab from '@mui/material/Tab'
import { Box } from '@mui/material'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Badge from '@mui/material/Badge'
import Alert from '@mui/material/Alert'
import Rating from '@mui/material/Rating'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Slider from '@mui/material/Slider'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import AlertTitle from '@mui/material/AlertTitle'
import AvatarGroup from '@mui/material/AvatarGroup'
import ToggleButton from '@mui/material/ToggleButton'
import CircularProgress from '@mui/material/CircularProgress'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'
import { _mock } from 'src/app/api/_data/_mock'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import { varFade } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeAllFeatures() {
  const mdUp = useResponsive('up', 'md')

  const [slider, setSlider] = useState<number>(24)

  const [app, setApp] = useState('chat')

  const [rating, setRating] = useState<number | null>(2)

  const [currentTab, setCurrentTab] = useState('Angular')

  const { t } = useTranslate()

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue)
  }, [])

  const contactUsBtn = (
    <m.div variants={varFade().inUp}>
      <Button
        size='large'
        color='inherit'
        variant='contained'
        target='_blank'
        rel='noopener'
        href='/'
      >
        {t('home.common.contact-us')}
      </Button>
    </m.div>
  )

  const renderDescription = (
    <Stack
      sx={{
        textAlign: { xs: 'center', md: 'unset' },
        pl: { md: 5 },
        pt: { md: 15 }
      }}
    >
      <m.div variants={varFade().inUp}>
        <Typography component='div' variant='overline' sx={{ color: 'text.disabled' }}>
          Functionalities
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography variant='h2' sx={{ my: 3 }}>
          Discover all features
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography
          sx={{
            mb: 5,
            color: 'text.secondary',
            textAlign: 'left'
          }}
        >
          <ul>
            <li>Transfer funds to any WhatsApp contact</li>
            <li>Receive payments and transfers directly in your WhatsApp</li>
            <li>Easily swap between different tokens in a user-friendly way</li>
            <li>Securely hold your tokens while maintaining full control over your assets</li>
            <li>Dashboard for balance and transaction history tracking</li>
            <li>
              {' '}
              Internal Administration Panel{' '}
              <a target='_blank' href='https://app.chatizalo.com/' rel='noreferrer'>
                (Chatizalo)
              </a>{' '}
              for supervising and managing user accounts
            </li>
            <li>Provides personalized and efficient support</li>
            <li>WhatsApp-based MFA for WebApp authentication</li>
            <li>Email-based MFA for account recovery</li>
            <li>Transaction notifications</li>
            <li>Fee management and payment</li>
            <li>Multi-agent message processing</li>
            <li>Private key management with Account Abstraction Technology</li>
          </ul>
        </Typography>
      </m.div>

      {mdUp && contactUsBtn}
    </Stack>
  )

  const renderContent = (
    <Stack
      component={Paper}
      variant='outlined'
      alignItems='center'
      spacing={{ xs: 3, md: 5 }}
      sx={{
        borderRadius: 2,
        bgcolor: 'unset',
        borderStyle: 'dashed',
        p: { xs: 3, md: 5 }
      }}
    >
      {/* Row 1 */}
      <Stack
        direction='row'
        flexWrap='wrap'
        alignItems='center'
        justifyContent='center'
        spacing={{ xs: 3, md: 4 }}
        sx={{ width: 1 }}
      >
        <m.div variants={varFade().in}>
          <Button
            variant='contained'
            color='primary'
            startIcon={<Iconify icon='solar:cart-plus-bold' />}
          >
            Add To Cart
          </Button>
        </m.div>

        <m.div variants={varFade().in}>
          <Button
            variant='soft'
            color='primary'
            startIcon={<Iconify icon='eva:cloud-upload-fill' />}
          >
            Upload
          </Button>
        </m.div>

        <m.div variants={varFade().in}>
          <Fab color='info' size='medium'>
            <Iconify icon='eva:search-fill' />
          </Fab>
        </m.div>

        <m.div variants={varFade().in}>
          <CircularProgress color='error' />
        </m.div>
      </Stack>

      {/* Row 2 */}
      <Stack
        direction='row'
        flexWrap='wrap'
        alignItems='center'
        justifyContent='center'
        spacing={{ xs: 3, md: 4 }}
        sx={{ width: 1 }}
      >
        <m.div variants={varFade().in}>
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            sx={{
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`
            }}
          >
            {['Angular', 'React', 'Vue'].map((tab) => (
              <Tab
                key={tab}
                value={tab}
                label={tab}
                sx={{
                  '&:not(:last-of-type)': { mr: 3 }
                }}
              />
            ))}
          </Tabs>
        </m.div>

        <m.div variants={varFade().in}>
          <ToggleButtonGroup
            size='small'
            color='secondary'
            value={app}
            exclusive
            onChange={(event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
              if (newValue !== null) {
                setApp(newValue)
              }
            }}
            aria-label='app'
          >
            {['chat', 'mail', 'bell'].map((item) => (
              <ToggleButton key={item} value={item} aria-label={item} disabled={item === 'bell'}>
                {item === 'chat' && <Iconify icon='solar:chat-round-dots-bold' />}
                {item === 'mail' && <Iconify icon='fluent:mail-24-filled' />}
                {item === 'bell' && <Iconify icon='solar:bell-bing-bold' />}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </m.div>

        <m.div variants={varFade().in}>
          <Chip
            color='error'
            variant='soft'
            onDelete={() => {}}
            avatar={<Avatar alt={_mock.fullName(2)} src={_mock.image.avatar(2)} />}
            label='Chip'
          />
        </m.div>
      </Stack>

      {/* Row 3 */}
      <Stack
        direction='row'
        flexWrap='wrap'
        alignItems='center'
        justifyContent='center'
        spacing={{ xs: 3, md: 4 }}
        sx={{ width: 1 }}
      >
        <m.div variants={varFade().in}>
          <Badge variant='online' anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Avatar src={_mock.image.avatar(19)} alt={_mock.fullName(19)} />
          </Badge>
        </m.div>

        <m.div variants={varFade().in}>
          <AvatarGroup>
            {[...Array(8)].map((_, index) => (
              <Avatar key={index} src={_mock.image.avatar(index)} />
            ))}
          </AvatarGroup>
        </m.div>

        <m.div variants={varFade().in}>
          <Rating
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue)
            }}
          />
        </m.div>

        <m.div variants={varFade().in}>
          <Label variant='filled' startIcon={<Iconify icon='fluent:mail-24-filled' />}>
            Label
          </Label>
        </m.div>
      </Stack>

      {/* Row 4 */}
      <Stack
        spacing={{ xs: 3, md: 4 }}
        sx={{
          width: 1,
          gap: 3,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }
        }}
      >
        <m.div variants={varFade().in}>
          <Slider
            valueLabelDisplay='on'
            value={slider}
            onChange={(event: Event, newValue: number | number[]) => {
              setSlider(newValue as number)
            }}
          />
        </m.div>

        <m.div variants={varFade().in}>
          <Alert severity='success' onClose={() => {}}>
            <AlertTitle>Success</AlertTitle>
            This is a success alert — <strong>check it out!</strong>
          </Alert>
        </m.div>
      </Stack>
    </Stack>
  )

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04)
      }}
    >
      <Container>
        <Grid container direction={{ xs: 'column', md: 'row-reverse' }} spacing={5}>
          <Grid xs={12} md={7}>
            {renderDescription}
          </Grid>

          <Grid xs={12} md={5}>
            {renderContent}
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
