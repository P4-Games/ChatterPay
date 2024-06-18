import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { Theme, alpha, SxProps, useTheme } from '@mui/material/styles'

import { useBoolean } from 'src/hooks/use-boolean'

import { fCurrency } from 'src/utils/format-number'

import { bgGradient } from 'src/theme/css'

import Iconify from 'src/components/iconify'
import Carousel, { useCarousel, CarouselDots } from 'src/components/carousel'

// ----------------------------------------------------------------------

type ItemProps = {
  id: string
  cardType: string
  balance: number
  cardHolder: string
  cardNumber: string
  cardValid: string
}

type Props = {
  list: ItemProps[]
  sx?: SxProps<Theme>
}

export default function BankingCurrentBalance({ list, sx }: Props) {
  const theme = useTheme()

  const carousel = useCarousel({
    fade: true,
    speed: 100,
    ...CarouselDots({
      sx: {
        right: 16,
        bottom: 16,
        position: 'absolute',
        color: 'primary.light'
      }
    })
  })

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.grey[900], 0.8),
          imgUrl: '/assets/background/overlay_2.jpg'
        }),
        height: 262,
        borderRadius: 2,
        position: 'relative',
        color: 'common.white',
        '.slick-slider, .slick-list, .slick-track, .slick-slide > div': {
          height: 1
        },
        '&:before, &:after': {
          left: 0,
          mx: 2.5,
          right: 0,
          zIndex: -2,
          height: 200,
          bottom: -16,
          content: "''",
          opacity: 0.16,
          borderRadius: 2,
          bgcolor: 'grey.500',
          position: 'absolute'
        },
        '&:after': {
          mx: 1,
          bottom: -8,
          opacity: 0.24
        },
        ...sx
      }}
    >
      <Carousel {...carousel.carouselSettings}>
        {list.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </Carousel>
    </Box>
  )
}

// ----------------------------------------------------------------------

type CardItemProps = {
  card: ItemProps
}

function CardItem({ card }: CardItemProps) {
  const { id, cardType, balance, cardHolder, cardNumber, cardValid } = card

  const currency = useBoolean()

  return (
    <Stack justifyContent='space-between' sx={{ height: 1, p: 3 }}>
      <div>
        <Typography sx={{ mb: 2, typography: 'subtitle2', opacity: 0.48 }}>
          Current Balance
        </Typography>

        <Stack direction='row' alignItems='center' spacing={1}>
          <Typography sx={{ typography: 'h3' }}>
            {currency.value ? '********' : fCurrency(balance)}
          </Typography>

          <IconButton color='inherit' onClick={currency.onToggle} sx={{ opacity: 0.48 }}>
            <Iconify icon={currency.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
          </IconButton>
        </Stack>
      </div>
    </Stack>
  )
}
