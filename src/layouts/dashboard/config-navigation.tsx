import { useMemo } from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import {
  Analytics01Icon,
  Image02Icon,
  StarSquareIcon,
  AccountSetting02Icon
} from '@hugeicons/core-free-icons'

import Box from '@mui/material/Box'

import { paths } from 'src/routes/paths'

import { useTranslate } from 'src/locales'

// ----------------------------------------------------------------------

const polymarketIcon = (
  <Box
    component='img'
    src='/assets/icons/polymarket/logo.svg'
    sx={{
      width: 28,
      height: 28,
      filter: 'grayscale(1)',
      opacity: 0.8
    }}
  />
)

const ICONS = {
  user: <HugeiconsIcon icon={AccountSetting02Icon} size={28} />,
  nft: <HugeiconsIcon icon={Image02Icon} size={28} />,
  chatterpoints: <HugeiconsIcon icon={StarSquareIcon} size={28} />,
  banking: <HugeiconsIcon icon={Analytics01Icon} size={28} />,
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
            title: 'Polymarket',
            path: paths.dashboard.polymarket.root,
            icon: ICONS.polymarket
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
            icon: ICONS.user
          }
        ]
      }
    ],
    [t]
  )

  return data
}
