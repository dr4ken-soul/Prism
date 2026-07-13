# Prism — App Blueprint

## Product Summary

Prism is a system prompt that gives an agent three separate memory namespaces on Walrus Memory instead of one. Everything the agent learns gets classified as a confirmed `fact`, a working `belief`, or an open `question`, written to the matching namespace, and cited by layer whenever it is recalled. The point is not storage, plenty of prompts can call `memwal_remember`. The point is that an agent using Prism can tell you how sure it is, because the structure of its memory encodes that confidence rather than hiding it in prose.

The product for this jam is the prompt itself, submitted as copy-pasteable text. The app built around it is a live console that proves the prompt works: a real chat, a real classification loop, real blobs landing on Mainnet in front of the judge while they watch.

---

## The Problem

Every memory-enabled agent treats what it knows as one flat list. Ask it something and it cannot tell you whether it is repeating something you told it directly, something it inferred from tone, or something it never actually confirmed and has been quietly assuming for three sessions. That collapse of confidence into a single undifferentiated memory is the actual failure mode, not forgetting. Forgetting is loud and obvious. A wrong assumption treated as settled fact is silent and expensive.

Prism does not fix this by remembering more. It fixes it by remembering with structure.

---

## Who This Is For

1. Developers building memory-enabled agents who need their agent's confidence to be inspectable rather than implied, particularly anyone shipping an agent that makes recommendations based on inferred user preferences
2. Teams running long-lived agent sessions, support bots, coding assistants, research agents, where an assumption treated as settled fact three sessions later is the actual failure mode, not forgetting
3. The Walrus Foundation panel itself, since the brief explicitly asks for a prompt that could seed the official prompt library, which means the target reader is someone evaluating prompt craftsmanship against the MemWal SDK directly

**What they currently do instead:** one flat memory namespace, if any structure exists at all it is usually a single vector store with no distinction between what the user said and what the agent guessed. Some agents avoid the problem by not persisting memory at all, which trades the risk for a worse one, total amnesia between sessions.

**Why Prism instead:** the classification cost is paid once, at write time, by the agent itself, not by a human labelling data afterwards. The namespace split is enforced by the prompt's own rules, not by a separate tagging step someone forgets to run.

---

## MVP Feature Set

### Feature 1: Classification loop

**User story:** As someone talking to a Prism-enabled agent I want everything it learns sorted into fact, belief or question so that I know how much to trust each part of what it tells me later.

**How it works:** The backend calls Claude with the Prism system prompt. Any `[[remember:namespace]]...[[/remember]]` block in the reply is extracted, written to the matching Walrus Memory namespace through `memwal.rememberAndWait()`, then stripped from the text the user actually sees.

**Acceptance criteria:** A confirmed statement lands in facts, a hedged inference lands in beliefs, an unresolved gap lands in questions, and the visible reply never contains the raw remember tags.

**Complexity:** Medium

---

### Feature 2: Recall before reply

**User story:** As someone continuing a conversation I want the agent to actually use what it already knows rather than starting cold every message.

**How it works:** Before generating a reply, the backend calls `recall(query, limit, namespace)` against facts, beliefs and questions using the incoming message as the query, and injects the labelled results into the system context sent to Claude.

**Acceptance criteria:** A follow-up question referencing something established two messages earlier is answered correctly and cites the namespace it came from.

**Complexity:** Medium

---

### Feature 3: Live namespace panel

**User story:** As a judge watching the demo I want to see the memory actually forming, not just hear about it.

**How it works:** Every successful write returned from the backend appends a card to the matching column in the namespace panel, teal for facts, amber for beliefs, violet for questions. Each card links to its Walrus blob.

**Acceptance criteria:** A new card appears within a second or two of the agent's reply, in the correct column, linking to a real blob.

**Complexity:** Medium

---

### Feature 4: Proof cluster

**User story:** As a judge I want to verify the 10-blob mainnet requirement without digging through a submission form.

**How it works:** The corner instrument and the intro strip both show a running count of blobs written this session, sourced from the same event stream that feeds the namespace panel.

**Acceptance criteria:** The count increments live and matches the total card count across all three columns.

**Complexity:** Low

---

### Feature 5: Prompt panel

**User story:** As a judge I want the actual submission text without reading code.

**How it works:** A collapsible panel renders `PRISM_SYSTEM_PROMPT` verbatim in a monospace block with a copy button.

**Acceptance criteria:** The copy button places the exact prompt text on the clipboard, matching the submission form field byte for byte.

**Complexity:** Low

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Fast build, strong typing |
| Styling | Tailwind CSS v3 | Utility-first, pairs with Motion |
| Animations | Motion (`motion/react`) | Current package name, same API as Framer Motion |
| State | Zustand | Lightweight global state for messages and the namespace feed |
| Icons | Lucide React | Clean outline icons |
| Backend | Node + Express | One small service, no need for anything heavier at this scope |
| LLM | Claude API, `claude-sonnet` | Best reasoning for the classification task |
| Memory | `@mysten-incubation/memwal` | The required SDK, Mainnet |
| Peer deps | `@mysten/sui`, `@mysten/seal`, `@mysten/walrus`, `ai`, `zod` | Required by MemWal |

No smart contract, no wallet-connect flow in the browser. MemWal's delegate key model handles authentication server-side, there is nothing for the visitor to sign.

---

## MemWal Integration Detail

### Client setup

