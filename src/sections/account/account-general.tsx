import * as Yup from 'yup'
import { useSWRConfig } from 'swr'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LoadingButton from '@mui/lab/LoadingButton'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import { updateContact } from 'src/app/api/hooks/use-contact'
import {
  useReferralByCode,
  referralByCodeSWRKey,
  submitReferralByCode,
  useReferralCodeWithUsageCount
} from 'src/app/api/hooks/use-referral'

import Iconify from 'src/components/iconify/iconify'
import { useSnackbar } from 'src/components/snackbar'
import FormProvider, { RHFTextField } from 'src/components/hook-form'

import { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type UserType = {
  displayName: string
  email: string
  photoURL?: any
  phoneNumber: string
  wallet?: string | null
  referralByCode?: string
}

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslate()
  const { user, updateUser } = useAuthContext()
  const router = useRouter()
  const { mutate } = useSWRConfig()

  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false)

  const { data: referralStats, isLoading: referralStatsLoading } = useReferralCodeWithUsageCount(
    user?.id
  )
  const { data: referralByCodeData, isLoading: referralByCodeLoading } = useReferralByCode(user?.id)

  const saveChangesButtonSx = {
    minHeight: 40,
    px: 2.5,
    whiteSpace: 'nowrap'
  }

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

  const UpdateUserSchema = Yup.object().shape({
    displayName: Yup.string()
      .trim()
      .required(t('common.required'))
      .min(3, t('common.must-be-min').replace('{MIN_CHARS}', '3')),
    email: Yup.string().required(t('common.required')).email(t('common.must-be-valid-email')),
    photoURL: Yup.mixed<any>().nullable().required(t('common.required')),
    phoneNumber: Yup.string().required(t('common.required')),
    wallet: Yup.string().nullable(),
    referralByCode: Yup.string().optional()
  })

  const defaultValues: UserType = useMemo(
    () => ({
      displayName: user?.displayName || '',
      email: user?.email || '',
      photoURL: user?.photoURL || null,
      phoneNumber: user?.phoneNumber || '',
      wallet: user?.wallet || '',
      referralByCode: ''
    }),
    [user?.displayName, user?.email, user?.phoneNumber, user?.photoURL, user?.wallet]
  )

  const methods = useForm<UserType>({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues
  })

  const {
    getValues,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { isSubmitting }
  } = methods

  // ----------------------------------------------------------------------

  const onSubmit = handleSubmit(async (data) => {
    const confirmMsg = t('common.msg.update-success')
    const errorMsg = t('common.msg.update-error')

    try {
      const formData = getValues()
      const userData: IAccount = {
        id: user!.id,
        name: formData.displayName,
        email: user!.email,
        phone_number: user!.phoneNumber,
        photo: user!.photoURL,
        wallet: user!.wallet,
        walletEOA: user!.walletEOA
      }
      await updateContact(user!.id, userData)

      updateUser({
        ...user, // Mantiene los campos que no cambian
        displayName: formData.displayName
      })

      enqueueSnackbar(confirmMsg)
    } catch {
      enqueueSnackbar(errorMsg, { variant: 'error' })
    }
  })

  const handleChangeEmail = () => {
    router.push(paths.dashboard.user.email)
  }

  const handleSubmitReferralByCode = async () => {
    if (!user?.id) return

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

      await mutate(referralByCodeSWRKey(user.id))
    } catch {
      enqueueSnackbar(t('referrals.errors.submit-failed'), { variant: 'error' })
    } finally {
      setIsSubmittingReferral(false)
    }
  }

  const handleCopy = async (value: string) => {
    if (!value || !value.trim()) return
    try {
      await navigator.clipboard.writeText(value)
      enqueueSnackbar(t('common.copied'))
    } catch {
      enqueueSnackbar(t('common.msg.update-error'), { variant: 'error' })
    }
  }

  // ----------------------------------------------------------------------

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
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
              <RHFTextField name='displayName' label={t('common.name')} />
              <RHFTextField disabled name='phoneNumber' label={t('common.phone-number')} />
              <RHFTextField disabled name='wallet' label={t('common.wallet')} />

              <Stack direction='row' spacing={2} alignItems='center'>
                <RHFTextField disabled name='email' label={t('common.email-address')} />
                <Button variant='outlined' color='inherit' onClick={handleChangeEmail}>
                  {t('account.change-email')}
                </Button>
              </Stack>
            </Box>

            <Stack spacing={3} alignItems='flex-end' sx={{ mt: 3 }}>
              <LoadingButton
                type='submit'
                variant='contained'
                loading={isSubmitting}
                sx={saveChangesButtonSx}
              >
                {t('common.save')}
              </LoadingButton>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={1.5}>
              <Typography variant='h6'>{t('referrals.title')}</Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 0.5, sm: 2 }}
                alignItems={{ sm: 'center' }}
                justifyContent='space-between'
              >
                <Typography variant='body2' color='text.secondary'>
                  {t('referrals.my-code')}
                </Typography>

                <Stack direction='row' spacing={1} alignItems='center' sx={{ minWidth: 0 }}>
                  <Typography variant='body1' sx={{ wordBreak: 'break-all' }}>
                    {referralStatsLoading
                      ? '...'
                      : referralStats?.referralCode || t('common.nodata')}
                  </Typography>

                  {!!(referralStats?.referralCode || '').trim() && (
                    <IconButton
                      size='small'
                      onClick={() => handleCopy(referralStats!.referralCode)}
                      aria-label='Copy referral code'
                    >
                      <Iconify icon='eva:copy-fill' width={18} />
                    </IconButton>
                  )}
                </Stack>
              </Stack>

              <Typography variant='body2' color='text.secondary'>
                {t('referrals.usage-count').replace(
                  '{COUNT}',
                  String(referralStats?.referredUsersCount ?? 0)
                )}
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 0.5, sm: 2 }}
                alignItems={{ sm: 'center' }}
                justifyContent='space-between'
              >
                <Typography variant='body2' color='text.secondary'>
                  {t('referrals.referred-by')}
                </Typography>

                <Stack direction='row' spacing={1} alignItems='center' sx={{ minWidth: 0 }}>
                  <Typography variant='body1' sx={{ wordBreak: 'break-all' }}>
                    {referralByCodeLoading
                      ? '...'
                      : referralByCodeData?.referralByCode || t('referrals.not-set')}
                  </Typography>

                  {!!(referralByCodeData?.referralByCode || '').trim() && (
                    <IconButton
                      size='small'
                      onClick={() => handleCopy(referralByCodeData!.referralByCode)}
                      aria-label='Copy referred by code'
                    >
                      <Iconify icon='eva:copy-fill' width={18} />
                    </IconButton>
                  )}
                </Stack>
              </Stack>

              {!referralByCodeLoading && !(referralByCodeData?.referralByCode || '').trim() && (
                <Stack direction='row' spacing={2} alignItems='center'>
                  <RHFTextField
                    name='referralByCode'
                    label={t('referrals.input-label')}
                    placeholder={t('referrals.input-placeholder')}
                    size='small'
                    inputProps={{ maxLength: 10 }}
                    sx={{ flex: 1, minWidth: 0 }}
                  />
                  <LoadingButton
                    type='button'
                    variant='contained'
                    loading={isSubmittingReferral}
                    onClick={handleSubmitReferralByCode}
                    sx={saveChangesButtonSx}
                  >
                    {t('common.save')}
                  </LoadingButton>
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  )
}
