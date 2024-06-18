import Stack from '@mui/material/Stack'

import NavList from './nav-list'
import { NavProps } from '../types'

// ----------------------------------------------------------------------

export default function MegaMenuDesktopHorizontal({ data, sx, slotProps, ...other }: NavProps) {
  return (
    <Stack
      component='nav'
      id='mega-menu-desktop-horizontal'
      direction='row'
      spacing={3}
      sx={{
        height: 1,
        ...sx
      }}
      {...other}
    >
      {data.map((list) => (
        <NavList key={list.title} data={list} slotProps={slotProps} />
      ))}
    </Stack>
  )
}
