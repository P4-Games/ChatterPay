'use client'

import Script from 'next/script'
import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { MS_CLARITY_ID, GA_MEASUREMENT_ID } from '../../config-global'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
    clarity: {
      q: any[]
      (...args: any[]): void
    }
  }
}

function AnalyticsContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname + searchParams.toString()
      })
    }

    if (MS_CLARITY_ID) {
      const maxAttempts = 10
      let attempts = 0

      const interval = setInterval(() => {
        if (typeof window.clarity === 'function') {
          window.clarity('consent')
          window.clarity('set', 'disableFilterAnimation', true)
          clearInterval(interval)
        } else {
          attempts += 1
          if (attempts >= maxAttempts) {
            clearInterval(interval)
          }
        }
      }, 1000)

      return () => clearInterval(interval)
    }
    return undefined
  }, [pathname, searchParams])

  if (!GA_MEASUREMENT_ID && !MS_CLARITY_ID) {
    return null
  }

  return (
    <>
      {/* Google Analytics */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy='afterInteractive'
          />
          <Script
            id='gtag-init'
            strategy='afterInteractive'
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: false
                });
              `
            }}
          />
        </>
      )}

      {/* Microsoft Clarity */}
      {MS_CLARITY_ID && (
        <Script
          id='microsoft-clarity'
          strategy='lazyOnload'
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                c[a]('consent');
                c[a]('set', 'disableFilterAnimation', true);
              })(window, document, "clarity", "script", "${MS_CLARITY_ID}");
            `
          }}
        />
      )}
    </>
  )
}

export default function Analytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsContent />
    </Suspense>
  )
}
