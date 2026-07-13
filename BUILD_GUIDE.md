# Prism — Build Guide

## Deadline

Walrus Memory Prompt Jam closes July 13 2026, 2:00 PM UTC. Results July 23. This guide is sequential, not day-boxed, work through it at whatever pace suits the session.

---

## Phase 1: The Prompt, Tested Alone First

**Goal:** `PRISM_SYSTEM_PROMPT` proven reliable before any app code exists. This is the actual submission artifact, everything else exists to prove it works.

### Step 1: Write the prompt

Create `server/prompt.ts`:

```typescript
/**
 * The Prism system prompt. This constant is the submission artifact,
 * rendered verbatim in the app's prompt panel. Do not alter its wording
 * without updating the submission form to match.
 */
export const PRISM_SYSTEM_PROMPT = `You have access to Walrus Memory through three namespaces: facts, beliefs, questions. Use them precisely, never as one undifferentiated bucket.

facts: information the user has explicitly stated, confirmed, or that you have independently verified. Write here only when you are certain.

beliefs: your own working assumptions, inferences drawn from context, or anything hedged with language like "probably" or "seems to". Write here when you are inferring rather than being told.

questions: anything unresolved that would change your answer if resolved. Write here when you notice a gap, contradiction, or unstated preference.

Before writing, decide the namespace using the definitions above. Never write the same idea to more than one namespace. Signal what to store using this exact format, inline in your reply:

[[remember:facts]] the memory text [[/remember]]
[[remember:beliefs]] the memory text [[/remember]]
[[remember:questions]] the memory text [[/remember]]

When recalling, state which namespace each piece of information came from. When a belief is confirmed, write a fresh fact that mentions it confirms the earlier belief, do not silently duplicate. When a question is answered, write the answer to facts and treat the question as closed. Recall from all three namespaces before answering anything non-trivial. Facts override beliefs, beliefs override guessing, unresolved questions get surfaced back to the user rather than silently assumed. Never invent a fact to fill a gap that belongs in questions.`
```

### Step 2: Test it in isolation

Before any UI exists, paste the prompt directly into a Claude conversation (console.anthropic.com or the API directly) alongside a short scripted exchange: state a fact, hedge a belief, leave a question open, then ask a follow-up that should pull from all three. Confirm the model actually uses the `[[remember:namespace]]` format correctly and consistently. If it drifts, tighten the wording before writing a single line of app code. A prompt that fails this test fails the whole submission regardless of how polished the app is.

---

## Phase 2: MemWal Account and First Write

**Goal:** A real blob confirmed on Mainnet, outside the app, before building the loop that depends on it.

### Step 1: Install

```bash
npm create vite@latest prism -- --template react-ts
cd prism
npm install
npm install tailwindcss @tailwindcss/vite motion zustand lucide-react
npm install @mysten-incubation/memwal
npm install @mysten/sui @mysten/seal @mysten/walrus ai zod
npm install express dotenv @anthropic-ai/sdk
npx tailwindcss init -p
```

### Step 2: Create the MemWal account

```typescript
// scripts/setupAccount.ts, run once, not part of the app runtime
import { generateDelegateKey, createAccount } from '@mysten-incubation/memwal/account'

const { privateKey, publicKey, suiAddress } = generateDelegateKey()
console.log('Delegate key:', privateKey)
console.log('Sui address:', suiAddress)

// Follow the createAccount() flow in the MemWal docs to register this
// key against a MemWalAccount object on Mainnet, then save the
// resulting accountId to .env as MEMWAL_ACCOUNT_ID
```

Run this once, save `MEMWAL_DELEGATE_KEY` and `MEMWAL_ACCOUNT_ID` to `.env`, never commit either.

### Step 3: First write, confirmed on-chain

```typescript
// scripts/testWrite.ts
import { memwal } from '../server/memory'

const result = await memwal.rememberAndWait('Prism agent initialised on Mainnet.', 'facts')
console.log(result.blob_id, result.namespace)
```

Run it, confirm a real `blob_id` comes back. This is blob one of the ten required for submission. Keep this script around, running it a few more times with varied text gets you comfortably past the minimum before the app even exists.

---

## Phase 3: Backend Loop

**Goal:** `/api/chat` working end to end from the command line, before any frontend touches it.

### Step 1: Memory helpers

Build `server/memory.ts` and `server/parseRemember.ts` exactly as specified in APP_BLUEPRINT.md.

### Step 2: Chat route

