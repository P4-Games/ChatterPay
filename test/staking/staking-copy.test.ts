import { describe, expect, it } from 'vitest'

import br from 'src/locales/langs/br.json'
import en from 'src/locales/langs/en.json'
import es from 'src/locales/langs/es.json'

// ----------------------------------------------------------------------

/**
 * The wording that is a product requirement rather than a preference.
 *
 * Almost all copy is free to change and no test should stand in its way, which is why the component
 * tests assert on translation keys. This file is the exception, and it covers one sentence: the
 * warning that leaving staking does not undo itself.
 *
 * It matters because the system it describes is silent. Staking is automatic — a wallet that holds
 * enough ada is enrolled by the daily pass without being asked — and an opt-out is the only thing
 * that stops that. A user who leaves, receives ada months later and assumes it is earning has no way
 * to find out otherwise from the product. The confirmation is where that is said, so a locale that
 * loses the sentence loses the only place it is said.
 *
 * The three files are also checked against each other. They are maintained line for line, and a key
 * added to one and forgotten in another shows up as a missing string on somebody's screen rather
 * than as an error.
 */

/** The locales, named the way the application names them. */
const LOCALES = { es, en, br } as const

type StakingCopy = {
  staking: {
    deactivate: Record<string, string>
    notices: Record<string, string>
    consent: Record<string, string>
    membership: Record<string, string>
    actions: Record<string, string>
  }
}

describe('the deactivation copy', () => {
  it('exists in all three locales', () => {
    for (const [name, locale] of Object.entries(LOCALES)) {
      expect((locale as StakingCopy).staking.deactivate, name).toBeDefined()
    }
  })

  it('carries the same keys in all three', () => {
    const [first, ...rest] = Object.values(LOCALES).map((locale) =>
      Object.keys((locale as StakingCopy).staking.deactivate)
        .sort()
        .join(',')
    )

    for (const other of rest) expect(other).toBe(first)
  })

  it('leaves nothing untranslated', () => {
    for (const [name, locale] of Object.entries(LOCALES)) {
      for (const [key, value] of Object.entries((locale as StakingCopy).staking.deactivate)) {
        expect(value.trim(), `${name}.${key}`).not.toBe('')
      }
    }
  })

  describe('the warning that participation does not resume', () => {
    it('says so in Spanish, in the words the product requires', () => {
      const copy = (es as StakingCopy).staking.deactivate

      expect(copy.noAutoRejoin).toContain('NO VOLVERÁS A PARTICIPAR AUTOMÁTICAMENTE')
      expect(copy.noAutoRejoin).toContain('AUNQUE RECIBAS NUEVOS ADA')
    })

    it('says so in the other two as well', () => {
      expect((en as StakingCopy).staking.deactivate.noAutoRejoin).toContain(
        'NOT TAKE PART AGAIN AUTOMATICALLY'
      )
      expect((br as StakingCopy).staking.deactivate.noAutoRejoin).toContain(
        'NÃO VAI PARTICIPAR DE NOVO AUTOMATICAMENTE'
      )
    })

    it('mentions new ada arriving, which is the case people get wrong', () => {
      // The misunderstanding this sentence exists to prevent: that leaving is temporary and a later
      // deposit puts you back.
      expect((en as StakingCopy).staking.deactivate.noAutoRejoin).toContain('MORE ADA')
      expect((br as StakingCopy).staking.deactivate.noAutoRejoin).toContain('NOVOS ADA')
    })
  })

  describe('what the confirmation tells the user to do next', () => {
    it('points at this section and at the control by name', () => {
      const copy = (es as StakingCopy).staking.deactivate

      expect(copy.howToReturn).toContain('Volver a activar staking')
    })

    it('names the same control the screen then shows', () => {
      // If these two drift apart the instruction points at a button that does not exist under that
      // name, which is worse than no instruction.
      expect((es as StakingCopy).staking.notices.optedOutRejoin).toBe('Volver a activar staking')
      expect((es as StakingCopy).staking.deactivate.howToReturn).toContain(
        (es as StakingCopy).staking.notices.optedOutRejoin
      )
    })
  })

  describe('the state a wallet that left is shown in', () => {
    it('says the user did it, rather than that it happened', () => {
      expect((es as StakingCopy).staking.notices.optedOutTitle).toBe('Staking desactivado por vos')
    })

    it('says that new ada will not put it back', () => {
      expect((es as StakingCopy).staking.notices.optedOutBody).toContain(
        'aunque recibas nuevos ADA'
      )
    })
  })

  describe('the button that opens the confirmation', () => {
    it('is named the same as the confirmation it opens', () => {
      const staking = (es as StakingCopy).staking

      expect(staking.consent.decline).toBe(staking.deactivate.title)
      expect(staking.consent.decline).toBe(staking.deactivate.confirm)
    })
  })
})

