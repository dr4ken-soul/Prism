# Prism

Facts, beliefs and questions, kept apart on purpose.

Prism is a system prompt for the **Walrus Memory Prompt Jam**. It teaches an agent to write memory into three Walrus namespaces (`facts`, `beliefs`, `questions`) and to cite which layer every answer came from. The console around it is a live proof surface. The submission artifact is `PRISM_SYSTEM_PROMPT` in `server/prompt.ts` (also `PROMPT.txt`).

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS + Motion + Zustand + Lucide |
| Backend | Node + Express |
| LLM | Claude API |
| Memory | `@mysten-incubation/memwal` on Mainnet |

## Quick start

```bash
npm install
cp .env.example .env
```

Fill `.env` (see `.env.example`):

```
# LLM: both supported. auto prefers Anthropic when both keys exist.
LLM_PROVIDER=auto
LLM_FALLBACK=true
ANTHROPIC_API_KEY=
GROQ_API_KEY=

MEMWAL_DELEGATE_KEY=
MEMWAL_ACCOUNT_ID=
MEMWAL_RELAYER_URL=https://relayer.memory.walrus.xyz
PORT=8787
```

Set `LLM_PROVIDER=groq` or `LLM_PROVIDER=anthropic` to force one provider.
With `LLM_FALLBACK=true` (default), a failed primary call tries the other key.

### 1. MemWal account (once)

```bash
npm run setup:account
```

Copy `MEMWAL_DELEGATE_KEY` into `.env`. Create a MemWal account on Mainnet, register the delegate key, set `MEMWAL_ACCOUNT_ID`. See [Walrus Memory docs](https://docs.wal.app/walrus-memory/getting-started/what-is-memwal) and [MemWal GitHub](https://github.com/MystenLabs/MemWal).

### 2. First Mainnet write

```bash
npm run test:write
```

### 3. Seed ten blobs (submission proof)

```bash
npm run seed:blobs
```

### 4. Run the console

```bash
npm run dev
```

- UI: http://localhost:5173  
- API: http://localhost:8787  

Production (serves built UI from Express):

```bash
npm run build
npm start
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Concurrent Vite + Express |
| `npm run build` | Production frontend build |
| `npm start` | Serve API + `dist/` |
| `npm run test:parse` | Remember-protocol unit check |
| `npm run setup:account` | Generate MemWal delegate key |
| `npm run test:write` | Confirm a Mainnet blob write |
| `npm run seed:blobs` | Write 11 Mainnet blobs for proof |
| `npm run demo:chat` | Scripted classification conversation |

## Remember protocol

The model signals stores with:

```
[[remember:facts]] ... [[/remember]]
[[remember:beliefs]] ... [[/remember]]
[[remember:questions]] ... [[/remember]]
```

The backend parses these out, writes via `rememberAndWait`, strips tags from the visible reply, and returns `newBlobs` for the light-split animation.

## Deploy

- **Render:** `render.yaml` included. Set secret env vars in the dashboard.
- **Railway:** `railway.toml` included. Set the same env vars as `.env.example`.

Never expose `ANTHROPIC_API_KEY` or `MEMWAL_DELEGATE_KEY` to the client.

## Submission

See `SUBMISSION.md` and `MARKETING.md`.

- Deadline: **13 July 2026, 14:00 UTC**
- Need ≥ 10 Mainnet blobs + agent address
- Copy-paste prompt from the panel or `PROMPT.txt`
- Demo video ≤ 3 minutes, uploaded to Walrus

## Project layout

```
server/          Express API, prompt, MemWal, parseRemember
src/             Spectral Editorial console
scripts/         setup, write test, seed, demo chat
PROMPT.txt       Submission prompt text
SUBMISSION.md    Form fields and checklist
```
