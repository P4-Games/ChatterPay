import { forwardRef } from 'react'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { alpha, styled } from '@mui/material/styles'
import ListItemButton from '@mui/material/ListItemButton'

import { RouterLink } from 'src/routes/components'

import Iconify from '../../iconify'
import { NavItemProps, NavItemStateProps } from '../types'

// ----------------------------------------------------------------------

const NavItem = forwardRef<HTMLDivElement, NavItemProps>(
  ({ title, path, icon, open, active, hasChild, externalLink, ...other }, ref) => {
    const renderContent = (
      <StyledNavItem ref={ref} open={open} active={active} {...other}>
        {icon && (
          <Box component='span' className='icon'>
            {icon}
          </Box>
        )}

        {title && (
          <Box component='span' className='label'>
            {title}
          </Box>
        )}

        {hasChild && <Iconify width={16} className='arrow' icon='eva:arrow-ios-forward-fill' />}
      </StyledNavItem>
    )

    if (externalLink)
      return (
        <Link href={path} target='_blank' rel='noopener' underline='none' color='inherit'>
          {renderContent}
        </Link>
      )

    return (
      <Link component={RouterLink} href={path} underline='none' color='inherit'>
        {renderContent}
      </Link>
    )
  }
)

export default NavItem

// ----------------------------------------------------------------------

const StyledNavItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active'
})<NavItemStateProps>(({ active, open, theme }) => {
  const opened = open && !active

  return {
    ...theme.typography.body2,
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(1.5),
    fontWeight: theme.typography.fontWeightMedium,
    '& .icon': {
      width: 20,
      height: 20,
      flexShrink: 0,
      marginRight: theme.spacing(2)
    },
    '& .label': {
      flexGrow: 1
    },
    '& .arrow': {
      marginLeft: theme.spacing(0.75)
    },
    ...(active && {
      color: theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightSemiBold,
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.16)
      }
    }),
    ...(opened && {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.action.hover
    })
  }
})
