import { NextResponse, type NextRequest } from 'next/server'

import { getActiveNews } from 'src/services/news-service'

import type { NewsTarget } from 'src/types/news'

// The window that decides whether an announcement shows lives in Mongo and is evaluated per
// request, so this route must never be cached at build time.
export const dynamic = 'force-dynamic'

/**
 * Proxies the active announcements to the browser.
 *
 * The backend credential is not public, so the banner cannot call the API directly. Any failure
 * answers with an empty list rather than an error: a banner is never worth breaking a page for.
 *
 * `target` says which surface is asking. Anything other than `dashboard` reads as the landing, so a
 * hand-made call never widens what a public page returns.
 */
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang') ?? 'en'
  const target: NewsTarget =
    request.nextUrl.searchParams.get('target') === 'dashboard' ? 'dashboard' : 'landing'

  try {
    const news = await getActiveNews(lang, target)

    return NextResponse.json({ status: 'success', data: { news } }, { status: 200 })
  } catch (error) {
    console.error('Error fetching news:', error)

    return NextResponse.json({ status: 'success', data: { news: [] } }, { status: 200 })
  }
}
