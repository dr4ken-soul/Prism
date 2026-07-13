import { motion } from 'motion/react'

/**
 * One-line pitch plus a restated proof cluster, sits directly below the
 * corner instrument with generous top padding.
 * @param blobCount - running session blob count
 */
export function IntroStrip({ blobCount }: { blobCount: number }) {
  return (
    <section className="mx-auto max-w-4xl px-8 pb-16 pt-32 text-center">
      <motion.p
        initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="font-display text-3xl italic leading-snug text-[var(--text-primary)] md:text-4xl"
      >
        Facts, beliefs and questions, kept apart on purpose.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-4 font-mono text-xs text-[var(--text-secondary)]"
      >
        {blobCount} blobs written this session, live on Walrus Mainnet
      </motion.p>
    </section>
  )
}
