import { useCallback } from 'react'

import Stack from '@mui/material/Stack'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { formHelperTextClasses } from '@mui/material/FormHelperText'

import Iconify from 'src/components/iconify'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

import { IInvoiceTableFilters, IInvoiceTableFilterValue } from 'src/types/invoice'

// ----------------------------------------------------------------------

type Props = {
  filters: IInvoiceTableFilters
  onFilters: (name: string, value: IInvoiceTableFilterValue) => void
  //
  dateError: boolean
  serviceOptions: string[]
}

export default function InvoiceTableToolbar({
  filters,
  onFilters,
  //
  dateError,
  serviceOptions
}: Props) {
  const popover = usePopover()

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value)
    },
    [onFilters]
  )

  const handleFilterService = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters(
        'service',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      )
    },
    [onFilters]
  )

  const handleFilterStartDate = useCallback(
    (newValue: Date | null) => {
      onFilters('startDate', newValue)
    },
    [onFilters]
  )

  const handleFilterEndDate = useCallback(
    (newValue: Date | null) => {
      onFilters('endDate', newValue)
    },
    [onFilters]
  )

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row'
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 }
        }}
      >
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 180 }
          }}
        >
          <InputLabel>Service</InputLabel>

          <Select
            multiple
            value={filters.service}
            onChange={handleFilterService}
            input={<OutlinedInput label='Service' />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            sx={{ textTransform: 'capitalize' }}
          >
            {serviceOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size='small' checked={filters.service.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label='Start date'
          value={filters.startDate}
          onChange={handleFilterStartDate}
          slotProps={{ textField: { fullWidth: true } }}
          sx={{
            maxWidth: { md: 180 }
          }}
        />

        <DatePicker
          label='End date'
          value={filters.endDate}
          onChange={handleFilterEndDate}
          slotProps={{
            textField: {
              fullWidth: true,
              error: dateError,
              helperText: dateError && 'End date must be later than start date'
            }
          }}
          sx={{
            maxWidth: { md: 180 },
            [`& .${formHelperTextClasses.root}`]: {
              position: { md: 'absolute' },
              bottom: { md: -40 }
            }
          }}
        />

        <Stack direction='row' alignItems='center' spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder='Search customer or invoice number...'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Iconify icon='eva:search-fill' sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon='eva:more-vertical-fill' />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow='right-top'
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose()
          }}
        >
          <Iconify icon='solar:printer-minimalistic-bold' />
          Print
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose()
          }}
        >
          <Iconify icon='solar:import-bold' />
          Import
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose()
          }}
        >
          <Iconify icon='solar:export-bold' />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  )
}
