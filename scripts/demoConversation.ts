/**
 * Scripted chat against the local Prism API to produce a natural
 * multi-namespace conversation and confirm the classification loop.
 *
 * Requires the server running with ANTHROPIC_API_KEY set.
 * MemWal keys optional; without them blobs are local mocks.
 *
 * Usage:
 *   npm run dev:server
 *   npx tsx scripts/demoConversation.ts
 */
import type { Message } from '../src/types/index.js'

const baseUrl = process.env.PRISM_API_URL || 'http://localhost:8787'

const turns = [
  'My project is called Prism and the deadline is July 13. I think the judges care most about craft, though I am not sure if they weight mainnet proof higher.',
  'We store memory on Walrus Mainnet using three namespaces. Does the relayer rate limit apply per user or per API key?',
  'What do you already know about my deadline, and which namespace did each part come from?',
]

async function chat(message: string, history: Message[]) {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })
  const data = (await response.json()) as {
    reply?: string
    newBlobs?: Array<{ namespace: string; blobId: string; text: string }>
    error?: string
  }
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`)
  }
  return data as {
    reply: string
    newBlobs: Array<{ namespace: string; blobId: string; text: string }>
  }
}

async function main() {
  const history: Message[] = []
  let totalBlobs = 0

  for (const turn of turns) {
    // eslint-disable-next-line no-console
    console.log('\n--- user ---')
    // eslint-disable-next-line no-console
    console.log(turn)
    const { reply, newBlobs } = await chat(turn, history)
    // eslint-disable-next-line no-console
    console.log('\n--- prism ---')
    // eslint-disable-next-line no-console
    console.log(reply)
    // eslint-disable-next-line no-console
    console.log('\nnewBlobs:', newBlobs.length)
    for (const blob of newBlobs) {
      // eslint-disable-next-line no-console
      console.log(`  [${blob.namespace}] ${blob.blobId.slice(0, 16)}... ${blob.text.slice(0, 60)}`)
    }
    totalBlobs += newBlobs.length
    history.push({ role: 'user', content: turn })
    history.push({ role: 'assistant', content: reply })
  }

  const namespaces = await fetch(`${baseUrl}/api/namespaces`).then((r) =>
    r.json(),
  )
  const health = await fetch(`${baseUrl}/api/health`).then((r) => r.json())

  // eslint-disable-next-line no-console
  console.log('\n=== session summary ===')
  // eslint-disable-next-line no-console
  console.log('blobs this script:', totalBlobs)
  // eslint-disable-next-line no-console
  console.log('namespaces:', namespaces)
  // eslint-disable-next-line no-console
  console.log('health:', health)
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
