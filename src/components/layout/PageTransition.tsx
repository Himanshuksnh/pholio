import type { ReactNode } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Cross-fades between routes.
 *
 * The movement is deliberately small (8px) and short so navigation feels
 * considered rather than showy. With reduced motion enabled the wrapper is a
 * plain `div` — no opacity ramp, no transform.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div key={pathname}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
