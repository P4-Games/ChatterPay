import { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Slider from '@mui/material/Slider'
import Tooltip from '@mui/material/Tooltip'
import { CardProps } from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import ListItemText from '@mui/material/ListItemText'
import DialogActions from '@mui/material/DialogActions'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import Input, { InputProps, inputClasses } from '@mui/material/Input'

import { useBoolean } from 'src/hooks/use-boolean'

import { fCurrency } from 'src/utils/format-number'

import Iconify from 'src/components/iconify'
import Carousel, { useCarousel, CarouselArrows } from 'src/components/carousel'

// ----------------------------------------------------------------------

const STEP = 50

const MIN_AMOUNT = 0

const MAX_AMOUNT = 1000

const AVATAR_SIZE = 40

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string
  subheader?: string
  list: {
    id: string
    name: string
    email: string
    avatarUrl: string
  }[]
}

export default function BankingQuickTransfer({ title, subheader, list, sx, ...other }: Props) {
  const theme = useTheme()

  const carousel = useCarousel({
    centerMode: true,
    swipeToSlide: true,
    focusOnSelect: true,
    centerPadding: '0px',
    slidesToShow: list.length > 7 ? 7 : list.length,
    responsive: [
      {
        // Down 1600
        breakpoint: 1600,
        settings: {
          slidesToShow: 5
        }
      },
      {
        // Down 1400
        breakpoint: 1400,
        settings: {
          slidesToShow: 3
        }
      },
      {
        // Down 900
        breakpoint: theme.breakpoints.values.md,
        settings: {
          slidesToShow: 5
        }
      },
      {
        // Down 400
        breakpoint: 400,
        settings: {
          slidesToShow: 3
        }
      }
    ]
  })

  const [autoWidth, setAutoWidth] = useState(24)

  const [amount, setAmount] = useState(0)

  const confirm = useBoolean()

  const getContactInfo = list.find((_, index) => index === carousel.currentIndex)

  useEffect(() => {
    if (amount) {
      handleAutoWidth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount])

  const handleAutoWidth = useCallback(() => {
    const getNumberLength = amount.toString().length
    setAutoWidth(getNumberLength * 24)
  }, [amount])

  const handleChangeSlider = useCallback((event: Event, newValue: number | number[]) => {
    setAmount(newValue as number)
  }, [])

  const handleChangeInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(event.target.value))
  }, [])

  const handleBlur = useCallback(() => {
    if (amount < 0) {
      setAmount(0)
    } else if (amount > MAX_AMOUNT) {
      setAmount(MAX_AMOUNT)
    }
  }, [amount])

  const renderCarousel = (
    <Box sx={{ position: 'relative' }}>
      <CarouselArrows
        filled
        onPrev={carousel.onPrev}
        onNext={carousel.onNext}
        leftButtonProps={{
          sx: {
            p: 0.5,
            mt: -1.5,
            left: -8,
            '& svg': { width: 16, height: 16 }
          }
        }}
        rightButtonProps={{
          sx: {
            p: 0.5,
            mt: -1.5,
            right: -8,
            '& svg': { width: 16, height: 16 }
          }
        }}
      >
        <Box
          component={Carousel}
          ref={carousel.carouselRef}
          {...carousel.carouselSettings}
          sx={{
            width: 1,
            mx: 'auto',
            maxWidth: AVATAR_SIZE * 7 + 160
          }}
        >
          {list.map((contact, index) => (
            <Box key={contact.id} sx={{ py: 5 }}>
              <Tooltip key={contact.id} title={contact.name} arrow placement='top'>
                <Avatar
                  src={contact.avatarUrl}
                  sx={{
                    mx: 'auto',
                    opacity: 0.48,
                    cursor: 'pointer',
                    transition: theme.transitions.create('all'),
                    ...(index === carousel.currentIndex && {
                      opacity: 1,
                      transform: 'scale(1.25)',
                      boxShadow: '-4px 12px 24px 0 rgb(0,0,0,0.24)'
                    })
                  }}
                />
              </Tooltip>
            </Box>
          ))}
        </Box>
      </CarouselArrows>
    </Box>
  )

  const renderInput = (
    <Stack spacing={3}>
      <Typography variant='overline' sx={{ color: 'text.secondary' }}>
        insert amount
      </Typography>

      <InputAmount
        amount={amount}
        onBlur={handleBlur}
        autoWidth={autoWidth}
        onChange={handleChangeInput}
      />

      <Slider
        value={typeof amount === 'number' ? amount : 0}
        valueLabelDisplay='auto'
        step={STEP}
        marks
        min={MIN_AMOUNT}
        max={MAX_AMOUNT}
        onChange={handleChangeSlider}
      />

      <Stack direction='row' alignItems='center' sx={{ typography: 'subtitle1' }}>
        <Box component='span' sx={{ flexGrow: 1 }}>
          Your Balance
        </Box>
        {fCurrency(34212)}
      </Stack>

      <Button
        size='large'
        color='inherit'
        variant='contained'
        disabled={amount === 0}
        onClick={confirm.onTrue}
      >
        Transfer Now
      </Button>
    </Stack>
  )

  return (
    <>
      <Stack
        sx={{
          borderRadius: 2,
          bgcolor: 'background.neutral',
          ...sx
        }}
        {...other}
      >
        <CardHeader title={title} subheader={subheader} />

        <Stack sx={{ p: 3 }}>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Typography variant='overline' sx={{ color: 'text.secondary' }}>
              Recent
            </Typography>

            <Button
              size='small'
              color='inherit'
              endIcon={<Iconify icon='eva:arrow-ios-forward-fill' width={18} sx={{ ml: -0.5 }} />}
              sx={{ mr: -1 }}
            >
              View All
            </Button>
          </Stack>

          {renderCarousel}

          {renderInput}
        </Stack>
      </Stack>

      <ConfirmTransferDialog
        amount={amount}
        onBlur={handleBlur}
        open={confirm.value}
        autoWidth={autoWidth}
        onClose={confirm.onFalse}
        contactInfo={getContactInfo}
        onChange={handleChangeInput}
      />
    </>
  )
}

