import Image from 'next/image'
import { useState } from 'react'
import { m } from 'framer-motion'
import { Icon } from '@iconify/react'

import { Box, Stack } from '@mui/system'
import { Card, Button, Dialog, Typography, IconButton, DialogTitle, DialogContent, DialogActions } from '@mui/material'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'
import { NFT_MARKETPLACE_URL, NFT_IMAGE_REPOSITORY } from 'src/config-global'

import { varFade } from 'src/components/animate'

import { INFT, ImageURLRepository } from 'src/types/wallet'

// ----------------------------------------------------------------------

type NftItemClaimProps = {
  nftId: string
  nftData: INFT
}

export default function NftItemShare({ nftId, nftData }: NftItemClaimProps) {
  const mdUp = useResponsive('up', 'md')
  const { t } = useTranslate()
  const [openShare, setOpenShare] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const handleOpenOpenSea = () => {
    const url = `${NFT_MARKETPLACE_URL}/${nftId}`
    window.open(url, '_blank')
  }

  const handleShare = (platform: string) => {
    const nftUrl = `${NFT_MARKETPLACE_URL}/${nftId}`
    const text = nftData.metadata.description
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(nftUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(nftUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${nftUrl}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(nftUrl)}`,
    } as const

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${NFT_MARKETPLACE_URL}/${nftId}`)
      enqueueSnackbar(t('nfts.share.clipboard'), { variant: 'info' })
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  let imageUrl = nftData.metadata.image_url[NFT_IMAGE_REPOSITORY as ImageURLRepository]
    ? nftData.metadata.image_url[NFT_IMAGE_REPOSITORY as ImageURLRepository]
    : nftData.metadata.image_url.gcp
  imageUrl = imageUrl || '/assets/images/nfts/default_nft.png'

  const handleTriggerShare = async () => {
    if (!openShare && !navigator.share) {
      try {
        await navigator.share({
          title: nftData.metadata.description,
          url: `${NFT_MARKETPLACE_URL}/${nftId}`
        })
      } catch (err) {
        console.error('Error al compartir:', err)
      }
    } else {
      setOpenShare(!openShare)
    }
  }

  const socialButtons = [
    { icon: 'ri:twitter-x-fill', name: 'Twitter', action: () => handleShare('twitter') },
    { icon: 'ri:whatsapp-fill', name: 'WhatsApp', action: () => handleShare('whatsapp') },
    { icon: 'ri:linkedin-box-fill', name: 'LinkedIn', action: () => handleShare('linkedin') },
    { icon: 'ri:facebook-circle-fill', name: 'Facebook', action: () => handleShare('facebook') },
    { icon: 'ri:links-fill', name: 'Copiar Link', action: handleCopyLink },
  ]

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
          
          {/* Botones flotantes */}
          <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 1 }}>
            <m.div variants={varFade().in}>
              <IconButton
                onClick={() => setOpenShare(true)}
                sx={{ 
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                }}
              >
                <Icon icon="ri:share-fill" width={24} />
              </IconButton>
            </m.div>
            
            <m.button
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1, cursor: 'pointer' }}
              transition={{ duration: 0.1 }}
              onClick={handleOpenOpenSea}
              style={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '50%',
                padding: '8px',
              }}
            >
              <Image
                width={24}
                height={24}
                src='https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.svg'
                alt={t('nfts.claim.opensea-alt')}
              />
            </m.button>
          </Box>
        </Card>

        <m.div variants={varFade().inUp}>
          <Button size='large' color='inherit' variant='contained' onClick={handleTriggerShare}>
            <Icon icon="ri:share-fill" width={20} style={{ marginRight: 8 }} /> {t('nfts.share.cta')}
          </Button>
        </m.div>
      </Box>

      {/* Diálogo de compartir */}
      <Dialog 
        open={openShare} 
        onClose={handleTriggerShare}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('nfts.share.cta')}</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 2,
            pt: 2
          }}>
            {socialButtons.map((button) => (
              <Button
                key={button.name}
                onClick={button.action}
                variant="outlined"
                startIcon={<Icon icon={button.icon} />}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                {button.name}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTriggerShare}>{t('nfts.share.close')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}