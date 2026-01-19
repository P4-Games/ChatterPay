import { yupResolver } from '@hookform/resolvers/yup'
import LoadingButton from '@mui/lab/LoadingButton'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  resetPin,
  securityStatusSWRKey,
  setPin,
  setRecoveryQuestions,
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
import { fDateTime, fToNow } from 'src/utils/format-time'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

import type {
  SelectedSecurityQuestion,
  SecurityQuestionAnswerInput,
  SecurityQuestionAnswerMap,
  SecurityQuestionCatalogItem
} from './security-types'

// ----------------------------------------------------------------------

type RecoveryQuestionsFormValues = {
  questions: SelectedSecurityQuestion[]
  answers: SecurityQuestionAnswerMap
  twoFactorCode: string
}

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

// ----------------------------------------------------------------------

type BlockedCountdownProps = {
  blockedUntil: Date
  onUnlock: VoidFunction
  labelNow: string
  labelUnlockAt: string
  labelRemaining: string
  labelTryAgain: string
}

const formatRemainingTime = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function BlockedCountdown({
  blockedUntil,
  onUnlock,
  labelNow,
  labelUnlockAt,
  labelRemaining,
  labelTryAgain
}: BlockedCountdownProps) {
  const [now, setNow] = useState(new Date())
  const [remainingMs, setRemainingMs] = useState(Math.max(0, blockedUntil.getTime() - Date.now()))

  useEffect(() => {
    let triggered = false
    let intervalId: ReturnType<typeof setInterval> | null = null
    const tick = () => {
      const current = new Date()
      const remaining = Math.max(0, blockedUntil.getTime() - current.getTime())
      setNow(current)
      setRemainingMs(remaining)

      if (remaining <= 0 && !triggered) {
        triggered = true
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
        onUnlock()
      }
    }

    tick()
    intervalId = setInterval(tick, 1000)
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [blockedUntil, onUnlock])

  return (
    <Alert severity='warning'>
      <Stack spacing={1}>
        <Typography variant='subtitle2'>{labelTryAgain}</Typography>
        <Stack direction='row' justifyContent='space-between'>
          <Typography variant='body2' color='text.secondary'>
            {labelNow}
          </Typography>
          <Typography variant='body2'>{fDateTime(now)}</Typography>
        </Stack>
        <Stack direction='row' justifyContent='space-between'>
          <Typography variant='body2' color='text.secondary'>
            {labelUnlockAt}
          </Typography>
          <Typography variant='body2'>{fDateTime(blockedUntil)}</Typography>
        </Stack>
        <Stack direction='row' justifyContent='space-between'>
          <Typography variant='body2' color='text.secondary'>
            {labelRemaining}
          </Typography>
          <Typography variant='body2'>{formatRemainingTime(remainingMs)}</Typography>
        </Stack>
      </Stack>
    </Alert>
  )
}

// ----------------------------------------------------------------------

export default function Security() {
  const { t } = useTranslate()
  const { enqueueSnackbar } = useSnackbar()
  const { mutate } = useSWRConfig()
  const { user, generate2faCodeEmail } = useAuthContext()

  const userId = user?.id
  const recoveryQuestionsCount = SECURITY_RECOVERY_QUESTIONS_COUNT
  const pinLength = SECURITY_PIN_LENGTH
  const twoFactorLength = 6

  const { data: statusResponse, isLoading: statusLoading } = useSecurityStatus(userId)
  const { data: questionsResponse, isLoading: questionsLoading } =
    useSecurityQuestionsCatalog(userId)

  const status = statusResponse?.ok ? statusResponse.data : null
  const questionsCatalog: SecurityQuestionCatalogItem[] = questionsResponse?.ok
    ? questionsResponse.data.questions
    : []

  const blockedUntil = status?.blockedUntil ? new Date(status.blockedUntil) : null
  const isBlocked = status?.pinStatus === 'blocked' && blockedUntil
  const isBlockedActive = status?.pinStatus === 'blocked'

  const canSetPin = status?.pinStatus === 'not_set'
  const canResetPin = status?.recoveryQuestionsSet
  const [recoveryCodeSent, setRecoveryCodeSent] = useState(false)
  const [resetCodeSent, setResetCodeSent] = useState(false)
  const [recoveryCodeError, setRecoveryCodeError] = useState('')
  const [resetCodeError, setResetCodeError] = useState('')

  const {
    counting: recoveryCounting,
    countdown: recoveryCountdown,
    startCountdown: startRecoveryCountdown,
    setCountdown: setRecoveryCountdown
  } = useCountdownSeconds(60)

  const {
    counting: resetCounting,
    countdown: resetCountdown,
    startCountdown: startResetCountdown,
    setCountdown: setResetCountdown
  } = useCountdownSeconds(60)

  const pinLengthMessage = t('security.pin.validation.exactLength').replace(
    '{length}',
    String(pinLength)
  )
  const pinRegex = new RegExp(`^\\d{${pinLength}}$`)
  const twoFactorRegex = new RegExp(`^\\d{${twoFactorLength}}$`)
  const pinPlaceholder = t('security.pin.placeholder').replace('{length}', String(pinLength))

  const securityErrorMessage = (message?: string) => {
    const normalized = (message ?? '').toLowerCase().trim()
    if (!normalized) return t('security.errors.generic')

    if (normalized.includes('invalid_code') || normalized.includes('invalid code'))
      return t('login.msg.invalid-code')
    if (normalized.includes('code_expired') || normalized.includes('expired'))
      return t('security.2fa.errors.expired')
    if (normalized.includes('missing_2fa_code') || normalized.includes('missing 2fa'))
      return t('login.msg.invalid-code')

    if (normalized.includes('pin already set')) return t('security.errors.pinAlreadySet')
    if (normalized.includes('recovery answers are incorrect'))
      return t('security.errors.incorrectRecoveryAnswers')
    if (normalized.includes('question ids must be unique'))
      return t('security.errors.questionsMustBeUnique')
    if (normalized.includes('recovery questions not set'))
      return t('security.errors.recoveryQuestionsNotSet')
    if (normalized.includes('pin must be exactly')) {
      const matchedCount = normalized.match(/\d+/)
      const length = matchedCount ? Number.parseInt(matchedCount[0], 10) : pinLength
      return t('security.pin.validation.exactLength').replace('{length}', String(length))
    }

    if (normalized.includes('exactly') && normalized.includes('recovery questions')) {
      const matchedCount = normalized.match(/\d+/)
      const count = matchedCount ? Number.parseInt(matchedCount[0], 10) : recoveryQuestionsCount
      return t('security.errors.exactlyNQuestionsRequired').replace('{COUNT}', String(count))
    }

    if (normalized.includes('incorrect')) return t('security.errors.incorrectRecoveryAnswers')

    return t('security.errors.generic')
  }

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

  const recoverySchema: Yup.ObjectSchema<RecoveryQuestionsFormValues> = Yup.object({
    questions: questionsSchema,
    answers: Yup.object<SecurityQuestionAnswerMap>().required(),
    twoFactorCode: Yup.string()
      .matches(twoFactorRegex, t('security.2fa.errors.invalid'))
      .required(t('common.required'))
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

  const recoveryMethods = useForm<RecoveryQuestionsFormValues>({
    resolver: yupResolver(recoverySchema),
    defaultValues: {
      questions: [],
      answers: {},
      twoFactorCode: ''
    }
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

  const selectedRecoveryQuestions = recoveryMethods.watch('questions') ?? []
  const selectedPinQuestions = setPinMethods.watch('questions') ?? []
  const recoveryTwoFactorCode = recoveryMethods.watch('twoFactorCode') ?? ''
  const resetTwoFactorCode = resetPinMethods.watch('twoFactorCode') ?? ''
  const isRecoverySubmitDisabled =
    !recoveryCodeSent ||
    recoveryTwoFactorCode.length !== twoFactorLength ||
    recoveryMethods.formState.isSubmitting
  const isResetSubmitDisabled =
    !resetCodeSent ||
    resetTwoFactorCode.length !== twoFactorLength ||
    resetPinMethods.formState.isSubmitting ||
    isBlockedActive

  const handleUnlockRefresh = useCallback(() => {
    if (!userId) return
    void mutate(securityStatusSWRKey(userId))
  }, [mutate, userId])

  const recoveryQuestionsById = useMemo(() => {
    const map = new Map<string, SecurityQuestionCatalogItem>()
    questionOptions.forEach((question) => {
      map.set(question.questionId, question)
    })
    return map
  }, [questionOptions])

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

  const applyTwoFactorError = (
    message: string | undefined,
    setError: (name: any, error: any) => void
  ) => {
    const normalized = (message ?? '').toLowerCase().trim()
    if (normalized.includes('code_expired') || normalized.includes('expired')) {
      setError('twoFactorCode', {
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
      setError('twoFactorCode', {
        type: 'manual',
        message: t('login.msg.invalid-code')
      })
    }
  }

  const handleSendRecoveryCode = useCallback(async () => {
    if (!user || !generate2faCodeEmail) return
    try {
      setRecoveryCodeError('')
      startRecoveryCountdown()
      await generate2faCodeEmail(user.id, user.phoneNumber, t('security.2fa.code-message'))
      setRecoveryCodeSent(true)
      recoveryMethods.setValue('twoFactorCode', '')
      enqueueSnackbar(t('security.2fa.code-sent'), { variant: 'info' })
    } catch (ex: any) {
      if (ex?.code === 'USER_NOT_FOUND') {
        setRecoveryCodeError(t('security.2fa.errors.generic'))
      } else {
        setRecoveryCodeError(t('security.2fa.errors.generic'))
      }
    }
  }, [user, generate2faCodeEmail, t, enqueueSnackbar, startRecoveryCountdown, recoveryMethods])

  const handleSendResetCode = useCallback(async () => {
    if (!user || !generate2faCodeEmail) return
    try {
      setResetCodeError('')
      startResetCountdown()
      await generate2faCodeEmail(user.id, user.phoneNumber, t('security.2fa.code-message'))
      setResetCodeSent(true)
      resetPinMethods.setValue('twoFactorCode', '')
      enqueueSnackbar(t('security.2fa.code-sent'), { variant: 'info' })
    } catch (ex: any) {
      if (ex?.code === 'USER_NOT_FOUND') {
        setResetCodeError(t('security.2fa.errors.generic'))
      } else {
        setResetCodeError(t('security.2fa.errors.generic'))
      }
    }
  }, [user, generate2faCodeEmail, t, enqueueSnackbar, startResetCountdown, resetPinMethods])

  const handleRecoverySubmit = recoveryMethods.handleSubmit(async (values) => {
    if (!userId) return
    if (!recoveryCodeSent) {
      enqueueSnackbar(t('security.2fa.errors.generic'), { variant: 'error' })
      return
    }

    const payload = buildQuestionsPayload(
      values.questions,
      values.answers,
      recoveryMethods.setError
    )
    if (!payload) return

    try {
      const response = await setRecoveryQuestions(userId, payload, values.twoFactorCode)
      if (!response.ok) {
        applyTwoFactorError(response.message, recoveryMethods.setError)
        enqueueSnackbar(securityErrorMessage(response.message), { variant: 'error' })
        return
      }

      enqueueSnackbar(t('security.messages.recovery-updated'))
      recoveryMethods.reset({ questions: [], answers: {}, twoFactorCode: '' })
      setRecoveryCodeSent(false)
      setRecoveryCountdown(60)
      await mutate(securityStatusSWRKey(userId))
    } catch {
      enqueueSnackbar(t('security.errors.generic'), { variant: 'error' })
    }
  })

  const handleSetPinSubmit = setPinMethods.handleSubmit(async (values) => {
    if (!userId) return

    const payload = buildQuestionsPayload(values.questions, values.answers, setPinMethods.setError)
    if (!payload) return

    try {
      const response = await setPin(userId, values.pin, payload)
      if (!response.ok) {
        enqueueSnackbar(securityErrorMessage(response.message), { variant: 'error' })
        return
      }

      enqueueSnackbar(t('security.messages.pin-set'))
      setPinMethods.reset({ pin: '', confirmPin: '', questions: [], answers: {} })
      await mutate(securityStatusSWRKey(userId))
    } catch {
      enqueueSnackbar(t('security.errors.generic'), { variant: 'error' })
    }
  })

  const handleResetPinSubmit = resetPinMethods.handleSubmit(async (values) => {
    if (!userId) return

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
      const response = await resetPin(userId, values.newPin, payload, values.twoFactorCode)
      if (!response.ok) {
        applyTwoFactorError(response.message, resetPinMethods.setError)
        enqueueSnackbar(securityErrorMessage(response.message), { variant: 'error' })
        return
      }

      enqueueSnackbar(t('security.messages.pin-reset'))
      resetPinMethods.reset({ newPin: '', confirmNewPin: '', answers: {}, twoFactorCode: '' })
      setResetCodeSent(false)
      setResetCountdown(60)
      await mutate(securityStatusSWRKey(userId))
    } catch {
      enqueueSnackbar(t('security.errors.generic'), { variant: 'error' })
    }
  })

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title={t('security.status.title')}
          subheader={t('security.status.description')}
        />
        <CardContent>
          {statusLoading && <Typography>{t('security.status.loading')}</Typography>}

          {!statusLoading && statusResponse && !statusResponse.ok && (
            <Alert severity='error'>{securityErrorMessage(statusResponse.message)}</Alert>
          )}

          {!statusLoading && status && (
            <Stack spacing={2}>
              <Stack direction='row' alignItems='center' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.status.labels.pin-status')}
                </Typography>
                <Chip
                  size='small'
                  label={t(`security.status.statuses.${status.pinStatus}`)}
                  color={status.pinStatus === 'active' ? 'success' : 'default'}
                />
              </Stack>

              <Stack direction='row' alignItems='center' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.status.labels.failed-attempts')}
                </Typography>
                <Typography variant='body2'>{status.failedAttempts}</Typography>
              </Stack>

              <Stack direction='row' alignItems='center' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.status.labels.blocked-until')}
                </Typography>
                <Typography variant='body2'>
                  {status.blockedUntil
                    ? `${fDateTime(status.blockedUntil)} (${fToNow(status.blockedUntil)})`
                    : t('common.nodata')}
                </Typography>
              </Stack>

              <Stack direction='row' alignItems='center' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.status.labels.last-set')}
                </Typography>
                <Typography variant='body2'>
                  {status.lastSetAt ? fDateTime(status.lastSetAt) : t('common.nodata')}
                </Typography>
              </Stack>

              <Stack direction='row' alignItems='center' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.status.labels.reset-required')}
                </Typography>
                <Typography variant='body2'>
                  {status.resetRequired ? t('common.yes') : t('common.no')}
                </Typography>
              </Stack>

              <Stack direction='row' alignItems='center' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.status.labels.recovery-set')}
                </Typography>
                <Typography variant='body2'>
                  {status.recoveryQuestionsSet ? t('common.yes') : t('common.no')}
                </Typography>
              </Stack>

              {status.recoveryQuestionsSet && (
                <Stack spacing={1}>
                  <Typography variant='body2' color='text.secondary'>
                    {t('security.status.labels.recovery-questions')}
                  </Typography>
                  <Stack direction='row' spacing={1} flexWrap='wrap'>
                    {(status.recoveryQuestionIds ?? []).length ? (
                      status.recoveryQuestionIds.map((id) => {
                        const match = recoveryQuestionsById.get(id)
                        return (
                          <Chip
                            key={id}
                            size='small'
                            variant='outlined'
                            label={match?.text ?? id}
                          />
                        )
                      })
                    ) : (
                      <Typography variant='body2'>{t('common.nodata')}</Typography>
                    )}
                  </Stack>
                </Stack>
              )}

              {isBlocked && (
                <BlockedCountdown
                  blockedUntil={blockedUntil!}
                  onUnlock={handleUnlockRefresh}
                  labelNow={t('security.blocked.now')}
                  labelUnlockAt={t('security.blocked.unlockAt')}
                  labelRemaining={t('security.blocked.remaining')}
                  labelTryAgain={t('security.blocked.tryAgainAfter')}
                />
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                {status.pinStatus === 'not_set' && (
                  <Button variant='contained' href='#security-set-pin'>
                    {t('security.actions.set-pin')}
                  </Button>
                )}
                {status.resetRequired && (
                  <Button variant='outlined' href='#security-reset-pin'>
                    {t('security.actions.reset-pin')}
                  </Button>
                )}
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={t('security.recovery.title')}
          subheader={t('security.recovery.description')}
        />
        <CardContent>
          {!questionsLoading && questionsResponse && !questionsResponse.ok && (
            <Alert severity='error'>{securityErrorMessage(questionsResponse.message)}</Alert>
          )}

          <FormProvider methods={recoveryMethods} onSubmit={handleRecoverySubmit}>
            <Stack spacing={3}>
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
                  selectedRecoveryQuestions.length >= recoveryQuestionsCount &&
                  !selectedRecoveryQuestions.some(
                    (selected) =>
                      selected.questionId === (option as SecurityQuestionCatalogItem).questionId
                  )
                }
                disabled={!questionOptions.length || questionsLoading}
                helperText={questionsHelperText}
              />

              {selectedRecoveryQuestions.length > 0 && (
                <Box display='grid' gap={2}>
                  {selectedRecoveryQuestions.map((question) => (
                    <RHFTextField
                      key={question.questionId}
                      name={`answers.${question.questionId}`}
                      label={question.text}
                      type='password'
                    />
                  ))}
                </Box>
              )}

              <Stack spacing={2}>
                <Typography variant='body2' color='text.secondary'>
                  {t('security.2fa.description')}
                </Typography>

                {recoveryCodeError && <Alert severity='error'>{recoveryCodeError}</Alert>}

                <Stack direction='row' spacing={2} alignItems='center'>
                  <WhatsappCodeButton
                    counting={recoveryCounting}
                    countdown={recoveryCountdown}
                    color='primary'
                    disabled={recoveryCounting}
                    onClick={handleSendRecoveryCode}
                    sendLabel={t('account.email.send-code')}
                    resendLabel={t('account.email.resend-code')}
                  />
                </Stack>

                {recoveryCodeSent && (
                  <Stack spacing={1.5}>
                    <Typography variant='body2'>{t('security.2fa.codeLabel')}</Typography>
                    <RHFCode name='twoFactorCode' length={twoFactorLength} autoFocus={false} />
                  </Stack>
                )}
              </Stack>

              <Stack direction='row' justifyContent='flex-end'>
                <LoadingButton
                  type='submit'
                  variant='contained'
                  loading={recoveryMethods.formState.isSubmitting}
                  disabled={isRecoverySubmitDisabled}
                >
                  {t('security.actions.save-questions')}
                </LoadingButton>
              </Stack>
            </Stack>
          </FormProvider>
        </CardContent>
      </Card>

      <Card id='security-set-pin'>
        <CardHeader title={t('security.pin.title')} subheader={t('security.pin.description')} />
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant='subtitle1'>{t('security.pin.set-title')}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {t('security.pin.set-description')}
              </Typography>
            </Box>

            {!canSetPin && <Alert severity='info'>{t('security.pin.set-disabled')}</Alert>}

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
                  disabled={
                    !questionOptions.length || questionsLoading || !canSetPin || isBlockedActive
                  }
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
                        disabled={!canSetPin || isBlockedActive}
                      />
                    ))}
                  </Box>
                )}

                <Stack direction='row' justifyContent='flex-end'>
                  <LoadingButton
                    type='submit'
                    variant='contained'
                    loading={setPinMethods.formState.isSubmitting}
                    disabled={!canSetPin || isBlockedActive}
                  >
                    {t('security.actions.set-pin')}
                  </LoadingButton>
                </Stack>
              </Stack>
            </FormProvider>
          </Stack>
        </CardContent>
      </Card>

      <Card id='security-reset-pin'>
        <CardHeader
          title={t('security.pin.reset-title')}
          subheader={t('security.pin.reset-description')}
        />
        <CardContent>
          {!canResetPin && <Alert severity='info'>{t('security.pin.reset-disabled')}</Alert>}

          {canResetPin && (
            <FormProvider methods={resetPinMethods} onSubmit={handleResetPinSubmit}>
              <Stack spacing={3}>
                <Divider />

                <Stack spacing={2}>
                  {configuredQuestions.map((question) => (
                    <RHFTextField
                      key={question.questionId}
                      name={`answers.${question.questionId}`}
                      label={question.text}
                      type='password'
                      disabled={isBlockedActive}
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
                      counting={resetCounting}
                      countdown={resetCountdown}
                      color='primary'
                      disabled={resetCounting || isBlockedActive}
                      onClick={handleSendResetCode}
                      sendLabel={t('account.email.send-code')}
                      resendLabel={t('account.email.resend-code')}
                    />
                  </Stack>

                  {resetCodeSent && (
                    <Stack spacing={1.5}>
                      <Typography variant='body2'>{t('security.2fa.codeLabel')}</Typography>
                      <RHFCode name='twoFactorCode' length={twoFactorLength} autoFocus={false} />
                    </Stack>
                  )}
                </Stack>

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
                      disabled: isBlockedActive
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
                      disabled: isBlockedActive
                    }}
                  />
                </Stack>

                <Stack direction='row' justifyContent='flex-end'>
                  <LoadingButton
                    type='submit'
                    variant='contained'
                    loading={resetPinMethods.formState.isSubmitting}
                    disabled={isResetSubmitDisabled}
                  >
                    {t('security.actions.reset-pin')}
                  </LoadingButton>
                </Stack>
              </Stack>
            </FormProvider>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
