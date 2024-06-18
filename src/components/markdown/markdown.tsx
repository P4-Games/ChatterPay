/* eslint-disable perfectionist/sort-imports */
import 'src/utils/highlight'

// markdown plugins
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

import Link from '@mui/material/Link'

import { RouterLink } from 'src/routes/components'

import Image from '../image'
import StyledMarkdown from './styles'
import { MarkdownProps } from './types'

// ----------------------------------------------------------------------

export default function Markdown({ sx, ...other }: MarkdownProps) {
  return (
    <StyledMarkdown sx={sx}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeHighlight, [remarkGfm, { singleTilde: false }]]}
        components={components}
        {...other}
      />
    </StyledMarkdown>
  )
}

// ----------------------------------------------------------------------

const components = {
  img: ({ ...props }) => <Image alt={props.alt} ratio='16/9' sx={{ borderRadius: 2 }} {...props} />,
  a: ({ ...props }) => {
    const isHttp = props.href.includes('http')

    return isHttp ? (
      <Link target='_blank' rel='noopener' {...props} />
    ) : (
      <Link component={RouterLink} href={props.href} {...props}>
        {props.children}
      </Link>
    )
  }
}
