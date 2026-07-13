import { motion, useMotionValue, useTransform } from 'motion/react'
import type { MouseEvent } from 'react'
import type { NamespacePulse } from '../../types'

/**
 * A single namespace dot in the corner instrument. Glows brighter as the
 * cursor nears it, and pulses when a new blob writes to its namespace.
 * @param colour - CSS colour for the dot
 * @param pulsing - whether a write just landed
 */
function InstrumentDot({
  colour,
  pulsing,
}: {
  colour: string
  pulsing: boolean
}) {
  const proximity = useMotionValue(0)
  const glow = useTransform(proximity, [0, 1], [0.3, 1])

  /**
   * Map cursor distance to proximity glow.
   */
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    const dist = Math.sqrt(dx * dx + dy * dy)
    proximity.set(Math.max(0, 1 - dist / 120))
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => proximity.set(0)}
      animate={pulsing ? { scale: [1, 1.6, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ opacity: glow }}
      className="h-2 w-2 rounded-full"
    >
      <div
        className="h-full w-full rounded-full"
        style={{ backgroundColor: colour }}
      />
    </motion.div>
  )
}

/**
 * The entire navigation surface for Prism. No bar, no container spanning
 * the width. Two independent elements anchored to opposite corners.
 * @param blobCount - running mainnet blob count for this session
 * @param namespacePulse - which namespace dots should pulse
 */
export function CornerInstrument({
  blobCount,
  namespacePulse,
}: {
  blobCount: number
  namespacePulse: NamespacePulse
}) {
  return (
    <>
      <div className="fixed top-6 left-8 z-50">
        <span className="font-display text-xl italic tracking-tight text-[var(--text-primary)]">
          Prism
        </span>
      </div>

      <div className="fixed top-6 right-8 z-50 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <InstrumentDot
            colour="var(--facts)"
            pulsing={namespacePulse.facts}
          />
          <InstrumentDot
            colour="var(--beliefs)"
            pulsing={namespacePulse.beliefs}
          />
          <InstrumentDot
            colour="var(--questions)"
            pulsing={namespacePulse.questions}
          />
        </div>
        <span className="font-mono text-xs text-[var(--text-secondary)] max-[400px]:hidden">
          {blobCount} blobs on mainnet
        </span>
        <span className="font-mono text-xs text-[var(--text-secondary)] hidden max-[400px]:inline">
          {blobCount}
        </span>
      </div>
    </>
  )
}
