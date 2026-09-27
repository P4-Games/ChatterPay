'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

import Iconify from 'src/components/iconify'

import { useTranslate } from 'src/locales'

import { useStakingStyles } from './staking-style'

import type { StakingMode } from './use-staking-mode'

// ----------------------------------------------------------------------

type ChipColor = 'default' | 'success' | 'warning' | 'error' | 'info'

/**
 * Building blocks shared by the staking and governance pages.
 *
 * They take already translated text: which key applies depends on the wallet's state, and that decision
 * belongs to the view that knows the state. The card geometry comes from `useStakingStyles`, the same
 * source the history, actions and delegation cards use, so every card on both pages has one border and
 * one padding.
 */

// ----------------------------------------------------------------------

/** The switch between the summary and the detailed layout. */
export function StakingModeToggle({
  mode,
  onChange
}: {
  mode: StakingMode
  onChange: (mode: StakingMode) => void
}): JSX.Element {
  const { t } = useTranslate()

  return (
    <ToggleButtonGroup
      exclusive
      size='small'
      value={mode}
      onChange={(_, value: StakingMode | null) => value && onChange(value)}
      aria-label={t('staking.mode.label')}
      data-testid='staking-mode'
      sx={{
        p: 0.5,
        borderRadius: 99,
        bgcolor: 'background.neutral',
        '& .MuiToggleButtonGroup-grouped': { border: 0, borderRadius: '99px !important' },
        '& .MuiToggleButton-root': {
          px: 2.5,
          py: 0.5,
          color: 'text.secondary',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem'
        },
        '& .Mui-selected': {
          bgcolor: 'background.paper !important',
          color: 'text.primary !important',
          boxShadow: (theme) => theme.shadows[1]
        }
      }}
    >
      <ToggleButton value='simple'>{t('staking.mode.simple')}</ToggleButton>
      <ToggleButton value='advanced'>{t('staking.mode.advanced')}</ToggleButton>
    </ToggleButtonGroup>
  )
}

