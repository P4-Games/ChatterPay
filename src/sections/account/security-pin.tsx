import { yupResolver } from '@hookform/resolvers/yup'
import LoadingButton from '@mui/lab/LoadingButton'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  resetPin,
  securityStatusSWRKey,
  setPin,
  useSecurityQuestionsCatalog,
  useSecurityStatus
} from 'src/app/api/hooks/use-security'
import { useAuthContext } from 'src/auth/hooks'
import FormProvider, { RHFAutocomplete, RHFCode, RHFTextField } from 'src/components/hook-form'
import { useSnackbar } from 'src/components/snackbar'
import WhatsappCodeButton from 'src/components/whatsapp-code-button'
import { SECURITY_PIN_LENGTH, SECURITY_RECOVERY_QUESTIONS_COUNT } from 'src/config-global'
import { useCountdownSeconds } from 'src/hooks/use-countdown'
import { useTranslate } from 'src/locales'
import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

import type {
  SelectedSecurityQuestion,
  SecurityQuestionAnswerInput,
  SecurityQuestionAnswerMap,
  SecurityQuestionCatalogItem
} from './security-types'

// ----------------------------------------------------------------------

type SetPinFormValues = {
  pin: string
  confirmPin: string
  questions: SelectedSecurityQuestion[]
  answers: SecurityQuestionAnswerMap
}

type ResetPinFormValues = {
  newPin: string
  confirmNewPin: string
  answers: SecurityQuestionAnswerMap
  twoFactorCode: string
}

