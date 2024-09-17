import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { Theme, SxProps } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

import EmptyContent from '../empty-content'

// ----------------------------------------------------------------------

type Props = {
  notFound: boolean
  sx?: SxProps<Theme>
}

export default function TableNoData({ notFound, sx }: Props) {
  const { t } = useTranslate()

  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={12}>
          <EmptyContent
            filled
            title={t('common.nodata')}
            sx={{
              py: 10,
              ...sx
            }}
          />
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  )
}
