'use client'

import { useRef, useEffect, useState } from 'react'
import { m, useAnimationControls } from 'framer-motion'
import Box from '@mui/material/Box'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
  direction?: 'left' | 'right'
  speed?: number // pixels per second
  pauseOnHover?: boolean
}

export default function Marquee({
  children,
  direction = 'left',
  speed = 40,
  pauseOnHover = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentWidth, setContentWidth] = useState(0)
  const controls = useAnimationControls()

  useEffect(() => {
    if (contentRef.current) {
      setContentWidth(contentRef.current.scrollWidth)
    }
  }, [children])

  useEffect(() => {
    if (contentWidth === 0) return

    const scrollDistance = contentWidth
    const duration = scrollDistance / speed

    controls.start({
      x: direction === 'left' ? [0, -contentWidth] : [-contentWidth, 0],
      transition: {
        ease: 'linear',
        duration,
        repeat: Infinity,
      },
    })
  }, [contentWidth, direction, speed, controls])

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
      }}
      onMouseEnter={() => pauseOnHover && controls.stop()}
      onMouseLeave={() => {
        if (!pauseOnHover || contentWidth === 0) return
        const duration = contentWidth / speed
        controls.start({
          x: direction === 'left' ? [0, -contentWidth] : [-contentWidth, 0],
          transition: {
            ease: 'linear',
            duration,
            repeat: Infinity,
          },
        })
      }}
    >
      <m.div
        animate={controls}
        style={{ display: 'flex', whiteSpace: 'nowrap' }}
      >
        <Box ref={contentRef} sx={{ display: 'flex', gap: 2, px: 1 }}>
          {children}
        </Box>
        {/* Duplicate for seamless looping */}
        <Box sx={{ display: 'flex', gap: 2, px: 1 }}>{children}</Box>
      </m.div>
    </Box>
  )
}

