import Anthropic from '@anthropic-ai/sdk'
import { logger } from './logger.js'

/**
 * Supported chat providers for the Prism classification loop.
 */
export type LlmProvider = 'anthropic' | 'groq'

/**
 * One turn in the conversation history sent to the model.
 */
export interface LlmMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Options for a single completion request.
 */
export interface CompleteOptions {
  system: string
  messages: LlmMessage[]
  maxTokens?: number
}

const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY?.trim())
const hasGroq = Boolean(process.env.GROQ_API_KEY?.trim())

const anthropic = hasAnthropic
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

/**
 * Resolves which provider to use from env.
 * LLM_PROVIDER: anthropic | groq | auto (default auto)
 * auto prefers Anthropic when both keys exist.
 */
export function resolveProvider(): LlmProvider | null {
  const raw = (process.env.LLM_PROVIDER || 'auto').toLowerCase().trim()

  if (raw === 'anthropic') {
    return hasAnthropic ? 'anthropic' : null
  }
  if (raw === 'groq') {
    return hasGroq ? 'groq' : null
  }

  // auto
  if (hasAnthropic) return 'anthropic'
  if (hasGroq) return 'groq'
  return null
}

/**
 * Returns which providers currently have API keys configured.
 */
export function getProviderStatus(): {
  anthropic: boolean
  groq: boolean
  active: LlmProvider | null
} {
  return {
    anthropic: hasAnthropic,
    groq: hasGroq,
    active: resolveProvider(),
  }
}

/**
 * Completes a chat turn with Anthropic Claude.
 * @param options - system prompt and messages
 */
async function completeAnthropic(options: CompleteOptions): Promise<string> {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    max_tokens: options.maxTokens ?? 1024,
    system: options.system,
    messages: options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  return response.content.find((b) => b.type === 'text')?.text ?? ''
}

/**
 * Completes a chat turn with Groq (OpenAI-compatible Chat Completions API).
 * @param options - system prompt and messages
 */
async function completeGroq(options: CompleteOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set')
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  const baseUrl = (
    process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
  ).replace(/\/$/, '')

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 1024,
      temperature: 0.4,
      messages: [
        { role: 'system', content: options.system },
        ...options.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Groq request failed (${response.status}): ${body}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return data.choices?.[0]?.message?.content ?? ''
}

/**
 * Ordered provider list for the current request, including optional fallback.
 * @param preferred - primary provider when set
 */
function providerChain(preferred: LlmProvider | null): LlmProvider[] {
  if (!preferred) return []

  const allowFallback =
    (process.env.LLM_FALLBACK || 'true').toLowerCase() !== 'false'

  if (!allowFallback) return [preferred]

  const other: LlmProvider = preferred === 'anthropic' ? 'groq' : 'anthropic'
  const chain: LlmProvider[] = [preferred]
  if (other === 'anthropic' && hasAnthropic) chain.push('anthropic')
  if (other === 'groq' && hasGroq) chain.push('groq')
  return chain
}

/**
 * Runs the Prism completion against Anthropic and/or Groq.
 * Tries the active provider first, then the other when LLM_FALLBACK is not false.
 * @param options - system prompt and messages
 * @returns model text and which provider served it
 */
export async function completeChat(options: CompleteOptions): Promise<{
  text: string
  provider: LlmProvider
}> {
  const preferred = resolveProvider()
  if (!preferred) {
    throw new Error(
      'No LLM configured. Set ANTHROPIC_API_KEY and/or GROQ_API_KEY',
    )
  }

  const chain = providerChain(preferred)
  let lastError: unknown

  for (let i = 0; i < chain.length; i += 1) {
    const provider = chain[i]
    const isLast = i === chain.length - 1
    try {
      logger.info(`Calling LLM provider: ${provider}`)
      const text =
        provider === 'anthropic'
          ? await completeAnthropic(options)
          : await completeGroq(options)
      if (provider !== preferred) {
        logger.warn('Primary LLM failed, used fallback', {
          preferred,
          provider,
        })
      }
      return { text, provider }
    } catch (error) {
      lastError = error
      logger.error(`LLM provider failed: ${provider}`, error)
      if (!isLast) {
        logger.warn(`Rotating to fallback LLM: ${chain[i + 1]}`)
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('All LLM providers failed')
}
