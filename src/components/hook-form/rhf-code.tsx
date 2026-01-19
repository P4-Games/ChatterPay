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
      render={({ field, fieldState: { error } }) => {
        const { TextFieldsProps, length, ...rest } = other
        const mergedInputProps = {
          inputMode: 'numeric',
          pattern: '[0-9]*',
          ...(TextFieldsProps?.inputProps ?? {})
        }
        const mergedTextFieldsProps = {
          type: TextFieldsProps?.type ?? 'number',
          placeholder: TextFieldsProps?.placeholder ?? '',
          ...TextFieldsProps,
          inputProps: mergedInputProps,
          error: TextFieldsProps?.error ?? !!error
        }

        return (
          <div>
            <MuiOtpInput
              {...field}
              autoFocus
              gap={1.5}
              length={length ?? 6}
              TextFieldsProps={mergedTextFieldsProps}
              {...rest}
            />

            {error && (
              <FormHelperText sx={{ px: 2 }} error>
                {error.message}
              </FormHelperText>
            )}
          </div>
        )
      }}
    />
  )
}
