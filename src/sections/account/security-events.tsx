'use client'

import NProgress from 'nprogress'
import { useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

import { useSecurityEvents } from 'src/app/api/hooks/use-security'
import { useAuthContext } from 'src/auth/hooks'
import EmptyContent from 'src/components/empty-content'
import Iconify from 'src/components/iconify'
import Scrollbar from 'src/components/scrollbar'
import {
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  emptyRows,
  useTable
} from 'src/components/table'
import { useTranslate } from 'src/locales'

import { SECURITY_EVENT_TYPES } from './security-types'

// ----------------------------------------------------------------------

const CHANNEL_OPTIONS = ['all', 'frontend', 'bot'] as const

const TABLE_HEAD = [
  { id: 'createdAt', label: 'security.events.table.date' },
  { id: 'eventType', label: 'security.events.table.type' },
  { id: 'channel', label: 'security.events.table.channel' },
  { id: 'details', label: 'security.events.table.details' }
]

export default function SecurityEvents() {
  const { t, i18n } = useTranslate()
  const { user } = useAuthContext()
  const table = useTable({ defaultOrder: 'desc', defaultOrderBy: 'createdAt' })

  const [channel, setChannel] = useState<string>('all')
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const hasActiveFilters = channel !== 'all' || eventTypes.length > 0 || search.trim().length > 0

  const handleClearFilters = () => {
    setChannel('all')
    setEventTypes([])
    setSearch('')
  }

  const {
    data: eventsResponse,
    isLoading,
    isValidating
  } = useSecurityEvents(user?.id, {
    channel: channel !== 'all' ? channel : undefined,
    eventTypes: eventTypes.length ? eventTypes : undefined,
    search: search.trim() ? search.trim() : undefined
  })

  const dateFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    } catch {
      return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' })
    }
  }, [i18n.language])

  const formatEventDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value
    }
    return dateFormatter.format(date)
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    if (isLoading || isValidating) {
      timer = setTimeout(() => {
        NProgress.start()
      }, 150)
    } else {
      NProgress.done()
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isLoading, isValidating])

  const events = eventsResponse?.ok ? eventsResponse.data.events : []
  const totalEventsCount = events.length

  const eventTypeOptions = useMemo(() => {
    const unique = new Set<string>(SECURITY_EVENT_TYPES)
    events.forEach((event) => {
      unique.add(event.eventType)
    })
    return Array.from(unique)
  }, [events])

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase()
    return events.filter((event) => {
      if (channel !== 'all' && event.channel !== channel) return false
      if (eventTypes.length && !eventTypes.includes(event.eventType)) return false
      if (!query) return true

      const details = event.details ? JSON.stringify(event.details).toLowerCase() : ''
      const message = event.message?.toLowerCase() ?? ''
      return (
        message.includes(query) ||
        event.eventType.toLowerCase().includes(query) ||
        event.channel.toLowerCase().includes(query) ||
        details.includes(query)
      )
    })
  }, [channel, eventTypes, events, search])

  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents]
    const direction = table.order === 'asc' ? 1 : -1

    const getValue = (event: (typeof filteredEvents)[number]) => {
      switch (table.orderBy) {
        case 'eventType':
          return event.eventType
        case 'channel':
          return event.channel
        case 'details':
          return event.details ? JSON.stringify(event.details) : ''
        default:
          return event.createdAt
      }
    }

    return sorted.sort((a, b) => {
      const aValue = getValue(a)
      const bValue = getValue(b)
      if (table.orderBy === 'createdAt') {
        const aTime = aValue ? new Date(aValue).getTime() : 0
        const bTime = bValue ? new Date(bValue).getTime() : 0
        return (aTime - bTime) * direction
      }
      return String(aValue).localeCompare(String(bValue)) * direction
    })
  }, [filteredEvents, table.order, table.orderBy])

  const pagedEvents = useMemo(() => {
    const start = table.page * table.rowsPerPage
    const end = start + table.rowsPerPage
    return sortedEvents.slice(start, end)
  }, [sortedEvents, table.page, table.rowsPerPage])

  useEffect(() => {
    table.onResetPage()
  }, [channel, eventTypes, search, table.onResetPage])

  const emptyOnFilter = !isLoading && sortedEvents.length === 0

  const formatEventType = (eventType: string) => {
    const label = t(`security.events.types.${eventType}`)
    if (label.includes('security.events.types.')) {
      return eventType.replace(/_/g, ' ')
    }
    return label
  }

  const formatChannel = (value: string) => {
    const label = t(`security.events.channels.${value}`)
    if (label.includes('security.events.channels.')) {
      return value
    }
    return label
  }

  const renderDetails = (details?: Record<string, unknown> | null) => {
    if (!details || Object.keys(details).length === 0) {
      return t('common.nodata')
    }

    const text = JSON.stringify(details)
    if (text.length <= 120) return text
    return `${text.slice(0, 117)}...`
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant='subtitle1'>{t('security.events.contextTitle')}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('security.events.contextDescription')}
            </Typography>
            {eventsResponse?.ok && (
              <Typography variant='body2' color='text.secondary'>
                {t('security.events.total').replace('{COUNT}', String(totalEventsCount))}
              </Typography>
            )}
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            <FormControl size='small' sx={{ minWidth: 160 }}>
              <InputLabel>{t('security.events.filters.channel')}</InputLabel>
              <Select
                value={channel}
                label={t('security.events.filters.channel')}
                onChange={(event) => setChannel(String(event.target.value))}
              >
                {CHANNEL_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {formatChannel(option)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size='small' sx={{ minWidth: 220 }}>
              <InputLabel>{t('security.events.filters.eventType')}</InputLabel>
              <Select
                multiple
                value={eventTypes}
                label={t('security.events.filters.eventType')}
                onChange={(event) => {
                  const value = event.target.value
                  setEventTypes(typeof value === 'string' ? value.split(',') : value)
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} size='small' label={formatEventType(value)} />
                    ))}
                  </Box>
                )}
              >
                {eventTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {formatEventType(option)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction='row' spacing={1} alignItems='center'>
              <TextField
                size='small'
                label={t('security.events.filters.search')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{ minWidth: 220 }}
              />
              <Tooltip title={t('security.events.filters.clear')}>
                <span>
                  <IconButton
                    size='small'
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                  >
                    <Iconify icon='eva:close-circle-outline' width={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          {eventsResponse && !eventsResponse.ok && (
            <Alert severity='error'>{t('security.events.errors.generic')}</Alert>
          )}

          {emptyOnFilter ? (
            <EmptyContent
              filled
              title={t('security.events.empty.title')}
              description={t('security.events.empty.description')}
              sx={{ py: 8 }}
            />
          ) : (
            <>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Scrollbar>
                  <Table sx={{ minWidth: 720 }}>
                    <TableHeadCustom
                      headLabel={TABLE_HEAD.map((item) => ({
                        ...item,
                        label: t(item.label)
                      }))}
                      order={table.order}
                      orderBy={table.orderBy}
                      onSort={table.onSort}
                      sx={{ '& th': { px: 3 } }}
                    />

                    <TableBody>
                      {pagedEvents.map((event) => (
                        <TableRow key={`${event.createdAt}-${event.eventType}-${event.channel}`}>
                          <TableCell sx={{ px: 3, whiteSpace: 'nowrap' }}>
                            {event.createdAt
                              ? formatEventDate(event.createdAt)
                              : t('common.nodata')}
                          </TableCell>
                          <TableCell sx={{ px: 3 }}>
                            <Chip size='small' label={formatEventType(event.eventType)} />
                          </TableCell>
                          <TableCell sx={{ px: 3 }}>
                            <Chip
                              size='small'
                              variant='outlined'
                              label={formatChannel(event.channel)}
                            />
                          </TableCell>
                          <TableCell sx={{ px: 3, minWidth: 200 }}>
                            {renderDetails(event.details)}
                          </TableCell>
                        </TableRow>
                      ))}

                      <TableEmptyRows
                        height={56}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, sortedEvents.length)}
                      />

                      <TableNoData notFound={!sortedEvents.length && !isLoading} />
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>

              <TablePaginationCustom
                count={sortedEvents.length}
                page={table.page}
                rowsPerPage={table.rowsPerPage}
                onPageChange={table.onChangePage}
                onRowsPerPageChange={table.onChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
