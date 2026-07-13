/**
 * Namespace keys accepted by the remember protocol.
 */
export type Namespace = 'facts' | 'beliefs' | 'questions'

/**
 * One parsed memory extracted from a model reply.
 */
export interface ParsedMemory {
  namespace: Namespace
  text: string
}

/**
 * Result of stripping remember tags from a model reply.
 */
export interface ParseRememberResult {
  cleaned: string
  memories: ParsedMemory[]
}

/**
 * Extracts every [[remember:namespace]]...[[/remember]] block from a
 * model reply, returning the cleaned text and the list of memories to write.
 * @param reply - raw text returned by Claude
 * @returns the reply with remember tags stripped, and the parsed memories
 */
export function parseRemember(reply: string): ParseRememberResult {
  const pattern =
    /\[\[remember:(facts|beliefs|questions)\]\]([\s\S]*?)\[\[\/remember\]\]/g
  const memories: ParsedMemory[] = []
  const cleaned = reply
    .replace(pattern, (_match, namespace: Namespace, text: string) => {
      const trimmed = text.trim()
      if (trimmed) {
        memories.push({ namespace, text: trimmed })
      }
      return ''
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return { cleaned, memories }
}
