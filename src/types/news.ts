// ----------------------------------------------------------------------

/**
 * Surface a banner is rendered on. The backend filters the announcements by it, so each page only
 * receives what it is meant to show.
 */
export type NewsTarget = 'landing' | 'dashboard'

/**
 * A site-wide announcement, already resolved to the visitor's language by the backend.
 *
 * `title` is the single line the banner shows collapsed, `message` the full text behind the
 * expander. Both may carry inline markdown.
 */
export interface INewsItem {
  key: string
  title: string
  message: string
  initAt: string
  endAt: string
}
