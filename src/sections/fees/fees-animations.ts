import type { Variants } from 'framer-motion'

// ----------------------------------------------------------------------

/** `as const` keeps the cubic-bezier a tuple; framer-motion rejects a widened `number[]`. */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export const FEES_ANIMATIONS: Record<'container' | 'item', Variants> = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.1, ease: EASE_OUT_EXPO }
    }
  }
}

/** Shared `whileInView` config so every block animates once, on first reveal. */
export const FEES_VIEWPORT = { once: true, amount: 0.2 } as const
