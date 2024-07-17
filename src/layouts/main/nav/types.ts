import { StackProps } from '@mui/material/Stack'
import { ListItemButtonProps } from '@mui/material/ListItemButton'

// ----------------------------------------------------------------------

export type NavItemStateProps = {
  open?: boolean
  active?: boolean
  subItem?: boolean
  hasChild?: boolean
  externalLink?: boolean
}

export type NavItemBaseProps = {
  title: string
  path: string
  icon?: React.ReactElement
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
}

export type NavSubListProps = StackProps & {
  data: NavItemBaseProps[]
  subheader: string
}

export type NavProps = {
  data: NavItemBaseProps[]
}
