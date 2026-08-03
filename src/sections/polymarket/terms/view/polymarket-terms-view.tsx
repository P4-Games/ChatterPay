'use client'

import ReactMarkdown from 'react-markdown'

import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import Logo from 'src/components/logo'

// ----------------------------------------------------------------------

export type PolymarketTermsData = {
  version: number
  content: string
  effective_date: string
  terms_url: string
}

type Props = {
  data: PolymarketTermsData | null
  error: boolean
}

export default function PolymarketTermsView({ data, error }: Props) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component='header'
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.default',
          borderBottom: 1,
          borderColor: 'divider',
          py: 2
        }}
      >
        <Container
          maxWidth='md'
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: { xs: 3, sm: 4 }
          }}
        >
          <Logo disabledLink sx={{ width: 36, height: 36 }} />
          <Typography
            variant='subtitle1'
            fontWeight={600}
            sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' } }}
          >
            Polymarket Terms of Service
          </Typography>
        </Container>
      </Box>

      <Container maxWidth='md' sx={{ py: 4, px: { xs: 3, sm: 4 } }}>
        {error || !data ? (
          <Alert severity='error' sx={{ mt: 2 }}>
            Could not load terms. Please refresh or visit{' '}
            <a href='https://polymarket.com/terms' target='_blank' rel='noopener noreferrer'>
              polymarket.com/terms
            </a>{' '}
            directly.
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant='body2' color='text.secondary'>
                Version {data.version}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Effective:{' '}
                {/* Explicit locale + timeZone so server and browser render identical text (page copy is English). */}
                {new Date(data.effective_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC'
                })}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box
              sx={{
                '& p': { fontSize: '1rem', lineHeight: 1.75, mb: 2, color: 'text.primary' },
                '& h1': { fontSize: '1.5rem', fontWeight: 700, mt: 4, mb: 1.5 },
                '& h2': { fontSize: '1.25rem', fontWeight: 600, mt: 3, mb: 1.5 },
                '& h3': { fontSize: '1.1rem', fontWeight: 600, mt: 2.5, mb: 1 },
                '& h4, & h5, & h6': { fontWeight: 600, mt: 2, mb: 1 },
                '& ul, & ol': { pl: 3, mb: 2 },
                '& li': { fontSize: '1rem', lineHeight: 1.75, mb: 0.5 },
                '& a': { color: 'primary.main' },
                '& strong': { fontWeight: 600 },
                '& em': { fontStyle: 'italic' },
                '& blockquote': {
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  pl: 2,
                  ml: 0,
                  my: 2,
                  color: 'text.secondary'
                },
                '& code': {
                  fontFamily: 'monospace',
                  bgcolor: 'action.hover',
                  px: 0.5,
                  borderRadius: 0.5,
                  fontSize: '0.875em'
                },
                '& pre': {
                  bgcolor: 'action.hover',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  mb: 2,
                  '& code': { bgcolor: 'transparent', p: 0 }
                },
                '& hr': { my: 3, borderColor: 'divider' }
              }}
            >
              <ReactMarkdown>{data.content}</ReactMarkdown>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ textAlign: 'center', pb: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                To accept these terms, return to WhatsApp and tap &ldquo;Accept Terms&rdquo; in the
                bot message.
              </Typography>
            </Box>
          </>
        )}
      </Container>
    </Box>
  )
}
