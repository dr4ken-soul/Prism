import type {
  ChatResponse,
  HealthResponse,
  Message,
  NamespacesResponse,
} from '../types'

/**
 * POST a user message to the Prism classification loop.
 * @param message - user input text
 * @param history - prior conversation turns
 */
export async function sendChat(
  message: string,
  history: Message[],
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      (data as { error?: string }).error ||
        'Could not reach the relayer. Check the connection and try again',
    )
  }
  return data as ChatResponse
}

/**
 * Fetch the current session namespace feed.
 */
export async function fetchNamespaces(): Promise<NamespacesResponse> {
  const response = await fetch('/api/namespaces')
  if (!response.ok) {
    throw new Error('Could not load namespaces')
  }
  return response.json() as Promise<NamespacesResponse>
}

/**
 * Fetch health and agent address.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health')
  if (!response.ok) {
    throw new Error('Could not reach the server')
  }
  return response.json() as Promise<HealthResponse>
}

/**
 * Fetch the public Prism system prompt text.
 */
export async function fetchPrompt(): Promise<string> {
  const response = await fetch('/api/prompt')
  if (!response.ok) {
    throw new Error('Could not load the prompt')
  }
  const data = (await response.json()) as { prompt: string }
  return data.prompt
}
