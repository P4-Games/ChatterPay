'use client'

import * as Yup from 'yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { Select, MenuItem } from '@mui/material'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'
import { RouterLink } from 'src/routes/components'

import { useTranslate } from 'src/locales'
import { BOT_WAPP_URL } from 'src/config-global'
import { allCountries } from 'src/app/api/_data/_countries'

import FormProvider, { RHFTextField } from 'src/components/hook-form'

// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const { t } = useTranslate()
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')

  const [selectedCountry, setSelectedCountry] = useState('54')
  const countryCodes = allCountries

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required(t('common.required')),
    lastName: Yup.string().required(t('common.required')),
    email: Yup.string().required(t('common.required')).email(t('common.must-be-valid-email')),
    telephone: Yup.string().required(t('common.required'))
  })

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    telephone: ''
  }

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues
  })

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods

  const handleCountryChange = (event: any) => {
    setSelectedCountry(event.target.value)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      const registerUrl = BOT_WAPP_URL.replaceAll('MESSAGE', t('register.wapp-msg'))
      router.push(registerUrl)
    } catch (error) {
      console.error(error.message)
      reset()
      setErrorMsg(typeof error === 'string' ? error : error.message)
    }
  })

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant='h4'>{t('register.get-started')}</Typography>

      <Stack direction='row' spacing={0.5}>
        <Typography variant='body2'> {t('register.already-account')}</Typography>

        <Link href={paths.auth.jwt.login} component={RouterLink} variant='subtitle2'>
          {t('register.sign-in')}
        </Link>
      </Stack>
    </Stack>
  )

  const renderTerms = (
    <Typography
      component='div'
      sx={{
        mt: 2.5,
        textAlign: 'center',
        typography: 'caption',
        color: 'text.secondary'
      }}
    >
      {t('register.by-signing')} {` `}
      <Link underline='always' color='text.primary' href={paths.terms}>
        {t('register.terms-of-service')}
      </Link>
      {` `}
      {t('register.and')}
      {` `}
      <Link underline='always' color='text.primary' href={paths.policy}>
        {t('register.privacy-policy')}
      </Link>
      .
    </Typography>
  )

  const renderForm = (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFTextField name='firstName' label={t('common.first-name')} />
        <RHFTextField name='lastName' label={t('common.last-name')} />
      </Stack>

      <RHFTextField name='email' label={t('common.email-address')} />

      <Select value={selectedCountry} onChange={handleCountryChange} label={t('common.country')}>
        {countryCodes.map((country) => (
          <MenuItem key={country.code} value={country.phone}>
            {country.label} (+{country.phone})
          </MenuItem>
        ))}
      </Select>

      <RHFTextField
        name='telephone'
        label={t('common.phone-number')}
        placeholder='1155557777'
        type='number'
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      />

      <LoadingButton
        fullWidth
        color='inherit'
        size='large'
        type='submit'
        variant='contained'
        loading={isSubmitting}
      >
        {t('register.create-account')}
      </LoadingButton>
    </Stack>
  )

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity='error' sx={{ m: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>

      {renderTerms}
    </>
  )
}
