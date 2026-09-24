import { usePathname } from 'next/navigation'

// ----------------------------------------------------------------------

type ReturnType = boolean

/**
 * Whether a pathname falls under one of an item's additional active paths.
 *
 * A nav item is active for its own path and for what hangs below it. A section reached through more
 * than one top-level route — tabs that are separate pages — needs the sidebar entry to stay lit on
 * all of them; without this, moving between the tabs of one section looks like leaving it.
 *
 * @param pathname - The current pathname.
 * @param paths - The additional paths the item is active for.
 * @returns Whether the pathname is one of them, or below one of them.
 */
export function matchesActivePath(pathname: string, paths: readonly string[] = []): boolean {
  const current = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return paths.some((path) => current === path || current.startsWith(`${path}/`))
}

export function useActiveLink(path: string, deep = true): ReturnType {
  const pathname = usePathname()

  const checkPath = path.startsWith('#')

  const currentPath = path === '/' ? '/' : `${path}/`

  const normalActive = !checkPath && pathname === currentPath

  const deepActive = !checkPath && pathname.includes(currentPath)

  return deep ? deepActive : normalActive
}
