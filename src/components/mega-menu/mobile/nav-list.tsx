import { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import ListItemButton from '@mui/material/ListItemButton'

import { RouterLink } from 'src/routes/components'
import { usePathname, useActiveLink } from 'src/routes/hooks'

import NavItem from './nav-item'
import Iconify from '../../iconify'
import Scrollbar from '../../scrollbar'
import { NavListProps, NavSubListProps } from '../types'

// ----------------------------------------------------------------------

export default function NavList({ data, slotProps }: NavListProps) {
  const pathname = usePathname()

  const active = useActiveLink(data.path, !!data.children)

  const [openMenu, setOpenMenu] = useState(false)

  const [rectWidth, setRectWidth] = useState(0)

  useEffect(() => {
    if (openMenu) {
      handleCloseMenu()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    const element = document.getElementById('mega-menu-mobile')

    if (element) {
      const clientRect = element?.getBoundingClientRect()

      setRectWidth(clientRect.width)
    }
  }, [])

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
        open={openMenu}
        onClick={handleOpenMenu}
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

      {!!data.children && (
        <Drawer
          open={openMenu}
          onClose={handleCloseMenu}
          slotProps={{
            backdrop: { invisible: true }
          }}
          PaperProps={{
            sx: {
              width: rectWidth - 8
            }
          }}
        >
          <NavSubList
            title={data.title}
            onCloseMenu={handleCloseMenu}
            data={data.children}
            slotProps={slotProps}
          />
        </Drawer>
      )}
    </>
  )
}

// ----------------------------------------------------------------------

function NavSubList({ data, slotProps, title, onCloseMenu }: NavSubListProps) {
  const theme = useTheme()

  const pathname = usePathname()

  return (
    <>
      <Stack direction='row' alignItems='center' px={1} py={1.5} spacing={1}>
        <IconButton onClick={onCloseMenu}>
          <Iconify icon='eva:arrow-ios-back-fill' width={16} />
        </IconButton>

        <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
          {title}
        </Typography>
      </Stack>

      <Divider />

      <Scrollbar>
        {data.map((list, index) => (
          <List key={list.subheader + index} disablePadding>
            {list.subheader && (
              <Typography
                noWrap
                component='div'
                variant='overline'
                sx={{
                  mt: 2,
                  mb: 1,
                  px: 2.5,
                  fontSize: 11,
                  color: 'text.secondary',
                  ...slotProps?.subheader
                }}
              >
                {list.subheader}
              </Typography>
            )}

            {list.items.map((link) => {
              const active = pathname === link.path || pathname === `${link.path}/`

              return (
                <ListItemButton
                  key={link.title}
                  component={RouterLink}
                  href={link.path}
                  className={active ? 'active' : ''}
                  sx={{
                    ...theme.typography.body2,
                    fontSize: 13,
                    ...(active && {
                      fontWeight: 'fontWeightSemiBold',
                      color: theme.palette.mode === 'light' ? 'primary.main' : 'primary.light',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.16)
                      }
                    }),
                    ...slotProps?.subItem
                  }}
                >
                  <Box
                    component='span'
                    className='icon'
                    sx={{
                      mr: 0.5,
                      width: 20,
                      height: 20,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Box
                      sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'currentColor' }}
                    />
                  </Box>

                  <Box
                    component='span'
                    className='label'
                    sx={{
                      flexGrow: 1,
                      maxWidth: 1,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {link.title}
                  </Box>
                </ListItemButton>
              )
            })}
          </List>
        ))}
      </Scrollbar>
    </>
  )
}
