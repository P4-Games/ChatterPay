import { describe, expect, it } from 'vitest'

import {
  GOVERNANCE_TARGET_KINDS,
  governanceTargetCanonical,
  readGovernanceTarget
} from 'src/app/api/services/staking/staking-service'

// ----------------------------------------------------------------------

/**
 * The half of the governance contract this application is responsible for.
 *
 * A vote delegation names a target as well as an action, and this is where the browser's version of that
 * target is read and turned into the string the route signs. Three properties are asserted, and each one
 * is load-bearing rather than defensive.
 *
 * **The rule is symmetric.** The one action that carries a target requires one, and every other action
 * refuses one. Requiring it is what stopped `delegate_vote` meaning whatever the backend defaulted to;
 * refusing it elsewhere keeps a field with no meaning from acquiring one later.
 *
 * **The canonical string is exact.** The backend rebuilds the same string from the same field and
 * compares the two, so these literals are the contract. A change to either side that is not made to the
 * other shows up as every staking mutation failing to verify, which is the failure direction to prefer
 * over one that verifies the wrong thing.
 *
 * **A representative's identifier is restricted before it is signed.** The canonical form joins its
 * fields with `|`, so an identifier able to carry one could be chosen to make two different claim sets
 * produce the same string. Nothing here parses bech32 — the backend decides whether an identifier
 * denotes a representative, with the normaliser it already has — but a string that could break the join
 * never reaches a signature.
 */

const DREP = 'drep1y242424242424242424242424242424242424242424242sdg97tu'
const DREP_LEGACY = 'drep_vkh1424242424242424242424242424242424242424242425xawa90'

describe('the targets offered', () => {
  it('offers the three in scope and nothing else', () => {
    expect([...GOVERNANCE_TARGET_KINDS]).toEqual(['always_abstain', 'always_no_confidence', 'drep'])
  })
})

describe('which actions carry a target', () => {
  it('requires one for a vote delegation', () => {
    for (const raw of [undefined, null]) {
      expect(readGovernanceTarget(raw, 'delegate_vote')).toMatchObject({ ok: false })
    }
  })

  it('refuses one on every action that has none', () => {
    for (const action of [
      'register_and_delegate',
      'redelegate_pool',
      'withdraw_rewards',
      'deregister',
      'exit_and_send_max'
    ] as const) {
      expect(readGovernanceTarget({ kind: 'always_abstain' }, action), action).toMatchObject({
        ok: false
      })
    }
  })

  it('reads no target for an action that has none', () => {
    expect(readGovernanceTarget(undefined, 'withdraw_rewards')).toEqual({ ok: true, target: null })
  })
})

describe('reading a target', () => {
  it('reads both predefined targets', () => {
    expect(readGovernanceTarget({ kind: 'always_abstain' }, 'delegate_vote')).toEqual({
      ok: true,
      target: { kind: 'always_abstain' }
    })
    expect(readGovernanceTarget({ kind: 'always_no_confidence' }, 'delegate_vote')).toEqual({
      ok: true,
      target: { kind: 'always_no_confidence' }
    })
  })

  it('reads a representative', () => {
    expect(readGovernanceTarget({ kind: 'drep', drepId: DREP }, 'delegate_vote')).toEqual({
      ok: true,
      target: { kind: 'drep', drepId: DREP }
    })
  })

  it('trims the identifier', () => {
    expect(readGovernanceTarget({ kind: 'drep', drepId: `  ${DREP} ` }, 'delegate_vote')).toEqual({
      ok: true,
      target: { kind: 'drep', drepId: DREP }
    })
  })

  it('refuses something that is not a target', () => {
    for (const raw of ['always_abstain', 7, true, ['always_abstain']]) {
      expect(readGovernanceTarget(raw, 'delegate_vote'), String(raw)).toMatchObject({ ok: false })
    }
  })

  it('refuses a kind outside the three', () => {
    for (const kind of ['abstain', 'register_drep', 'cast_drep_vote', '']) {
      expect(readGovernanceTarget({ kind }, 'delegate_vote'), kind).toMatchObject({ ok: false })
    }
  })

  it('refuses a representative named by nothing', () => {
    for (const raw of [
      { kind: 'drep' },
      { kind: 'drep', drepId: '' },
      { kind: 'drep', drepId: ' ' }
    ]) {
      expect(readGovernanceTarget(raw, 'delegate_vote')).toMatchObject({ ok: false })
    }
  })

  it('refuses an identifier that could break the string it is signed inside', () => {
    for (const drepId of [
      'drep1abc|always_abstain',
      'drep1abc|5491133334444|delegate_vote|-',
      'drep1abc:more',
      'drep1ABCDEF',
      'drep1 abc',
      'drep1abc\ndrep1def'
    ]) {
      expect(readGovernanceTarget({ kind: 'drep', drepId }, 'delegate_vote')).toMatchObject({
        ok: false
      })
    }
  })
})

describe('the string the assertion and the grant are bound to', () => {
  it('is null when there is no target', () => {
    expect(governanceTargetCanonical(null)).toBeNull()
  })

  it('is the kind itself for a predefined target', () => {
    expect(governanceTargetCanonical({ kind: 'always_abstain' })).toBe('always_abstain')
    expect(governanceTargetCanonical({ kind: 'always_no_confidence' })).toBe('always_no_confidence')
  })

  it('is the identifier under a prefix for a representative', () => {
    expect(governanceTargetCanonical({ kind: 'drep', drepId: DREP })).toBe(`drep:${DREP}`)
  })

  it('differs for every distinct target', () => {
    // If two targets shared a string, a grant for one would verify for the other and the choice on the
    // screen would not be the choice the ledger is told.
    const strings = [
      governanceTargetCanonical({ kind: 'always_abstain' }),
      governanceTargetCanonical({ kind: 'always_no_confidence' }),
      governanceTargetCanonical({ kind: 'drep', drepId: DREP }),
      governanceTargetCanonical({ kind: 'drep', drepId: DREP_LEGACY })
    ]

    expect(new Set(strings).size).toBe(strings.length)
  })

  it('binds the identifier as supplied, not a normalised form', () => {
    // Deliberate, and tighter rather than looser. Normalising here would mean a second DRep parser in
    // this process, and two parsers are two chances to disagree; the backend normalises for the
    // certificate and for comparison, where a parser already lives.
    expect(governanceTargetCanonical({ kind: 'drep', drepId: DREP_LEGACY })).toBe(
      `drep:${DREP_LEGACY}`
    )
  })

  it('never contains the delimiter the canonical form joins on', () => {
    for (const target of [
      { kind: 'always_abstain' as const },
      { kind: 'always_no_confidence' as const },
      { kind: 'drep' as const, drepId: DREP },
      { kind: 'drep' as const, drepId: DREP_LEGACY }
    ]) {
      expect(governanceTargetCanonical(target)).not.toContain('|')
    }
  })
})
