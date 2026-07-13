# Prism — Submission Package

## Project title

Prism

## Tagline

Facts, beliefs and questions, kept apart on purpose.

## One-line pitch

Prism splits an agent's memory into facts, beliefs and questions, so you can see exactly how sure it is before you trust an answer.

## Explanation (2 to 5 sentences for the form)

Most memory-enabled agents keep one flat pile of everything they have learned, with no way to tell what a user actually said from what the agent inferred or what it never confirmed. Prism is a system prompt that fixes this by splitting an agent's memory into three Walrus Memory namespaces: facts for confirmed information, beliefs for working assumptions, questions for unresolved gaps. Every memory the agent writes gets classified by the prompt's own rules before it is stored, and every answer the agent gives cites which namespace it drew from, so confidence is visible rather than implied. The console proves it works in real time with real Mainnet blobs.

## Full prompt text

Copy from the live console panel, or from `server/prompt.ts` (`PRISM_SYSTEM_PROMPT`). The panel copy button must match this field byte for byte.

## Mainnet proof fields

- Agent / Sessions wallet address: from footer strip or `GET /api/health` → `agentAddress`
- Blob count: corner instrument + intro strip (need ≥ 10 on Mainnet at submission)

## Demo video flow (≤ 3 minutes)

1. Open the Prism console, corner instrument at rest
2. Send a message stating something clearly, a hedge, and an open gap in one exchange
3. Show the light-split animation landing in the correct namespace column for each
4. Ask a follow-up that depends on something established earlier, show the agent citing the namespace it recalled from
5. Open the prompt panel, copy the full prompt text
6. Briefly state the blob count and agent address as mainnet proof

Upload the video to Walrus per Sessions rules.

## X posts

See `MARKETING.md`. Post manually. Use #Walrus on the demo post.

## Operator path (today)

```bash
npm install
cp .env.example .env
# fill ANTHROPIC_API_KEY

npm run setup:account
# fill MEMWAL_DELEGATE_KEY + MEMWAL_ACCOUNT_ID after on-chain account create

npm run test:write
npm run seed:blobs          # ≥ 10 mainnet blobs
npm run dev                 # demo in the console
# optional: npm run demo:chat with server already running
```

## Checklist

- [ ] Prompt tested in isolation against Claude (`PROMPT.txt` or console panel)
- [ ] MemWal account created (`npm run setup:account`) and first blob confirmed (`npm run test:write`)
- [ ] `.env` filled from `.env.example` (keys never committed)
- [ ] `npm run dev` works (frontend + backend)
- [ ] Ten or more real Mainnet blobs (`npm run seed:blobs` and/or live chat)
- [ ] Agent address and blob count captured (footer + corner instrument)
- [ ] Demo video under three minutes uploaded to Walrus
- [ ] DeepSurge registration + Walrus submission form + MemWal feedback form
- [ ] Discord joined, demo posted on X with #Walrus
