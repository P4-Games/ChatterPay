import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { NFT_IMAGE_REPOSITORY } from 'src/config-global'
import Iconify from 'src/components/iconify'

import type { INFT, ImageURLRepository } from 'src/types/wallet'

// ----------------------------------------------------------------------

type Props = {
  nfts: INFT[]
  loading: boolean
}

/**
 * Resolves the display image for an NFT, preferring the configured repository.
 * @param {INFT} nft - NFT record.
 * @returns {string} Image URL (falls back to the default artwork).
 */
export function getNftImageUrl(nft: INFT): string {
  const repo = NFT_IMAGE_REPOSITORY as ImageURLRepository
  return (
    nft.metadata.image_url[repo] ||
    nft.metadata.image_url.gcp ||
    '/assets/images/nfts/default_nft.png'
  )
}

/**
 * Hero for the NFTs page: headline, collection count card and a preview of
 * the most recent mint. Mirrors the dashboard/polymarket hero layout.
 * @param {Props} props - Wallet NFTs and loading flag.
 * @returns {JSX.Element} Hero section.
 */
export default function NftsHero({ nfts, loading }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent='space-between'
      spacing={4}
    >
      {/* Left: heading + collection count */}
      <Box sx={{ maxWidth: 480, width: '100%' }}>
        <Typography
          variant='h1'
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 2,
            fontSize: { xs: 32, md: 36 },
            letterSpacing: '-0.36px'
          }}
        >
          {t('nfts.hero.title')}
        </Typography>

        <Typography
          variant='body1'
          sx={{
            color: 'text.primary',
            fontSize: 16,
            letterSpacing: '-0.16px',
            lineHeight: 1.5,
            mb: 3
          }}
        >
          {t('nfts.hero.subtitle')}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            px: 2.5,
            py: 2,
            boxShadow: theme.customShadows.card,
            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            width: { xs: '100%', sm: 'auto' },
            minWidth: { sm: 300 }
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Iconify icon='solar:gallery-bold-duotone' width={26} sx={{ color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography
              variant='caption'
              sx={{ display: 'block', color: 'text.secondary', fontWeight: 600 }}
            >
              {t('nfts.hero.total-label')}
            </Typography>
            {loading ? (
              <Skeleton variant='text' width={64} sx={{ fontSize: theme.typography.h4.fontSize }} />
            ) : (
              <Typography variant='h4' fontWeight={700}>
                {nfts?.length ?? 0}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Stack>
  )
}
