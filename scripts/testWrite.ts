/**
 * Confirms a real Walrus Mainnet write outside the app.
 * Run after MEMWAL_DELEGATE_KEY and MEMWAL_ACCOUNT_ID are set.
 *
 * Usage: npx tsx scripts/testWrite.ts
 */
import 'dotenv/config'
import { writeMemory, isMemWalConfigured, agentAddress } from '../server/memory.js'

async function main() {
  // eslint-disable-next-line no-console
  console.log('MemWal configured:', isMemWalConfigured())
  // eslint-disable-next-line no-console
  console.log('Agent address:', agentAddress)

  const result = await writeMemory(
    'Prism agent initialised on Mainnet.',
    'facts',
  )
  // eslint-disable-next-line no-console
  console.log('blob_id:', result.blobId)
  // eslint-disable-next-line no-console
  console.log('namespace:', result.namespace)
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
