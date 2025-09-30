import Image from 'next/image'
import { m } from 'framer-motion'

import { Box, Stack } from '@mui/system'
import { Card, Button, Typography } from '@mui/material'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'
import { BOT_WAPP_URL, NFT_MARKETPLACE_URL, NFT_IMAGE_REPOSITORY } from 'src/config-global'

import { varFade } from 'src/components/animate'

import { INFT, ImageURLRepository } from 'src/types/wallet'

// ----------------------------------------------------------------------

type NftItemClaimProps = {
  nftId: string
  nftData: INFT
}

export default function NftItemClaim({ nftId, nftData }: NftItemClaimProps) {
  const mdUp = useResponsive('up', 'md')
  const { t } = useTranslate()

  const handleOpenOpenSea = () => {
    const url = `${NFT_MARKETPLACE_URL}/${nftData.minted_contract_address}/${nftId}`
    window.open(url, '_blank')
  }

  let imageUrl = nftData.metadata.image_url[NFT_IMAGE_REPOSITORY as ImageURLRepository]
    ? nftData.metadata.image_url[NFT_IMAGE_REPOSITORY as ImageURLRepository]
    : nftData.metadata.image_url.gcp
  imageUrl = imageUrl || '/assets/images/nfts/default_nft.png'

  const handleMint = async () => {
    const text = 'Me gustaría mintear el NFT'
    const message = `${text} ${nftId}`
    const url = `${BOT_WAPP_URL.replace('MESSAGE', message)}`
    window.open(url, '_blank')
  }

  return (
    <Stack spacing={3} sx={{ mb: 10, textAlign: 'center' }}>
      <m.div variants={varFade().in}>
        <Typography
          variant='h3'
          sx={{
            textAlign: 'center',
            maxWidth: 'min(700px, 100%)',
            marginTop: '20px',
            marginLeft: 'auto',
            marginRight: 'auto',
            mb: mdUp ? 0 : 5
          }}
        >
          {t('nfts.claim.cta-msg')}
        </Typography>
      </m.div>
      <m.div variants={varFade().in}>
        <Typography
          variant='subtitle1'
          sx={{
            textAlign: 'center',
            fontWeight: 400,
            mb: mdUp ? 0 : 5
          }}
        >
          {nftData.metadata.description}
        </Typography>
      </m.div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          width: '100%',
          marginTop: '20px'
        }}
      >
        <Card
          sx={{
            position: 'relative'
          }}
        >
          <Box sx={{ maxWidth: 400, maxHeight: 400, overflow: 'hidden' }}>
            <Image
              layout='responsive'
              width={200}
              height={200}
              src={imageUrl}
              alt={nftData.metadata.description}
            />
          </Box>
          <m.button
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1, cursor: 'pointer' }}
            transition={{ duration: 0.1 }}
            onClick={handleOpenOpenSea as any}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              backgroundColor: 'transparent',
              border: 'none'
            }}
          >
            <Image
              width={40}
              height={40}
              src='https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.svg'
              alt={t('nfts.claim.opensea-alt')}
            />
          </m.button>
        </Card>
        <m.div variants={varFade().inUp}>
          <Button size='large' color='inherit' variant='contained' onClick={handleMint}>
            {t('nfts.claim.cta')}
          </Button>
        </m.div>
      </Box>
    </Stack>
  )
}