// ----------------------------------------------------------------------

/** The two subtrees these screens read, in every locale. */
const SUBTREES = ['staking', 'governance'] as const

/** The six action labels, in the order the screen offers them. */
const ACTION_LABELS = [
  'register_and_delegate',
  'delegate_vote',
  'redelegate_pool',
  'withdraw_rewards',
  'deregister',
  'exit_and_send_max'
] as const

/**
 * The longest a control's label may be.
 *
 * The actions are a grid of equal cells, so a label is only correct if it fits one line of one cell.
 * Twenty-two characters is what the narrowest cell holds at the button's font size; past that the
 * label wraps, the cell grows, and the row stops lining up.
 */
const LABEL_LIMIT = 22

/**
 * Every key path under a subtree, so two locales can be compared rather than spot-checked.
 *
 * @param value - The subtree.
 * @param prefix - The path so far.
 * @returns Every leaf path, sorted.
 */
function paths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, child]) => paths(child, prefix === '' ? key : `${prefix}.${key}`))
    .sort()
}

describe('the staking and governance copy', () => {
  it.each(SUBTREES)('carries the same keys in all three locales, under %s', (subtree) => {
    // The three files are maintained line for line. A key added to one and forgotten in another shows
    // up as a raw key on somebody's screen rather than as an error, so it is checked here instead.
    const [first, ...rest] = Object.values(LOCALES).map((locale) =>
      paths((locale as Record<string, unknown>)[subtree])
    )

    for (const other of rest) expect(other).toEqual(first)
  })

  it.each(SUBTREES)('leaves nothing empty, under %s', (subtree) => {
    for (const [name, locale] of Object.entries(LOCALES)) {
      const tree = (locale as Record<string, unknown>)[subtree]
      for (const path of paths(tree)) {
        const value = path
          .split('.')
          .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], tree)
        expect(String(value).trim(), `${name}.${subtree}.${path}`).not.toBe('')
      }
    }
  })
})

describe('the action labels', () => {
  it('exist for every action the screen can offer', () => {
    for (const [name, locale] of Object.entries(LOCALES)) {
      const labels = (locale as StakingCopy).staking.actions
      for (const action of ACTION_LABELS) {
        expect(labels[action], `${name}.${action}`).toBeTruthy()
      }
    }
  })

  it('are short enough to sit on one line of one grid cell', () => {
    for (const [name, locale] of Object.entries(LOCALES)) {
      const labels = (locale as StakingCopy).staking.actions
      for (const action of ACTION_LABELS) {
        expect(labels[action].length, `${name}.${action}: ${labels[action]}`).toBeLessThanOrEqual(
          LABEL_LIMIT
        )
      }
    }
  })

  it('carry no reason inside them, which is what the helper line is for', () => {
    // A label that explains itself is a label that changes length per wallet, and the grid is built on
    // labels that do not.
    for (const [name, locale] of Object.entries(LOCALES)) {
      const labels = (locale as StakingCopy).staking.actions
      for (const action of ACTION_LABELS) {
        expect(labels[action], `${name}.${action}`).not.toMatch(/[.:]/)
      }
    }
  })
})

describe('the status card copy', () => {
  it('names each state and says what follows from it', () => {
    for (const [name, locale] of Object.entries(LOCALES)) {
      const membership = (locale as StakingCopy).staking.membership

      for (const key of ['pendingTitle', 'pendingBody', 'leavingTitle', 'leavingBody']) {
        expect(membership[key], `${name}.${key}`).toBeTruthy()
      }
    }
  })

  it('describes an external wallet as viewable rather than broken', () => {
    const notices = (en as StakingCopy).staking.notices

    expect(notices.notSignableTitle).toBe('External staking wallet')
    expect(notices.notSignableBody).toContain('viewed here')
  })
})
