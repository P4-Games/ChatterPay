import Box from '@mui/material/Box'
import { Link } from '@mui/material'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'
import { NFT_SHARE, UI_API_URL, NFT_MARKETPLACE, NFT_TRX_EXPLORER } from 'src/config-global'

import Iconify from 'src/components/iconify'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

import { INFT } from 'src/types/wallet'

// ----------------------------------------------------------------------

type Props = {
  nft: INFT
}

export default function NftItem({ nft }: Props) {
  const { t } = useTranslate()
  const popover = usePopover()

  const { trxId, nftId, metadata } = nft

  const linkTrx = `${NFT_TRX_EXPLORER}/tx/${trxId}`
  const linkMarketplace = `${NFT_MARKETPLACE.replace('ID', nftId.toString())}`

  const mintUrl = `${UI_API_URL}/nfts/mint/${nftId.toString()}`
  const linkShare = `${NFT_SHARE.replace('MESSAGE', `${t('nfts.mint')}: ${mintUrl}`)}`

  const handleView = () => {
    popover.onClose()
    window.open(linkMarketplace, '_blank')
  }

  const handleShare = () => {
    popover.onClose()
    window.open(linkShare, '_blank')
  }

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
            <Link
              href={linkMarketplace}
              target='_blank'
              rel='noopener'
              color='inherit'
              underline='none'
            >
              <Avatar
                alt='nft'
                src={metadata.image}
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
          </Box>
        </Stack>
        <Divider sx={{ borderStyle: 'dashed' }} />

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
      </Card>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow='right-top'>
        <MenuItem onClick={handleView}>
          <Iconify icon='solar:eye-bold' />
          {t('common.view')}
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <Iconify icon='solar:eye-bold' />
          {t('common.share')}
        </MenuItem>
      </CustomPopover>
    </>
  )
}
