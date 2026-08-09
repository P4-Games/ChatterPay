import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Container from '@mui/material/Container'

// ----------------------------------------------------------------------

const SKELETON_ROWS = [100, 95, 88, 100, 72, 90, 85, 100, 60, 92, 78, 95].map((width, i) => ({
  id: `row-${i}`,
  width
}))

export default function Loading() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', py: 2 }}>
        <Container
          maxWidth='md'
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: { xs: 3, sm: 4 }
          }}
        >
          <Skeleton variant='circular' width={36} height={36} />
          <Skeleton width={240} height={24} />
        </Container>
      </Box>

      <Container maxWidth='md' sx={{ py: 4, px: { xs: 3, sm: 4 } }}>
        <Skeleton width={120} height={20} sx={{ mb: 0.5 }} />
        <Skeleton width={180} height={20} sx={{ mb: 3 }} />
        <Skeleton width='100%' height={1} sx={{ mb: 3 }} />
        {SKELETON_ROWS.map((row) => (
          <Skeleton key={row.id} width={`${row.width}%`} height={20} sx={{ mb: 1 }} />
        ))}
      </Container>
    </Box>
  )
}
