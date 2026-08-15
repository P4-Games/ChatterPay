'use client'

import ReactMarkdown from 'react-markdown'

import Box from '@mui/material/Box'

// ----------------------------------------------------------------------

type Props = {
  content: string
}

export default function MarkdownContent({ content }: Props) {
  return (
    <Box
      sx={{
        '& h1': { fontSize: '2rem', fontWeight: 700, mt: 5, mb: 2, textAlign: 'center' },
        '& h2': { fontSize: '1.375rem', fontWeight: 600, mt: 4, mb: 1.5 },
        '& h3': { fontSize: '1.15rem', fontWeight: 600, mt: 3, mb: 1 },
        '& h4, & h5, & h6': { fontWeight: 600, mt: 2, mb: 1 },
        '& p': { fontSize: '1rem', lineHeight: 1.75, mb: 2, color: 'text.primary' },
        '& ul, & ol': { pl: 3, mb: 2 },
        '& li': { fontSize: '1rem', lineHeight: 1.75, mb: 0.5 },
        '& a': { color: 'primary.main' },
        '& strong': { fontWeight: 600 },
        '& em': { fontStyle: 'italic' },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          pl: 2,
          ml: 0,
          my: 2,
          color: 'text.secondary'
        },
        '& code': {
          fontFamily: 'monospace',
          bgcolor: 'action.hover',
          px: 0.5,
          borderRadius: 0.5,
          fontSize: '0.875em'
        },
        '& pre': {
          bgcolor: 'action.hover',
          p: 2,
          borderRadius: 1,
          overflow: 'auto',
          mb: 2,
          '& code': { bgcolor: 'transparent', p: 0 }
        },
        '& hr': { my: 3, borderColor: 'divider' }
      }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  )
}