export default function SecurityPinManagement() {
  const { t } = useTranslate()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { user, generate2faCodeEmail } = useAuthContext()

  const pinLength = SECURITY_PIN_LENGTH
  const recoveryQuestionsCount = SECURITY_RECOVERY_QUESTIONS_COUNT
  const pinRegex = new RegExp(`^\\d{${pinLength}}$`)
  const pinLengthMessage = t('security.pin.validation.exactLength').replace(
    '{length}',
    String(pinLength)
  )
  const pinPlaceholder = t('security.pin.placeholder').replace('{length}', String(pinLength))
  const twoFactorLength = 6
  const twoFactorRegex = new RegExp(`^\\d{${twoFactorLength}}$`)

  const { data: statusResponse } = useSecurityStatus(user?.id)
  const { data: questionsResponse, isLoading: questionsLoading } = useSecurityQuestionsCatalog(
    user?.id
  )

  const status = statusResponse?.ok ? statusResponse.data : null
  const canSetPin = status?.pinStatus === 'not_set'
  const canResetPin = status?.pinStatus !== 'not_set' && status?.recoveryQuestionsSet
  const isBlocked = status?.pinStatus === 'blocked'

  const questionsCatalog: SecurityQuestionCatalogItem[] = questionsResponse?.ok
    ? questionsResponse.data.questions
    : []
  const questionOptions = useMemo(() => questionsCatalog ?? [], [questionsCatalog])

  const questionsHelperText = t('security.recovery.questions-helper').replace(
    '{COUNT}',
    String(recoveryQuestionsCount)
  )
  const selectExactlyMessage = t('security.validation.select-exactly').replace(
    '{COUNT}',
    String(recoveryQuestionsCount)
  )

  const questionSchema = Yup.object({
    questionId: Yup.string().required(),
    text: Yup.string().required()
  })

  const questionsSchema = Yup.array()
    .of(questionSchema)
    .required(selectExactlyMessage)
    .min(recoveryQuestionsCount, selectExactlyMessage)
    .max(recoveryQuestionsCount, selectExactlyMessage)
    .test('unique-questions', t('security.validation.unique-questions'), (value) => {
      const ids = (value ?? []).map((item) => item.questionId)
      return new Set(ids).size === ids.length
    })

  const setPinSchema: Yup.ObjectSchema<SetPinFormValues> = Yup.object({
    pin: Yup.string().matches(pinRegex, pinLengthMessage).required(t('common.required')),
    confirmPin: Yup.string()
      .oneOf([Yup.ref('pin')], t('security.validation.pin-match'))
      .required(t('common.required')),
    questions: questionsSchema,
    answers: Yup.object<SecurityQuestionAnswerMap>().required()
  })

  const resetPinSchema: Yup.ObjectSchema<ResetPinFormValues> = Yup.object({
    newPin: Yup.string().matches(pinRegex, pinLengthMessage).required(t('common.required')),
    confirmNewPin: Yup.string()
      .oneOf([Yup.ref('newPin')], t('security.validation.pin-match'))
      .required(t('common.required')),
    answers: Yup.object<SecurityQuestionAnswerMap>().required(),
    twoFactorCode: Yup.string()
      .matches(twoFactorRegex, t('security.2fa.errors.invalid'))
      .required(t('common.required'))
  })

  const setPinMethods = useForm<SetPinFormValues>({
    resolver: yupResolver(setPinSchema),
    defaultValues: {
      pin: '',
      confirmPin: '',
      questions: [],
      answers: {}
    }
  })

  const resetPinMethods = useForm<ResetPinFormValues>({
    resolver: yupResolver(resetPinSchema),
    defaultValues: {
      newPin: '',
      confirmNewPin: '',
      answers: {},
      twoFactorCode: ''
    }
  })

  const selectedPinQuestions = setPinMethods.watch('questions') ?? []
  const resetAnswers = resetPinMethods.watch('answers') ?? {}
  const resetTwoFactorCode = resetPinMethods.watch('twoFactorCode') ?? ''

  const [resetCodeSent, setResetCodeSent] = useState(false)
  const [resetCodeError, setResetCodeError] = useState('')

  const { counting, countdown, startCountdown, setCountdown } = useCountdownSeconds(60)

  const recoveryQuestionsById = useMemo(() => {
    const map = new Map<string, SecurityQuestionCatalogItem>()
    questionsCatalog.forEach((question) => {
      map.set(question.questionId, question)
    })
    return map
  }, [questionsCatalog])

  const configuredQuestions = useMemo(() => {
    return (status?.recoveryQuestionIds ?? []).map((id) => {
      const question = recoveryQuestionsById.get(id)
      return {
        questionId: id,
        text: question?.text ?? id
      }
    })
  }, [status?.recoveryQuestionIds, recoveryQuestionsById])

  const buildQuestionsPayload = (
    questions: SelectedSecurityQuestion[],
    answers: SecurityQuestionAnswerMap,
    setError: (name: any, error: any) => void
  ): SecurityQuestionAnswerInput[] | null => {
    const missing = questions.filter((question) => !answers?.[question.questionId]?.trim())
    if (missing.length) {
      missing.forEach((question) => {
        setError(`answers.${question.questionId}`, {
          type: 'manual',
          message: t('common.required')
        })
      })
      return null
    }

    return questions.map((question) => ({
      questionId: question.questionId,
      answer: answers[question.questionId].trim()
    }))
  }

  const applyTwoFactorError = (message: string | undefined) => {
    const normalized = (message ?? '').toLowerCase().trim()
    if (normalized.includes('code_expired') || normalized.includes('expired')) {
      resetPinMethods.setError('twoFactorCode', {
        type: 'manual',
        message: t('security.2fa.errors.expired')
      })
      return
    }

    if (
      normalized.includes('invalid_code') ||
      normalized.includes('invalid code') ||
      normalized.includes('missing_2fa_code')
    ) {
      resetPinMethods.setError('twoFactorCode', {
        type: 'manual',
        message: t('login.msg.invalid-code')
      })
    }
  }

  const handleSendResetCode = useCallback(async () => {
    if (!user || !generate2faCodeEmail) return
    try {
      setResetCodeError('')
      startCountdown()
      await generate2faCodeEmail(user.id, user.phoneNumber, t('security.2fa.code-message'))
      setResetCodeSent(true)
      resetPinMethods.setValue('twoFactorCode', '')
      enqueueSnackbar(t('security.2fa.code-sent'), { variant: 'info' })
    } catch {
      setResetCodeError(t('security.2fa.errors.generic'))
    }
  }, [user, generate2faCodeEmail, t, enqueueSnackbar, startCountdown, resetPinMethods])

  const handleSetPinSubmit = setPinMethods.handleSubmit(async (values) => {
    if (!user?.id) return

    const payload = buildQuestionsPayload(values.questions, values.answers, setPinMethods.setError)
    if (!payload) return

    try {
      const response = await setPin(user.id, values.pin, payload)
      if (!response.ok) {
        enqueueSnackbar(t('security.errors.generic'), { variant: 'error' })
        return
      }

      enqueueSnackbar(t('security.messages.pin-set'))
      setPinMethods.reset({ pin: '', confirmPin: '', questions: [], answers: {} })
      await mutate(securityStatusSWRKey(user.id))
      router.push(paths.dashboard.user.security)
    } catch {
      enqueueSnackbar(t('security.errors.generic'), { variant: 'error' })
    }
  })

  const handleResetPinSubmit = resetPinMethods.handleSubmit(async (values) => {
    if (!user?.id) return

    if (!configuredQuestions.length) {
      enqueueSnackbar(t('security.errors.recoveryQuestionsNotSet'), { variant: 'error' })
      return
    }

    if (!resetCodeSent) {
      enqueueSnackbar(t('security.2fa.errors.generic'), { variant: 'error' })
      return
    }

    const payload = buildQuestionsPayload(
      configuredQuestions,
      values.answers,
      resetPinMethods.setError
    )
    if (!payload) return

    try {
      const response = await resetPin(user.id, values.newPin, payload, values.twoFactorCode)
      if (!response.ok) {
        applyTwoFactorError(response.message)
        enqueueSnackbar(t('security.errors.generic'), { variant: 'error' })
        return
      }

      enqueueSnackbar(t('security.messages.pin-reset'))
      resetPinMethods.reset({ newPin: '', confirmNewPin: '', answers: {}, twoFactorCode: '' })
      setResetCodeSent(false)
      setCountdown(60)
      await mutate(securityStatusSWRKey(user.id))
      router.push(paths.dashboard.user.security)
    } catch {
      enqueueSnackbar(t('security.errors.generic'), { variant: 'error' })
    }
  })

  const isResetSubmitDisabled =
    !resetCodeSent ||
    resetTwoFactorCode.length !== twoFactorLength ||
    resetPinMethods.formState.isSubmitting ||
    isBlocked
  const hasAllResetAnswers =
    configuredQuestions.length > 0 &&
    configuredQuestions.every(
      (question) => (resetAnswers?.[question.questionId] ?? '').trim().length > 0
    )
  const pinStateCopy =
    status?.pinStatus === 'not_set' ? t('security.pin.copy.unset') : t('security.pin.copy.set')

  if (!canSetPin && !canResetPin) {
    return (
      <Card>
        <CardContent>
          <Alert severity='info'>{t('security.pin.reset-disabled')}</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          {pinStateCopy}
        </Typography>
        {canSetPin && (
          <FormProvider methods={setPinMethods} onSubmit={handleSetPinSubmit}>
            <Stack spacing={3}>
              <Stack spacing={1.5}>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.pin.label')}
                </Typography>
                <RHFCode
                  name='pin'
                  length={pinLength}
                  TextFieldsProps={{
                    type: 'password',
                    inputProps: { inputMode: 'numeric', pattern: '[0-9]*' },
                    placeholder: pinPlaceholder
                  }}
                />
              </Stack>

              <Stack spacing={1.5}>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.pin.confirm-label')}
                </Typography>
                <RHFCode
                  name='confirmPin'
                  autoFocus={false}
                  length={pinLength}
                  TextFieldsProps={{
                    type: 'password',
                    inputProps: { inputMode: 'numeric', pattern: '[0-9]*' },
                    placeholder: pinPlaceholder
                  }}
                />
              </Stack>

              <Typography variant='body2' color='text.secondary'>
                {t('security.recovery.instructions').replace(
                  '{COUNT}',
                  String(recoveryQuestionsCount)
                )}
              </Typography>

              <RHFAutocomplete
                multiple
                name='questions'
                label={t('security.recovery.questions-label')}
                placeholder={t('security.recovery.questions-placeholder')}
                options={questionOptions}
                getOptionLabel={(option) => (option as SecurityQuestionCatalogItem).text}
                isOptionEqualToValue={(option, value) =>
                  (option as SecurityQuestionCatalogItem).questionId ===
                  (value as SecurityQuestionCatalogItem).questionId
                }
                getOptionDisabled={(option) =>
                  selectedPinQuestions.length >= recoveryQuestionsCount &&
                  !selectedPinQuestions.some(
                    (selected) =>
                      selected.questionId === (option as SecurityQuestionCatalogItem).questionId
                  )
                }
                disabled={!questionOptions.length || questionsLoading || isBlocked}
                helperText={questionsHelperText}
              />

              {selectedPinQuestions.length > 0 && (
                <Box display='grid' gap={2}>
                  {selectedPinQuestions.map((question) => (
                    <RHFTextField
                      key={question.questionId}
                      name={`answers.${question.questionId}`}
                      label={question.text}
                      type='password'
                      disabled={isBlocked}
                    />
                  ))}
                </Box>
              )}

              <Stack direction='row' justifyContent='flex-end'>
                <LoadingButton
                  type='submit'
                  variant='contained'
                  loading={setPinMethods.formState.isSubmitting}
                  disabled={isBlocked}
                >
                  {t('security.actions.set-pin')}
                </LoadingButton>
              </Stack>
            </Stack>
          </FormProvider>
        )}

        {!canSetPin && canResetPin && (
          <FormProvider methods={resetPinMethods} onSubmit={handleResetPinSubmit}>
            <Stack spacing={3}>
              <Stack spacing={2}>
                {configuredQuestions.map((question) => (
                  <RHFTextField
                    key={question.questionId}
                    name={`answers.${question.questionId}`}
                    label={question.text}
                    type='password'
                    disabled={isBlocked}
                  />
                ))}
              </Stack>

              <Stack spacing={2}>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.2fa.description')}
                </Typography>

                {resetCodeError && <Alert severity='error'>{resetCodeError}</Alert>}

                <Stack direction='row' spacing={2} alignItems='center'>
                  <WhatsappCodeButton
                    counting={counting}
                    countdown={countdown}
                    color='primary'
                    disabled={counting || isBlocked || !hasAllResetAnswers}
                    onClick={handleSendResetCode}
                    sendLabel={t('account.email.send-code')}
                    resendLabel={t('account.email.resend-code')}
                  />
                </Stack>

                {resetCodeSent && (
                  <Stack spacing={1.5}>
                    <Alert severity='info'>{t('account.email.code-info')}</Alert>
                    <Typography variant='body2'>{t('security.2fa.codeLabel')}</Typography>
                    <RHFCode name='twoFactorCode' length={twoFactorLength} autoFocus={false} />
                  </Stack>
                )}
              </Stack>

              <Divider />

              <Stack spacing={1.5}>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.pin.new-pin-label')}
                </Typography>
                <RHFCode
                  name='newPin'
                  autoFocus={false}
                  length={pinLength}
                  TextFieldsProps={{
                    type: 'password',
                    inputProps: { inputMode: 'numeric', pattern: '[0-9]*' },
                    placeholder: pinPlaceholder,
                    disabled: isBlocked
                  }}
                />
              </Stack>

              <Stack spacing={1.5}>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.pin.confirm-new-label')}
                </Typography>
                <RHFCode
                  name='confirmNewPin'
                  autoFocus={false}
                  length={pinLength}
                  TextFieldsProps={{
                    type: 'password',
                    inputProps: { inputMode: 'numeric', pattern: '[0-9]*' },
                    placeholder: pinPlaceholder,
                    disabled: isBlocked
                  }}
                />
              </Stack>

              <Stack direction='row' justifyContent='flex-end'>
                <LoadingButton type='submit' variant='contained' disabled={isResetSubmitDisabled}>
                  {t('security.actions.reset-pin')}
                </LoadingButton>
              </Stack>
            </Stack>
          </FormProvider>
        )}
      </CardContent>
    </Card>
  )
}
