import * as Yup from 'yup'
import { useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import CardContent from '@mui/material/CardContent'
import LoadingButton from '@mui/lab/LoadingButton'

import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import { updateContact } from 'src/app/api/hooks/use-contact'
import { useSnackbar } from 'src/components/snackbar'
import FormProvider, { RHFTextField } from 'src/components/hook-form'
import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'

import type { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type ProfileNameFormValues = {
  displayName: string
}

export default function ProfileName() {
  const { t } = useTranslate()
  const { user, updateUser } = useAuthContext()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()

  const schema = Yup.object().shape({
    displayName: Yup.string()
      .trim()
      .required(t('common.required'))
      .min(3, t('common.must-be-min').replace('{MIN_CHARS}', '3'))
  })

  const defaultValues = useMemo(
    () => ({
      displayName: user?.displayName || ''
    }),
    [user?.displayName]
  )

  const methods = useForm<ProfileNameFormValues>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods

  const handleSaveName = handleSubmit(async (values) => {
    if (!user?.id) return
    try {
      const userData: IAccount = {
        id: user.id,
        name: values.displayName,
        email: user.email,
        phone_number: user.phoneNumber,
        photo: user.photoURL,
        wallet: user.wallet,
        walletEOA: user.walletEOA
      }
      await updateContact(user.id, userData)
      updateUser({ ...user, displayName: values.displayName })
      enqueueSnackbar(t('common.msg.update-success'))
      router.push(paths.dashboard.user.profile)
    } catch {
      enqueueSnackbar(t('common.msg.update-error'), { variant: 'error' })
    }
  })

  return (
    <Card>
      <CardContent>
        <FormProvider methods={methods} onSubmit={handleSaveName}>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems='center'>
            <RHFTextField name='displayName' label={t('common.name')} sx={{ flex: 1 }} />
            <LoadingButton type='submit' variant='contained' loading={isSubmitting}>
              {t('common.save')}
            </LoadingButton>
          </Stack>
        </FormProvider>
      </CardContent>
    </Card>
  )
}
