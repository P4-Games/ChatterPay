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
