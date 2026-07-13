import { AnimatePresence, motion } from 'motion/react'

/**
 * Animates a single point of light travelling from the corner counter
 * to the target namespace column when a blob confirms.
 * @param active - whether the animation is running
 * @param targetColour - destination namespace colour
 * @param targetX - destination x in viewport pixels
 * @param targetY - destination y in viewport pixels
 */
export function LightSplit({
  active,
  targetColour,
  targetX,
  targetY,
}: {
  active: boolean
  targetColour: string
  targetX: number
  targetY: number
}) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{
            top: 24,
            right: 96,
            left: 'auto',
            opacity: 1,
            scale: 1,
            backgroundColor: 'var(--accent)',
          }}
          animate={{
            top: targetY,
            left: targetX,
            right: 'auto',
            backgroundColor: targetColour,
            scale: 1.4,
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="pointer-events-none fixed z-40 h-2 w-2 rounded-full"
        />
      )}
    </AnimatePresence>
  )
}
