import { Controller, useFormContext } from 'react-hook-form'

import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete'

import { allCountries } from 'src/app/api/services/db/_data/countries-data'

import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

interface Props<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined
> extends AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {
  name: string
  label?: string
  placeholder?: string
  type?: 'country' | string
  helperText?: React.ReactNode
}

export default function RHFAutocomplete<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined
>({
  name,
  label,
  type,
  helperText,
  placeholder,
  ...other
}: Omit<Props<T, Multiple, DisableClearable, FreeSolo>, 'renderInput'>) {
  const { control, setValue } = useFormContext()

  const { multiple } = other

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        if (type === 'country') {
          return (
            <Autocomplete
              {...field}
              id={`autocomplete-${name}`}
              autoHighlight={!multiple}
              disableCloseOnSelect={multiple}
              onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
              renderOption={(props, option) => {
                const country = getCountry(option as string)

                if (!country.label) {
                  return null
                }

                return (
                  <li {...props} key={country.label}>
                    <Iconify
                      key={country.label}
                      icon={`circle-flags:${country.code?.toLowerCase()}`}
                      sx={{ mr: 1 }}
                    />
                    {country.label} ({country.code}) +{country.phone}
                  </li>
                )
              }}
              renderInput={(params) => {
                const country = getCountry(params.inputProps.value as string)

                const baseField = {
                  ...params,
                  label,
                  placeholder,
                  error: !!error,
                  helperText: error ? error?.message : helperText,
                  inputProps: {
                    ...params.inputProps,
                    autoComplete: 'new-password'
                  }
                }

                if (multiple) {
                  return <TextField {...baseField} />
                }

                return (
                  <TextField
                    {...baseField}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment
                          position='start'
                          sx={{
                            ...(!country.code && {
                              display: 'none'
                            })
                          }}
                        >
                          <Iconify
                            icon={`circle-flags:${country.code?.toLowerCase()}`}
                            sx={{ mr: -0.5, ml: 0.5 }}
                          />
                        </InputAdornment>
                      )
                    }}
                  />
                )
              }}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => {
                  const country = getCountry(option as string)

                  return (
                    <Chip
                      {...getTagProps({ index })}
                      key={country.label}
                      label={country.label}
                      icon={<Iconify icon={`circle-flags:${country.code?.toLowerCase()}`} />}
                      size='small'
                      variant='soft'
                    />
                  )
                })
              }
              {...other}
            />
          )
        }

        return (
          <Autocomplete
            {...field}
            id={`autocomplete-${name}`}
            onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder}
                error={!!error}
                helperText={error ? error?.message : helperText}
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'new-password'
                }}
              />
            )}
            {...other}
          />
        )
      }}
    />
  )
}

// ----------------------------------------------------------------------

export function getCountry(inputValue: string) {
  const option = allCountries.filter((country) => country.label === inputValue)[0]

  return {
    ...option
  }
}
