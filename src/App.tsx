import { useEffect } from 'react'
import { CornerInstrument } from './components/layout/CornerInstrument'
import { IntroStrip } from './components/console/IntroStrip'
import { ConversationPane } from './components/console/ConversationPane'
import { NamespacePanel } from './components/console/NamespacePanel'
import { LightSplit } from './components/console/LightSplit'
import { PromptPanel } from './components/console/PromptPanel'
import { FooterStrip } from './components/console/FooterStrip'
import { GrainOverlay } from './components/ui/GrainOverlay'
import { fetchHealth, fetchPrompt } from './lib/api'
import { PRISM_SYSTEM_PROMPT } from './lib/prismPrompt'
import { useConsoleStore } from './store/useConsoleStore'

/**
 * Prism single-page live console.
 */
function App() {
  const blobCount = useConsoleStore((s) => s.blobCount)
  const namespacePulse = useConsoleStore((s) => s.namespacePulse)
  const lightSplit = useConsoleStore((s) => s.lightSplit)
  const promptOpen = useConsoleStore((s) => s.promptOpen)
  const promptText = useConsoleStore((s) => s.promptText)
  const agentAddress = useConsoleStore((s) => s.agentAddress)
  const setPromptOpen = useConsoleStore((s) => s.setPromptOpen)
  const setPromptText = useConsoleStore((s) => s.setPromptText)
  const setAgentAddress = useConsoleStore((s) => s.setAgentAddress)

  useEffect(() => {
    let cancelled = false
    // Bundled copy so the submission text is available even before the API responds
    setPromptText(PRISM_SYSTEM_PROMPT)

    /**
     * Load public prompt text and agent address on boot.
     */
    async function boot() {
      try {
        const [prompt, health] = await Promise.all([
          fetchPrompt(),
          fetchHealth(),
        ])
        if (cancelled) return
        setPromptText(prompt)
        setAgentAddress(health.agentAddress)
      } catch {
        // Server may not be up yet during pure frontend preview
      }
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [setAgentAddress, setPromptText])

  return (
    <div className="relative min-h-[100dvh]">
      <div className="spectral-glow" aria-hidden />
      <GrainOverlay />

      <CornerInstrument
        blobCount={blobCount}
        namespacePulse={namespacePulse}
      />

      <LightSplit
        active={Boolean(lightSplit)}
        targetColour={lightSplit?.colour ?? 'var(--accent)'}
        targetX={lightSplit?.targetX ?? 0}
        targetY={lightSplit?.targetY ?? 0}
      />

      <main>
        <IntroStrip blobCount={blobCount} />

        <section className="w-full px-8 pb-24">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.1fr]">
            <ConversationPane />
            <NamespacePanel />
          </div>
        </section>

        <PromptPanel
          open={promptOpen}
          onToggle={() => setPromptOpen(!promptOpen)}
          promptText={promptText}
        />
      </main>

      <FooterStrip agentAddress={agentAddress} />
    </div>
  )
}

export default App
