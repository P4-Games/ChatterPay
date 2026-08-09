'use client'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'
import { CONTACT_EMAIL } from 'src/config-global'

// ----------------------------------------------------------------------

export default function PolicyView() {
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
        {t('policy.title')}
      </Typography>

      <Box sx={{ mb: 5, mt: 10 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('policy.introduction.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('policy.introduction.description')}
        </Typography>
      </Box>

      <Box sx={{ mb: 5 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('policy.data_collection.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('policy.data_collection.description')}
        </Typography>
      </Box>

      <Box sx={{ mb: 5 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('policy.data_usage.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('policy.data_usage.description')}
        </Typography>
      </Box>

      <Box sx={{ mb: 5 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('policy.third_party.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('policy.third_party.description')}
        </Typography>
      </Box>

      <Box sx={{ mb: 5 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('policy.security.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('policy.security.description')}
        </Typography>
      </Box>

      <Box sx={{ mb: 5 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('policy.modifications.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('policy.modifications.description')}
        </Typography>
      </Box>

      <Box sx={{ mb: 10 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: '1.25rem' }}>
          {t('policy.contact.title')}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
          {t('policy.contact.description')}{' '}
          <Link href={`mailto:${CONTACT_EMAIL}`} underline='hover'>
            {CONTACT_EMAIL}
          </Link>
          .
        </Typography>
      </Box>

      <Typography align='center' sx={{ color: 'text.secondary', fontSize: '1rem', mt: 4 }}>
        {t('policy.last_updated')} {t('policy.date')}
      </Typography>
    </Container>
  )
}
