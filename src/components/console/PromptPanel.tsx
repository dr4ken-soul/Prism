import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Magnet } from '../ui/Magnet'

/**
 * Magnetic copy button for the submission prompt text.
 * @param text - exact PRISM_SYSTEM_PROMPT string
 */
function CopyPromptButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  /**
   * Copy the prompt to the clipboard and show brief confirmation.
   */
  function handleCopy() {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Magnet padding={60} strength={4}>
      <button
        type="button"
        onClick={handleCopy}
        className="group mt-3 flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-5 py-2.5 font-body text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
      >
        <span>{copied ? 'Copied' : 'Copy prompt'}</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-px">
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </span>
      </button>
    </Magnet>
  )
}

/**
 * Collapsible panel that renders the submission prompt verbatim.
 * @param open - whether the panel is expanded
 * @param onToggle - toggle expand/collapse
 * @param promptText - PRISM_SYSTEM_PROMPT text
 */
export function PromptPanel({
  open,
  onToggle,
  promptText,
}: {
  open: boolean
  onToggle: () => void
  promptText: string
}) {
  return (
    <section className="mx-auto max-w-4xl px-8 pb-24">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-5 py-2.5 font-body text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
      >
        {open ? 'Hide the prompt' : 'View the prompt'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            className="overflow-hidden"
          >
            <pre className="mt-4 whitespace-pre-wrap rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 font-mono text-xs text-[var(--text-secondary)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.10)]">
              {promptText || 'Loading prompt…'}
            </pre>
            {promptText ? <CopyPromptButton text={promptText} /> : null}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
