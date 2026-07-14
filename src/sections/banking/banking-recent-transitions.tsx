import { useState } from 'react'

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TableRow from '@mui/material/TableRow'
import { Skeleton } from '@mui/material'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import CardHeader from '@mui/material/CardHeader'
import Card, { type CardProps } from '@mui/material/Card'
import TableContainer from '@mui/material/TableContainer'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'
import Scrollbar from 'src/components/scrollbar'
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom
} from 'src/components/table'

import BankingRecentTransitionsRow from './banking-recent-transitions-row'

import type { ITransaction } from 'src/types/wallet'

// ----------------------------------------------------------------------

const EMPTY_TOKEN_LOGOS: Record<string, string> = {}

interface Props extends CardProps {
  title?: string
  subheader?: string
  isLoading: boolean
  tableData: ITransaction[]
  tableLabels: any
  userWallet: string
  tokenLogos?: Record<string, string>
  hideValues?: boolean
}

export default function BankingRecentTransitions({
  title,
  subheader,
  tableLabels,
  isLoading,
  tableData,
  userWallet,
  tokenLogos = EMPTY_TOKEN_LOGOS,
  hideValues = false,
  ...other
}: Props) {
  const mdUp = useResponsive('up', 'md')
  const { t } = useTranslate()
  const table = useTable()

  // Cap how many rows we mount at once — the history can be very long and
  // rendering every row is the main source of memory pressure on this page.
  const [showAll, setShowAll] = useState(false)
  const MAX_VISIBLE = 20
  const visibleData = showAll ? tableData : (tableData || []).slice(0, MAX_VISIBLE)
  const hasMore = (tableData?.length || 0) > MAX_VISIBLE

  const denseHeight = table.dense ? 56 : 56 + 20
  const notFound = !tableData || !tableData.length

  // ----------------------------------------------------------------------

  const renderTitle = (
    <CardHeader title={title} subheader={subheader} sx={{ mb: 2, px: 3, pt: 3, pb: 0 }} />
  )

  const renderConent = (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: mdUp ? 720 : 300 }}>
          {mdUp && <TableHeadCustom headLabel={tableLabels} sx={{ '& th': { px: 3 } }} />}

          <TableBody>
            {!notFound &&
              visibleData.map((row) => (
                <BankingRecentTransitionsRow
                  key={row.id}
                  userWallet={userWallet}
                  row={row}
                  mdUp={mdUp}
                  hideValues={hideValues}
                  tokenLogos={tokenLogos}
                />
              ))}

            <TableEmptyRows
              height={denseHeight}
              emptyRows={emptyRows(
                table.page,
                table.rowsPerPage,
                (tableData && tableData.length) || 0
              )}
            />

            <TableNoData notFound={notFound} />
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  )

  const renderContentSkeleton = (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: mdUp ? 720 : 300 }}>
          {mdUp && <TableHeadCustom headLabel={tableLabels} sx={{ '& th': { px: 3 } }} />}

          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell sx={{ pl: 3, py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Skeleton variant='circular' width={48} height={48} sx={{ mr: 2 }} />
                    <Skeleton variant='text' width={160} />
                  </Box>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Skeleton variant='text' width={100} />
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Skeleton variant='text' width={140} />
                </TableCell>

                <TableCell align='right' sx={{ pr: 3, py: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 1
                    }}
                  >
                    <Skeleton variant='circular' width={32} height={32} />
                    <Skeleton variant='circular' width={32} height={32} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  )
  const renderActions = hasMore && (
    <Box sx={{ p: 2, textAlign: 'right' }}>
      <Button
        size='small'
        color='inherit'
        onClick={() => setShowAll((prev) => !prev)}
        endIcon={
          <Iconify
            icon={showAll ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            width={18}
            sx={{ ml: -0.5 }}
          />
        }
      >
        {showAll ? t('transactions.table-view-less') : t('transactions.table-view-all')}
      </Button>
    </Box>
  )

  return (
    <Card {...other}>
      {renderTitle}

      {isLoading ? renderContentSkeleton : renderConent}

      {hasMore && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {renderActions}
        </>
      )}
    </Card>
  )
}
