import fs from 'fs'
import path from 'path'
import { cookies, headers } from 'next/headers'

import { TermsView } from 'src/sections/terms/view'
import { languageCookieKey, resolveInitialLanguage } from 'src/locales/detect-language'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Terms of Service'
}

export default function TermsPage() {
  const language = resolveInitialLanguage(
    cookies().get(languageCookieKey)?.value,
    headers().get('accept-language')
  )

  const content = fs.readFileSync(
    path.join(process.cwd(), 'src/content/legal', `terms-${language}.md`),
    'utf-8'
  )

  return <TermsView content={content} />
}
