import { memo } from 'react'
import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
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

import type { LabelColor } from 'src/components/label'

import type { FeeCell, FeeRow, FeeSection } from './fees-types'

// ----------------------------------------------------------------------

const TONE_COLORS: Record<string, LabelColor> = {
  success: 'success',
  warning: 'warning',
  neutral: 'default',
  info: 'info'
}

// Brand marks fill their own tile, so they drop the tinted background.
const BRAND_ICON_SX = { width: 40, height: 40, flexShrink: 0, borderRadius: 1.5, display: 'block' }

type CellProps = {
  cell: FeeCell
  label: string
  logo?: string
}

/** Renders one cell according to its `kind`; `label` is the already-translated row name. */
function FeeCellContent({ cell, label, logo }: CellProps) {
  const { t } = useTranslate()

  switch (cell.kind) {
    case 'label':
      return (
        <Stack direction='row' spacing={1} alignItems='center'>
          {logo && (
            <Box
              component='img'
              src={logo}
              alt=''
              loading='lazy'
              sx={{ width: 22, height: 22, borderRadius: '50%' }}
            />
          )}
          <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
        </Stack>
      )
    case 'amount':
      return (
        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
          {cell.value}
        </Typography>
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
  sectionId: string
}

function FeeTableRow({ row, sectionId }: RowProps) {
  const theme = useTheme()
  const { t } = useTranslate()

  const label = t(`fees.sections.${sectionId}.rows.${row.id}`)

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
          sx={{ whiteSpace: 'nowrap' }}
        >
          <FeeCellContent cell={cell} label={label} logo={row.logo} />
        </TableCell>
      ))}
    </TableRow>
  )
}

// ----------------------------------------------------------------------

type Props = {
  section: FeeSection
  /** Extra content rendered under the table, before the footnotes. */
  footer?: React.ReactNode
}

/** Heading + fee table + optional footnotes for a single fees block. */
function FeesSection({ section, footer }: Props) {
  const theme = useTheme()
  const { t } = useTranslate()
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

  const sectionIcon = section.iconImage ? (
    <Box component='img' src={section.iconImage} alt='' sx={BRAND_ICON_SX} />
  ) : (
    <Box sx={iconBoxSx}>
      <Iconify icon={section.icon || ''} width={22} />
    </Box>
  )

  return (
    <m.div
      variants={FEES_ANIMATIONS.item}
      initial='hidden'
      whileInView='visible'
      viewport={FEES_VIEWPORT}
    >
      <Stack spacing={2.5} sx={{ mb: { xs: 6, md: 8 } }}>
        <Stack direction='row' spacing={1.5} alignItems='center'>
          {sectionIcon}

          <Typography variant='h4' sx={{ fontWeight: 700 }}>
            {t(`fees.sections.${section.id}.title`)}
          </Typography>
        </Stack>

        <Card
          sx={{
            boxShadow: 'none',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
            bgcolor: isDark ? alpha(theme.palette.grey[900], 0.4) : 'common.white'
          }}
        >
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size='medium' sx={{ minWidth: 440 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.08) }}>
                  {section.columns.map((column, index) => (
                    <TableCell
                      key={column}
                      align={index === 0 ? 'left' : 'right'}
                      sx={{
                        bgcolor: 'transparent',
                        whiteSpace: 'nowrap',
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
                {section.rows.map((row) => (
                  <FeeTableRow key={row.id} row={row} sectionId={section.id} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {footer}

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
