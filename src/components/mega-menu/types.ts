import { StackProps } from '@mui/material/Stack'
import { Theme, SxProps } from '@mui/material/styles'
import { ListItemButtonProps } from '@mui/material/ListItemButton'

// ----------------------------------------------------------------------

export type SlotProps = {
  rootItem?: SxProps<Theme>
  subItem?: SxProps<Theme>
  subheader?: SxProps<Theme>
  displayProduct?: number
}

export type NavProducts = {
  name: string
  path: string
  coverUrl: string
}

export type NavLink = {
  title: string
  path: string
}

export type NavItemStateProps = {
  open?: boolean
  active?: boolean
  hasChild?: boolean
  externalLink?: boolean
}

export type NavItemBaseProps = {
  title: string
  path: string
  icon?: React.ReactElement
  tags?: NavLink[]
  moreLink?: NavLink
  products?: NavProducts[]
  children?: {
    subheader: string
    items: {
      title: string
      path: string
    }[]
  }[]
}

export type NavItemProps = ListItemButtonProps & NavItemBaseProps & NavItemStateProps

export type NavListProps = {
  data: NavItemBaseProps
  slotProps?: SlotProps
}

export type NavSubListProps = StackProps & {
  data: {
    subheader: string
    items: {
      title: string
      path: string
    }[]
  }[]
  slotProps?: SlotProps
  title?: string
  onCloseMenu?: VoidFunction
}

export type NavProps = StackProps & {
  data: NavItemBaseProps[]
  slotProps?: SlotProps
}
