import { Controller, useFormContext } from 'react-hook-form'

import TextField, { type TextFieldProps } from '@mui/material/TextField'

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string
}

export default function RHFTextField({ name, helperText, type, ...other }: Props) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type === 'wallet' ? 'text' : type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onChange={(event) => {
            let inputValue = event.target.value
            if (type === 'number') {
              field.onChange(Number(inputValue))
            } else if (type === 'wallet') {
              inputValue = inputValue.replace(/[^a-zA-Z0-9]/g, '')
              field.onChange(inputValue.startsWith('0x') ? inputValue : `0x${inputValue}`)
            } else {
              field.onChange(event.target.value)
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
        />
      )}
    />
  )
}
