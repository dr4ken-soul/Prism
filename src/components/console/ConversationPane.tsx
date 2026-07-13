import { useEffect, useRef, useState } from 'react'
import { useChat } from '../../hooks/useChat'
import { FadeIn } from '../ui/FadeIn'

/**
 * Text input for the conversation pane. Border glow tracks focus
 * instead of a flat focus ring.
 * @param onSend - callback when the user submits
 * @param disabled - whether input is locked during a request
 */
function ConsoleInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void
  disabled: boolean
}) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)

  /**
   * Submit the current value if non-empty.
   */
  function submit() {
    if (!value.trim() || disabled) return
    onSend(value)
    setValue('')
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-1 transition-shadow duration-300"
      style={
        focused
          ? {
              boxShadow:
                '0 0 0 1px var(--accent-glow), 0 0 24px var(--accent-glow)',
            }
          : {}
      }
    >
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          disabled={disabled}
          placeholder="Tell it something"
          className="w-full bg-transparent px-4 py-3 font-body text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="mr-1 shrink-0 rounded-full bg-[var(--bg-surface)] px-4 py-2 font-body text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)] disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  )
}

/**
 * Left workbench pane: message list and console input.
 */
export function ConversationPane() {
  const { messages, isSending, error, send } = useChat()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = listRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages, isSending])

  return (
    <FadeIn delay={0.15} className="min-w-0">
      <div className="flex h-full min-h-[420px] flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="border-b border-[var(--border-subtle)] px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)]">
            Conversation
          </p>
        </div>

        <div
          ref={listRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="font-body text-sm text-[var(--text-muted)]">
                No blobs written yet. Send a message to start
              </p>
              <p className="font-body text-sm text-[var(--text-muted)]">
                Try stating a fact, a hedge, and an open gap in one exchange
              </p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === 'user'
                  ? 'ml-6 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2'
                  : 'mr-4 px-1 py-1'
              }
            >
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {message.role === 'user' ? 'You' : 'Prism'}
              </p>
              <p className="whitespace-pre-wrap font-body text-sm leading-relaxed text-[var(--text-primary)]">
                {message.content}
              </p>
            </div>
          ))}
          {isSending && (
            <div className="skeleton-shimmer h-16 rounded-[var(--radius-md)]" />
          )}
        </div>

        <div className="space-y-2 border-t border-[var(--border-subtle)] p-4">
          {error && (
            <p className="font-body text-sm text-[var(--error)]">{error}</p>
          )}
          <ConsoleInput onSend={send} disabled={isSending} />
        </div>
      </div>
    </FadeIn>
  )
}