// ----------------------------------------------------------------------

interface InputAmountProps extends InputProps {
  autoWidth: number
  amount: number | number[]
}

function InputAmount({ autoWidth, amount, onBlur, onChange, sx, ...other }: InputAmountProps) {
  return (
    <Stack direction='row' justifyContent='center' spacing={1} sx={sx}>
      <Typography variant='h5'>$</Typography>

      <Input
        disableUnderline
        size='small'
        value={amount}
        onChange={onChange}
        onBlur={onBlur}
        inputProps={{
          step: STEP,
          min: MIN_AMOUNT,
          max: MAX_AMOUNT,
          type: 'number'
        }}
        sx={{
          [`& .${inputClasses.input}`]: {
            p: 0,
            typography: 'h3',
            textAlign: 'center',
            width: autoWidth
          }
        }}
        {...other}
      />
    </Stack>
  )
}

// ----------------------------------------------------------------------

type TConfirmTransferDialogProps = InputAmountProps & DialogProps

interface ConfirmTransferDialogProps extends TConfirmTransferDialogProps {
  contactInfo?: {
    id: string
    name: string
    email: string
    avatarUrl: string
  }
  onClose: VoidFunction
}

function ConfirmTransferDialog({
  open,
  amount,
  autoWidth,
  contactInfo,
  onClose,
  onBlur,
  onChange
}: ConfirmTransferDialogProps) {
  return (
    <Dialog open={open} fullWidth maxWidth='xs' onClose={onClose}>
      <DialogTitle>Transfer to</DialogTitle>

      <Stack spacing={3} sx={{ px: 3 }}>
        <Stack direction='row' alignItems='center' spacing={2}>
          <Avatar src={contactInfo?.avatarUrl} sx={{ width: 48, height: 48 }} />

          <ListItemText
            primary={contactInfo?.name}
            secondary={contactInfo?.email}
            secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
          />
        </Stack>

        <InputAmount
          onBlur={onBlur}
          onChange={onChange}
          autoWidth={autoWidth}
          amount={amount}
          disableUnderline={false}
          sx={{ justifyContent: 'flex-end' }}
        />

        <TextField fullWidth multiline rows={3} placeholder='Write a message...' />
      </Stack>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button variant='contained' disabled={amount === 0} onClick={onClose}>
          Confirm & Transfer
        </Button>
      </DialogActions>
    </Dialog>
  )
}
