import Stack from '@mui/material/Stack'
import ButtonBase from '@mui/material/ButtonBase'
import { alpha, useTheme } from '@mui/material/styles'

// ----------------------------------------------------------------------

type Props = {
  totalSteps: number
  currentStep: number
  onGoStep: (index: number) => void
}

export default function WalktourProgressBar({ totalSteps, currentStep, onGoStep }: Props) {
  const theme = useTheme()

  const barStyles = {
    height: 2,
    bottom: 0,
    content: '""',
    position: 'absolute',
    width: `calc(100% / ${totalSteps} * ${currentStep})`,
    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
  }

  return (
    <Stack
      direction='row'
      sx={{
        left: 0,
        width: 1,
        bottom: -1,
        position: 'absolute',
        '&:before': barStyles
      }}
    >
      {[...Array(totalSteps)].map((_, index) => {
        const stepIndex = index + 1

        return (
          <ButtonBase
            disableRipple
            key={index}
            onClick={() => {
              if (currentStep !== stepIndex) {
                onGoStep(index)
              }
            }}
            sx={{
              pt: 1,
              width: `calc(100% / ${totalSteps})`,
              '&:hover': {
                bgcolor: 'action.hover',
                ...(currentStep >= stepIndex && {
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity)
                })
              }
            }}
          />
        )
      })}
    </Stack>
  )
}
