import { useState, useEffect } from 'react'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { SplashScreen } from 'src/components/loading-screen'

import { useAuthContext } from '../hooks'

// ----------------------------------------------------------------------

const loginPaths: Record<string, string> = {
  jwt: paths.auth.jwt.login
}

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function AuthGuard({ children }: Props) {
  const router = useRouter()
  const { loading, authenticated, method } = useAuthContext()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) return

    if (authenticated) {
      setReady(true)
    } else {
      // Not logged in -> redirect to login
      const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString()
      const loginPath = loginPaths[method]
      router.replace(`${loginPath}?${searchParams}`)
      setReady(false)
    }
  }, [authenticated, loading, method, router])

  // Always block rendering until auth is resolved
  if (loading || !ready) {
    return <SplashScreen />
  }

  return <>{children}</>
}
