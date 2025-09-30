import { useEffect } from 'react'
import createCache from '@emotion/cache'
import rtlPlugin from 'stylis-plugin-rtl'
import { CacheProvider } from '@emotion/react'

// ----------------------------------------------------------------------

type Props = {
  themeDirection: 'rtl' | 'ltr'
  children: React.ReactNode
}

export default function RTL({ children, themeDirection }: Props) {
  useEffect(() => {
    document.dir = themeDirection
  }, [themeDirection])

  const cacheRtl = createCache({
    key: 'rtl',
    prepend: true,
    // https://github.com/styled-components/stylis-plugin-rtl/issues/35
    stylisPlugins: [rtlPlugin]
  })

  if (themeDirection === 'rtl') {
    return <CacheProvider value={cacheRtl}>{children}</CacheProvider>
  }

  return <>{children}</>
}
