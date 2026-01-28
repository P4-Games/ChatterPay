/* eslint-disable perfectionist/sort-imports */
import 'src/global.css'

import 'src/locales/i18n'

// ----------------------------------------------------------------------

import ThemeProvider from 'src/theme'
import { LocalizationProvider } from 'src/locales'
import { primaryFont } from 'src/theme/typography'

import ProgressBar from 'src/components/progress-bar'
import { MotionLazy } from 'src/components/animate/motion-lazy'
import SnackbarProvider from 'src/components/snackbar/snackbar-provider'
import { SettingsDrawer, SettingsProvider } from 'src/components/settings'

import { AuthProvider } from 'src/auth/context/jwt'
import { UI_BASE_URL } from 'src/config-global'

// ----------------------------------------------------------------------

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

export const metadata = {
  title: 'ChatterPay',
  metadataBase: new URL(UI_BASE_URL),
  description: 'Transfer crypto easily through WhatsApp using our Web3 platform.',
  keywords: 'whatsapp,transaction,pago,web3,transferencia,wallet,billetera',
  manifest: '/manifest.json',
  openGraph: {
    title: 'ChatterPay',
    description: 'Transfer crypto easily through WhatsApp using our Web3 platform.',
    url: UI_BASE_URL,
    siteName: 'ChatterPay',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/assets/images/ogimage.png',
        width: 1200,
        height: 620,
        alt: 'ChatterPay - Transfer crypto through WhatsApp'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@chatterpay',
    creator: '@chatterpay',
    title: 'ChatterPay',
    description: 'Transfer crypto easily through WhatsApp using our Web3 platform.',
    images: [
      {
        url: '/assets/images/ogimage.png',
        width: 1200,
        height: 620,
        alt: 'ChatterPay - Transfer crypto through WhatsApp'
      }
    ]
  },
  icons: [
    { rel: 'icon', url: '/assets/images/favicon/favicon.ico' },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/assets/images/favicon/favicon-16x16.png'
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/assets/images/favicon/favicon-32x32.png'
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/assets/images/favicon/apple-touch-icon.png'
    }
  ]
}

type Props = {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang='en' className={primaryFont.className}>
      <body>
        <AuthProvider>
          <LocalizationProvider>
            <SettingsProvider
              defaultSettings={{
                themeMode: 'light', // 'light' | 'dark'
                themeDirection: 'ltr', //  'rtl' | 'ltr'
                themeContrast: 'bold', // 'default' | 'bold'
                themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
                themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
                themeStretch: false
              }}
            >
              <ThemeProvider>
                <MotionLazy>
                  <SnackbarProvider>
                    <SettingsDrawer />
                    <ProgressBar />
                    {children}
                  </SnackbarProvider>
                </MotionLazy>
              </ThemeProvider>
            </SettingsProvider>
          </LocalizationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
