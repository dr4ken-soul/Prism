import { useCallback } from 'react'
import { sendChat } from '../lib/api'
import { useConsoleStore } from '../store/useConsoleStore'
import type { Namespace } from '../types'

const NAMESPACE_COLOUR: Record<Namespace, string> = {
  facts: 'var(--facts)',
  beliefs: 'var(--beliefs)',
  questions: 'var(--questions)',
}

/**
 * Measures the centre of a namespace column for the light-split animation.
 * @param namespace - destination column
 */
function measureColumnTarget(namespace: Namespace): {
  targetX: number
  targetY: number
} {
  const el = document.querySelector(`[data-namespace="${namespace}"]`)
  if (!el) {
    return { targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 }
  }
  const rect = el.getBoundingClientRect()
  return {
    targetX: rect.left + rect.width / 2,
    targetY: rect.top + 40,
  }
}

/**
 * Chat loop hook. Posts to /api/chat, appends messages, then runs light-split
 * and card append for each confirmed blob.
 */
export function useChat() {
  const messages = useConsoleStore((s) => s.messages)
  const isSending = useConsoleStore((s) => s.isSending)
  const error = useConsoleStore((s) => s.error)
  const addMessage = useConsoleStore((s) => s.addMessage)
  const setSending = useConsoleStore((s) => s.setSending)
  const setError = useConsoleStore((s) => s.setError)
  const appendBlobs = useConsoleStore((s) => s.appendBlobs)
  const pulseNamespace = useConsoleStore((s) => s.pulseNamespace)
  const setLightSplit = useConsoleStore((s) => s.setLightSplit)

  /**
   * Send a user message through the Prism classification loop.
   * @param text - user input
   */
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isSending) return

      setError(null)
      setSending(true)
      // Prior turns only. The server appends the current user message itself.
      const history = useConsoleStore.getState().messages
      addMessage({ role: 'user', content: trimmed })

      try {
        const { reply, newBlobs } = await sendChat(trimmed, history)
        addMessage({ role: 'assistant', content: reply })

        for (const blob of newBlobs) {
          const { targetX, targetY } = measureColumnTarget(blob.namespace)
          setLightSplit({
            id: blob.blobId,
            colour: NAMESPACE_COLOUR[blob.namespace],
            targetX,
            targetY,
          })
          pulseNamespace(blob.namespace)

          await new Promise((resolve) => window.setTimeout(resolve, 520))
          appendBlobs([blob])
          setLightSplit(null)
          await new Promise((resolve) => window.setTimeout(resolve, 120))
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Could not reach the relayer. Check the connection and try again'
        setError(message)
      } finally {
        setSending(false)
      }
    },
    [
      addMessage,
      appendBlobs,
      isSending,
      pulseNamespace,
      setError,
      setLightSplit,
      setSending,
    ],
  )

  return { messages, isSending, error, send }
}
