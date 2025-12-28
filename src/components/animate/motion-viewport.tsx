import { useState, useEffect } from 'react'
import { m, type MotionProps } from 'framer-motion'

import Box, { type BoxProps } from '@mui/material/Box'

import { useResponsive } from 'src/hooks/use-responsive'
import { getStorageItem } from 'src/hooks/use-local-storage'

import { varContainer } from './variants'

// ----------------------------------------------------------------------

type IProps = BoxProps & MotionProps

interface Props extends IProps {
  children: React.ReactNode
  disableAnimatedMobile?: boolean
}

export default function MotionViewport({
  children,
  disableAnimatedMobile = true,
  ...other
}: Props) {
  const smDown = useResponsive('down', 'sm')
  const [key, setKey] = useState('key-en')
  const langStorage = getStorageItem('i18nextLng')

  useEffect(() => {
    // Just a dummy key, to force re-render when the language changes.
    setKey(`key-${langStorage || 'en'}`)
  }, [langStorage])

  if (smDown && disableAnimatedMobile) {
    return <Box {...other}>{children}</Box>
  }

  return (
    <Box
      key={key}
      component={m.div}
      initial='initial'
      whileInView='animate'
      viewport={{ once: true, amount: 0.3 }}
      variants={varContainer()}
      {...other}
    >
      {children}
    </Box>
  )
}
