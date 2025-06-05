'use client'

import { useTranslationReady } from 'src/hooks/use-translation-ready'

// ----------------------------------------------------------------------

function TranslationLoaderFallback() {
  return null
}

type Props = {
  children: React.ReactNode
}

export default function BaseLayout({ children }: Props) {
  const ready = useTranslationReady()
  if (!ready) return <TranslationLoaderFallback />
  return <>{children}</>
}
