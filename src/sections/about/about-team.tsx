import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { _socials, _carouselsMembers } from 'src/app/api/_data/_mock'

import Image from 'src/components/image'
import Iconify from 'src/components/iconify'
import { varFade, MotionViewport } from 'src/components/animate'
import Carousel, { useCarousel, CarouselArrows } from 'src/components/carousel'

// ----------------------------------------------------------------------

export default function AboutTeam() {
  const carousel = useCarousel({
    infinite: false,
    slidesToShow: 4,
    responsive: [
      {
        breakpoint: 1279,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 959,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 }
      }
    ]
  })

  return (
    <Container component={MotionViewport} sx={{ textAlign: 'center', py: { xs: 10, md: 15 } }}>
      <m.div variants={varFade().inDown}>
        <Typography variant='overline' sx={{ color: 'text.disabled' }}>
          Dream team
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography variant='h2' sx={{ my: 3 }}>
          Great team is the key
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography
          sx={{
            mx: 'auto',
            maxWidth: 640,
            color: 'text.secondary'
          }}
        >
          Transfer crypto easily through WhatsApp using our Web3 platform.
        </Typography>
      </m.div>

      <Box sx={{ position: 'relative' }}>
        <CarouselArrows
          filled
          shape='rounded'
          onNext={carousel.onNext}
          onPrev={carousel.onPrev}
          leftButtonProps={{
            sx: {
              left: 24,
              ...(_carouselsMembers.length < 5 && { display: 'none' })
            }
          }}
          rightButtonProps={{
            sx: {
              right: 24,
              ...(_carouselsMembers.length < 5 && { display: 'none' })
            }
          }}
        >
          <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
            {_carouselsMembers.map((member) => (
              <Box
                key={member.id}
                component={m.div}
                variants={varFade().in}
                sx={{
                  px: 1.5,
                  py: { xs: 8, md: 10 }
                }}
              >
                <MemberCard member={member} />
              </Box>
            ))}
          </Carousel>
        </CarouselArrows>
      </Box>

      <Button
        size='large'
        color='inherit'
        variant='outlined'
        endIcon={<Iconify icon='eva:arrow-ios-forward-fill' width={24} />}
        sx={{ mx: 'auto' }}
      >
        All Members
      </Button>
    </Container>
  )
}

// ----------------------------------------------------------------------

type MemberCardProps = {
  member: {
    name: string
    role: string | undefined
    avatarUrl: string
  }
}

function MemberCard({ member }: MemberCardProps) {
  const { name, role, avatarUrl } = member
  return (
    <Card key={name}>
      <Typography variant='subtitle1' sx={{ mt: 2.5, mb: 0.5 }}>
        {name}
      </Typography>

      <Typography variant='body2' sx={{ mb: 2.5, color: 'text.secondary' }}>
        {role}
      </Typography>

      <Box sx={{ px: 1 }}>
        <Image alt={name} src={avatarUrl} ratio='1/1' sx={{ borderRadius: 2 }} />
      </Box>

      <Stack direction='row' alignItems='center' justifyContent='center' sx={{ p: 2 }}>
        {_socials.map((social) => (
          <IconButton
            key={social.name}
            sx={{
              color: social.color,
              '&:hover': {
                bgcolor: alpha(social.color, 0.08)
              }
            }}
          >
            <Iconify icon={social.icon} />
          </IconButton>
        ))}
      </Stack>
    </Card>
  )
}
