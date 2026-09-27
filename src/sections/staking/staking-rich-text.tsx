'use client'

import { Fragment } from 'react'

import Link from '@mui/material/Link'

// ----------------------------------------------------------------------

/**
 * Pages on cardano.org that explain the Cardano terms the staking screens use.
 *
 * The copy names these terms in tags, `<epoch>épocas</epoch>`, so each translation places the link on
 * its own word.
 */
export const CARDANO_GLOSSARY: Record<string, string> = {
  epoch: 'https://cardano.org/glossary/epoch/',
  drep: 'https://cardano.org/glossary/drep/'
}

const TAG = /<(\w+)>(.*?)<\/\1>/g

// ----------------------------------------------------------------------

/**
 * Renders translated text, turning its tagged terms into links that open in a new tab.
 *
 * A tag with no entry in `links` is rendered as its plain inner text, so a translation that tags a
 * term this build has no page for still reads correctly.
 *
 * @param text - The translated string.
 * @param links - The URL for each tag name. Defaults to the Cardano glossary.
 */
export default function StakingRichText({
  text,
  links = CARDANO_GLOSSARY
}: {
  text: string
  links?: Record<string, string>
}): JSX.Element {
  const parts: JSX.Element[] = []
  let last = 0

  for (const match of text.matchAll(TAG)) {
    const [whole, name, inner] = match
    const start = match.index ?? 0
    if (start > last) parts.push(<Fragment key={`t${last}`}>{text.slice(last, start)}</Fragment>)

    const href = links[name]
    parts.push(
      href ? (
        <Link
          key={`l${start}`}
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          underline='always'
          color='inherit'
          onClick={(event) => event.stopPropagation()}
        >
          {inner}
        </Link>
      ) : (
        <Fragment key={`l${start}`}>{inner}</Fragment>
      )
    )
    last = start + whole.length
  }

  if (last < text.length) parts.push(<Fragment key={`t${last}`}>{text.slice(last)}</Fragment>)

  return <>{parts}</>
}
