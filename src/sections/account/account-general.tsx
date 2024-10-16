import * as Yup from 'yup'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Unstable_Grid2'
import LoadingButton from '@mui/lab/LoadingButton'

import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import { updateContact } from 'src/app/api/_hooks/use-contact'

import { useSnackbar } from 'src/components/snackbar'
import FormProvider, { RHFTextField } from 'src/components/hook-form'

import { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type UserType = {
  displayName: string
  email: string
  photoURL: any
  phoneNumber: string
  wallet?: string
}

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslate()
  const { user, updateUser } = useAuthContext()

  const UpdateUserSchema = Yup.object().shape({
    displayName: Yup.string()
      .trim()
      .required(t('common.required'))
      .min(3, t('common.must-be-min').replace('{MIN_CHARS}', '3')),
    email: Yup.string().required(t('common.required')).email(t('common.must-be-valid-email')),
    photoURL: Yup.mixed<any>().nullable().required(t('common.required')),
    phoneNumber: Yup.string().required(t('common.required')),
    wallet: Yup.string().nullable()
  })

  const defaultValues: UserType = useMemo(
    () => ({
      displayName: user?.displayName || '',
      email: user?.email || '',
      photoURL: user?.photoURL || null,
      phoneNumber: user?.phoneNumber || '',
      wallet: user?.wallet || ''
    }),
    [user?.displayName, user?.email, user?.phoneNumber, user?.photoURL, user?.wallet]
  )

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues
  })

  const {
    getValues,
    handleSubmit,
    formState: { isSubmitting }
  } = methods

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
        wallet: user!.wallet
      }
      await updateContact(user!.id, userData)

      // TODO: Actualizar el contexto (para que se actualice el form)
      updateUser({
        ...user, // Mantiene los campos que no cambian
        displayName: formData.displayName
      })

      console.info('DATA', data)
      enqueueSnackbar(confirmMsg)
    } catch (error) {
      enqueueSnackbar(errorMsg, { variant: 'error' })
    }
  })

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
              <RHFTextField disabled name='email' label={t('common.email-address')} />
              <RHFTextField disabled name='phoneNumber' label={t('common.phone-number')} />
              <RHFTextField disabled name='wallet' label={t('common.wallet')} />
            </Box>

            <Stack spacing={3} alignItems='flex-end' sx={{ mt: 3 }}>
              <LoadingButton type='submit' variant='contained' loading={isSubmitting}>
                {t('account.save')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  )
}
