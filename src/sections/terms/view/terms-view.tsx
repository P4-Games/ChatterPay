'use client'

import Container from '@mui/material/Container'

import { useRefreshOnLanguageChange } from 'src/locales'

import MarkdownContent from 'src/components/markdown-content'

// ----------------------------------------------------------------------

type Props = {
  content: string
}

export default function TermsView({ content }: Props) {
  // The document is picked per language on the server, so a switch in the
  // popover only reaches it through a refresh.
  useRefreshOnLanguageChange()

  return (
    <Container maxWidth='md' sx={{ pt: 4, pb: 10, minHeight: '100vh' }}>
      <MarkdownContent content={content} />
    </Container>
  )
}
