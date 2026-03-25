import { useMemo } from 'react'

import Box from '@mui/material/Box'

import { paths } from 'src/routes/paths'

import { useTranslate } from 'src/locales'

import SvgColor from 'src/components/svg-color'

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
)

const polymarketIcon = (
  <Box
    component='img'
    src='/assets/icons/polymarket/logo.svg'
    sx={{
      width: 22,
      height: 22,
      filter: 'grayscale(1)',
      opacity: 0.8
    }}
  />
)

const ICONS = {
  user: icon('ic_user'),
  nft: icon('ic_label'),
  chatterpoints: icon('ic_chatterpoints'),
  account: icon('ic_account'),
  notification: icon('ic_mail'),
  banking: icon('ic_banking'),
  polymarket: polymarketIcon
}

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useTranslate()

  const data = useMemo(
    () => [
      // ----------------------------------------------------------------------
      {
        subheader: t('menu.overview'),
        items: [
          {
            title: t('menu._dashboard'),
            path: paths.dashboard.root,
            icon: ICONS.banking
          },
          {
            title: t('menu.chatterpoints'),
            path: paths.dashboard.chatterpoints.root,
            icon: ICONS.chatterpoints
          },
          {
            title: t('menu.nfts'),
            path: paths.dashboard.nfts.root,
            icon: ICONS.nft
          },
          {
            title: 'Polymarket',
            path: paths.dashboard.polymarket.root,
            icon: ICONS.polymarket
          }
        ]
      },
      // ----------------------------------------------------------------------
      {
        subheader: t('menu.management'),
        items: [
          {
            title: t('menu.user'),
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [
              {
                title: t('menu.account'),
                icon: ICONS.account,
                path: paths.dashboard.user.root
              }
            ]
          }
        ]
      }
    ],
    [t]
  )

  return data
}
