'use client'

import { useState, useEffect } from 'react'

import Container from '@mui/material/Container'

import { useTranslate } from 'src/locales'
import { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import { useGetWalletNfts } from 'src/app/api/_hooks/'

import EmptyContent from 'src/components/empty-content'
import { useSettingsContext } from 'src/components/settings'
import { LoadingScreen } from 'src/components/loading-screen'

import { INFT } from 'src/types/wallet'

import NftList from '../nft-list'

// ----------------------------------------------------------------------

export default function NftsView() {
  const { t } = useTranslate()
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.wallet) {
      setWalletAddress(user.wallet)
    }
  }, [user])

  const { data: nfts, isLoading: loadingNfts }: { data: INFT[]; isLoading: boolean } =
    useGetWalletNfts(
      // 'none' => // avoid slow context-user load issues
      walletAddress || 'none'
    )

  const notFound = !nfts || !nfts.length
  const renderContent = (
    <>
      {notFound ? (
        <EmptyContent filled title={t('common.nodata')} sx={{ py: 10 }} />
      ) : (
        <NftList nfts={nfts} />
      )}
    </>
  )

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {loadingNfts ? <LoadingScreen /> : renderContent}
    </Container>
  )
}
