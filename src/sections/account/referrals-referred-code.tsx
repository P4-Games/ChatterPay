import { useState } from 'react'
import { useSWRConfig } from 'swr'
import { useForm } from 'react-hook-form'

import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import CardContent from '@mui/material/CardContent'
import LoadingButton from '@mui/lab/LoadingButton'

import { useTranslate } from 'src/locales'
import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'
import { useAuthContext } from 'src/auth/hooks'
import { useSnackbar } from 'src/components/snackbar'
import FormProvider, { RHFTextField } from 'src/components/hook-form'
import {
  useReferralByCode,
  referralByCodeSWRKey,
  submitReferralByCode
} from 'src/app/api/hooks/use-referral'

// ----------------------------------------------------------------------

type ReferredCodeFormValues = {
  referralByCode: string
}

export default function ReferralsReferredCode() {
  const { t } = useTranslate()
  const router = useRouter()
  const { user } = useAuthContext()
  const { enqueueSnackbar } = useSnackbar()
  const { mutate } = useSWRConfig()
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false)

  const { data: referralByCodeData, isLoading: referralByCodeLoading } = useReferralByCode(user?.id)
  const isAlreadySet = !!(referralByCodeData?.referralByCode || '').trim()

  const methods = useForm<ReferredCodeFormValues>({
    defaultValues: { referralByCode: '' }
  })

  const {
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { isSubmitting }
  } = methods

  const getReferralSubmitErrorMessage = (backendMessage?: string) => {
    const msg = (backendMessage ?? '').trim().toLowerCase()
    if (!msg) return t('referrals.errors.submit-failed')

    if (msg.includes('referrer referral code not found'))
      return t('referrals.errors.referrer-not-found')
    if (msg.includes('referral_by_code already set')) return t('referrals.errors.already-set')
    if (msg.includes('self-referral')) return t('referrals.errors.self-referral')
    if (msg.includes('user not found')) return t('referrals.errors.user-not-found')

    return t('referrals.errors.submit-failed')
  }

  const handleSubmitReferralByCode = async () => {
    if (!user?.id || isAlreadySet) return

    const code = String(getValues('referralByCode') ?? '').trim()
    if (!code) {
      setError('referralByCode', { type: 'manual', message: t('common.required') })
      return
    }

    clearErrors('referralByCode')

    setIsSubmittingReferral(true)
    try {
      const res = await submitReferralByCode(user.id, code)
      if (!res.ok) {
        enqueueSnackbar(getReferralSubmitErrorMessage(res.message), { variant: 'error' })
        return
      }

      enqueueSnackbar(t('referrals.messages.saved'))
      setValue('referralByCode', '')
      clearErrors('referralByCode')

      await mutate(referralByCodeSWRKey(user.id), { referralByCode: code }, false)
      router.push(paths.dashboard.user.referrals)
    } catch {
      enqueueSnackbar(t('referrals.errors.submit-failed'), { variant: 'error' })
    } finally {
      setIsSubmittingReferral(false)
    }
  }

  return (
    <Card>
      <CardContent>
        {isAlreadySet && <Alert severity='info'>{t('referrals.errors.already-set')}</Alert>}

        {!isAlreadySet && (
          <FormProvider methods={methods} onSubmit={(event) => event.preventDefault()}>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems='center'>
              <RHFTextField
                name='referralByCode'
                label={t('referrals.input-label')}
                placeholder={t('referrals.input-placeholder')}
                size='small'
                inputProps={{ maxLength: 10 }}
                sx={{ flex: 1, minWidth: 0, maxWidth: 280 }}
                disabled={referralByCodeLoading}
              />
              <LoadingButton
                type='button'
                variant='contained'
                loading={isSubmittingReferral || isSubmitting}
                onClick={handleSubmitReferralByCode}
              >
                {t('common.save')}
              </LoadingButton>
            </Stack>
          </FormProvider>
        )}
      </CardContent>
    </Card>
  )
}
