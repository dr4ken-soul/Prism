import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

/**
 * Footer strip with feedback links and agent Sui address proof.
 * @param agentAddress - derived Sessions wallet address
 */
export function FooterStrip({ agentAddress }: { agentAddress: string }) {
  const [copied, setCopied] = useState(false)
  const short =
    agentAddress && agentAddress.length > 12
      ? `${agentAddress.slice(0, 10)}...`
      : agentAddress || 'not configured'

  /**
   * Copy the full agent address to the clipboard.
   */
  function handleCopy() {
    if (!agentAddress) return
    void navigator.clipboard.writeText(agentAddress)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <footer className="border-t border-[var(--border-subtle)] px-8 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 font-mono text-xs text-[var(--text-muted)]">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 transition-colors hover:text-[var(--text-secondary)]"
          title="Copy agent address"
        >
          <span>Agent: {short}</span>
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/MystenLabs/MemWal"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-[var(--text-secondary)]"
          >
            Feedback
          </a>
          <a
            href="https://discord.com/invite/walrusprotocol"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-[var(--text-secondary)]"
          >
            Discord
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-[var(--text-secondary)]"
          >
            X
          </a>
        </div>
      </div>
    </footer>
  )
}
