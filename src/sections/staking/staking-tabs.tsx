'use client'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import { paths } from 'src/routes/paths'
import { useRouter, usePathname } from 'src/routes/hooks'

import { useTranslate } from 'src/locales'

// ----------------------------------------------------------------------

/** The two pages of the staking section, in the order they are offered. */
const TABS = [
  { value: paths.dashboard.staking.root, label: 'staking.tabs.position' },
  { value: paths.dashboard.staking.governance, label: 'staking.tabs.governance' }
] as const

// ----------------------------------------------------------------------

/**
 * Navigation between the two pages of the staking section.
 *
 * They are separate routes rather than one page with client-side state, so each keeps a URL that can
 * be refreshed, bookmarked and shared, and the browser's back button moves between them. The
 * selected tab is therefore derived from the pathname rather than held in state: the pathname is
 * already the source of truth, and a second copy of it would disagree with it on a back navigation.
 *
 * A pathname that matches neither leaves no tab selected rather than defaulting to the first, which
 * would show the user a selection they did not make.
 */
export default function StakingTabs(): JSX.Element {
  const { t } = useTranslate()
  const router = useRouter()
  const pathname = usePathname()

  const current = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  const selected = TABS.find((tab) => tab.value === current)?.value ?? false

  return (
    <Tabs
      value={selected}
      onChange={(_event, value: string) => router.push(value)}
      data-testid='staking-tabs'
      sx={{ mb: 3 }}
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={t(tab.label)}
          data-testid={`staking-tab-${tab.value.split('/').pop()}`}
        />
      ))}
    </Tabs>
  )
}