```typescript
// server/memory.ts
import { MemWal } from '@mysten-incubation/memwal'

/**
 * Single MemWal client for the whole server process.
 * Namespace is passed per call, not fixed at creation, so one client
 * covers all three namespaces.
 */
export const memwal = MemWal.create({
  key: process.env.MEMWAL_DELEGATE_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_RELAYER_URL,
  namespace: 'facts', // default, overridden per call below
})
```

### Writing a classified memory

```typescript
/**
 * Writes one classified memory to its namespace and waits for the
 * Walrus blob to confirm before returning.
 * @param text - the memory text to store
 * @param namespace - one of facts, beliefs, questions
 * @returns the confirmed blob id and namespace for the UI to render
 */
async function writeMemory(text: string, namespace: 'facts' | 'beliefs' | 'questions') {
  const result = await memwal.rememberAndWait(text, namespace)
  return { blobId: result.blob_id, namespace: result.namespace, text }
}
```

### Recalling before a reply

```typescript
/**
 * Pulls the most relevant memories from all three namespaces for the
 * incoming message, so the model answers from grounded context rather
 * than restating the prompt abstractly.
 * @param query - the user's incoming message
 * @returns labelled recall results per namespace
 */
async function recallContext(query: string) {
  const [facts, beliefs, questions] = await Promise.all([
    memwal.recall(query, 5, 'facts'),
    memwal.recall(query, 5, 'beliefs'),
    memwal.recall(query, 3, 'questions'),
  ])
  return { facts: facts.results, beliefs: beliefs.results, questions: questions.results }
}
```

### Parsing the remember protocol

```typescript
// server/parseRemember.ts

/**
 * Extracts every [[remember:namespace]]...[[/remember]] block from a
 * model reply, returning the cleaned text and the list of memories to write.
 * @param reply - raw text returned by Claude
 * @returns the reply with remember tags stripped, and the parsed memories
 */
export function parseRemember(reply: string) {
  const pattern = /\[\[remember:(facts|beliefs|questions)\]\]([\s\S]*?)\[\[\/remember\]\]/g
  const memories: Array<{ namespace: 'facts' | 'beliefs' | 'questions'; text: string }> = []
  const cleaned = reply.replace(pattern, (_match, namespace, text) => {
    memories.push({ namespace, text: text.trim() })
    return ''
  }).trim()
  return { cleaned, memories }
}
```

### Agent identity for submission proof

```typescript
import { delegateKeyToSuiAddress } from '@mysten-incubation/memwal'

/**
 * Derives the agent's Sui address from the delegate key, used both as
 * the dedicated Sessions wallet address and as the proof identifier
 * shown in the footer strip.
 */
export const agentAddress = delegateKeyToSuiAddress(process.env.MEMWAL_DELEGATE_KEY!)
```

---

## API Routes

| Route | Method | Body | Response |
|---|---|---|---|
| `/api/chat` | POST | `{ message: string, history: Message[] }` | `{ reply: string, newBlobs: BlobRecord[] }` |
| `/api/namespaces` | GET | none | `{ facts: BlobRecord[], beliefs: BlobRecord[], questions: BlobRecord[], total: number }` |
| `/api/health` | GET | none | `{ status: string, agentAddress: string }` |

`/api/namespaces` reflects the current session's writes held in server memory, not a full historical scan. The MemWal SDK's `recall` requires a query and `restore` rebuilds an index rather than listing contents, so session state is the honest source of truth for what the panel shows. The submission's 10-blob mainnet proof is satisfied cumulatively across a demo session, the count does not need to reset.

---

## Data Structures

```typescript
interface BlobRecord {
  namespace: 'facts' | 'beliefs' | 'questions'
  blobId: string
  text: string
  writtenAt: number // unix timestamp, client-side receipt time
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  reply: string
  newBlobs: BlobRecord[]
}
```

---

## Environment Variables

```
MEMWAL_DELEGATE_KEY=
MEMWAL_ACCOUNT_ID=
MEMWAL_RELAYER_URL=
MEMWAL_NETWORK=mainnet
ANTHROPIC_API_KEY=
PORT=8787
```

`MEMWAL_DELEGATE_KEY` and `ANTHROPIC_API_KEY` never reach the client bundle. Both live only in the server process's environment.

---

## What Is Not Being Built in MVP

- Programmatic belief-to-fact promotion with tracked lineage IDs, MVP uses natural-language mention instead ("confirms earlier belief that...")
- Multi-agent or multi-user namespace merging
- A public read-only view of someone else's namespace split
- Historical full-namespace browsing beyond the current session
- Authentication or accounts, this is a single-operator demo tool

These are reasonable post-jam directions if the prompt lands in the official library.

---

## Submission Priority

Deadline July 13 2026, 2:00 PM UTC. Judging weighs real problem, prompt craftsmanship, and demonstrated mainnet function equally.

Priority order:
1. Prompt text finalised and tested against Claude directly, outside any UI, confirming the remember protocol format is followed reliably
2. MemWal account and delegate key created, `writeMemory` confirmed working against Mainnet in isolation
3. Backend `/api/chat` loop working end to end, recall then reply then parse then write
4. Console UI, corner instrument, workbench, namespace panel
5. Ten or more real blobs written across a real conversation, agent address and count captured for the submission form
6. Prompt panel and footer strip
7. Demo video, 3 minutes or less, showing a real conversation, real classification, real Walrus writes appearing live

Everything after step 5 is polish, the mainnet proof is the part that cannot be faked or rushed at the end.
