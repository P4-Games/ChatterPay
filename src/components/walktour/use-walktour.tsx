import { useRef, useState } from 'react'
import { Step, STATUS, LIFECYCLE, StoreHelpers, CallBackProps } from 'react-joyride'

import WalktourProgressBar from './walktour-progress-bar'

// ----------------------------------------------------------------------

type ReturnType = {
  run: boolean
  steps: Step[]
  onCallback: (data: CallBackProps) => void
  setHelpers: (storeHelpers: StoreHelpers) => void
  setRun: React.Dispatch<React.SetStateAction<boolean>>
}

export type UseWalktourProps = {
  defaultRun?: boolean
  showProgress?: boolean
  steps: Step[]
}

export function useWalktour(props: UseWalktourProps): ReturnType {
  const helpers = useRef<StoreHelpers>()

  const [run, setRun] = useState(!!props?.defaultRun)

  const [currentIndex, setCurrentIndex] = useState(0)

  const setHelpers = (storeHelpers: StoreHelpers) => {
    helpers.current = storeHelpers
  }

  const onCallback = (data: CallBackProps) => {
    const { status, index, lifecycle } = data

    if (lifecycle === LIFECYCLE.TOOLTIP) {
      setCurrentIndex(index + 1)
    }

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRun(false)
      setCurrentIndex(0)
    }
  }

  const steps = props.steps.map((step) => ({
    ...step,
    content: (
      <>
        {step.content}
        {props.showProgress && (
          <WalktourProgressBar
            currentStep={currentIndex}
            totalSteps={props.steps.length}
            onGoStep={(index: number) => helpers.current?.go(index)}
          />
        )}
      </>
    )
  }))

  return {
    steps,
    run,
    setRun,
    onCallback,
    setHelpers
  }
}
