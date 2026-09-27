'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import { useTranslate } from 'src/locales'
import { useSettingsContext } from 'src/components/settings'
import {
  authorizeStakingAction,
  requestStakingAction,
  useGovernance,
  useStakingState
} from 'src/app/api/hooks'

import GovernanceDelegation from '../governance-delegation'
import GovernanceHistory from '../governance-history'
import StakingNotices from '../staking-notices'
import StakingPageShell from '../staking-page-shell'
import StakingPinDialog from '../staking-pin-dialog'
import { useCardanoAddress } from '../use-cardano-address'
import { useStakingMode } from '../use-staking-mode'
import { MetricCard, NoticeCard, StakingModeToggle } from '../ui'

import type { GovernanceTarget } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

/** How much of a DRep identifier is enough to recognise one. */
const ID_PREFIX = 12

// ----------------------------------------------------------------------

/**
 * The governance page.
 *
 * It offers one mutation, delegating the voting power, with the three targets Cardano defines. In
 * Conway a credential that has never delegated its vote cannot withdraw rewards at all, so this is the
 * page a user is sent to when their rewards look stuck.
 *
 * The summary layout shows where the vote goes and what that means; changing it switches to the detailed
 * layout, which is where the targets are listed. Both share the history.
 *
 * The target the user pressed is held in state for exactly as long as the PIN dialog is open, and it is
 * the same value that is authorised and then requested. The PIN buys a grant bound by signature to one
 * target, so authorising with one target and requesting with another is refused by the backend rather
 * than delegating somewhere the user did not choose.
 */
export default function GovernanceDashboardView(): JSX.Element {
  const { t } = useTranslate()
  const settings = useSettingsContext()
  const [mode, setMode] = useStakingMode()

  const { address: cardanoAddress, loading: addressLoading } = useCardanoAddress()
  const { data, isLoading, error } = useStakingState(cardanoAddress)
  const { data: governance } = useGovernance(cardanoAddress)
  const staking = data?.staking

  // `null` means no dialog is open, so there is no state in which a PIN could be confirmed without a
  // target to spend it on.
  const [asking, setAsking] = useState<GovernanceTarget | null>(null)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  /**
   * Delegates the vote to one target, authorising it with the PIN first.
   *
   * @param target - Where the voting power goes. Passed to both calls from the same variable, because
   *   the grant is bound to it.
   * @param pin - The user's PIN, sent once.
   */
  const delegate = async (target: GovernanceTarget, pin: string): Promise<void> => {
    if (!cardanoAddress) return
    setBusy(true)
    setFailure(null)

    const authorised = await authorizeStakingAction(
      cardanoAddress,
      'delegate_vote',
      pin,
      null,
      target
    )
    if (!authorised.ok) {
      setFailure(authorised.message)
      setBusy(false)
      return
    }

    const started = await requestStakingAction(cardanoAddress, 'delegate_vote', {
      pinGrant: String(authorised.data.grant ?? ''),
      governanceTarget: target
    })
    if (!started.ok) {
      setFailure(started.message)
      setBusy(false)
      return
    }

    const txId = started.data.txId
    setNotice(
      typeof txId === 'string' && txId !== ''
        ? t('staking.actions.startedWithTx', { tx: `${txId.slice(0, 10)}…` })
        : t('staking.actions.started')
    )
    setAsking(null)
    setBusy(false)
  }

  if (addressLoading || isLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack alignItems='center' sx={{ py: 8 }}>
          <CircularProgress />
          <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary' }}>
            {t('staking.loading')}
          </Typography>
        </Stack>
      </Container>
    )
  }

  if (error || !staking) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Alert severity='info' sx={{ mt: 3 }}>
          {t('staking.unavailable')}
        </Alert>
      </Container>
    )
  }

  const delegation = staking.governanceDelegation
  const kind = delegation?.kind ?? 'none'
  const delegated = kind !== 'none' && kind !== 'not_registered'
  const current =
    kind === 'drep'
      ? t('governance.current.drep', {
          drep: (delegation?.idCip129 ?? '').slice(0, ID_PREFIX) || '—'
        })
      : t(`governance.current.${kind}`, { defaultValue: t('governance.current.none') })

  return (
    <StakingPageShell
      title={t('governance.title')}
      subtitle={t('governance.description')}
      action={<StakingModeToggle mode={mode} onChange={setMode} />}
    >
      {notice && (
        <Alert severity='success' sx={{ py: 0.5 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {/* The same notices as the staking tab. An operation still in flight is what disables delegating,
          and the notice is what says so. */}
      <StakingNotices staking={staking} />

      {mode === 'simple' ? (
        <Stack spacing={2}>
          <MetricCard
            testId='governance-current'
            title={t('governance.simple.title')}
            value={current}
            status={delegated ? t('governance.simple.delegated') : undefined}
            description={
              delegated ? t('governance.simple.delegatedBody') : t('governance.simple.noneBody')
            }
            tooltip={t('governance.simple.hint')}
            action={
              // Hidden for a wallet that is not staking: there is no credential to delegate from, and
              // the detailed layout says so in its own words.
              kind !== 'not_registered' && (
                <Button
                  variant='contained'
                  onClick={() => setMode('advanced')}
                  data-testid='governance-change'
                >
                  {t('governance.simple.change')}
                </Button>
              )
            }
          />

          <NoticeCard
            title={t('governance.simple.infoTitle')}
            body={t('governance.simple.infoBody')}
          />

          <GovernanceHistory governance={governance ?? null} />
        </Stack>
      ) : (
        <GovernanceDelegation
          staking={staking}
          governance={governance ?? null}
          submitting={busy}
          onDelegate={(target) => {
            setFailure(null)
            setAsking(target)
          }}
        />
      )}

      <StakingPinDialog
        open={asking !== null}
        action='delegate_vote'
        submitting={busy}
        error={failure}
        onCancel={() => setAsking(null)}
        onConfirm={(pin) => {
          // Guarded rather than asserted: a confirmation without a target must do nothing rather than
          // send a delegation with no destination.
          if (asking !== null) void delegate(asking, pin)
        }}
      />
    </StakingPageShell>
  )
}
