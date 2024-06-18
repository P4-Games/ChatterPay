import { useRef, useState, useEffect, useCallback } from 'react'

import Masonry from '@mui/lab/Masonry'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

import { usePathname, useActiveLink } from 'src/routes/hooks'

import NavItem from './nav-item'
import { NavListProps } from '../types'
import MenuTags from '../common/menu-tags'
import NavSubList from '../common/nav-sub-list'
import MenuProducts from '../common/menu-products'
import MenuMoreLink from '../common/menu-more-link'

// ----------------------------------------------------------------------

export default function NavList({ data, slotProps }: NavListProps) {
  const navRef = useRef<HTMLDivElement | null>(null)

  const pathname = usePathname()

  const active = useActiveLink(data.path, !!data.children)

  const singleList = data.children?.length === 1

  const [openMenu, setOpenMenu] = useState(false)

  useEffect(() => {
    if (openMenu) {
      handleCloseMenu()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleOpenMenu = useCallback(() => {
    if (data.children) {
      setOpenMenu(true)
    }
  }, [data.children])

  const handleCloseMenu = useCallback(() => {
    setOpenMenu(false)
  }, [])

  return (
    <>
      <NavItem
        ref={navRef}
        open={openMenu}
        onMouseEnter={handleOpenMenu}
        onMouseLeave={handleCloseMenu}
        //
        title={data.title}
        path={data.path}
        icon={data.icon}
        //
        hasChild={!!data.children}
        externalLink={data.path.includes('http')}
        //
        active={active}
        className={active ? 'active' : ''}
        sx={slotProps?.rootItem}
      />

      {!!data.children && openMenu && (
        <Paper
          onMouseEnter={handleOpenMenu}
          onMouseLeave={handleCloseMenu}
          sx={{
            p: 3,
            top: -40,
            width: 800,
            borderRadius: 2,
            position: 'absolute',
            left: 'calc(100% - 2px)',
            zIndex: (theme) => theme.zIndex.drawer,
            boxShadow: (theme) => theme.customShadows.z20,
            ...(singleList && {
              p: 2,
              width: 'auto',
              minWidth: 160
            })
          }}
        >
          {singleList ? (
            <NavSubList data={data.children} slotProps={slotProps} />
          ) : (
            <Masonry columns={3} spacing={3} defaultColumns={3} defaultSpacing={3}>
              <NavSubList data={data.children} slotProps={slotProps} sx={{ mb: 2.5 }} />
            </Masonry>
          )}

          <Stack spacing={3}>
            {!!data.moreLink && (
              <MenuMoreLink path={data.moreLink.path} title={data.moreLink.title} />
            )}

            {!!data.products && (
              <>
                <Divider sx={{ borderStyle: 'dashed' }} />

                <MenuProducts products={data.products} displayProduct={slotProps?.displayProduct} />
              </>
            )}

            {!!data.tags && (
              <>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <MenuTags tags={data.tags} />
              </>
            )}
          </Stack>
        </Paper>
      )}
    </>
  )
}
