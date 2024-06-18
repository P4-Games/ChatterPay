import { StackProps } from '@mui/material/Stack'
import { Theme, SxProps } from '@mui/material/styles'
import { ListItemButtonProps } from '@mui/material/ListItemButton'

// ----------------------------------------------------------------------

export type SlotProps = {
  rootItem?: SxProps<Theme>
  subItem?: SxProps<Theme>
}

export type NavItemStateProps = {
  depth?: number
  open?: boolean
  active?: boolean
  hasChild?: boolean
  externalLink?: boolean
}

export type NavItemBaseProps = {
  title: string
  path: string
  caption?: string
  icon?: React.ReactElement
  children?: any
}

export type NavItemProps = ListItemButtonProps & NavItemBaseProps & NavItemStateProps

export type NavListProps = {
  data: NavItemBaseProps
  depth: number
  slotProps?: SlotProps
}

export type NavSubListProps = {
  data: NavItemBaseProps[]
  depth: number
  slotProps?: SlotProps
}

export type NavProps = StackProps & {
  data: NavItemBaseProps[]
  slotProps?: SlotProps
}
