import { useMotionValue, useSpring } from 'motion/react'
import { useCallback, useRef, type MouseEvent } from 'react'

/**
 * Cursor-tracking magnetic offset using motion values, not React state.
 * @param strength - divisor applied to distance from centre (higher is weaker)
 */
export function useMagneticHover(strength = 4) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 20 })
  const springY = useSpring(y, { stiffness: 200, damping: 20 })

  /**
   * Update magnetic offset from pointer position.
   */
  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      x.set(dx / strength)
      y.set(dy / strength)
    },
    [strength, x, y],
  )

  /**
   * Reset magnetic offset when the pointer leaves.
   */
  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return { ref, springX, springY, handleMouseMove, handleMouseLeave }
}
