import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Unstable_Grid2'

import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'

import { useSnackbar } from 'src/components/snackbar'
import FormProvider, { RHFTextField } from 'src/components/hook-form'

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
  const { user } = useAuthContext()

  const UpdateUserSchema = Yup.object().shape({
    displayName: Yup.string().required(t('common.required')),
    email: Yup.string().required(t('common.required')).email(t('common.must-be-valid-email')),
    photoURL: Yup.mixed<any>().nullable().required(t('common.required')),
    phoneNumber: Yup.string().required(t('common.required')),
    wallet: Yup.string().nullable()
  })

  const defaultValues: UserType = {
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || null,
    phoneNumber: user?.phoneNumber || '',
    wallet: user?.wallet || ''
  }

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues
  })

  const { handleSubmit } = methods

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      enqueueSnackbar('Update success!')
    } catch (error) {
      console.error(error)
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
              <RHFTextField disabled name='displayName' label={t('common.name')} />
              <RHFTextField disabled name='email' label={t('common.email-address')} />
              <RHFTextField disabled name='phoneNumber' label={t('common.phone-number')} />
              <RHFTextField disabled name='wallet' label={t('common.wallet')} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  )
}
