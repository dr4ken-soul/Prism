# Prism — Agent Context

## What This Is

Prism is a system prompt that teaches an agent to keep three separate kinds of memory instead of one undifferentiated pile. Every piece of information the agent encounters gets classified into `facts` (confirmed), `beliefs` (working assumptions) or `questions` (unresolved gaps), and each is written to its own Walrus Memory namespace. The agent cites which layer any answer came from, so its confidence is always visible rather than implied.

Built for the Walrus Sessions: Walrus Memory Prompt Jam, June 26 to July 13 2026, results July 23. Judged on whether the prompt solves a real problem, whether it is well crafted, and whether it demonstrably works on Mainnet.

---

## One-Line Pitch

Prism splits an agent's memory into facts, beliefs and questions, so you can see exactly how sure it is before you trust an answer.

---

## The Prompt (submission artifact)

The full text lives in `server/prompt.ts` as the `PRISM_SYSTEM_PROMPT` constant and is rendered read-only in the app's prompt panel with a copy button. Nothing in the UI is the actual submission, the prompt text is. The UI exists to prove the prompt works.

---

## MVP Features

1. Live console — a single page, not a marketing site plus a separate app. Chat pane on one side, namespace panel on the other
2. Classification loop — every user message is answered by Claude using the Prism prompt, and any `[[remember:namespace]]...[[/remember]]` block in the reply is parsed out, written to Walrus Memory in that namespace, and stripped from the visible reply
3. Recall before reply — before answering, the backend recalls from all three namespaces and injects the results as labelled context, so the agent's behaviour visibly changes based on what it already knows
4. Live namespace panel — three colour-coded columns, facts, beliefs, questions, each card links to its Walrus blob
5. Proof cluster — a running mainnet blob count and per-namespace pulse, visible without opening any panel

Post-jam, if this goes further: promotion of a belief to a fact with tracked lineage rather than natural-language mention, a public read-only view of someone else's namespace split, multi-agent namespace merging.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 |
| Animations | Motion (`motion/react`) |
| State | Zustand |
| Icons | Lucide React |
| Backend | Node + Express, single small service |
| LLM | Claude API (claude-sonnet) |
| Memory | Walrus Memory via `@mysten-incubation/memwal`, Mainnet |

No framework opinion beyond this, build in whichever IDE or agent you have open, nothing here assumes a specific one.

---

## Project Structure

