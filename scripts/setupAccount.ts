/**
 * One-time MemWal account bootstrap. Run once, not part of the app runtime.
 * Prints keys to stdout only. Store them in .env, never commit them.
 *
 * Usage: npm run setup:account
 *
 * Full flow:
 * 1. Run this script and copy MEMWAL_DELEGATE_KEY + Sui address
 * 2. Create a MemWal account on Mainnet (dashboard or createAccount())
 * 3. Add this delegate key to the account if it is not the owner key
 * 4. Set MEMWAL_ACCOUNT_ID and MEMWAL_DELEGATE_KEY in .env
 * 5. Confirm with npm run test:write
 *
 * Docs: https://docs.wal.app/walrus-memory/getting-started/what-is-memwal
 * SDK:  https://github.com/MystenLabs/MemWal
 */
import { generateDelegateKey } from '@mysten-incubation/memwal/account'
import { delegateKeyToSuiAddress } from '@mysten-incubation/memwal'

async function main() {
  const { privateKey, publicKey, suiAddress } = await generateDelegateKey()
  const derived = delegateKeyToSuiAddress(privateKey)

  // eslint-disable-next-line no-console
  console.log('=== Prism MemWal setup ===')
  // eslint-disable-next-line no-console
  console.log('')
  // eslint-disable-next-line no-console
  console.log('Paste into .env (never commit this file):')
  // eslint-disable-next-line no-console
  console.log('')
  // eslint-disable-next-line no-console
  console.log(`MEMWAL_DELEGATE_KEY=${privateKey}`)
  // eslint-disable-next-line no-console
  console.log('MEMWAL_ACCOUNT_ID=')
  // eslint-disable-next-line no-console
  console.log('MEMWAL_NETWORK=mainnet')
  // eslint-disable-next-line no-console
  console.log('')
  // eslint-disable-next-line no-console
  console.log('Agent / Sessions wallet address (submission proof field):')
  // eslint-disable-next-line no-console
  console.log(suiAddress || derived)
  // eslint-disable-next-line no-console
  console.log('')
  // eslint-disable-next-line no-console
  console.log('Public key (hex or bytes depending on SDK version):')
  // eslint-disable-next-line no-console
  console.log(publicKey)
  // eslint-disable-next-line no-console
  console.log('')
  // eslint-disable-next-line no-console
  console.log('Next steps:')
  // eslint-disable-next-line no-console
  console.log('1. Create a MemWalAccount on Mainnet for your Sessions wallet')
  // eslint-disable-next-line no-console
  console.log('2. Register this delegate key on that account')
  // eslint-disable-next-line no-console
  console.log('3. Set MEMWAL_ACCOUNT_ID in .env to the account object id')
  // eslint-disable-next-line no-console
  console.log('4. npm run test:write')
  // eslint-disable-next-line no-console
  console.log('5. npm run seed:blobs   (clears the 10-blob proof threshold)')
  // eslint-disable-next-line no-console
  console.log('6. npm run dev          (open http://localhost:5173)')
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
