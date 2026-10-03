import { type NextRequest, NextResponse } from 'next/server'

import { UI_BASE_URL, ALLOWED_ORIGINS } from 'src/config-global'

// ----------------------------------------------------------------------

/**
 * A cross-site request forgery check for the routes that change something.
 *
 * The session cookie is `SameSite=Lax`, which already keeps browsers from attaching it to a cross-site
 * `POST`. That is the primary defence and it is a good one. This is the second layer, and it exists
 * because the first one is a promise made by the browser rather than a property of this application:
 * a client that has not implemented Lax correctly, a cookie that is rewritten without the attribute in
 * some future change, or an attacker on a sibling subdomain — "same site" is not "same origin" — all
 * end up sending a request Lax was expected to stop.
 *
 * What it checks is where the request says it came from, and it does that in the one order that is
 * safe. `Sec-Fetch-Site` is set by the browser and cannot be set by page script, so `same-origin`
 * settles the question outright. Failing that, the `Origin` header has to name an allowed origin. A
 * request with neither is refused: a browser sends `Origin` on every `POST`, so a `POST` without one
 * did not come from a page, and the routes this guards are only ever called by our own pages.
 *
 * It is deliberately **not** applied to reads. A `GET` that changes nothing is not worth a header
 * requirement, and the responses are not readable cross-origin anyway.
 */

/** Headers a browser sets and page script cannot. */
const SAME_ORIGIN_FETCH_SITES = ['same-origin', 'none']

/**
 * The origins allowed to make a state-changing request.
 *
 * `NEXT_PUBLIC_ALLOWED_ORIGINS` defaults to `*` in this codebase, and a wildcard is meaningless for a
 * CSRF check — it would allow exactly what the check exists to prevent. So a wildcard is ignored here
 * and the application's own URL is what remains, which is the only origin these routes are called from.
 */
function allowedOrigins(): string[] {
  const configured = ALLOWED_ORIGINS.split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '' && entry !== '*')

  return [UI_BASE_URL, ...configured].map(normalizeOrigin).filter((entry) => entry !== '')
}

/**
 * Reduces a URL or origin to a comparable origin.
 *
 * Compared as an origin rather than by prefix: `https://chatterpay.net.attacker.example` starts with
 * our URL and is not us.
 */
function normalizeOrigin(value: string): string {
  try {
    return new URL(value).origin.toLowerCase()
  } catch {
    return ''
  }
}

// ----------------------------------------------------------------------

/**
 * Refuses a state-changing request that did not come from one of our own pages.
 *
 * @param req - The request.
 * @returns A `NextResponse` when the request is refused, or `null` when it may proceed.
 */
export function validateStateChangingRequest(req: NextRequest): NextResponse | null {
  // Set by the browser, unsettable by script. `none` is a user-initiated action with no initiator,
  // which a fetch from a page cannot produce.
  const fetchSite = req.headers.get('sec-fetch-site')?.toLowerCase()
  if (fetchSite && SAME_ORIGIN_FETCH_SITES.includes(fetchSite)) return null

  // An explicit cross-site hint settles it the other way, whatever the Origin header says.
  if (fetchSite === 'cross-site') {
    return refuse('the request was initiated from another site')
  }

  const origin = req.headers.get('origin')
  if (origin) {
    return allowedOrigins().includes(normalizeOrigin(origin))
      ? null
      : refuse('the request came from an origin this application does not serve')
  }

  // No `Sec-Fetch-Site` and no `Origin`. Browsers send `Origin` on every state-changing request, so
  // this did not come from a page — which is what these routes are for.
  return refuse('the request carries no origin')
}

/**
 * The refusal.
 *
 * The reason is generic on purpose: it tells our own developers what happened and tells a caller
 * probing the endpoint nothing about which origins are accepted.
 */
function refuse(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: 'CROSS_SITE_REQUEST_REJECTED', message } },
    { status: 403 }
  )
}
