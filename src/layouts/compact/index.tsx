import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'

import BaseLayout from '../baseLayout'
import Header from '../common/header-simple'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function CompactLayout({ children }: Props) {
  return (
    <BaseLayout>
      <Header />

      <Container component='main'>
        <Stack
          sx={{
            py: 12,
            m: 'auto',
            maxWidth: 400,
            minHeight: '100vh',
            textAlign: 'center',
            justifyContent: 'center'
          }}
        >
          {children}
        </Stack>
      </Container>
    </BaseLayout>
  )
}
