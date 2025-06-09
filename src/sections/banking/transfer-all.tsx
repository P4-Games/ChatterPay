import * as Yup from 'yup'
import { isAddress } from 'ethers'
import { Trans } from 'react-i18next'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Unstable_Grid2'
import LoadingButton from '@mui/lab/LoadingButton'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import { NETWORK_NAME } from 'src/config-global'
import { transferAll } from 'src/app/api/hooks/use-wallet'

import { useSnackbar } from 'src/components/snackbar'
import FormProvider, { RHFTextField } from 'src/components/hook-form'

// ----------------------------------------------------------------------

export default function TransferAll() {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslate()
  const { user } = useAuthContext()
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')

  const TransferAllSchema = Yup.object().shape({
    wallet: Yup.string()
      .required(t('common.required'))
      .test('is-eth-address', t('common.msg.invalid-wallet'), (value) => isAddress(value ?? ''))
  })

  const defaultValues = useMemo(
    () => ({
      wallet: ''
    }),
    []
  )

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(TransferAllSchema),
    defaultValues
  })

  const {
    handleSubmit,
    formState: { isSubmitting, isValid }
  } = methods

  // ----------------------------------------------------------------------

  const handleCancel = () => {
    router.push(paths.dashboard.root)
  }

  const onSubmit = async (data: any) => {
    try {
      const walletTo = data.wallet.startsWith('0x') ? data.wallet : `0x${data.wallet}`
      if (!isAddress(walletTo)) {
        setErrorMsg(t('common.msg.invalid-wallet'))
        return
      }
      await transferAll(user!.id, { walletTo })
      router.push(paths.dashboard.root)
      setErrorMsg('')
      enqueueSnackbar(t('transfer-all.msgs.ok'))
    } catch (ex) {
      console.error(ex)
      setErrorMsg(t('transfer-all.msgs.error'))
    }
  }

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
            <Alert severity='warning'>
              <Trans
                i18nKey='transfer-all.warning'
                components={{ bold: <strong /> }}
                values={{ NETWORK: NETWORK_NAME }}
              />
            </Alert>
            <Alert severity='info'>{t('transfer-all.info')}</Alert>
            <RHFTextField
              type='wallet'
              name='wallet'
              label={t('common.wallet')}
              inputProps={{ maxLength: 42 }}
            />
            {errorMsg && <Alert severity='error'>{errorMsg}</Alert>}
          </Box>
          <Stack spacing={2} direction='row' justifyContent='flex-end' sx={{ mt: 3 }}>
            <Button variant='outlined' color='inherit' onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <LoadingButton
              type='submit'
              variant='contained'
              loading={isSubmitting}
              disabled={!isValid}
            >
              {t('transfer-all.actions.transfer')}
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
