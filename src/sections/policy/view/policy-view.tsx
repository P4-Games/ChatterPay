import Container from '@mui/material/Container'

import MarkdownContent from 'src/components/markdown-content'

// ----------------------------------------------------------------------

type Props = {
  content: string
}

export default function PolicyView({ content }: Props) {
  return (
    <Container maxWidth='md' sx={{ pt: 4, pb: 10, minHeight: '100vh' }}>
      <MarkdownContent content={content} />
    </Container>
  )
}
