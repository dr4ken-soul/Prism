import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Entrance wrapper with blur-in and translate.
 * @param children - content to reveal
 * @param delay - entrance delay in seconds
 * @param duration - animation duration in seconds
 * @param y - initial vertical offset
 * @param className - optional class names
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  y = 20,
  className = '',
}: {
  children: ReactNode
  delay?: number
  duration?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(8px)', y }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
