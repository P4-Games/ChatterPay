'use client'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { paths } from 'src/routes/paths'

import { useTranslate } from 'src/locales'
import { CONTACT_EMAIL } from 'src/config-global'
// ----------------------------------------------------------------------

export default function TermsView() {
  const { t } = useTranslate()

  return (
    <Container
      sx={{
        pt: 4,
        pb: 4,
        minHeight: '100vh'
      }}
    >
      <Typography variant='h3' align='center' sx={{ mb: 4, fontSize: '2.5rem' }}>
        {t('terms.title')}
      </Typography>

      <Box sx={{ mb: 5, mt: 10 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('terms.introduction.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('terms.introduction.description')}
        </Typography>
      </Box>

      <Box sx={{ mb: 5 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('terms.usage.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('terms.usage.description')}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('terms.security.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('terms.security.description')}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('terms.privacy_policy.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('terms.privacy_policy.description')}{' '}
          <Link href={paths.policy} underline='hover'>
            {t('terms.privacy_policy.link')}
          </Link>
          .
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('terms.modifications.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('terms.modifications.description')}
        </Typography>
      </Box>

      <Box sx={{ mb: 10 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('terms.contact.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('terms.contact.description')}{' '}
          <Link href={`mailto:${CONTACT_EMAIL}`} underline='hover'>
            {CONTACT_EMAIL}
          </Link>
          .
        </Typography>
      </Box>

      <Typography align='center' sx={{ color: 'text.secondary', fontSize: '1rem', mt: 4 }}>
        {t('terms.last_updated')} {t('terms.date')}
      </Typography>
    </Container>
  )
}
