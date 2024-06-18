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
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard')
}

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useTranslate()

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('overview'),
        items: [
          {
            title: t('Dashboard'),
            path: paths.dashboard.root,
            icon: ICONS.banking
          }
        ]
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          // USER
          {
            title: t('user'),
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [{ title: t('account'), path: paths.dashboard.user.account }]
          },

          // INVOICE
          {
            title: t('invoice'),
            path: paths.dashboard.invoice.root,
            icon: ICONS.invoice,
            children: [
              { title: t('list'), path: paths.dashboard.invoice.root },
              {
                title: t('details'),
                path: paths.dashboard.invoice.demo.details
              },
              { title: t('create'), path: paths.dashboard.invoice.new },
              { title: t('edit'), path: paths.dashboard.invoice.demo.edit }
            ]
          }
        ]
      }
    ],
    [t]
  )

  return data
}
