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
        const { TextFieldsProps, length, onPaste, ...rest } = other
        const isTextFieldsPropsFn = typeof TextFieldsProps === 'function'

        const baseInputProps: TextFieldProps['inputProps'] = {
          inputMode: 'numeric',
          pattern: '[0-9]*'
        }

        const otpLength = length ?? 6

        const handlePaste: NonNullable<MuiOtpInputProps['onPaste']> = (event) => {
          const pasted = event.clipboardData.getData('text').trim()
          const isValid = new RegExp(`^\\d{${otpLength}}$`).test(pasted)

          if (!isValid) {
            event.preventDefault()
            onPaste?.(event)
            return
          }

          event.preventDefault()
          field.onChange(pasted)
          onPaste?.(event)
        }

        const mergedTextFieldsProps: MuiOtpInputProps['TextFieldsProps'] = isTextFieldsPropsFn
          ? (index: number) => {
              const resolvedProps = TextFieldsProps(index)
              const resolvedInputProps = resolvedProps?.inputProps ?? {}
              const mergedInputProps = {
                ...baseInputProps,
                ...resolvedInputProps,
                onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.ctrlKey || event.metaKey) {
                    resolvedInputProps.onKeyDown?.(event)
                    return
                  }
                  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
                  if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
                    event.preventDefault()
                    return
                  }
                  resolvedInputProps.onKeyDown?.(event)
                },
                onPaste: resolvedInputProps.onPaste
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
                ...(TextFieldsProps?.inputProps ?? {}),
                onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.ctrlKey || event.metaKey) {
                    TextFieldsProps?.inputProps?.onKeyDown?.(event)
                    return
                  }
                  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
                  if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
                    event.preventDefault()
                    return
                  }
                  TextFieldsProps?.inputProps?.onKeyDown?.(event)
                },
                onPaste: TextFieldsProps?.inputProps?.onPaste
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
              onPaste={handlePaste}
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
