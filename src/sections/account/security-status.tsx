import { useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { useSWRConfig } from 'swr'

import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import { fDateTime } from 'src/utils/format-time'
import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import {
  useSecurityStatus,
  useSecurityQuestionsCatalog,
  securityStatusSWRKey,
  type SecurityQuestion
} from 'src/app/api/hooks/use-security'

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

export default function SecurityStatusDetail() {
  const { t } = useTranslate()
  const { user } = useAuthContext()
  const { mutate } = useSWRConfig()

  const { data: statusResponse, isLoading: statusLoading } = useSecurityStatus(user?.id)
  const { data: questionsResponse } = useSecurityQuestionsCatalog(user?.id)

  const status = statusResponse?.ok ? statusResponse.data : null
  const questionsCatalog = questionsResponse?.ok ? questionsResponse.data.questions : []

  const blockedUntil = status?.blockedUntil ? new Date(status.blockedUntil) : null
  const isBlocked = status?.pinStatus === 'blocked' && blockedUntil
  const countdownActive = !!blockedUntil && blockedUntil.getTime() > Date.now()
  const refreshTriggeredRef = useRef(false)

  const recoveryQuestionsById = useMemo(() => {
    const map = new Map<string, SecurityQuestion>()
    questionsCatalog.forEach((question) => {
      map.set(question.questionId, question)
    })
    return map
  }, [questionsCatalog])

  const handleUnlockRefresh = useCallback(() => {
    if (!user?.id) return
    void mutate(securityStatusSWRKey(user.id))
  }, [mutate, user?.id])

  useEffect(() => {
    if (!isBlocked || !blockedUntil) {
      refreshTriggeredRef.current = false
      return
    }

    if (blockedUntil.getTime() <= Date.now() && !refreshTriggeredRef.current) {
      refreshTriggeredRef.current = true
      handleUnlockRefresh()
    }
  }, [isBlocked, blockedUntil, handleUnlockRefresh])

  return (
    <Card>
      <CardContent>
        {statusLoading && <Typography>{t('security.status.loading')}</Typography>}

        {!statusLoading && statusResponse && !statusResponse.ok && (
          <Alert severity='error'>{t('security.errors.generic')}</Alert>
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
                color={
                  status.pinStatus === 'active'
                    ? 'success'
                    : status.pinStatus === 'blocked'
                      ? 'warning'
                      : status.pinStatus === 'reset_required'
                        ? 'warning'
                        : 'default'
                }
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
                {status.blockedUntil ? fDateTime(status.blockedUntil) : t('common.nodata')}
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

            <Stack spacing={1}>
              <Typography variant='body2' color='text.secondary'>
                {t('security.status.labels.recovery-questions')}
              </Typography>
              <Stack direction='row' spacing={1} flexWrap='wrap'>
                {(status.recoveryQuestionIds ?? []).length ? (
                  status.recoveryQuestionIds.map((id) => {
                    const match = recoveryQuestionsById.get(id)
                    return (
                      <Chip key={id} size='small' variant='outlined' label={match?.text ?? id} />
                    )
                  })
                ) : (
                  <Typography variant='body2'>{t('common.nodata')}</Typography>
                )}
              </Stack>
            </Stack>

            {isBlocked && countdownActive && (
              <BlockedCountdown
                blockedUntil={blockedUntil!}
                onUnlock={handleUnlockRefresh}
                labelNow={t('security.blocked.now')}
                labelUnlockAt={t('security.blocked.unlockAt')}
                labelRemaining={t('security.blocked.remaining')}
                labelTryAgain={t('security.blocked.tryAgainAfter')}
              />
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
