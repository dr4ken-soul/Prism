import { create } from 'zustand'
import type {
  BlobRecord,
  LightSplitTarget,
  Message,
  Namespace,
  NamespacePulse,
} from '../types'

/**
 * Global console state for chat, namespace feed, and proof cluster.
 */
interface ConsoleState {
  messages: Message[]
  facts: BlobRecord[]
  beliefs: BlobRecord[]
  questions: BlobRecord[]
  blobCount: number
  isSending: boolean
  error: string | null
  promptOpen: boolean
  promptText: string
  agentAddress: string
  namespacePulse: NamespacePulse
  lightSplit: LightSplitTarget | null
  addMessage: (message: Message) => void
  setSending: (value: boolean) => void
  setError: (error: string | null) => void
  setPromptOpen: (open: boolean) => void
  setPromptText: (text: string) => void
  setAgentAddress: (address: string) => void
  hydrateNamespaces: (payload: {
    facts: BlobRecord[]
    beliefs: BlobRecord[]
    questions: BlobRecord[]
    total: number
  }) => void
  appendBlobs: (blobs: BlobRecord[]) => void
  pulseNamespace: (namespace: Namespace) => void
  setLightSplit: (target: LightSplitTarget | null) => void
}

/**
 * Zustand store for the Prism live console.
 */
export const useConsoleStore = create<ConsoleState>((set) => ({
  messages: [],
  facts: [],
  beliefs: [],
  questions: [],
  blobCount: 0,
  isSending: false,
  error: null,
  promptOpen: false,
  promptText: '',
  agentAddress: '',
  namespacePulse: { facts: false, beliefs: false, questions: false },
  lightSplit: null,

  /**
   * Append a chat message.
   */
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  /**
   * Toggle the sending lock on the input.
   */
  setSending: (value) => set({ isSending: value }),

  /**
   * Set or clear the last error string.
   */
  setError: (error) => set({ error }),

  /**
   * Expand or collapse the prompt panel.
   */
  setPromptOpen: (open) => set({ promptOpen: open }),

  /**
   * Store the public Prism prompt text.
   */
  setPromptText: (text) => set({ promptText: text }),

  /**
   * Store the agent Sui address for the footer.
   */
  setAgentAddress: (address) => set({ agentAddress: address }),

  /**
   * Replace namespace columns from the server session feed.
   */
  hydrateNamespaces: (payload) =>
    set({
      facts: payload.facts,
      beliefs: payload.beliefs,
      questions: payload.questions,
      blobCount: payload.total,
    }),

  /**
   * Append newly confirmed blobs to the matching columns.
   */
  appendBlobs: (blobs) =>
    set((state) => {
      const next = {
        facts: [...state.facts],
        beliefs: [...state.beliefs],
        questions: [...state.questions],
      }
      for (const blob of blobs) {
        const list = next[blob.namespace]
        if (!list.some((b) => b.blobId === blob.blobId)) {
          list.push(blob)
        }
      }
      const total =
        next.facts.length + next.beliefs.length + next.questions.length
      return { ...next, blobCount: total }
    }),

  /**
   * Briefly pulse a corner instrument dot for a namespace write.
   */
  pulseNamespace: (namespace) => {
    set((state) => ({
      namespacePulse: { ...state.namespacePulse, [namespace]: true },
    }))
    window.setTimeout(() => {
      set((state) => ({
        namespacePulse: { ...state.namespacePulse, [namespace]: false },
      }))
    }, 600)
  },

  /**
   * Set the active light-split animation target.
   */
  setLightSplit: (target) => set({ lightSplit: target }),
}))
