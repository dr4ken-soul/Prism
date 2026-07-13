import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import type { BlobRecord } from '../../types'

/**
 * A single memory card. Hover shadow tints to the namespace colour
 * rather than a generic dark drop shadow.
 * @param item - confirmed blob record
 * @param colour - namespace colour token
 * @param glow - namespace glow token for hover shadow
 */
export function NamespaceCard({
  item,
  colour,
  glow,
}: {
  item: BlobRecord
  colour: string
  glow: string
}) {
  const isLocal = item.blobId.startsWith('local_')
  const href = isLocal
    ? undefined
    : `https://walruscan.com/blob/${item.blobId}`

  const content = (
    <>
      <p className="font-body text-sm leading-snug text-[var(--text-primary)]">
        {item.text}
      </p>
      <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">
        {item.blobId.slice(0, 12)}...
      </p>
      {!isLocal && (
        <p className="mt-1 font-mono text-[10px] text-[var(--text-secondary)]">
          View on Walrus
        </p>
      )}
    </>
  )

  if (!href) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="namespace-card block px-1 py-3 transition-shadow duration-200"
        style={{ '--hover-shadow': glow, borderLeft: `2px solid ${colour}` } as CSSProperties}
      >
        {content}
      </motion.div>
    )
  }

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="namespace-card block px-1 py-3 transition-shadow duration-200"
      style={{ '--hover-shadow': glow } as CSSProperties}
    >
      {content}
    </motion.a>
  )
}
