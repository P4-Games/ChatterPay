import { Controller, useFormContext } from 'react-hook-form'
import { MuiOtpInput, type MuiOtpInputProps } from 'mui-one-time-password-input'

import FormHelperText from '@mui/material/FormHelperText'

// ----------------------------------------------------------------------

type RHFCodesProps = MuiOtpInputProps & {
  name: string
}

export default function RHFCode({ name, ...other }: RHFCodesProps) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <MuiOtpInput
            {...field}
            autoFocus
            gap={1.5}
            length={6}
            TextFieldsProps={{
              type: 'number',
              inputProps: {
                inputMode: 'numeric',
                pattern: '[0-9]*'
              },
              error: !!error,
              placeholder: ''
            }}
            {...other}
          />

          {error && (
            <FormHelperText sx={{ px: 2 }} error>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  )
}
