import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/** Shared entrance easing — a soft "out expo" that suits heavy display type. */
export const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Fade-and-rise on enter, driven by Motion's viewport detection (which wraps
 * IntersectionObserver, so it stays independent of Lenis).
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      /* No negative bottom margin: copy is pinned to the bottom of each
         section, so shrinking the root would leave above-the-fold text stuck
         at opacity 0 until the user scrolled. */
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay: delay / 1000, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
