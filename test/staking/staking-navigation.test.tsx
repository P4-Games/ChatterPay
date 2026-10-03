import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { paths } from 'src/routes/paths'
import { matchesActivePath } from 'src/routes/hooks/use-active-link'
import StakingTabs from 'src/sections/staking/staking-tabs'

// ----------------------------------------------------------------------

/**
 * Reaching the staking section, and knowing where you are inside it.
 *
 * The section is two routes rather than one page, so each keeps a URL that survives a refresh and can
 * be shared, and the browser's back button moves between them. Two things follow, and both are here:
 * the selected tab has to be derived from the pathname rather than stored, and the sidebar entry has
 * to stay lit on both routes — otherwise moving between the tabs of one section reads as leaving it.
 */

const push = vi.fn()
const pathname = { current: paths.dashboard.staking.root }

vi.mock('src/routes/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('src/routes/hooks')>()
  return {
    ...actual,
    useRouter: () => ({ push }),
    usePathname: () => pathname.current
  }
})

beforeEach(() => {
  push.mockClear()
  pathname.current = paths.dashboard.staking.root
})

describe('the sidebar entry', () => {
  it('is lit on the staking page', () => {
    expect(matchesActivePath(paths.dashboard.staking.root, [paths.dashboard.staking.root])).toBe(
      true
    )
  })

  it('stays lit on governance, which is a tab of the same section', () => {
    expect(
      matchesActivePath(paths.dashboard.staking.governance, [paths.dashboard.staking.governance])
    ).toBe(true)
  })

  it('is lit on a page below one of its routes', () => {
    expect(
      matchesActivePath(`${paths.dashboard.staking.governance}/drep`, [
        paths.dashboard.staking.governance
      ])
    ).toBe(true)
  })

  it('tolerates the trailing slash the router adds', () => {
    expect(
      matchesActivePath(`${paths.dashboard.staking.governance}/`, [
        paths.dashboard.staking.governance
      ])
    ).toBe(true)
  })

  it('is not lit on an unrelated page', () => {
    expect(matchesActivePath(paths.dashboard.nfts.root, [paths.dashboard.staking.governance])).toBe(
      false
    )
  })

  it('is not lit on a path that merely starts with the same letters', () => {
    // `/dashboard/governance-archive` is a different page, and a naive prefix test would light this.
    expect(
      matchesActivePath(`${paths.dashboard.staking.governance}-archive`, [
        paths.dashboard.staking.governance
      ])
    ).toBe(false)
  })

  it('is lit by nothing when no extra routes are declared', () => {
    expect(matchesActivePath(paths.dashboard.staking.root)).toBe(false)
  })
})

describe('StakingTabs', () => {
  it('offers both pages of the section', () => {
    render(<StakingTabs />)

    expect(screen.getByTestId('staking-tab-staking')).toBeInTheDocument()
    expect(screen.getByTestId('staking-tab-governance')).toBeInTheDocument()
  })

  it('selects the staking tab on the staking route', () => {
    render(<StakingTabs />)

    expect(screen.getByTestId('staking-tab-staking')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('staking-tab-governance')).toHaveAttribute('aria-selected', 'false')
  })

  it('selects the governance tab on the governance route', () => {
    // Derived from the pathname, so a direct visit or a refresh lands on the right tab rather than
    // on whichever one a piece of state happened to hold.
    pathname.current = paths.dashboard.staking.governance

    render(<StakingTabs />)

    expect(screen.getByTestId('staking-tab-governance')).toHaveAttribute('aria-selected', 'true')
  })

  it('reads a pathname carrying a trailing slash', () => {
    pathname.current = `${paths.dashboard.staking.governance}/`

    render(<StakingTabs />)

    expect(screen.getByTestId('staking-tab-governance')).toHaveAttribute('aria-selected', 'true')
  })

  it('selects nothing on a pathname that is neither', () => {
    // Rather than defaulting to the first, which would show a selection the user did not make.
    pathname.current = paths.dashboard.nfts.root

    render(<StakingTabs />)

    expect(screen.getByTestId('staking-tab-staking')).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByTestId('staking-tab-governance')).toHaveAttribute('aria-selected', 'false')
  })

  it('navigates rather than swapping content in place', async () => {
    render(<StakingTabs />)

    await userEvent.click(screen.getByTestId('staking-tab-governance'))

    expect(push).toHaveBeenCalledWith(paths.dashboard.staking.governance)
  })
})
