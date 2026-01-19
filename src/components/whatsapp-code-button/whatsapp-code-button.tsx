import LoadingButton from '@mui/lab/LoadingButton'
import type { SxProps, Theme } from '@mui/material/styles'

type Props = {
  counting: boolean
  countdown: number
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
  disabled?: boolean
  onClick: () => void
  sendLabel: string
  resendLabel: string
  sx?: SxProps<Theme>
}

export default function WhatsappCodeButton({
  counting,
  countdown,
  color = 'info',
  disabled,
  onClick,
  sendLabel,
  resendLabel,
  sx
}: Props) {
  const label = counting ? `${resendLabel} (${countdown}s)` : sendLabel

  return (
    <LoadingButton
      type='button'
      variant='contained'
      color={color}
      disabled={disabled}
      onClick={onClick}
      sx={sx}
    >
      {label}
    </LoadingButton>
  )
}
