/**
 * Namespace keys used across the console.
 */
export type Namespace = 'facts' | 'beliefs' | 'questions'

/**
 * One confirmed Walrus memory blob shown in the namespace panel.
 */
export interface BlobRecord {
  namespace: Namespace
  blobId: string
  text: string
  writtenAt: number
}

/**
 * Chat message in the conversation pane.
 */
export interface Message {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Response body from POST /api/chat.
 */
export interface ChatResponse {
  reply: string
  newBlobs: BlobRecord[]
}

/**
 * Response body from GET /api/namespaces.
 */
export interface NamespacesResponse {
  facts: BlobRecord[]
  beliefs: BlobRecord[]
  questions: BlobRecord[]
  total: number
}

/**
 * Response body from GET /api/health.
 */
export interface HealthResponse {
  status: string
  agentAddress: string
  memwal: boolean
  anthropic: boolean
  groq?: boolean
  llm?: {
    anthropic: boolean
    groq: boolean
    active: 'anthropic' | 'groq' | null
  }
}

/**
 * Pulse flags for the corner instrument dots.
 */
export interface NamespacePulse {
  facts: boolean
  beliefs: boolean
  questions: boolean
}

/**
 * Pending light-split animation target.
 */
export interface LightSplitTarget {
  id: string
  colour: string
  targetX: number
  targetY: number
}
