import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useMagneticHover } from '../../hooks/useMagneticHover'

/**
 * Magnetic hover wrapper. Cursor proximity pulls the child slightly.
 * Uses motion values, not React state, for the offset.
 * @param children - element that should track the cursor
 * @param padding - unused padding reserved for API parity with the skill file
 * @param strength - higher values reduce movement
 * @param className - optional class names
 */
export function Magnet({
  children,
  strength = 4,
  className = '',
}: {
  children: ReactNode
  padding?: number
  strength?: number
  className?: string
}) {
  const { ref, springX, springY, handleMouseMove, handleMouseLeave } =
    useMagneticHover(strength)

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY, willChange: 'transform' }}
    >
      {children}
    </motion.div>
  )
}
