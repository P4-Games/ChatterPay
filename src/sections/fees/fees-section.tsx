import { memo } from 'react'
import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import Divider from '@mui/material/Divider'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'

import { FEES_ANIMATIONS, FEES_VIEWPORT } from './fees-animations'

import type { Theme } from '@mui/material/styles'

import type { LabelColor } from 'src/components/label'

import type { FeeCell, FeeRow, FeeTableSection } from './fees-types'

// ----------------------------------------------------------------------

export const TONE_COLORS: Record<string, LabelColor> = {
  success: 'success',
  warning: 'warning',
  neutral: 'default',
  info: 'info'
}

// Brand marks fill their own tile, so they drop the tinted background.
const BRAND_ICON_SX = { width: 40, height: 40, flexShrink: 0, borderRadius: 1.5, display: 'block' }

// Below `sm` there's rarely room for every column on one line: wrap instead of forcing a scrollbar.
const CELL_WHITE_SPACE_SX = { whiteSpace: { xs: 'normal', sm: 'nowrap' } }

/** The bordered surface every fees block sits on. */
export function feesCardSx(theme: Theme) {
  const isDark = theme.palette.mode === 'dark'

  return {
    boxShadow: 'none',
    borderRadius: 2,
    border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
    bgcolor: isDark ? alpha(theme.palette.grey[900], 0.4) : 'common.white'
  }
}

// ----------------------------------------------------------------------

type CellProps = {
  cell: FeeCell
  label: string
}

/** Renders one cell according to its `kind`; `label` is the already-translated row name. */
function FeeCellContent({ cell, label }: CellProps) {
  const { t } = useTranslate()

  switch (cell.kind) {
    case 'label':
      return (
        <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      )
    case 'amount':
      return (
        <>
          <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
            {cell.value}
          </Typography>
          {cell.note && (
            <Typography variant='caption' component='div' sx={{ color: 'text.secondary' }}>
              {t(`fees.values.${cell.note}`)}
            </Typography>
          )}
        </>
      )
    case 'text':
      return (
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {t(`fees.values.${cell.value}`)}
        </Typography>
      )
    default:
      return (
        <Label variant='soft' color={TONE_COLORS[cell.tone]}>
          {t(`fees.values.${cell.value}`)}
        </Label>
      )
  }
}

// ----------------------------------------------------------------------

type RowProps = {
  row: FeeRow
  rowsKey: string
}

function FeeTableRow({ row, rowsKey }: RowProps) {
  const theme = useTheme()
  const { t } = useTranslate()

  const label = t(`${rowsKey}.${row.id}`)

  return (
    <TableRow
      sx={{
        transition: theme.transitions.create('background-color', { duration: 100 }),
        '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.08) },
        '&:last-of-type td': { border: 0 }
      }}
    >
      {row.cells.map((cell, index) => (
        <TableCell
          key={`${row.id}-${index}`}
          align={index === 0 ? 'left' : 'right'}
          sx={CELL_WHITE_SPACE_SX}
        >
          <FeeCellContent cell={cell} label={label} />
        </TableCell>
      ))}
    </TableRow>
  )
}

// ----------------------------------------------------------------------

type HeadingProps = {
  /** Iconify name; ignored when `iconImage` is set. */
  icon?: string
  iconImage?: string
  title: string
}

/** Mark and title of a fees block. */
export function FeesBlockHeading({ icon, iconImage, title }: HeadingProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const iconBoxSx = {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'primary.main',
    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.12)
  }

  return (
    <Stack direction='row' spacing={1.5} alignItems='center'>
      {iconImage ? (
        <Box component='img' src={iconImage} alt='' sx={BRAND_ICON_SX} />
      ) : (
        <Box sx={iconBoxSx}>
          <Iconify icon={icon || ''} width={22} />
        </Box>
      )}

      <Typography variant='h4' sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Stack>
  )
}

// ----------------------------------------------------------------------

type TableProps = {
  columns: string[]
  rows: FeeRow[]
  /** Translation prefix the row names hang from, without the row id. */
  rowsKey: string
}

/** The fee table, inside the card every block shares. */
export function FeesTable({ columns, rows, rowsKey }: TableProps) {
  const theme = useTheme()
  const { t } = useTranslate()

  return (
    <Card sx={feesCardSx(theme)}>
      <TableContainer sx={{ overflowX: { xs: 'visible', sm: 'auto' } }}>
        <Table size='medium' sx={{ minWidth: { xs: 0, sm: 440 } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.08) }}>
              {columns.map((column, index) => (
                <TableCell
                  key={column}
                  align={index === 0 ? 'left' : 'right'}
                  sx={{
                    ...CELL_WHITE_SPACE_SX,
                    bgcolor: 'transparent',
                    color: 'text.secondary',
                    fontWeight: 600
                  }}
                >
                  {t(`fees.columns.${column}`)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <FeeTableRow key={row.id} row={row} rowsKey={rowsKey} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

// ----------------------------------------------------------------------

type StackedProps = {
  rows: FeeRow[]
  rowsKey: string
}

/**
 * The same rows stacked instead of tabulated: the operation, then what it costs under it.
 * It is what a narrow screen gets, where two columns would leave neither one room enough to
 * print a fee and the sentence that qualifies it without cutting either.
 */
export function FeesStackedRows({ rows, rowsKey }: StackedProps) {
  const theme = useTheme()
  const { t } = useTranslate()

  return (
    <Card sx={feesCardSx(theme)}>
      <Stack divider={<Divider />}>
        {rows.map((row) => {
          const label = t(`${rowsKey}.${row.id}`)

          return (
            <Stack key={row.id} spacing={1} alignItems='flex-start' sx={{ p: 2 }}>
              {row.cells.map((cell, index) => (
                <Box key={`${row.id}-${index}`}>
                  <FeeCellContent cell={cell} label={label} />
                </Box>
              ))}
            </Stack>
          )
        })}
      </Stack>
    </Card>
  )
}

// ----------------------------------------------------------------------

type Props = {
  section: FeeTableSection
}

/** Heading + fee table + optional footnotes for a single fees block. */
function FeesSection({ section }: Props) {
  const { t } = useTranslate()

  return (
    <m.div
      variants={FEES_ANIMATIONS.item}
      initial='hidden'
      whileInView='visible'
      viewport={FEES_VIEWPORT}
    >
      <Stack spacing={2.5} sx={{ mb: { xs: 6, md: 8 } }}>
        <FeesBlockHeading
          icon={section.icon}
          iconImage={section.iconImage}
          title={t(`fees.sections.${section.id}.title`)}
        />

        <FeesTable
          columns={section.columns}
          rows={section.rows}
          rowsKey={`fees.sections.${section.id}.rows`}
        />

        {section.notes?.map((note) => (
          <Typography key={note} variant='body2' sx={{ color: 'text.secondary' }}>
            {t(`fees.sections.${section.id}.notes.${note}`)}
          </Typography>
        ))}
      </Stack>
    </m.div>
  )
}

export default memo(FeesSection)
