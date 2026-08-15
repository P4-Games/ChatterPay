import fs from 'fs'
import path from 'path'
import { cookies, headers } from 'next/headers'

import { PolicyView } from 'src/sections/policy/view'
import { languageCookieKey, resolveInitialLanguage } from 'src/locales/detect-language'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Privacy Policy'
}

export default function PolicyPage() {
  const language = resolveInitialLanguage(
    cookies().get(languageCookieKey)?.value,
    headers().get('accept-language')
  )

  const content = fs.readFileSync(
    path.join(process.cwd(), 'src/content/legal', `privacy-${language}.md`),
    'utf-8'
  )

  return <PolicyView content={content} />
}
