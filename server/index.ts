import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PRISM_SYSTEM_PROMPT } from './prompt.js'
import {
  recallContext,
  writeMemory,
  sessionState,
  getAgentAddress,
  resolveAgentAddress,
  isMemWalConfigured,
  hydrateSessionFromWalrus,
} from './memory.js'
import { parseRemember } from './parseRemember.js'
import { completeChat, getProviderStatus } from './llm.js'
import { logger } from './logger.js'

const app = express()
const port = Number(process.env.PORT) || 8787
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.resolve(__dirname, '../dist')

app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Lazy hydration for Serverless cold starts
let isHydrated = false
const ensureHydrated = async () => {
  if (!isHydrated) {
    await hydrateSessionFromWalrus()
    isHydrated = true
  }
}

// Middleware to ensure hydration on Vercel
app.use('/api', (req, res, next) => {
  if (process.env.VERCEL) {
    ensureHydrated().then(() => next()).catch((error) => {
      logger.error('Failed to hydrate session on Serverless cold start', error)
      next()
    })
  } else {
    next()
  }
})

/**
 * Formats labelled recall results into a system context block.
 * @param context - recall results per namespace
 */
function formatContextBlock(context: {
  facts: Array<{ text: string }>
  beliefs: Array<{ text: string }>
  questions: Array<{ text: string }>
}): string {
  const factText = context.facts.map((r) => r.text).join('. ') || 'none yet'
  const beliefText = context.beliefs.map((r) => r.text).join('. ') || 'none yet'
  const questionText =
    context.questions.map((r) => r.text).join('. ') || 'none yet'
  return `Known facts: ${factText}
Working beliefs: ${beliefText}
Open questions: ${questionText}`
}

/**
 * Health check with agent address and LLM provider status.
 */
app.get('/api/health', (_req, res) => {
  const providers = getProviderStatus()
  res.json({
    status: 'ok',
    agentAddress: getAgentAddress(),
    memwal: isMemWalConfigured(),
    llm: providers,
    anthropic: providers.anthropic,
    groq: providers.groq,
  })
})

/**
 * Returns the submission prompt text for the prompt panel.
 */
app.get('/api/prompt', (_req, res) => {
  res.json({ prompt: PRISM_SYSTEM_PROMPT })
})

/**
 * Session namespace feed for the live panel and proof cluster.
 */
app.get('/api/namespaces', (_req, res) => {
  res.json({
    facts: sessionState.facts,
    beliefs: sessionState.beliefs,
    questions: sessionState.questions,
    total: sessionState.total,
  })
})

/**
 * Classification loop: recall, reply with Prism prompt, parse remember
 * tags, write to Walrus, return clean reply plus new blobs.
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body as {
      message?: string
      history?: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required' })
      return
    }

    const providers = getProviderStatus()
    if (!providers.active) {
      res.status(503).json({
        error:
          'Could not reach the model. Set ANTHROPIC_API_KEY and/or GROQ_API_KEY and try again',
      })
      return
    }

    const context = await recallContext(message.trim())
    const contextBlock = formatContextBlock(context)

    const safeHistory = (Array.isArray(history) ? history : [])
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string',
      )
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }))

    // Providers expect a user message first in the history window
    while (safeHistory.length > 0 && safeHistory[0].role !== 'user') {
      safeHistory.shift()
    }

    const { text: rawReply, provider } = await completeChat({
      system: `${PRISM_SYSTEM_PROMPT}\n\n${contextBlock}`,
      messages: [
        ...safeHistory,
        { role: 'user', content: message.trim() },
      ],
      maxTokens: 1024,
    })

    const { cleaned, memories } = parseRemember(rawReply)

    const newBlobs = []
    for (const memory of memories) {
      try {
        const blob = await writeMemory(memory.text, memory.namespace)
        newBlobs.push(blob)
      } catch (writeError) {
        logger.error('Write failed for memory', writeError)
      }
    }

    res.json({ reply: cleaned, newBlobs, provider })
  } catch (error) {
    logger.error('Chat route failed', error)
    res.status(500).json({
      error: 'Could not reach the relayer. Check the connection and try again',
    })
  }
})

/**
 * Serve the built console in production so one process can host API + UI.
 */
if (!process.env.VERCEL) {
  app.use(express.static(distPath))
  app.get(/^(?!\/api).*/, (req, res, next) => {
    if (req.method !== 'GET') {
      next()
      return
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next()
    })
  })
}

if (!process.env.VERCEL) {
  resolveAgentAddress().then(async (address) => {
    await ensureHydrated()
    app.listen(port, () => {
      const providers = getProviderStatus()
      logger.info(`Prism server listening on :${port}`, {
        memwal: isMemWalConfigured(),
        llm: providers,
        agentAddress: address,
      })
    })
  })
}

export default app
