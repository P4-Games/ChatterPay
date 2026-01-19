import { Controller, useFormContext } from 'react-hook-form'
import { MuiOtpInput, type MuiOtpInputProps } from 'mui-one-time-password-input'

import FormHelperText from '@mui/material/FormHelperText'
import type { TextFieldProps } from '@mui/material/TextField'

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
        const isTextFieldsPropsFn = typeof TextFieldsProps === 'function'
        const baseInputProps: TextFieldProps['inputProps'] = {
          inputMode: 'numeric',
          pattern: '[0-9]*'
        }

        const mergedTextFieldsProps: MuiOtpInputProps['TextFieldsProps'] = isTextFieldsPropsFn
          ? (index: number) => {
              const resolvedProps = TextFieldsProps(index)
              const mergedInputProps = {
                ...baseInputProps,
                ...(resolvedProps?.inputProps ?? {})
              }
              return {
                type: resolvedProps?.type ?? 'number',
                placeholder: resolvedProps?.placeholder ?? '',
                ...resolvedProps,
                inputProps: mergedInputProps,
                error: resolvedProps?.error ?? !!error
              }
            }
          : {
              type: TextFieldsProps?.type ?? 'number',
              placeholder: TextFieldsProps?.placeholder ?? '',
              ...TextFieldsProps,
              inputProps: {
                ...baseInputProps,
                ...(TextFieldsProps?.inputProps ?? {})
              },
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
