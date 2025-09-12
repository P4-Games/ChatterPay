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
  const { loading } = useAuthContext()

  return <>{loading ? <SplashScreen /> : <Container>{children}</Container>}</>
}

// ----------------------------------------------------------------------

function Container({ children }: Props) {
  const router = useRouter()

  const { authenticated, method } = useAuthContext()

  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (authenticated) {
      setChecked(true)
      return
    }
    const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString()
    const loginPath = loginPaths[method]
    router.replace(`${loginPath}?${searchParams}`)
  }, [authenticated, method, router])

  if (!checked) {
    return null
  }

  return <>{children}</>
}
