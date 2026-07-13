import { MemWal, delegateKeyToSuiAddress } from '@mysten-incubation/memwal'
import type { Namespace } from './parseRemember.js'
import { logger } from './logger.js'

/**
 * Session blob record returned to the client after a confirmed write.
 */
export interface BlobRecord {
  namespace: Namespace
  blobId: string
  text: string
  writtenAt: number
}

/**
 * In-memory session state for the live namespace panel.
 * Populated at startup from Walrus recall, then kept live via writes.
 */
export const sessionState: {
  facts: BlobRecord[]
  beliefs: BlobRecord[]
  questions: BlobRecord[]
  total: number
} = {
  facts: [],
  beliefs: [],
  questions: [],
  total: 0,
}

const hasMemWalCredentials = Boolean(
  process.env.MEMWAL_DELEGATE_KEY && process.env.MEMWAL_ACCOUNT_ID,
)

/**
 * Single MemWal client for the whole server process.
 * Namespace is passed per call, not fixed at creation.
 * Null when credentials are missing so the console still boots for UI work.
 */
export const memwal = hasMemWalCredentials
  ? MemWal.create({
      key: process.env.MEMWAL_DELEGATE_KEY!,
      accountId: process.env.MEMWAL_ACCOUNT_ID!,
      serverUrl: process.env.MEMWAL_RELAYER_URL,
      namespace: 'facts',
    })
  : null

/**
 * Cached resolved agent address string.
 */
let resolvedAgentAddress = '0x_configure_MEMWAL_DELEGATE_KEY'

/**
 * Derives the agent's Sui address from the delegate key for footer proof
 * and the submission form. Returns a placeholder when no key is set.
 * Must be called once at startup to resolve the async derivation.
 */
export async function resolveAgentAddress(): Promise<string> {
  if (process.env.MEMWAL_DELEGATE_KEY) {
    const result = delegateKeyToSuiAddress(process.env.MEMWAL_DELEGATE_KEY)
    resolvedAgentAddress = typeof result === 'object' && result !== null && 'then' in result
      ? await result
      : String(result)
  }
  return resolvedAgentAddress
}

/**
 * Returns the resolved agent address. Call resolveAgentAddress() first.
 */
export function getAgentAddress(): string {
  return resolvedAgentAddress
}

/**
 * Writes one classified memory to its namespace and waits for the
 * Walrus blob to confirm before returning. Falls back to a local mock
 * write when MemWal is not configured so the UI loop can still be demoed.
 * @param text - the memory text to store
 * @param namespace - one of facts, beliefs, questions
 * @returns the confirmed blob id and namespace for the UI to render
 */
export async function writeMemory(
  text: string,
  namespace: Namespace,
): Promise<BlobRecord> {
  if (!memwal) {
    logger.warn('MemWal not configured, using local mock blob', { namespace })
    const record: BlobRecord = {
      namespace,
      blobId: `local_${namespace}_${Date.now().toString(36)}`,
      text,
      writtenAt: Date.now(),
    }
    sessionState[namespace].push(record)
    sessionState.total += 1
    return record
  }

  const result = await memwal.rememberAndWait(text, namespace, {
    timeoutMs: 60_000,
    pollIntervalMs: 1_500,
  })
  const record: BlobRecord = {
    namespace: (result.namespace as Namespace) || namespace,
    blobId: result.blob_id,
    text,
    writtenAt: Date.now(),
  }
  sessionState[namespace].push(record)
  sessionState.total += 1
  logger.info('Blob written', {
    namespace: record.namespace,
    blobId: record.blobId,
  })
  return record
}

/**
 * Pulls the most relevant memories from all three namespaces for the
 * incoming message, so the model answers from grounded context.
 * @param query - the user's incoming message
 * @returns labelled recall results per namespace
 */
export async function recallContext(query: string): Promise<{
  facts: Array<{ text: string }>
  beliefs: Array<{ text: string }>
  questions: Array<{ text: string }>
}> {
  if (!memwal) {
    return {
      facts: sessionState.facts.slice(-5).map((r) => ({ text: r.text })),
      beliefs: sessionState.beliefs.slice(-5).map((r) => ({ text: r.text })),
      questions: sessionState.questions.slice(-3).map((r) => ({ text: r.text })),
    }
  }

  try {
    const [facts, beliefs, questions] = await Promise.all([
      memwal.recall({ query, limit: 5, namespace: 'facts' }),
      memwal.recall({ query, limit: 5, namespace: 'beliefs' }),
      memwal.recall({ query, limit: 3, namespace: 'questions' }),
    ])
    return {
      facts: facts.results ?? [],
      beliefs: beliefs.results ?? [],
      questions: questions.results ?? [],
    }
  } catch (error) {
    logger.error('Recall failed, falling back to session state', error)
    return {
      facts: sessionState.facts.slice(-5).map((r) => ({ text: r.text })),
      beliefs: sessionState.beliefs.slice(-5).map((r) => ({ text: r.text })),
      questions: sessionState.questions.slice(-3).map((r) => ({ text: r.text })),
    }
  }
}

/**
 * Returns whether MemWal Mainnet credentials are present.
 */
export function isMemWalConfigured(): boolean {
  return Boolean(memwal)
}

/**
 * Re-hydrates sessionState from Walrus on startup so blobs written in
 * previous server runs (e.g. the seed script) appear immediately in the UI.
 * Safe to call once at boot; silently skips if MemWal is not configured.
 */
export async function hydrateSessionFromWalrus(): Promise<void> {
  if (!memwal) return

  // recall() is semantic search — one query misses blobs that don't rank highly for it.
  // Run several targeted queries per namespace and deduplicate by blobId.
  const hydrationQueries: Record<Namespace, string[]> = {
    facts: [
      'Prism agent Walrus Mainnet initialised',
      'submission deadline deadline UTC proof',
      'namespace seed script minimum proof set',
    ],
    beliefs: [
      'judges prompt craftsmanship mainnet blob count',
      'light-split demo persuasive screenshot audience',
    ],
    questions: [
      'rate limit managed relayer account key',
      'belief fact promotion natural language jam wallet',
    ],
  }

  const namespaces: Namespace[] = ['facts', 'beliefs', 'questions']
  for (const ns of namespaces) {
    for (const query of hydrationQueries[ns]) {
      try {
        const recalled = await memwal.recall({ query, limit: 50, namespace: ns })
        const results: Array<{ text?: string; blob_id?: string }> = recalled.results ?? []
        for (const item of results) {
          if (!item.text) continue
          const record: BlobRecord = {
            namespace: ns,
            blobId: item.blob_id ?? `hydrated_${ns}_${Date.now().toString(36)}`,
            text: item.text,
            writtenAt: Date.now(),
          }
          // Deduplicate by blobId so multiple queries don't double-count
          if (!sessionState[ns].some((b) => b.blobId === record.blobId)) {
            sessionState[ns].push(record)
          }
        }
      } catch (error) {
        logger.warn(`Hydration failed for namespace ${ns} query "${query}"`, error)
      }
    }
  }

  sessionState.total =
    sessionState.facts.length +
    sessionState.beliefs.length +
    sessionState.questions.length

  logger.info('Session hydrated from Walrus', {
    facts: sessionState.facts.length,
    beliefs: sessionState.beliefs.length,
    questions: sessionState.questions.length,
    total: sessionState.total,
  })
}
