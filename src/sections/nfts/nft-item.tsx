import { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { fDate } from 'src/utils/format-time'
import { NFT_SHARE, UI_BASE_URL, EXPLORER_NFT_URL, NFT_MARKETPLACE_URL } from 'src/config-global'

import Iconify from 'src/components/iconify'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

import type { INFT } from 'src/types/wallet'

import { getNftImageUrl } from './utils'

// ----------------------------------------------------------------------

const renderExternalLink = (url: string, name: string) => (
  <Link href={url} target='_blank' rel='noopener noreferrer' color='primary.main'>
    {name}
  </Link>
)

// Glassy overlay chip used on top of the artwork
const overlayChipSx = {
  px: 1,
  py: 0.25,
  borderRadius: 0.75,
  bgcolor: 'rgba(0, 0, 0, 0.56)',
  backdropFilter: 'blur(6px)',
  color: 'common.white',
  typography: 'caption',
  fontWeight: 700,
  lineHeight: 1.6,
  zIndex: 1
} as const

type Props = {
  nft: INFT
}

/**
 * Gallery card for a single NFT: full-bleed artwork with id/edition chips,
 * clamped description and actions menu (marketplace, share, metadata).
 * @param {Props} props - NFT to render.
 * @returns {JSX.Element} NFT card.
 */
export default function NftItem({ nft }: Props) {
  const { t } = useTranslate()
  const popover = usePopover()
  const theme = useTheme()

  const { trxId, nftId, metadata } = nft

  const linkTrx = `${EXPLORER_NFT_URL}/tx/${trxId}`
  const linkMarketplace = `${NFT_MARKETPLACE_URL}/${nft.minted_contract_address}/${nftId}`

  const mintUrl = `${UI_BASE_URL}/nfts/mint/${nftId.toString()}`
  const linkShare = `${NFT_SHARE.replace('MESSAGE', `${t('nfts.mint')}: ${mintUrl}`)}`

  const [openMetadata, setOpenMetadata] = useState(false)

  const imageUrl = getNftImageUrl(nft)

  const { geolocation } = metadata || {}
  const latitude = geolocation?.latitude || ''
  const longitude = geolocation?.longitude || ''

  const editionLabel = nft.original
    ? t('nfts.item.original')
    : t('nfts.item.copy-of')
        .replace('{X}', String(nft.copy_order_original) || '1')
        .replace('{Z}', String(nft.total_of_original) || '1')

  const handleView = () => {
    popover.onClose()
    window.open(linkMarketplace, '_blank')
  }

  const handleShare = () => {
    popover.onClose()
    window.open(linkShare, '_blank')
  }

  const handleViewTrx = () => {
    popover.onClose()
    window.open(linkTrx, '_blank', 'noopener,noreferrer')
  }

  const handleViewMetadata = () => {
    popover.onClose()
    setOpenMetadata(true)
  }

  const renderMapLink = (lng: string, lat: string) => {
    if (lng && lat) {
      const mapsUrl = `https://www.google.com/maps/@${lat},${lng},15z`
      return (
        <Typography variant='body2'>{renderExternalLink(mapsUrl, t('nfts.item.maps'))}</Typography>
      )
    }
    return <Typography variant='body2'>{t('nfts.item.geo-no-data')}</Typography>
  }

  const renderModalMetadata = (
    <Dialog open={openMetadata} onClose={() => setOpenMetadata(false)} fullWidth maxWidth='xs'>
      <DialogTitle>{t('nfts.item.metadata')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
              {t('nfts.item.meta-image')}
            </Typography>
            <Typography variant='body2'>
              {renderExternalLink(metadata.image_url.gcp, 'Google')}
              {' · '}
              {renderExternalLink(metadata.image_url.ipfs, 'IPFS')}
            </Typography>
          </Box>
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
              {t('nfts.item.meta-description')}
            </Typography>
            <Typography variant='body2'>{metadata.description}</Typography>
          </Box>
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
              {t('nfts.item.meta-geo')}
            </Typography>
            {renderMapLink(longitude, latitude)}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='inherit' onClick={() => setOpenMetadata(false)}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  )

  const renderMenu = (
    <CustomPopover open={popover.open} onClose={popover.onClose} arrow='right-top'>
      <MenuItem onClick={handleView}>
        <Iconify icon='solar:eye-bold' />
        {t('common.view')}
      </MenuItem>
      <MenuItem onClick={handleShare}>
        <Iconify icon='solar:share-bold' />
        {t('common.share')}
      </MenuItem>
      <MenuItem onClick={handleViewTrx}>
        <Iconify icon='solar:link-round-bold' />
        {t('nfts.view-trx')}
      </MenuItem>
      <MenuItem onClick={handleViewMetadata}>
        <Iconify icon='solar:document-bold-duotone' />
        {t('nfts.item.metadata')}
      </MenuItem>
    </CustomPopover>
  )

  return (
    <>
      <Card
        sx={{
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          boxShadow: theme.customShadows.card,
          overflow: 'hidden',
          transition: 'all 0.18s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.customShadows.z20
          }
        }}
      >
        {/* Artwork — full bleed, square */}
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{ position: 'absolute', top: 12, left: 12, ...overlayChipSx }}
          >{`#${nftId}`}</Box>
          <Box sx={{ position: 'absolute', top: 12, right: 12, ...overlayChipSx }}>
            {editionLabel}
          </Box>

          <Link href={linkMarketplace} target='_blank' rel='noopener' underline='none'>
            <Box
              component='img'
              src={imageUrl}
              alt={metadata.description}
              loading='lazy'
              decoding='async'
              sx={{
                width: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                display: 'block',
                bgcolor: alpha(theme.palette.grey[500], 0.08)
              }}
            />
          </Link>
        </Box>

        {/* Details */}
        <Stack direction='row' alignItems='flex-start' spacing={1} sx={{ p: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {metadata.description}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.disabled' }}>
              {fDate(nft.timestamp)}
            </Typography>
          </Box>

          <IconButton size='small' onClick={popover.onOpen} sx={{ flexShrink: 0, mt: -0.5 }}>
            <Iconify icon='eva:more-vertical-fill' width={18} />
          </IconButton>
        </Stack>
      </Card>

      {renderMenu}

      {renderModalMetadata}
    </>
  )
}