/** One headline figure, with what it means under it. */
export function MetricCard({
  title,
  value,
  description,
  status,
  statusColor = 'success',
  headerAction,
  action,
  tooltip,
  testId
}: {
  title: string
  value: string
  description?: ReactNode
  status?: string
  statusColor?: ChipColor
  /** A control in the top-right corner. Takes the place of the status chip when both are given. */
  headerAction?: ReactNode
  action?: ReactNode
  tooltip?: string
  testId?: string
}): JSX.Element {
  const { card, heading } = useStakingStyles()

  return (
    <Card sx={{ ...card, height: '100%' }} data-testid={testId}>
      <Stack spacing={1.25} sx={{ height: '100%' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1}>
          <Stack direction='row' alignItems='center' spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography variant='subtitle2' sx={{ color: 'text.secondary' }} noWrap>
              {title}
            </Typography>
            {tooltip ? <InfoTip title={tooltip} /> : null}
          </Stack>
          {headerAction ? (
            <Box sx={{ flexShrink: 0 }}>{headerAction}</Box>
          ) : status ? (
            <Chip
              label={status}
              color={statusColor}
              size='small'
              variant='outlined'
              sx={{ height: 24, fontSize: '0.75rem', flexShrink: 0 }}
            />
          ) : null}
        </Stack>

        <Typography
          sx={{
            color: heading,
            fontSize: { xs: 22, sm: 26 },
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.24px',
            fontVariantNumeric: 'tabular-nums',
            wordBreak: 'break-word'
          }}
        >
          {value}
        </Typography>

        {description ? (
          <Typography variant='body2' sx={{ color: 'text.secondary', flexGrow: 1 }}>
            {description}
          </Typography>
        ) : (
          <Box sx={{ flexGrow: 1 }} />
        )}

        {action ? <Box>{action}</Box> : null}
      </Stack>
    </Card>
  )
}

/** A titled card holding controls. */
export function ActionPanel({
  title,
  children
}: {
  title: string
  children: ReactNode
}): JSX.Element {
  const { card } = useStakingStyles()

  return (
    <Card sx={card}>
      <Typography variant='subtitle2' sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Card>
  )
}

/** Explanatory copy, set apart from the figures by the info colour. */
export function NoticeCard({ title, body }: { title: string; body: ReactNode }): JSX.Element {
  const { card } = useStakingStyles()

  return (
    <Card
      sx={{
        ...card,
        bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
        borderColor: (theme) => alpha(theme.palette.info.main, 0.24)
      }}
    >
      <Stack direction='row' spacing={1.5} alignItems='flex-start'>
        <Iconify
          icon='eva:info-outline'
          width={20}
          sx={{ color: 'info.main', flexShrink: 0, mt: 0.25 }}
        />
        <Box>
          <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {body}
          </Typography>
        </Box>
      </Stack>
    </Card>
  )
}

type KeyValueRow = { label: string; value: ReactNode; tooltip?: string }

/**
 * Labelled values, one per row, with the value right-aligned.
 *
 * With `columns={2}` the rows split in half from `md` up, the first half on the left, so a panel that
 * spans the page does not stretch each label and its value to opposite edges. Below `md` the halves
 * stack in order.
 */
export function KeyValuePanel({
  title,
  rows,
  chip,
  columns = 1,
  headerAction,
  footer,
  testId
}: {
  title: string
  rows: KeyValueRow[]
  chip?: ReactNode
  columns?: 1 | 2
  /** Controls in the top-right corner. The chip then moves next to the title. */
  headerAction?: ReactNode
  /** Rendered under the rows, when the panel has anything to add there. */
  footer?: ReactNode
  testId?: string
}): JSX.Element {
  const { card } = useStakingStyles()

  const half = Math.ceil(rows.length / 2)
  const groups = columns === 2 ? [rows.slice(0, half), rows.slice(half)] : [rows]

  const renderRows = (group: KeyValueRow[]): JSX.Element => (
    <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
      {group.map((row) => (
        <Stack
          key={row.label}
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          spacing={2}
          sx={{ py: 1.25 }}
        >
          <Stack direction='row' spacing={0.75} alignItems='center' sx={{ minWidth: 0 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {row.label}
            </Typography>
            {row.tooltip ? <InfoTip title={row.tooltip} /> : null}
          </Stack>
          <Typography
            component='div'
            variant='body2'
            sx={{
              fontWeight: 600,
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
              minWidth: 0
            }}
          >
            {row.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )

  return (
    <Card sx={{ ...card, height: '100%' }} data-testid={testId}>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        spacing={1}
        sx={{ mb: 1 }}
      >
        {headerAction ? (
          <>
            <Stack direction='row' alignItems='center' spacing={1} sx={{ minWidth: 0 }}>
              <Typography variant='subtitle2'>{title}</Typography>
              {chip}
            </Stack>
            {headerAction}
          </>
        ) : (
          <>
            <Typography variant='subtitle2'>{title}</Typography>
            {chip}
          </>
        )}
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: `repeat(${groups.length}, minmax(0, 1fr))` },
          columnGap: 4
        }}
      >
        {groups.map((group, index) => (
          <Box key={index}>{renderRows(group)}</Box>
        ))}
      </Box>
      {footer ? <Box sx={{ mt: 2 }}>{footer}</Box> : null}
    </Card>
  )
}

/**
 * An info icon that explains its neighbour.
 *
 * `enterTouchDelay` is zero because a phone has no hover: without it the explanation needs a long press
 * nobody knows to make.
 */
export function InfoTip({ title }: { title: string }): JSX.Element {
  return (
    <Tooltip title={title} arrow enterTouchDelay={0}>
      <Iconify
        icon='eva:info-outline'
        width={16}
        sx={{ color: 'text.disabled', cursor: 'help', flexShrink: 0 }}
      />
    </Tooltip>
  )
}
