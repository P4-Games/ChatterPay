import { useState } from 'react'
import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import Tabs from '@mui/material/Tabs'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

import Label from 'src/components/label'

import { FEES_ANIMATIONS, FEES_VIEWPORT } from './fees-animations'
import {
  TONE_COLORS,
  FeesTable,
  feesCardSx,
  FeesBlockHeading,
  FeesStackedRows
} from './fees-section'

import type { FeeNetworksSection } from './fees-types'

// ----------------------------------------------------------------------

const tabId = (id: string) => `fees-network-tab-${id}`
const panelId = (id: string) => `fees-network-panel-${id}`

/**
 * The network name keeps to one line wherever the tab is wide enough to hold it. Below `sm` the
 * longest name does not fit at a readable size, so there it wraps.
 */
const NAME_SX = {
  fontWeight: 600,
  fontSize: { xs: 12, sm: 13, md: 14 },
  whiteSpace: { xs: 'normal', sm: 'nowrap' }
}

/** Room for the two lines a wrapped name takes, so every tab is the same height as the longest. */
const NAME_MIN_HEIGHT = { xs: 36, sm: 'auto' }

type Props = {
  section: FeeNetworksSection
  /** Extra content under a network's fees, keyed by tab id. */
  footers?: Record<string, React.ReactNode>
}

/**
 * The networks block: one tab per blockchain, and under it what that network costs.
 *
 * The tabs are laid out as a grid rather than the row MUI gives by default, so a narrow screen
 * gets two columns of two instead of a strip that scrolls sideways, and the selected one is told
 * apart by its border and its background and not by color alone.
 */
export default function FeesNetworks({ section, footers }: Props) {
  const theme = useTheme()
  const { t } = useTranslate()

  const isDark = theme.palette.mode === 'dark'

  // The first network is the one ChatterPay runs on today, so it is the one that opens.
  const [selected, setSelected] = useState(section.tabs[0].id)
  const active = section.tabs.find((tab) => tab.id === selected) ?? section.tabs[0]

  const tabsKey = `fees.sections.${section.id}.tabs`
  const rowsKey = `${tabsKey}.${active.id}.rows`

  const tabSx = {
    minHeight: 56,
    // A grid cell is the width every tab takes: same column, same tab, whatever the name is.
    width: '100%',
    maxWidth: 'none',
    px: 1,
    py: 1.25,
    borderRadius: 2,
    whiteSpace: 'normal',
    textTransform: 'none',
    color: 'text.secondary',
    border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
    bgcolor: isDark ? alpha(theme.palette.grey[900], 0.4) : 'common.white',
    '&.Mui-selected': {
      color: 'text.primary',
      borderColor: 'primary.main',
      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.08)
    },
    '&.Mui-focusVisible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2
    }
  }

  return (
    <m.div
      variants={FEES_ANIMATIONS.item}
      initial='hidden'
      whileInView='visible'
      viewport={FEES_VIEWPORT}
    >
      <Stack spacing={2.5} sx={{ mb: { xs: 6, md: 8 } }}>
        <FeesBlockHeading
          icon={section.icon}
          iconImage={section.iconImage}
          title={t(`fees.sections.${section.id}.title`)}
        />

        <Tabs
          value={selected}
          onChange={(_, value: string) => setSelected(value)}
          aria-label={t(`fees.sections.${section.id}.title`)}
          TabIndicatorProps={{ sx: { display: 'none' } }}
          sx={{
            minHeight: 0,
            // The grid never overflows, and a visible overflow keeps focus outlines whole.
            '& .MuiTabs-scroller': { overflow: 'visible !important' },
            '& .MuiTabs-flexContainer': {
              gap: 1.5,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }
            }
          }}
        >
          {section.tabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              id={tabId(tab.id)}
              aria-controls={panelId(tab.id)}
              sx={tabSx}
              label={
                <Stack spacing={0.75} alignItems='center' sx={{ width: '100%' }}>
                  <Stack
                    spacing={1}
                    direction='row'
                    alignItems='center'
                    justifyContent='center'
                    sx={{ width: '100%', minHeight: NAME_MIN_HEIGHT }}
                  >
                    {tab.logo && (
                      <Box
                        component='img'
                        src={tab.logo}
                        alt=''
                        loading='lazy'
                        sx={{ width: 20, height: 20, flexShrink: 0, borderRadius: '50%' }}
                      />
                    )}

                    <Typography variant='subtitle2' sx={NAME_SX}>
                      {t(`${tabsKey}.${tab.id}.name`)}
                    </Typography>
                  </Stack>

                  <Label variant='soft' color={TONE_COLORS[tab.status.tone]}>
                    {t(`fees.values.${tab.status.value}`)}
                  </Label>
                </Stack>
              }
            />
          ))}
        </Tabs>

        <Box
          role='tabpanel'
          id={panelId(active.id)}
          aria-labelledby={tabId(active.id)}
          sx={{ width: '100%' }}
        >
          <Stack spacing={2.5}>
            {active.rows ? (
              <Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <FeesTable columns={active.columns || []} rows={active.rows} rowsKey={rowsKey} />
                </Box>

                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <FeesStackedRows rows={active.rows} rowsKey={rowsKey} />
                </Box>
              </Box>
            ) : (
              <Card sx={{ ...feesCardSx(theme), p: 3 }}>
                <Stack spacing={1.5} alignItems='flex-start'>
                  <Label variant='soft' color={TONE_COLORS[active.status.tone]}>
                    {t(`fees.values.${active.status.value}`)}
                  </Label>

                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    {t(`${tabsKey}.${active.id}.empty`)}
                  </Typography>
                </Stack>
              </Card>
            )}

            {footers?.[active.id]}

            {active.notes?.map((note) => (
              <Typography key={note} variant='body2' sx={{ color: 'text.secondary' }}>
                {t(`${tabsKey}.${active.id}.notes.${note}`)}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Stack>
    </m.div>
  )
}