```typescript
// server/index.ts
import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { PRISM_SYSTEM_PROMPT } from './prompt'
import { recallContext, writeMemory } from './memory'
import { parseRemember } from './parseRemember'

const app = express()
app.use(express.json())
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body
  const context = await recallContext(message)

  const contextBlock = `Known facts: ${context.facts.map(r => r.text).join('. ') || 'none yet'}
Working beliefs: ${context.beliefs.map(r => r.text).join('. ') || 'none yet'}
Open questions: ${context.questions.map(r => r.text).join('. ') || 'none yet'}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `${PRISM_SYSTEM_PROMPT}\n\n${contextBlock}`,
    messages: [...history, { role: 'user', content: message }],
  })

  const rawReply = response.content.find(b => b.type === 'text')?.text ?? ''
  const { cleaned, memories } = parseRemember(rawReply)

  const newBlobs = await Promise.all(
    memories.map(m => writeMemory(m.text, m.namespace))
  )

  res.json({ reply: cleaned, newBlobs })
})

app.get('/api/namespaces', (req, res) => {
  res.json(sessionState) // in-memory accumulation, see APP_BLUEPRINT.md
})

app.listen(process.env.PORT || 8787)
```

### Step 3: Test from the command line

```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "My deadline is July 13, and I think the judges care most about craft.", "history": []}'
```

Confirm the response includes a clean reply with no visible tags, and `newBlobs` shows at least one fact and one belief written. This is the whole product working, the frontend is presentation from here.

---

## Phase 4: Console UI

**Goal:** The Spectral Editorial console from FRONTEND_SPEC.md, wired to the working backend.

### Step 1: Design tokens

Set up `globals.css` and `tailwind.config.ts` with the colour system and fonts from FRONTEND_SPEC.md. Add the font link to `index.html`.

### Step 2: Corner instrument

Build `CornerInstrument.tsx` exactly as specified, wire `blobCount` and `namespacePulse` to the Zustand store.

### Step 3: Intro strip and workbench shell

Build `IntroStrip.tsx`, then the split grid, `ConversationPane.tsx` and `NamespacePanel.tsx` with three `NamespaceColumn` instances.

### Step 4: Wire the chat loop

`useChat.ts` posts to `/api/chat`, appends the user message and reply to the store, then dispatches each entry in `newBlobs` to trigger a `LightSplit` animation followed by a card appending to the correct column.

### Step 5: Prompt panel and footer

Build `PromptPanel.tsx` importing the same `PRISM_SYSTEM_PROMPT` text (expose it via a small `/api/prompt` route or a shared constant bundled to the client, either is fine since it is meant to be public). Build the footer strip with the real agent address from `/api/health`.

### Step 6: Deploy

Deploy the frontend to Vercel, the backend wherever is fastest for tonight, Render or Railway both work for a single small Express service. Confirm the deployed app can reach the deployed backend before recording anything.

---

## Phase 5: Prove the Ten Blobs and Record

**Goal:** A submission-ready state.

### Step 1: Run a real conversation

Use the deployed console, not the test scripts, to generate the remaining blobs needed. A natural back-and-forth easily produces ten or more across the three namespaces within a few exchanges. Screenshot or note the agent address and the final blob count.

### Step 2: Record the demo

Three minutes or less, uploaded to Walrus per the submission requirements. Show: the corner instrument at rest, a message sent, the light-split animation landing in a column, the namespace panel populating across a short conversation, the prompt panel opened and copied. No voiceover script needed, the interface should explain itself, but a short spoken walkthrough of what fact versus belief versus question means will help judges unfamiliar with the concept.

### Step 3: Submit

Complete the DeepSurge registration, the Walrus submission form, the MemWal feedback form, join Discord if not already, and post the demo on X with #Walrus.

---

## Common Issues

**Remember tags leaking into the visible reply:**
Check `parseRemember.ts` runs before the reply is sent to the client, not after. The regex is greedy across newlines by design, confirm multiline memory text still matches.

**Recall returns nothing even after writes confirm:**
Vector indexing runs asynchronously after `rememberAndWait` resolves. A recall issued immediately after a write in the same request may miss it. This is expected, the next turn's recall will find it.

**Blob count in the corner instrument does not match the namespace panel:**
Both must read from the same session state object server-side, not two separate counters. If they diverge, one is likely counting requests rather than confirmed writes.

**Light-split animation targets the wrong column on resize:**
Target coordinates are measured from the destination column's bounding rect at write-confirmation time, not cached at mount. Recompute on each trigger, not once on load.
