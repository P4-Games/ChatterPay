import { useMemo } from 'react'

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

const ICONS = {
  user: icon('ic_user'),
  banking: icon('ic_banking')
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
            children: [{ title: t('menu.account'), path: paths.dashboard.user.account }]
          }
        ]
      }
    ],
    [t]
  )

  return data
}