```
prism/
├── public/
│   └── favicon.ico                  (favicon — user provides, plain comment slot until then)
├── server/
│   ├── index.ts                     (Express app, /api/chat and /api/namespaces)
│   ├── prompt.ts                    (PRISM_SYSTEM_PROMPT constant, the submission artifact)
│   ├── memory.ts                    (MemWal client setup, remember/recall helpers)
│   └── parseRemember.ts             (extracts [[remember:namespace]] blocks from model output)
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── FadeIn.tsx
│   │   │   ├── BlurText.tsx
│   │   │   ├── Magnet.tsx
│   │   │   └── GrainOverlay.tsx
│   │   ├── layout/
│   │   │   └── CornerInstrument.tsx
│   │   └── console/
│   │       ├── IntroStrip.tsx
│   │       ├── ConversationPane.tsx
│   │       ├── NamespacePanel.tsx
│   │       ├── NamespaceCard.tsx
│   │       ├── LightSplit.tsx
│   │       ├── PromptPanel.tsx
│   │       └── FooterStrip.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useNamespaceFeed.ts
│   │   └── useMagneticHover.ts
│   ├── lib/
│   │   └── api.ts
│   ├── store/
│   │   └── useConsoleStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## Design System

All seven gates are confirmed. Do not deviate without explicit instruction.

**Name:** Prism
**Aesthetic:** Spectral Editorial, dark editorial base with a functional colour language, not a decorative one
**Nav:** Corner Instrument, no bar. Wordmark top-left, live proof cluster top-right, single action pill floats near the prompt panel

**Fonts:**
- Display: Instrument Serif (italic accents)
- Body: Figtree
- Mono: IBM Plex Mono

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Figtree:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

**Colour palette — Spectral Editorial:**
```css
--bg-primary:     #0a0a0e;
--bg-secondary:   #101015;
--bg-surface:     #16161d;
--bg-elevated:    #1e1e27;
--accent:         #d8d4ec;
--accent-hover:   #eae7f7;
--accent-glow:    rgba(216, 212, 236, 0.10);
--facts:          #4dd9c0;
--facts-glow:     rgba(77, 217, 192, 0.14);
--beliefs:        #e8a94d;
--beliefs-glow:   rgba(232, 169, 77, 0.14);
--questions:      #b088e8;
--questions-glow: rgba(176, 136, 232, 0.14);
--text-primary:   #eeecf5;
--text-secondary: #8a889c;
--text-muted:     #4a4856;
--border-subtle:  rgba(255, 255, 255, 0.04);
--border-default: rgba(255, 255, 255, 0.08);
--success:        #22c55e;
--error:          #ef4444;
```

**Background:** static atmospheric, grain overlay plus a slow radial glow that cycles through facts, beliefs and questions hues in turn rather than one fixed accent. No video, this is a working tool not a launch page.

**Nav in full:** top-left corner holds only the Prism wordmark, quiet, Instrument Serif italic, no container. Top-right corner holds three small dots in the namespace colours that glow brighter on cursor proximity and pulse when a blob writes, next to a running mainnet blob count in IBM Plex Mono. No links, no hamburger, nothing else lives in a bar because there is no second page to navigate to.

---

## Page Structure (single page)

1. Corner instrument, described above
2. Intro strip, one line pitch plus the proof cluster restated larger
3. Workbench, split layout, conversation pane left, namespace panel right with three colour-coded columns
4. Prompt panel, collapsed by default, expands on spring physics, shows the full copy-pasteable prompt with a copy button
5. Footer strip, GitHub feedback link, Discord link, X link, agent Sui address with copy button

---

## Logo and Favicon

No logo mark exists and none should be invented. The Prism wordmark is the one accepted exception to the no-hardcoded-mark rule, set in Instrument Serif italic as plain text, nothing else. Favicon stays a comment slot until provided.

```tsx
{/* Favicon slot: replace with public/favicon.ico once provided */}
```

Never substitute an AI-generated icon, a symbol, or an emoji for either.

---

## The Remember Protocol

The model signals what to store using an inline tag the backend parses out before the reply reaches the user:

```
[[remember:facts]] User's project deadline is July 13. [[/remember]]
[[remember:beliefs]] User likely prefers async updates based on response timing. [[/remember]]
[[remember:questions]] Does the rate limit apply per user or per API key. [[/remember]]
```

`parseRemember.ts` extracts every block, calls `memwal.rememberAndWait(text, namespace)` for each, strips the tags from the visible reply, and returns the clean text plus the list of newly written blobs so the frontend can animate the light-split reveal.

Before generating a reply, the backend calls `recall()` against all three namespaces with the user's message as the query and injects the results into the system context, labelled by namespace, so the model's answer is grounded rather than restating the prompt in the abstract.

---

## Code Rules (follow without exception)

**TypeScript / React:**
- camelCase for all variables and functions
- JSDoc comments on every function and custom hook
- No inline styles unless a CSS variable or dynamic value requires it
- CSS variables from the design system used directly, never hardcoded hex values in components
- No hardcoded placeholder logos, favicons or icon symbols anywhere
- No AI-generated icon symbols or emoji used as visual accents anywhere

**Writing rules (all frontend copy, labels, comments, dashboard text, code comments, JSDoc):**
- British English throughout
- No em dashes anywhere
- Periods only when necessary
- Commas only when necessary
- Short direct sentences that connect to the surrounding copy
- No filler phrases: no "seamlessly", "leverage", "powerful", "robust", "unlock"
- CTA text is direct: "Copy prompt", "Send", "View on Walrus"
- Error messages are plain: "Could not reach the relayer. Check the connection and try again"
- Empty states are honest: "No blobs written yet. Send a message to start"

**Component rules:**
- CSS class-based hover states only, no inline JS onMouseEnter or onMouseLeave handlers
- Motion for all entrance animations, blur-in pattern
- Spring physics for interactive elements, not linear easing
- Loading states use skeleton shimmer, not spinners

**Never do these:**
- Never add a logo, favicon or brand mark beyond the plain wordmark exception
- Never write a namespace card before the Walrus write confirms
- Never use `console.log` in production paths, use a `logger` utility instead
- Never store the delegate private key anywhere but server-side environment variables
- Never expose `ANTHROPIC_API_KEY` or `MEMWAL_DELEGATE_KEY` to the client bundle

---

## Hackathon Checklist

- Project name: Prism
- Hackathon: Walrus Sessions, Walrus Memory Prompt Jam
- Submission deadline: July 13 2026, 2:00 PM UTC
- Agent must show at least 10 blobs written on Mainnet at submission time, agent address and blob count as proof
- Full copy-pasteable prompt text plus a 2 to 5 sentence explanation required on the submission form
- Demo video, 3 minutes or less, uploaded to Walrus
- Dedicated Sessions wallet address required, separate from any prize wallet
- Feedback form completed, including any GitHub issues opened at github.com/MystenLabs/MemWal
- Join the Walrus Discord and post a demo on X with #Walrus
