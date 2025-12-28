import type { ReactNode } from 'react'
import { m } from 'framer-motion'

import type { HighlightSize, SingleWordHighlightProps } from './types'

export default function SingleWordHighlight({
  size = 'lg',
  color = '#418966',
  strokeWidth = 2.5,
  width
}: SingleWordHighlightProps) {
  // Default width values for different sizes
  const defaultWidths = {
    lg: 121,
    xl: 228
  }

  // Calculate actual width to use
  const actualWidth = width || defaultWidths[size]

  // Calculate height proportionally
  const defaultHeight = 11
  const heightRatio = defaultHeight / defaultWidths[size]
  const actualHeight = Math.round(actualWidth * heightRatio)

  // Animación para dibujar el trazo de izquierda a derecha
  const pathAnimation = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.8, ease: 'easeInOut' },
        opacity: { duration: 0.2 }
      }
    }
  }

  const highlights: Record<HighlightSize, ReactNode> = {
    lg: (
      <svg
        width={actualWidth}
        height={actualHeight}
        viewBox={`0 0 ${defaultWidths.lg} ${defaultHeight}`}
        preserveAspectRatio='none'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <m.path
          d='M1 5.26667L58.7925 2L55.6402 9L120 5.26667'
          stroke={color}
          strokeWidth={strokeWidth}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: false }}
          variants={pathAnimation}
        />
      </svg>
    ),
    xl: (
      <svg
        width={actualWidth}
        height={actualHeight}
        viewBox={`0 0 ${defaultWidths.xl} ${defaultHeight}`}
        preserveAspectRatio='none'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <m.path
          d='M1 5.5L111 2L105 9.5L227.5 5.5'
          stroke={color}
          strokeWidth={strokeWidth}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: false }}
          variants={pathAnimation}
        />
      </svg>
    )
  }

  return highlights[size]
}
