'use client'

import * as Yup from 'yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import InputAdornment from '@mui/material/InputAdornment'

import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'
import { useRouter, useSearchParams } from 'src/routes/hooks'

import { useBoolean } from 'src/hooks/use-boolean'

import { useAuthContext } from 'src/auth/hooks'
import { PATH_AFTER_LOGIN } from 'src/config-global'

import Iconify from 'src/components/iconify'
import FormProvider, { RHFTextField } from 'src/components/hook-form'

// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const { register } = useAuthContext()

  const router = useRouter()

  const [errorMsg, setErrorMsg] = useState('')

  const searchParams = useSearchParams()

  const returnTo = searchParams.get('returnTo')

  const password = useBoolean()

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required')
  })

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      await register?.(data.email, data.password, data.firstName, data.lastName)

      router.push(returnTo || PATH_AFTER_LOGIN)
    } catch (error) {
      console.error(error)
      reset()
      setErrorMsg(typeof error === 'string' ? error : error.message)
    }
  })

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant='h4'>Get started</Typography>

      <Stack direction='row' spacing={0.5}>
        <Typography variant='body2'> Already have an account? </Typography>

        <Link href={paths.auth.jwt.login} component={RouterLink} variant='subtitle2'>
          Sign in
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
      {'By signing up, I agree to '}
      <Link underline='always' color='text.primary'>
        Terms of Service
      </Link>
      {' and '}
      <Link underline='always' color='text.primary'>
        Privacy Policy
      </Link>
      .
    </Typography>
  )

  const renderForm = (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFTextField name='firstName' label='First name' />
        <RHFTextField name='lastName' label='Last name' />
      </Stack>

      <RHFTextField name='email' label='Email address' />

      <RHFTextField
        name='password'
        label='Password'
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton onClick={password.onToggle} edge='end'>
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <LoadingButton
        fullWidth
        color='inherit'
        size='large'
        type='submit'
        variant='contained'
        loading={isSubmitting}
      >
        Create account
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
