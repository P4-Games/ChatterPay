'use client'

import ReactMarkdown from 'react-markdown'
import { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Collapse from '@mui/material/Collapse'
import { alpha, type Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import ButtonBase from '@mui/material/ButtonBase'

import { useTranslate } from 'src/locales'
import { useGetActiveNews } from 'src/app/api/hooks'

import Iconify from 'src/components/iconify'

import type { NewsTarget } from 'src/types/news'

// ----------------------------------------------------------------------

// Long enough to read a one-line headline without hurrying, short enough that a visitor who stays
// on the page a few seconds still sees there is more than one announcement.
const ROTATION_MS = 8000

// Collapsed heights in pixels, held fixed so a layout sitting under a fixed header can offset its
// content by them. Expanding overlays the page instead of pushing it, so these stay constant.
export const NEWS_BANNER_HEIGHT = 46
export const NEWS_BANNER_HEIGHT_COMPACT = 34

const ROW_HEIGHT = 28
const ROW_HEIGHT_COMPACT = 20

// Solid where the headline sits, gone by the right edge.
const BACKDROP_FADE = 'linear-gradient(to right, #000 0%, #000 55%, transparent 92%)'

/**
 * Whether any announcement is live on a surface, for layouts that need to reserve room for the
 * banner.
 *
 * Shares the SWR key with the banner itself, so asking here costs no extra request, as long as both
 * are asked about the same surface.
 */
export function useHasActiveNews(target: NewsTarget): boolean {
  const { i18n } = useTranslate()
  const { news } = useGetActiveNews(i18n.language, target)

  return news.length > 0
}

type Props = {
  /** Surface the banner is rendered on, which decides the announcements it receives. */
  target: NewsTarget
  /** Shows the close button. The banner then disappears until the layout mounts again. */
  dismissible?: boolean
  /** Tighter vertical rhythm, for the landing, where the banner sits over the hero. */
  compact?: boolean
}

/**
 * One-line announcement banner, fed by the active items of `templates.news`.
 *
 * When more than one announcement is live it rotates through them, pausing while the visitor
 * hovers or has the full text open, so reading is never cut short. Renders nothing at all when
 * there is nothing active, which is what keeps it out of the way for most of the year.
 */
export default function NewsBanner({ target, dismissible = false, compact = false }: Props) {
  const { t, i18n } = useTranslate()

  const { news } = useGetActiveNews(i18n.language, target)

  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [paused, setPaused] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const total = news.length

  // An operator lowering an announcement can shrink the list under the current index.
  useEffect(() => {
    setIndex((current) => (current < total ? current : 0))
  }, [total])

  useEffect(() => {
    if (total < 2 || paused || expanded) return undefined

    const timer = setInterval(() => setIndex((current) => (current + 1) % total), ROTATION_MS)

    return () => clearInterval(timer)
  }, [total, paused, expanded])

  const handleSelect = useCallback((next: number) => {
    setIndex(next)
    setExpanded(false)
  }, [])

  if (dismissed || total === 0) return null

  const item = news[index] ?? news[0]

  // In compact mode every control has to fit the shorter row, or the banner grows past the height
  // the landing layout reserves for it.
  const controlSize = compact ? ROW_HEIGHT_COMPACT : ROW_HEIGHT
  const iconSize = compact ? 16 : 20
  const controlSx = { flexShrink: 0, width: controlSize, height: controlSize, p: 0 }
  const fadeBackdrop = compact && !expanded

  return (
    <Box
      role='status'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{
        width: '100%',
        position: 'relative',
        px: { xs: 1.5, md: 2 },
        py: compact ? '6px' : '8px',
        // The backdrop is a layer of its own so it can be faded independently of the text and the
        // controls, which always stay fully opaque.
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          backgroundImage: (theme: Theme) => {
            const tint = alpha(theme.palette.info.main, 0.12)
            return `linear-gradient(${tint}, ${tint})`
          },
          borderTop: (theme: Theme) => `1px solid ${alpha(theme.palette.info.main, 0.24)}`,
          borderBottom: (theme: Theme) => `1px solid ${alpha(theme.palette.info.main, 0.24)}`,
          // Collapsed over the landing hero, the strip dissolves towards the right so the artwork
          // behind it stays visible. Expanded it goes solid, because then it is what has to be
          // read. Only from md up: on a narrow screen the headline itself reaches that far.
          ...(fadeBackdrop && {
            maskImage: { xs: 'none', md: BACKDROP_FADE },
            WebkitMaskImage: { xs: 'none', md: BACKDROP_FADE }
          })
        }
      }}
    >
      <Stack
        direction='row'
        alignItems='center'
        spacing={1}
        sx={{ position: 'relative', minHeight: compact ? ROW_HEIGHT_COMPACT : ROW_HEIGHT }}
      >
        <Iconify
          icon='solar:info-circle-bold-duotone'
          width={iconSize}
          sx={{ flexShrink: 0, color: 'info.main' }}
        />

        <ButtonBase
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            justifyContent: 'flex-start',
            textAlign: 'left',
            borderRadius: 0.5
          }}
        >
          <Typography
            noWrap
            variant='body2'
            sx={{
              width: '100%',
              fontWeight: 600,
              color: 'text.primary',
              ...(compact && { fontSize: 13, lineHeight: `${ROW_HEIGHT_COMPACT}px` })
            }}
          >
            {item.title || item.message}
          </Typography>
        </ButtonBase>

        {total > 1 && (
          <Stack direction='row' spacing={0.5} sx={{ flexShrink: 0, px: 0.5 }}>
            {news.map((entry, entryIndex) => (
              <Box
                key={entry.key}
                component='button'
                type='button'
                aria-label={t('news.goTo', { number: entryIndex + 1 })}
                aria-current={entryIndex === index}
                onClick={() => handleSelect(entryIndex)}
                sx={{
                  p: 0,
                  width: 8,
                  height: 8,
                  border: 0,
                  cursor: 'pointer',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s',
                  bgcolor: (theme) =>
                    entryIndex === index
                      ? theme.palette.info.main
                      : alpha(theme.palette.info.main, 0.32)
                }}
              />
            ))}
          </Stack>
        )}

        <IconButton
          size='small'
          onClick={() => setExpanded((current) => !current)}
          aria-label={expanded ? t('news.collapse') : t('news.expand')}
          sx={{ ...controlSx, color: 'info.main' }}
        >
          <Iconify
            width={iconSize}
            icon='eva:arrow-ios-downward-fill'
            sx={{
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(180deg)' : 'none'
            }}
          />
        </IconButton>

        {dismissible && (
          <IconButton
            size='small'
            onClick={() => setDismissed(true)}
            aria-label={t('news.close')}
            sx={{ ...controlSx, color: 'text.secondary' }}
          >
            <Iconify width={iconSize} icon='mingcute:close-line' />
          </IconButton>
        )}
      </Stack>

      <Collapse in={expanded} unmountOnExit>
        <Box
          sx={{
            position: 'relative',
            pt: 1,
            pl: `${iconSize + 8}px`,
            pr: 1,
            '& p': { m: 0, mb: 1, '&:last-of-type': { mb: 0 } },
            '& strong': { fontWeight: 700 },
            '& a': { color: 'info.dark' },
            typography: 'body2',
            color: 'text.secondary'
          }}
        >
          <ReactMarkdown>{item.message}</ReactMarkdown>
        </Box>
      </Collapse>
    </Box>
  )
}
