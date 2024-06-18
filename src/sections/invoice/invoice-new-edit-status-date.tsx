import { Controller, useFormContext } from 'react-hook-form'

import Stack from '@mui/material/Stack'
import MenuItem from '@mui/material/MenuItem'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

import { RHFSelect, RHFTextField } from 'src/components/hook-form'

// ----------------------------------------------------------------------

export default function InvoiceNewEditStatusDate() {
  const { control, watch } = useFormContext()

  const values = watch()

  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ p: 3, bgcolor: 'background.neutral' }}
    >
      <RHFTextField
        disabled
        name='invoiceNumber'
        label='Invoice number'
        value={values.invoiceNumber}
      />

      <RHFSelect
        fullWidth
        name='status'
        label='Status'
        InputLabelProps={{ shrink: true }}
        PaperPropsSx={{ textTransform: 'capitalize' }}
      >
        {['paid', 'pending', 'overdue', 'draft'].map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </RHFSelect>

      <Controller
        name='createDate'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            label='Date create'
            value={field.value}
            onChange={(newValue) => {
              field.onChange(newValue)
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error?.message
              }
            }}
          />
        )}
      />

      <Controller
        name='dueDate'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            label='Due date'
            value={field.value}
            onChange={(newValue) => {
              field.onChange(newValue)
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error?.message
              }
            }}
          />
        )}
      />
    </Stack>
  )
}
