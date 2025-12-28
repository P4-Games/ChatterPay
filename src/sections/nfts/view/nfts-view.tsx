'use client'

import { useState, useEffect } from 'react'

import Container from '@mui/material/Container'

import { useTranslate } from 'src/locales'
import type { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import { useGetWalletNfts } from 'src/app/api/hooks/'

import EmptyContent from 'src/components/empty-content'
import { useSettingsContext } from 'src/components/settings'
import { LoadingScreen } from 'src/components/loading-screen'

import type { INFT } from 'src/types/wallet'
import type { IAccount } from 'src/types/account'

import NftList from '../nft-list'

// ----------------------------------------------------------------------

export default function NftsView() {
  const { t } = useTranslate()
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [contextUser] = useState<IAccount | null>(null)

  useEffect(() => {
    if (user?.wallet) {
      setWalletAddress(user.wallet)
    }
  }, [user])

  useEffect(() => {
    if (contextUser && contextUser.wallet) {
      setWalletAddress(contextUser.wallet)
    }
  }, [contextUser])

  const { data: nfts, isLoading: loadingNfts }: { data: INFT[]; isLoading: boolean } =
    useGetWalletNfts(walletAddress)

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
