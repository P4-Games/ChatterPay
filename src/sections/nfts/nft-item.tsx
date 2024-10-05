import { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import {
  Link,
  Button,
  Dialog,
  useTheme,
  DialogTitle,
  DialogActions,
  DialogContent
} from '@mui/material'

import { useTranslate } from 'src/locales'
import {
  NFT_SHARE,
  UI_API_URL,
  NFT_TRX_EXPLORER,
  NFT_MARKETPLACE_URL,
  NFT_IMAGE_REPOSITORY
} from 'src/config-global'

import Iconify from 'src/components/iconify'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

import { INFT, ImageURLRepository } from 'src/types/wallet'

// ----------------------------------------------------------------------

type Props = {
  nft: INFT
}

export default function NftItem({ nft }: Props) {
  const { t } = useTranslate()
  const popover = usePopover()
  const theme = useTheme()

  const { trxId, nftId, metadata } = nft

  const linkTrx = `${NFT_TRX_EXPLORER}/tx/${trxId}`
  const linkMarketplace = `${NFT_MARKETPLACE_URL}/${nftId}`

  const mintUrl = `${UI_API_URL}/nfts/mint/${nftId.toString()}`
  const linkShare = `${NFT_SHARE.replace('MESSAGE', `${t('nfts.mint')}: ${mintUrl}`)}`

  const [openMetadata, setOpenMetadata] = useState(false)

  let imageUrl = metadata.image_url[NFT_IMAGE_REPOSITORY as ImageURLRepository]
    ? metadata.image_url[NFT_IMAGE_REPOSITORY as ImageURLRepository]
    : metadata.image_url.gcp
  imageUrl = imageUrl || '/assets/images/nfts/default_nft.png'

  const { geolocation } = metadata || {}
  const latitude = geolocation?.latitud || ''
  const longitude = geolocation?.longitud || ''

  const handleView = () => {
    popover.onClose()
    window.open(linkMarketplace, '_blank')
  }

  const handleShare = () => {
    popover.onClose()
    window.open(linkShare, '_blank')
  }

  const handleViewMetadata = () => {
    popover.onClose()
    setOpenMetadata(true)
  }

  const handleCloseMetadata = () => {
    setOpenMetadata(false)
  }

  // ----------------------------------------------------------------------

  const renderClickableLink = (url: string, name: string) => (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      style={{
        color:
          theme.palette.mode !== 'light' ? theme.palette.primary.light : theme.palette.primary.main
      }}
    >
      {name}
    </a>
  )

  const renderMapLink = (lng: string, lat: string) => {
    if (lng && lat) {
      const mapsUrl = `https://www.google.com/maps/@${lat},${lng},15z`
      return (
        <Typography variant='body2'>
          <a href={mapsUrl} target='_blank' rel='noopener noreferrer'>
            {t('nfts.item.maps')}
          </a>
        </Typography>
      )
    }
    return <Typography variant='body2'>{t('nfts.item.geo-no-data')}</Typography>
  }

  const isOriginalOrCopy = (nftItem: INFT) => {
    if (nftItem.original || false) {
      return t('nfts.item.original')
    }
    const copyText = t('nfts.item.copy-of')
      .replace('{X}', String(nft.copy_order_original) || '1')
      .replace('{Z}', String(nft.total_of_original) || '1')
    return copyText
  }

  // ----------------------------------------------------------------------

  const renderNftId = (
    <Box
      sx={{
        position: 'absolute',
        top: 30,
        left: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '2px 6px',
        borderRadius: '4px',
        color: 'white',
        fontSize: '10px',
        zIndex: 1
      }}
    >
      {`#${nftId}`}
    </Box>
  )

  const renderNftOriginalOrCopy = (
    <Box
      sx={{
        position: 'absolute',
        top: 30,
        right: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '2px 6px',
        borderRadius: '4px',
        color: 'white',
        fontSize: '10px',
        zIndex: 1
      }}
    >
      {`${isOriginalOrCopy(nft)}`}
    </Box>
  )

  const renderImage = (
    <Link href={linkMarketplace} target='_blank' rel='noopener' color='inherit' underline='none'>
      <Avatar
        alt='nft'
        src={imageUrl}
        variant='rounded'
        sx={{
          position: 'absolute',
          marginLeft: 1.5,
          marginTop: 2.5,
          marginBottom: 2.5,
          width: '90%',
          height: '90%',
          borderRadius: 2,
          overflow: 'hidden',
          objectFit: 'cover'
        }}
      />
    </Link>
  )

  const renderDescriptionItems = (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Link href={linkTrx} target='_blank' rel='noopener' color='inherit' underline='none'>
          <Stack direction='row' spacing={1.5} alignItems='center'>
            <Iconify width={16} icon='mdi:swap-horizontal' />
            <Typography variant='caption'>{t('nfts.view-trx')}</Typography>
          </Stack>
        </Link>

        <Stack direction='row' spacing={1.5} alignItems='center'>
          <Iconify width={16} icon='arcticons:openai-chatgpt' />
          <Typography variant='caption'>{metadata.description}</Typography>
        </Stack>
      </Stack>
    </Box>
  )

  const renderModalMetadata = (
    <Dialog open={openMetadata} onClose={handleCloseMetadata} fullWidth maxWidth='xs'>
      {' '}
      <DialogTitle>{t('nfts.item.metadata')}</DialogTitle>
      <DialogContent>
        <Box sx={{ padding: 2 }}>
          <Typography variant='h6'>{t('nfts.item.meta-image')}</Typography>
          {'   '}
          {renderClickableLink(metadata.image_url.gcp, 'Google')}
          {', '}
          {'   '}
          {renderClickableLink(metadata.image_url.icp, 'ICP')}
          {', '}
          {'   '}
          {renderClickableLink(metadata.image_url.ipfs, 'IPFS')}
          <Typography variant='h6' sx={{ marginTop: 2 }}>
            {t('nfts.item.meta-description')}
          </Typography>
          <Typography variant='body1'>{metadata.description}</Typography>
          <Typography variant='h6' sx={{ marginTop: 2 }}>
            {t('nfts.item.meta-geo')}
          </Typography>
          {renderMapLink(longitude, latitude)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='inherit' onClick={handleCloseMetadata}>
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
      <MenuItem onClick={handleViewMetadata}>
        <Iconify icon='arcticons:metadataremover' />
        {t('nfts.item.metadata')}
      </MenuItem>
    </CustomPopover>
  )

  return (
    <>
      <Card>
        <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon='eva:more-vertical-fill' />
        </IconButton>

        <Stack sx={{ p: 3, pb: 2, alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              width: '100%',
              height: 0,
              paddingBottom: '100%',
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {renderNftId}
            {renderNftOriginalOrCopy}
            {renderImage}
          </Box>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {renderDescriptionItems}
      </Card>

      {renderMenu}

      {renderModalMetadata}
    </>
  )
}
