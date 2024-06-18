import { forwardRef } from 'react'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { styled } from '@mui/material/styles'
import ListItemButton from '@mui/material/ListItemButton'

import { RouterLink } from 'src/routes/components'

import Iconify from '../../iconify'
import { NavItemProps, NavItemStateProps } from '../types'

// ----------------------------------------------------------------------

const NavItem = forwardRef<HTMLDivElement, NavItemProps>(
  ({ title, path, icon, open, active, hasChild, externalLink, ...other }, ref) => {
    const renderContent = (
      <StyledNavItem
        disableRipple
        disableTouchRipple
        ref={ref}
        open={open}
        active={active}
        {...other}
      >
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

        {hasChild && <Iconify width={16} className='arrow' icon='eva:arrow-ios-downward-fill' />}
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
    padding: 0,
    minHeight: '100%',
    fontWeight: theme.typography.fontWeightMedium,
    transition: theme.transitions.create(['all'], {
      duration: theme.transitions.duration.shorter
    }),
    '&:hover': {
      backgroundColor: 'transparent'
    },
    '& .icon': {
      width: 20,
      height: 20,
      flexShrink: 0,
      marginRight: theme.spacing(1)
    },
    '& .arrow': {
      marginLeft: theme.spacing(0.75)
    },
    ...(active && {
      color: theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightSemiBold
    }),
    ...(opened && {
      opacity: 0.64
    })
  }
})
