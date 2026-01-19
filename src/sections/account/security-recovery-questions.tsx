import { yupResolver } from '@hookform/resolvers/yup'
import LoadingButton from '@mui/lab/LoadingButton'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  securityStatusSWRKey,
  setRecoveryQuestions,
  useSecurityQuestionsCatalog
} from 'src/app/api/hooks/use-security'
import { useAuthContext } from 'src/auth/hooks'
import FormProvider, { RHFAutocomplete, RHFCode, RHFTextField } from 'src/components/hook-form'
import { useSnackbar } from 'src/components/snackbar'
import WhatsappCodeButton from 'src/components/whatsapp-code-button'
import { SECURITY_RECOVERY_QUESTIONS_COUNT } from 'src/config-global'
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

type RecoveryQuestionsFormValues = {
  questions: SelectedSecurityQuestion[]
  answers: SecurityQuestionAnswerMap
  twoFactorCode: string
}

export default function SecurityRecoveryQuestions() {
  const { t } = useTranslate()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { user, generate2faCodeEmail } = useAuthContext()

  const recoveryQuestionsCount = SECURITY_RECOVERY_QUESTIONS_COUNT
  const twoFactorLength = 6
  const twoFactorRegex = new RegExp(`^\\d{${twoFactorLength}}$`)

  const { data: questionsResponse, isLoading: questionsLoading } = useSecurityQuestionsCatalog(
    user?.id
  )

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

  const recoverySchema: Yup.ObjectSchema<RecoveryQuestionsFormValues> = Yup.object({
    questions: questionsSchema,
    answers: Yup.object<SecurityQuestionAnswerMap>().required(),
    twoFactorCode: Yup.string()
      .matches(twoFactorRegex, t('security.2fa.errors.invalid'))
      .required(t('common.required'))
  })

  const methods = useForm<RecoveryQuestionsFormValues>({
    resolver: yupResolver(recoverySchema),
    mode: 'onChange',
    defaultValues: {
      questions: [],
      answers: {},
      twoFactorCode: ''
    }
  })

  const selectedQuestions = methods.watch('questions') ?? []
  const answers = methods.watch('answers') ?? {}
  const twoFactorCode = methods.watch('twoFactorCode') ?? ''

  const [codeSent, setCodeSent] = useState(false)
  const [codeError, setCodeError] = useState('')

  const { counting, countdown, startCountdown, setCountdown } = useCountdownSeconds(60)

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
      methods.setError('twoFactorCode', {
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
      methods.setError('twoFactorCode', {
        type: 'manual',
        message: t('login.msg.invalid-code')
      })
    }
  }

  const handleSendCode = useCallback(async () => {
    if (!user || !generate2faCodeEmail) return
    try {
      setCodeError('')
      startCountdown()
      await generate2faCodeEmail(user.id, user.phoneNumber, t('security.2fa.code-message'))
      setCodeSent(true)
      methods.setValue('twoFactorCode', '')
      enqueueSnackbar(t('security.2fa.code-sent'), { variant: 'info' })
    } catch {
      setCodeError(t('security.2fa.errors.generic'))
    }
  }, [user, generate2faCodeEmail, t, enqueueSnackbar, startCountdown, methods])

  const handleSubmit = methods.handleSubmit(async (values) => {
    if (!user?.id) return
    if (!codeSent) {
      enqueueSnackbar(t('security.2fa.errors.generic'), { variant: 'error' })
      return
    }

    const payload = buildQuestionsPayload(values.questions, values.answers, methods.setError)
    if (!payload) return

    try {
      const response = await setRecoveryQuestions(user.id, payload, values.twoFactorCode)
      if (!response.ok) {
        applyTwoFactorError(response.message)
        enqueueSnackbar(t('security.errors.generic'), { variant: 'error' })
        return
      }

      enqueueSnackbar(t('security.messages.recovery-updated'))
      methods.reset({ questions: [], answers: {}, twoFactorCode: '' })
      setCodeSent(false)
      setCountdown(60)
      await mutate(securityStatusSWRKey(user.id))
      router.push(paths.dashboard.user.security)
    } catch {
      enqueueSnackbar(t('security.errors.generic'), { variant: 'error' })
    }
  })

  const hasExactQuestions = selectedQuestions.length === recoveryQuestionsCount
  const hasUniqueQuestions =
    new Set(selectedQuestions.map((question) => question.questionId)).size ===
    selectedQuestions.length
  const hasAllAnswers = selectedQuestions.every(
    (question) => (answers?.[question.questionId] ?? '').trim().length > 0
  )
  const isSendDisabled = counting || !hasExactQuestions || !hasUniqueQuestions || !hasAllAnswers
  const isSubmitDisabled = !codeSent || twoFactorCode.length !== twoFactorLength

  return (
    <Card>
      <CardContent>
        {!questionsLoading && questionsResponse && !questionsResponse.ok && (
          <Alert severity='error'>{t('security.errors.generic')}</Alert>
        )}

        <FormProvider methods={methods} onSubmit={handleSubmit}>
          <Stack spacing={3}>
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
                selectedQuestions.length >= recoveryQuestionsCount &&
                !selectedQuestions.some(
                  (selected) =>
                    selected.questionId === (option as SecurityQuestionCatalogItem).questionId
                )
              }
              disabled={!questionOptions.length || questionsLoading}
              helperText={questionsHelperText}
            />

            {selectedQuestions.length > 0 && (
              <Box display='grid' gap={2}>
                {selectedQuestions.map((question) => (
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

              {codeError && <Alert severity='error'>{codeError}</Alert>}

              <Stack direction='row' spacing={2} alignItems='center'>
                <WhatsappCodeButton
                  counting={counting}
                  countdown={countdown}
                  color='primary'
                  disabled={isSendDisabled}
                  onClick={handleSendCode}
                  sendLabel={t('account.email.send-code')}
                  resendLabel={t('account.email.resend-code')}
                />
              </Stack>

              {codeSent && (
                <Stack spacing={1.5}>
                  <Alert severity='info'>{t('account.email.code-info')}</Alert>
                  <Typography variant='body2'>{t('security.2fa.codeLabel')}</Typography>
                  <RHFCode
                    name='twoFactorCode'
                    length={twoFactorLength}
                    autoFocus={false}
                    TextFieldsProps={{ type: 'password' }}
                  />
                </Stack>
              )}
            </Stack>

            <Stack direction='row' justifyContent='flex-end'>
              <LoadingButton type='submit' variant='contained' disabled={isSubmitDisabled}>
                {t('security.actions.save-questions')}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </CardContent>
    </Card>
  )
}
