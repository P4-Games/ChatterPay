import { forwardRef } from 'react'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { styled } from '@mui/material/styles'
import ListItemButton from '@mui/material/ListItemButton'

import { RouterLink } from 'src/routes/components'

import Iconify from '../../iconify'
import type { NavItemProps, NavItemStateProps } from '../types'

// ----------------------------------------------------------------------

const NavItem = forwardRef<HTMLDivElement, NavItemProps>(
  ({ title, path, icon, caption, depth, open, active, hasChild, externalLink, ...other }, ref) => {
    const subItem = depth !== 1

    const renderContent = (
      <StyledNavItem
        disableRipple
        disableTouchRipple
        ref={ref}
        open={open}
        depth={depth}
        active={active}
        {...other}
      >
        {icon && (
          <Box component='span' className='icon'>
            {icon}
          </Box>
        )}

        <Box component='span' className='text-container'>
          {title && (
            <Box component='span' className='label'>
              {title}
            </Box>
          )}

          {caption && (
            <Box component='span' className='caption'>
              {caption}
            </Box>
          )}
        </Box>

        {hasChild && (
          <Iconify
            width={16}
            className='arrow'
            icon={subItem ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-downward-fill'}
          />
        )}
      </StyledNavItem>
    )

    if (externalLink)
      return (
        <Link href={path} target='_blank' rel='noopener' color='inherit' underline='none'>
          {renderContent}
        </Link>
      )

    return (
      <Link component={RouterLink} href={path} color='inherit' underline='none'>
        {renderContent}
      </Link>
    )
  }
)

export default NavItem

// ----------------------------------------------------------------------

const StyledNavItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active'
})<NavItemStateProps>(({ active, open, depth, theme }) => {
  const subItem = depth !== 1

  const opened = open && !active

  const baseStyles = {
    item: {
      ...theme.typography.body2,
      fontWeight: theme.typography.fontWeightMedium
    },
    icon: {
      width: 20,
      height: 20,
      flexShrink: 0,
      marginRight: theme.spacing(1)
    },
    textContainer: {
      flexGrow: 1,
      display: 'inline-flex',
      flexDirection: 'column'
    },
    label: {
      flexGrow: 1
    },
    caption: {
      ...theme.typography.caption,
      color: theme.palette.text.disabled
    },
    arrow: {
      flexShrink: 0,
      marginLeft: theme.spacing(0.75)
    }
  } as const

  return {
    // Root item
    ...(!subItem && {
      ...baseStyles.item,
      padding: 0,
      minHeight: 40,
      transition: theme.transitions.create(['all'], {
        duration: theme.transitions.duration.shorter
      }),
      '&:hover': {
        backgroundColor: 'transparent'
      },
      '& .icon': {
        ...baseStyles.icon
      },
      '& .text-container': {
        ...baseStyles.textContainer
      },
      '& .label': {
        ...baseStyles.label
      },
      '& .caption': {
        ...baseStyles.caption,
        display: 'none'
      },
      '& .arrow': {
        ...baseStyles.arrow
      },
      ...(active && {
        color: theme.palette.primary.main,
        fontWeight: theme.typography.fontWeightSemiBold
      }),
      ...(opened && {
        opacity: 0.64
      })
    }),

    // Sub item
    ...(subItem && {
      ...baseStyles.item,
      fontSize: 13,
      borderRadius: 6,
      padding: theme.spacing(0.75, 1),
      color: theme.palette.text.secondary,
      '& .icon': {
        ...baseStyles.icon
      },
      '& .text-container': {
        ...baseStyles.textContainer
      },
      '& .label': {
        ...baseStyles.label
      },
      '& .caption': {
        ...baseStyles.caption
      },
      '& .arrow': {
        ...baseStyles.arrow,
        marginRight: theme.spacing(-0.5)
      },
      ...(active && {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.action.selected,
        fontWeight: theme.typography.fontWeightSemiBold
      }),
      ...(opened && {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.action.hover
      })
    })
  }
})
