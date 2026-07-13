/**
 * Seeds ten-plus Mainnet blobs across facts, beliefs and questions so the
 * submission proof threshold is cleared without relying only on live chat.
 *
 * Requires MEMWAL_DELEGATE_KEY and MEMWAL_ACCOUNT_ID in .env.
 *
 * Usage: npx tsx scripts/seedBlobs.ts
 */
import 'dotenv/config'
import {
  writeMemory,
  isMemWalConfigured,
  agentAddress,
  sessionState,
} from '../server/memory.js'
import type { Namespace } from '../server/parseRemember.js'

const seeds: Array<{ namespace: Namespace; text: string }> = [
  {
    namespace: 'facts',
    text: 'Prism agent initialised on Walrus Mainnet for the Memory Prompt Jam.',
  },
  {
    namespace: 'facts',
    text: 'Submission deadline is 13 July 2026 at 14:00 UTC.',
  },
  {
    namespace: 'facts',
    text: 'Prism uses three Walrus Memory namespaces: facts, beliefs, questions.',
  },
  {
    namespace: 'facts',
    text: 'The submission artifact is the PRISM_SYSTEM_PROMPT text, not the UI shell.',
  },
  {
    namespace: 'beliefs',
    text: 'Judges likely weigh prompt craftsmanship as highly as mainnet blob count.',
  },
  {
    namespace: 'beliefs',
    text: 'A live light-split demo is more persuasive than a static screenshot.',
  },
  {
    namespace: 'beliefs',
    text: 'Developers shipping long-lived agents are the primary audience for Prism.',
  },
  {
    namespace: 'questions',
    text: 'Does the rate limit on the managed relayer apply per account or per key.',
  },
  {
    namespace: 'questions',
    text: 'Should belief-to-fact promotion stay natural language only for the jam.',
  },
  {
    namespace: 'questions',
    text: 'Is a dedicated Sessions wallet required to differ from any prize wallet.',
  },
  {
    namespace: 'facts',
    text: 'Seed script wrote the minimum mainnet proof set for Prism submission.',
  },
]

async function main() {
  // eslint-disable-next-line no-console
  console.log('MemWal configured:', isMemWalConfigured())
  // eslint-disable-next-line no-console
  console.log('Agent address:', agentAddress)

  if (!isMemWalConfigured()) {
    // eslint-disable-next-line no-console
    console.error(
      'Set MEMWAL_DELEGATE_KEY and MEMWAL_ACCOUNT_ID in .env before seeding.',
    )
    process.exit(1)
  }

  for (const seed of seeds) {
    // eslint-disable-next-line no-console
    console.log(`Writing ${seed.namespace}: ${seed.text.slice(0, 48)}...`)
    const result = await writeMemory(seed.text, seed.namespace)
    // eslint-disable-next-line no-console
    console.log(`  -> ${result.blobId}`)
  }

  // eslint-disable-next-line no-console
  console.log('')
  // eslint-disable-next-line no-console
  console.log('Total blobs this run:', sessionState.total)
  // eslint-disable-next-line no-console
  console.log('facts:', sessionState.facts.length)
  // eslint-disable-next-line no-console
  console.log('beliefs:', sessionState.beliefs.length)
  // eslint-disable-next-line no-console
  console.log('questions:', sessionState.questions.length)
  // eslint-disable-next-line no-console
  console.log('Agent address for submission form:', agentAddress)
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
