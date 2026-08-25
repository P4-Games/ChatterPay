import { forwardRef } from 'react'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import ListItemButton from '@mui/material/ListItemButton'

import { RouterLink } from 'src/routes/components'

import Iconify from '../../iconify'
import type { NavItemProps, NavItemStateProps } from '../types'

// ----------------------------------------------------------------------

const NavItem = forwardRef<HTMLDivElement, NavItemProps>(
  (
    {
      title,
      path,
      icon,
      info,
      disabled,
      caption,
      roles,
      //
      open,
      depth,
      active,
      hasChild,
      externalLink,
      currentRole = 'admin',
      ...other
    },
    ref
  ) => {
    const subItem = depth !== 1

    const renderContent = (
      <StyledNavItem
        ref={ref}
        open={open}
        depth={depth}
        active={active}
        disabled={disabled}
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

        {caption && (
          <Tooltip title={caption} arrow>
            <Iconify width={16} icon='eva:info-outline' className='caption' />
          </Tooltip>
        )}

        {info && (
          <Box component='span' className='info'>
            {info}
          </Box>
        )}

        {hasChild && (
          <Iconify
            width={16}
            className='arrow'
            icon={subItem ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-downward-fill'}
          />
        )}
      </StyledNavItem>
    )

    // Hidden item by role
    if (roles && !roles.includes(`${currentRole}`)) {
      return null
    }

    if (externalLink)
      return (
        <Link
          href={path}
          target='_blank'
          rel='noopener'
          color='inherit'
          underline='none'
          sx={{
            ...(disabled && {
              cursor: 'default'
            })
          }}
        >
          {renderContent}
        </Link>
      )

    return (
      <Link
        component={RouterLink}
        href={path}
        color='inherit'
        underline='none'
        sx={{
          ...(disabled && {
            cursor: 'default'
          })
        }}
      >
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
      borderRadius: 6,
      color: theme.palette.text.secondary,
      fontWeight: theme.typography.fontWeightMedium
    },
    icon: {
      width: 22,
      height: 22,
      flexShrink: 0,
      marginRight: theme.spacing(1)
    },
    label: {
      textTransform: 'capitalize'
    },
    caption: {
      marginLeft: theme.spacing(0.75),
      color: theme.palette.text.disabled
    },
    info: {
      display: 'inline-flex',
      marginLeft: theme.spacing(0.75)
    },
    arrow: {
      marginLeft: theme.spacing(0.75)
    }
  } as const

  return {
    // Root item
    ...(!subItem && {
      ...baseStyles.item,
      minHeight: 32,
      flexShrink: 0,
      padding: theme.spacing(0, 0.75),
      '& .icon': {
        ...baseStyles.icon
      },
      '& .label': {
        ...baseStyles.label,
        whiteSpace: 'nowrap'
      },
      '& .caption': {
        ...baseStyles.caption
      },
      '& .info': {
        ...baseStyles.info
      },
      '& .arrow': {
        ...baseStyles.arrow
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
    }),

    // Sub item
    ...(subItem && {
      ...baseStyles.item,
      minHeight: 34,
      padding: theme.spacing(0, 1),
      '& .icon': {
        ...baseStyles.icon
      },
      '& .label': {
        ...baseStyles.label,
        flexGrow: 1
      },
      '& .caption': {
        ...baseStyles.caption
      },
      '& .info': {
        ...baseStyles.info
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
