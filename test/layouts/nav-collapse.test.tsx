import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NAV } from 'src/layouts/config-layout'
import Main from 'src/layouts/dashboard/main'
import Header from 'src/layouts/dashboard/header'
import NavToggleButton from 'src/layouts/dashboard/nav-toggle-button'
import NavItem from 'src/components/nav-section/vertical/nav-item'
import type { SettingsValueProps } from 'src/components/settings'
import { SettingsProvider } from 'src/components/settings'

// ----------------------------------------------------------------------

/**
 * Collapsing and expanding the desktop nav.
 *
 * The rail, the header and the main content are three elements that have to agree on one width. They
 * agree because all three derive it from the persisted `themeLayout` preference, which is what the
 * toggle writes — so the tests here drive the real settings context rather than a stub, and assert on
 * the widths that come out the other side.
 */

vi.mock('src/hooks/use-responsive', () => ({
  useResponsive: () => true,
  useWidth: () => 'lg'
}))

vi.mock('src/routes/components', () => ({ RouterLink: 'a' }))

vi.mock('src/layouts/common/account-popover', () => ({ default: () => <div /> }))
vi.mock('src/layouts/common/settings-button', () => ({ default: () => <div /> }))
vi.mock('src/layouts/common/language-popover', () => ({ default: () => <div /> }))
vi.mock('src/layouts/common/notifications-button', () => ({ default: () => <div /> }))

const defaults: SettingsValueProps = {
  themeMode: 'light',
  themeDirection: 'ltr',
  themeContrast: 'bold',
  themeLayout: 'vertical',
  themeColorPresets: 'default',
  themeStretch: false
}

function withSettings(children: React.ReactNode, themeLayout: SettingsValueProps['themeLayout']) {
  return render(
    <SettingsProvider defaultSettings={{ ...defaults, themeLayout }}>{children}</SettingsProvider>
  )
}

/**
 * The CSS emotion generated for an element, read as text.
 *
 * `getComputedStyle` is not usable here: jsdom drops `calc()` values, and the width of the header and
 * of the main region is exactly a `calc()`. The style tags emotion appends still carry the rule
 * verbatim, so the assertions read those.
 */
function cssTextFor(element: Element): string {
  const classes = Array.from(element.classList).map((name) => `.${name}`)

  return Array.from(document.querySelectorAll('style'))
    .flatMap((style) => (style.textContent ?? '').split('}'))
    .filter((chunk) => classes.some((name) => chunk.includes(name)))
    .join('}')
}

beforeEach(() => {
  window.localStorage.clear()
})

// ----------------------------------------------------------------------

describe('the toggle button', () => {
  it('collapses by writing the themeLayout preference', async () => {
    withSettings(<NavToggleButton />, 'vertical')

    await userEvent.click(screen.getByRole('button', { name: 'menu.collapseNav' }))

    expect(screen.getByRole('button', { name: 'menu.expandNav' })).toBeInTheDocument()
    expect(
      JSON.parse(window.localStorage.getItem(Object.keys(window.localStorage)[0]) ?? '{}')
    ).toMatchObject({ themeLayout: 'mini' })
  })

  it('expands by writing the themeLayout preference back', async () => {
    withSettings(<NavToggleButton />, 'mini')

    await userEvent.click(screen.getByRole('button', { name: 'menu.expandNav' }))

    expect(screen.getByRole('button', { name: 'menu.collapseNav' })).toBeInTheDocument()
    expect(
      JSON.parse(window.localStorage.getItem(Object.keys(window.localStorage)[0]) ?? '{}')
    ).toMatchObject({ themeLayout: 'vertical' })
  })

  it('reports the state it is in to assistive technology', () => {
    withSettings(<NavToggleButton />, 'mini')

    expect(screen.getByRole('button', { name: 'menu.expandNav' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })
})

// ----------------------------------------------------------------------

describe('the preference drives the width', () => {
  it('sizes the main region against the expanded rail', () => {
    const { container } = withSettings(<Main>content</Main>, 'vertical')

    const main = container.querySelector('main') as HTMLElement

    expect(cssTextFor(main)).toContain(`width:calc(100% - ${NAV.W_VERTICAL}px)`)
  })

  it('sizes the main region against the collapsed rail', () => {
    const { container } = withSettings(<Main>content</Main>, 'mini')

    const main = container.querySelector('main') as HTMLElement

    expect(cssTextFor(main)).toContain(`width:calc(100% - ${NAV.W_MINI}px)`)
  })

  it('sizes the header against the expanded rail, leaving room for its border', () => {
    const { container } = withSettings(<Header />, 'vertical')

    const bar = container.querySelector('header') as HTMLElement

    expect(cssTextFor(bar)).toContain(`width:calc(100% - ${NAV.W_VERTICAL + 1}px)`)
  })

  it('sizes the header against the collapsed rail, leaving room for its border', () => {
    const { container } = withSettings(<Header />, 'mini')

    const bar = container.querySelector('header') as HTMLElement

    expect(cssTextFor(bar)).toContain(`width:calc(100% - ${NAV.W_MINI + 1}px)`)
  })

  it('keeps the header clear of the content it scrolls over', () => {
    const { container } = withSettings(<Header />, 'mini')

    const bar = container.querySelector('header') as HTMLElement

    // The bar is transparent and fixed over the scrolling page: without this it hit-tests across its
    // whole area and the cards and buttons passing underneath stop responding.
    expect(cssTextFor(bar)).toContain('pointer-events:none')
  })
})

// ----------------------------------------------------------------------

describe('a collapsed nav item', () => {
  it('carries its label as a tooltip', async () => {
    render(<NavItem title='Staking' path='/dashboard/staking' depth={1} collapsed icon={<i />} />)

    await userEvent.hover(screen.getByRole('button', { name: 'Staking' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Staking')
  })

  it('does not show the label as text', () => {
    const { container } = render(
      <NavItem title='Staking' path='/dashboard/staking' depth={1} collapsed icon={<i />} />
    )

    const item = container.querySelector('[class*="MuiButtonBase-root"]') as HTMLElement

    expect(cssTextFor(item)).toMatch(/\.texts\s*\{[^}]*opacity:0/)
  })

  it('shows the label as text and no tooltip once expanded', async () => {
    render(<NavItem title='Staking' path='/dashboard/staking' depth={1} icon={<i />} />)

    const item = screen.getByRole('button')

    expect(item).toHaveTextContent('Staking')

    await userEvent.hover(item)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
