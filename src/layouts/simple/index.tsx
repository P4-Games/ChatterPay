import BaseLayout from '../baseLayout'
import Header from '../common/header-simple'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function SimpleLayout({ children }: Props) {
  return (
    <BaseLayout>
      <Header />
      {children}
    </BaseLayout>
  )
}
