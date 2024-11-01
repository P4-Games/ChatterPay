'use client'

import Container from '@mui/material/Container'

import { useTranslate } from 'src/locales'
import { useGetNftById } from 'src/app/api/_hooks'

import EmptyContent from 'src/components/empty-content'
import { useSettingsContext } from 'src/components/settings'
import { LoadingScreen } from 'src/components/loading-screen'

import { INFT } from 'src/types/wallet'

import NftItemShare from '../nft-item-share'

// ----------------------------------------------------------------------

type NftItemProps = {
  nftId: string
}
export default function NftShareView({ nftId }: NftItemProps) {
  const { t } = useTranslate()
  const settings = useSettingsContext()

  const {
    data: nftData,
    isLoading
  }: {
    data: INFT
    isLoading: boolean
  } = useGetNftById(nftId)

  const notFound = !nftData

  const renderContent = (
    <>
      {notFound ? (
        <EmptyContent filled title={t('common.nodata')} sx={{ py: 10 }} />
      ) : (
        <NftItemShare nftId={nftId} nftData={nftData} />
      )}
    </>
  )

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {isLoading ? <LoadingScreen /> : renderContent}
    </Container>
  )
}
