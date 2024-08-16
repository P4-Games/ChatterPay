'use client'

import Image from 'next/image'
import { m } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { Box, Stack } from '@mui/system'
import { Card, Button } from '@mui/material'
import Typography from '@mui/material/Typography'

import { useResponsive } from 'src/hooks/use-responsive'

import MainLayout from 'src/layouts/main'

import { varFade } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function Mint({ params }: { params: { id: string } }) {
  const { t } = useTranslation()

  const mdUp = useResponsive('up', 'md')
  const router = useRouter()

  const [nftData, setNftData] = useState<{
    image_url: string
    description: string
  }>({
    image_url: '',
    description: ''
  })

  useEffect(() => {
    const getData = async () => {
      const NFTData = await fetch(
        `https://chatterpay-back-ylswtey2za-uc.a.run.app/nft/${parseInt(params.id, 10)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ).then((res) => res.json())

      if (!NFTData) {
        router.push('/404')
        return
      }

      console.log(NFTData)

      const { image, description } = NFTData

      setNftData({
        image_url: image,
        description
      })
    }

    getData()
  }, [params.id, router])

  const handleOpenOpenSea = () => {
    const URL = `https://testnets.opensea.io/assets/arbitrum-sepolia/0xedeb3db84518d539c8d7a4755d4be48dc1f876c1/${params.id}`
    router.push(URL)
  }

  const handleMint = async () => {
    const URL = `https://api.whatsapp.com/send/?phone=5491164629653&text=Me%20gustar%C3%ADa%20mintear%20el%20id%20${params.id}`
    router.push(URL)
  }

  return (
    <MainLayout>
      <Stack spacing={3} sx={{ mb: 10, textAlign: 'center' }}>
        <m.div variants={varFade().in}>
          <Typography
            variant='h2'
            sx={{
              textAlign: 'center',
              maxWidth: 'min(700px, 100%)',
              marginTop: '20px',
              marginLeft: 'auto',
              marginRight: 'auto',
              mb: mdUp ? 0 : 5
            }}
          >
            Reclamá tu certificado en blockchain gratis!
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
            {nftData.description}
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
            <Image width={200} height={200} src={nftData.image_url} alt={nftData.description} />
            <m.button
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1, cursor: 'pointer' }}
              transition={{ duration: 0.1 }}
              onClick={handleOpenOpenSea}
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
                alt='Open Sea Logo'
              />
            </m.button>
          </Card>
          <m.div variants={varFade().inUp}>
            <Button size='large' color='inherit' variant='contained' onClick={handleMint}>
              Reclamar
            </Button>
          </m.div>
        </Box>
      </Stack>
    </MainLayout>
  )
}
