'use client'

import * as Yup from 'yup'
import { useSnackbar } from 'notistack'
import { useForm } from 'react-hook-form'
import Captcha from 'react-google-recaptcha'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useRef, useState, useEffect, useCallback } from 'react'

import Link from '@mui/material/Link'
import { Alert } from '@mui/material'
import Stack from '@mui/material/Stack'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import LoadingButton from '@mui/lab/LoadingButton'
import FormControl from '@mui/material/FormControl'

import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'
import { useRouter, useSearchParams } from 'src/routes/hooks'

import { useCountdownSeconds } from 'src/hooks/use-countdown'

import { getRecaptchaLng } from 'src/utils/format-number'

import { useAuthContext } from 'src/auth/hooks'
import { useLocales, useTranslate } from 'src/locales'
import { allCountries } from 'src/app/api/_data/_countries'
import { PATH_AFTER_LOGIN, RECAPTCHA_SITE_KEY } from 'src/config-global'

import FormProvider, { RHFCode, RHFTextField } from 'src/components/hook-form'

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { t } = useTranslate()
  const { generate2faCodeLogin, loginWithCode, authenticated } = useAuthContext()
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const { counting, countdown, startCountdown } = useCountdownSeconds(120)
  const [selectedCountry, setSelectedCountry] = useState('54')
  const searchParams = useSearchParams()
  const countryCodes = allCountries
  const returnTo = searchParams.get('returnTo')
  const captchaRef = useRef<Captcha>(null)
  const { currentLang } = useLocales()
  const [language, setLanguage] = useState(getRecaptchaLng(currentLang.value))
  const [recaptchaKey, setRecaptchaKey] = useState(0) // Clave para forzar re-render

  const LoginSchema = Yup.object().shape({
    phone: Yup.string()
      .max(12, t('common.must-be-max').replace('{MAX_DIGITS}', '12'))
      .matches(/^[0-9]+$/, t('common.must-be-numeric'))
      .required(t('common.required')),
    // @ts-ignore
    code: Yup.string().when('codeSent', {
      is: true,
      then: Yup.string()
        .matches(/^[0-9]{6}$/, t('common.must-be-numeric'))
        .required(t('common.required'))
    })
  })

  const defaultValues = {
    phone: '',
    code: ''
  }

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues
  })

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods

  const phone = watch('phone')
  const codeValue = watch('code')
  const { enqueueSnackbar } = useSnackbar()

  const handleSendCode = useCallback(
    async (data: any) => {
      try {
        const recaptchaToken = await captchaRef.current?.executeAsync()

        startCountdown()
        setErrorMsg('')
        setValue('code', '')
        await generate2faCodeLogin?.(
          `${selectedCountry}${data.phone}`,
          t('login.msg.code-bot'),
          recaptchaToken || ''
        )
        enqueueSnackbar(`${t('login.msg.code-sent')} ${phone.toString()}`, { variant: 'info' })
        setCodeSent(true)
      } catch (ex) {
        console.error(ex)
        if (typeof ex === 'string') {
          setErrorMsg(ex)
        } else if (ex.code === 'USER_NOT_FOUND') {
          setErrorMsg(t('login.msg.invalid-user'))
        } else {
          setErrorMsg(ex.error)
        }
      }
    },
    [enqueueSnackbar, generate2faCodeLogin, phone, selectedCountry, setValue, startCountdown, t]
  )

  const onSubmit = handleSubmit(async (data) => {
    try {
      const fullPhoneNumber = `${selectedCountry}${data.phone}`
      const recaptchaToken = await captchaRef.current?.executeAsync()
      await loginWithCode?.(fullPhoneNumber, data.code || '', recaptchaToken || '')
      router.push(returnTo || PATH_AFTER_LOGIN)
      setErrorMsg('')
    } catch (ex) {
      console.error(ex)
      if (typeof ex === 'string') {
        setErrorMsg(ex)
      } else if (ex.code === 'USER_NOT_FOUND') {
        setErrorMsg(t('login.msg.invalid-user'))
      } else if (ex.code === 'AUTH_INVALID_CODE') {
        setErrorMsg(t('login.msg.invalid-code'))
      } else {
        setErrorMsg(ex.error)
      }
    }
  })

  const handleCountryChange = (event: any) => {
    setSelectedCountry(event.target.value)
  }

  // ----------------------------------------------------------------------

  useEffect(() => {
    if (authenticated) {
      router.push(PATH_AFTER_LOGIN)
    } else {
      console.log('not authenticated')
    }
  }, [authenticated, router])

  // Efecto para actualizar el idioma
  useEffect(() => {
    const newLang = getRecaptchaLng(currentLang.value)
    setLanguage(newLang)
    setRecaptchaKey((prevKey) => prevKey + 1) // Cambia la clave para re-renderizar
  }, [currentLang.value])

  // ----------------------------------------------------------------------

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant='h4'>{t('login.title')}</Typography>
      <Stack direction='row' spacing={0.5}>
        <Typography variant='body2'>{t('login.new-user')}</Typography>
        <Link component={RouterLink} href={paths.auth.jwt.register} variant='subtitle2'>
          {t('login.create-account')}
        </Link>
      </Stack>
    </Stack>
  )

  const renderForm = (
    <Stack spacing={2.5}>
      {!codeSent ? (
        <>
          <FormControl fullWidth>
            <InputLabel>{t('common.country')}</InputLabel>
            <Select
              value={selectedCountry}
              onChange={handleCountryChange}
              label={t('common.country')}
            >
              {countryCodes.map((country) => (
                <MenuItem key={country.code} value={country.phone}>
                  {country.label} (+{country.phone})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <RHFTextField
            name='phone'
            label={t('common.phone-number')}
            placeholder='1155557777'
            type='number'
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
          <Alert severity='info' sx={{ mb: 3 }}>
            {t('login.msg.enter-phone')}
          </Alert>
          {errorMsg && <Alert severity='error'>{errorMsg}</Alert>}
          <LoadingButton
            fullWidth
            color='inherit'
            size='large'
            type='button'
            variant='contained'
            loading={isSubmitting}
            disabled={!selectedCountry || !phone || isSubmitting}
            onClick={handleSubmit(handleSendCode)}
          >
            {t('login.send-code')}
          </LoadingButton>
        </>
      ) : (
        <>
          <FormControl fullWidth>
            <InputLabel>{t('common.country')}</InputLabel>
            <Select
              disabled
              value={selectedCountry}
              onChange={handleCountryChange}
              label={t('common.country')}
            >
              {countryCodes.map((country) => (
                <MenuItem key={country.code} value={country.phone}>
                  {country.label} (+{country.phone})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <RHFTextField disabled name='phone' label='Phone Number' type='number' value={phone} />
          <Alert severity='info'>{t('login.msg.code-info')}</Alert>
          <RHFCode name='code' />

          {errorMsg && <Alert severity='error'>{errorMsg}</Alert>}
          <LoadingButton
            fullWidth
            color='inherit'
            size='large'
            type='submit'
            variant='contained'
            loading={isSubmitting}
            disabled={!codeValue || codeValue.length !== 6 || isSubmitting}
          >
            {t('login.login')}
          </LoadingButton>
          <Typography variant='body2' sx={{ textAlign: 'right' }}>
            {`${t('login.dont-have-code')} ${' '}`}
            <Link
              variant='subtitle2'
              onClick={handleSubmit(handleSendCode)}
              sx={{
                cursor: 'pointer',
                ...(counting && {
                  color: 'text.disabled',
                  pointerEvents: 'none'
                })
              }}
            >
              {t('login.resend-code')} {counting && `(${countdown}s)`}
            </Link>
          </Typography>
        </>
      )}
    </Stack>
  )

  const renderRecaptcha = (
    /* @ts-ignore */
    <Captcha
      key={recaptchaKey} // Usar la clave para forzar el re-montaje
      ref={captchaRef}
      sitekey={RECAPTCHA_SITE_KEY}
      badge='bottomright'
      hl={language}
      size='invisible'
    />
  )

  return (
    <>
      {renderHead}
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
        {renderRecaptcha}
      </FormProvider>
    </>
  )
}
