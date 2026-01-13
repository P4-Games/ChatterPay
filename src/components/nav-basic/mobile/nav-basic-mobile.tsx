import { memo } from 'react'

import Stack from '@mui/material/Stack'

import NavList from './nav-list'
import type { NavProps } from '../types'

// ----------------------------------------------------------------------

function NavBasicMobile({ data, slotProps, ...other }: NavProps) {
  return (
    <Stack component='nav' id='nav-basic-mobile' {...other}>
      {data.map((list) => (
        <NavList key={list.title} data={list} depth={1} slotProps={slotProps} />
      ))}
    </Stack>
  )
}

export default memo(NavBasicMobile)
