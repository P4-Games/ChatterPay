'use client'

import Container from '@mui/material/Container'

import { useTranslate } from 'src/locales'
import { useGetWalletNft } from 'src/app/api/_hooks/'

import EmptyContent from 'src/components/empty-content'
import { useSettingsContext } from 'src/components/settings'
import { LoadingScreen } from 'src/components/loading-screen'

import { INFT } from 'src/types/wallet'

import NftItemMint from '../nft-item-mint'

// ----------------------------------------------------------------------

type NftItemProps = {
  walletId: string
  nftId: string
}

export default function NftView({ walletId, nftId }: NftItemProps) {
  const { t } = useTranslate()
  const settings = useSettingsContext()

  const { data: nft, isLoading: loadingNft }: { data: INFT | undefined; isLoading: boolean } =
    useGetWalletNft(walletId, nftId)

  const notFound = !nft

  const renderContent = (
    <>
      {notFound ? (
        <EmptyContent filled title={t('common.nodata')} sx={{ py: 10 }} />
      ) : (
        <NftItemMint nft={nft} />
      )}
    </>
  )

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {loadingNft ? <LoadingScreen /> : renderContent}
    </Container>
  )
}
