import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMemo, useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useCountdownSeconds } from 'src/hooks/use-countdown'

import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'

import { useSnackbar } from 'src/components/snackbar'
import FormProvider, { RHFCode, RHFTextField } from 'src/components/hook-form'
import WhatsappCodeButton from 'src/components/whatsapp-code-button'

import type { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type ApiError = {
  code?: string
  error?: string
}

const getApiError = (ex: unknown): ApiError => {
  if (typeof ex !== 'object' || ex === null) {
    return {}
  }

  if ('response' in ex) {
    const response = (ex as { response?: { data?: ApiError } }).response
    return response?.data ?? {}
  }

  if ('code' in ex || 'error' in ex) {
    return ex as ApiError
  }

  return {}
}

export default function ChangeEmail() {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslate()
  const { generate2faCodeEmail, updateEmail, updateUser, user } = useAuthContext()
  const router = useRouter()

  const [codeSent, setCodeSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [contextUser, setContextUser] = useState<IAccount | null>(null)

  const { counting, countdown, startCountdown } = useCountdownSeconds(60)

  const ChangeEmailSchema = Yup.object().shape({
    newEmail: Yup.string().email(t('common.must-be-valid-email')).required(t('common.required')),
    confirmEmail: Yup.string()
      .oneOf([Yup.ref('newEmail')], t('common.emails-must-match'))
      .required(t('common.required')),
    // @ts-expect-error "error-expected"
    code: Yup.string().when('codeSent', {
      is: true,
      then: Yup.string()
        .matches(/^[0-9]{6}$/, t('common.must-be-numeric'))
        .required(t('common.required'))
    })
  })

  const defaultValues = useMemo(
    () => ({
      oldEmail: user?.email || '',
      newEmail: '',
      confirmEmail: '',
      code: ''
    }),
    [user?.email]
  )

  const methods = useForm({
    resolver: yupResolver(ChangeEmailSchema),
    defaultValues
  })

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid }
  } = methods

  const newEmail = watch('newEmail')
  const confirmEmail = watch('confirmEmail')
  const codeValue = watch('code')

  // ----------------------------------------------------------------------

  // guardar el telefono en estado, por cambios en el contexdto del user
  useEffect(() => {
    if (!user) return
    // @ts-expect-error "error-expected"
    setContextUser(user)
  }, [user])

  const handleSendCode = useCallback(async () => {
    try {
      startCountdown()
      setErrorMsg('')

      await generate2faCodeEmail?.(
        contextUser!.id,
        // @ts-expect-error "error-expected"
        contextUser!.phoneNumber,
        t('account.email.code-bot')
      )

      setCodeSent(true)
      setValue('code', '')
      enqueueSnackbar(`${t('account.email.code-sent')} ${contextUser}`, {
        variant: 'info'
      })
    } catch (ex) {
      console.error(ex)
      if (typeof ex === 'string') {
        setErrorMsg(ex)
        return
      }

      const apiError = getApiError(ex)

      if (apiError.code === 'USER_NOT_FOUND') {
        setErrorMsg(t('login.msg.invalid-user'))
        return
      }

      setErrorMsg(apiError.error || t('common.msg.unexpected-error'))
    }
  }, [startCountdown, contextUser, generate2faCodeEmail, t, setValue, enqueueSnackbar])

  const handleCancel = () => {
    router.push(paths.dashboard.user.root)
  }

  const onSubmit = async (data: any) => {
    try {
      // @ts-expect-error "error-expected"
      await updateEmail?.(contextUser!.phoneNumber, data.code || '', confirmEmail, contextUser!.id)
      if (user) {
        updateUser({ ...user, email: confirmEmail })
      }
      router.push(paths.dashboard.user.profile)
      setErrorMsg('')
      enqueueSnackbar(t('common.msg.update-success'))
    } catch (ex) {
      console.error(ex)
      if (typeof ex === 'string') {
        setErrorMsg(ex)
        return
      }

      const apiError = getApiError(ex)

      if (apiError.code === 'USER_NOT_FOUND') {
        setErrorMsg(t('login.msg.invalid-user'))
        return
      }

      if (apiError.code === 'INVALID_CODE') {
        setErrorMsg(t('login.msg.invalid-code'))
        return
      }

      setErrorMsg(apiError.error || t('common.msg.unexpected-error'))
    }
  }

  const isSendCodeDisabled = !newEmail || !confirmEmail || newEmail !== confirmEmail || counting
  const isSaveDisabled = !codeSent || !codeValue || codeValue.length !== 6 || !isValid

  // ----------------------------------------------------------------------

  const renderForm = (
    <Grid container spacing={3}>
      <Grid xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Box
            rowGap={3}
            columnGap={2}
            display='grid'
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)'
            }}
          >
            <RHFTextField type='email' disabled name='oldEmail' label={t('account.email.old')} />
            <RHFTextField type='email' name='newEmail' label={t('account.email.new')} />
            <RHFTextField type='email' name='confirmEmail' label={t('account.email.new2')} />

            {codeSent && (
              <>
                <Alert severity='info'>{t('account.email.code-info')}</Alert>
                <RHFCode name='code' TextFieldsProps={{ type: 'password' }} />
              </>
            )}

            {errorMsg && <Alert severity='error'>{errorMsg}</Alert>}

            <Typography variant='body2' color='text.secondary'>
              {t('security.2fa.description')}
            </Typography>

            <Stack direction='row' spacing={2} alignItems='center'>
              <WhatsappCodeButton
                counting={counting}
                countdown={countdown}
                color='primary'
                disabled={isSendCodeDisabled}
                onClick={handleSendCode}
                sendLabel={t('account.email.send-code')}
                resendLabel={t('account.email.resend-code')}
              />
            </Stack>
          </Box>

          <Stack spacing={2} direction='row' justifyContent='flex-end' sx={{ mt: 3 }}>
            <Button variant='outlined' color='inherit' onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <LoadingButton
              type='submit'
              variant='contained'
              loading={isSubmitting}
              disabled={isSaveDisabled}
            >
              {t('common.save')}
            </LoadingButton>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  )

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {renderForm}
    </FormProvider>
  )
}
