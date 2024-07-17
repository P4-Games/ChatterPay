import { useState, useCallback } from 'react'

// ----------------------------------------------------------------------

export interface useBooleanReturnType {
  value: boolean
  onTrue: () => void
  onFalse: () => void
  onToggle: () => void
  setValue: React.Dispatch<React.SetStateAction<boolean>>
}

export function useBoolean(defaultValue?: boolean): useBooleanReturnType {
  const [value, setValue] = useState(!!defaultValue)

  const onTrue = useCallback(() => {
    setValue(true)
  }, [])

  const onFalse = useCallback(() => {
    setValue(false)
  }, [])

  const onToggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  return {
    value,
    onTrue,
    onFalse,
    onToggle,
    setValue
  }
}
