# Prism — Frontend Specification

All design decisions are locked. Do not deviate from any value here without explicit instruction.

---

## Design Gates (Confirmed)

| Gate | Decision |
|---|---|
| 1. Name | Prism |
| 2. Aesthetic | Spectral Editorial, dark editorial base with a functional colour language tied to the three namespaces |
| 3. Navigation | Corner Instrument, no bar. Wordmark top-left, live proof cluster top-right, action pill floats near the prompt panel |
| 4. Background | Static atmospheric, grain plus a slow radial glow cycling through facts, beliefs, questions hues |
| 5. Typography | Instrument Serif + Figtree + IBM Plex Mono |
| 6. Colour palette | Spectral Editorial, see below |
| 7. Structure | Single page console: corner instrument, intro strip, workbench, prompt panel, footer strip |

---

## Colour System

```css
:root {
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
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-xl: 24px;
}
```

Never hardcode a hex value in a component. Reference the variable.

---

## Typography

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Figtree:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

```css
.font-display { font-family: 'Instrument Serif', Georgia, serif; }
.font-body    { font-family: 'Figtree', system-ui, sans-serif; }
.font-mono    { font-family: 'IBM Plex Mono', 'Courier New', monospace; }
```

```typescript
// tailwind.config.ts
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Instrument Serif', 'Georgia', 'serif'],
        body:    ['Figtree', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'Courier New', 'monospace'],
      },
    },
  },
}
```

---

## Liquid Glass Classes

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-default);
  position: relative;
}

.liquid-glass-strong {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid var(--border-default);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.10);
}
```

Apply `backdrop-filter` only to fixed elements, the corner instrument and the action pill. Never inside the scrolling namespace columns.

---

## Background

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
  opacity: 0.035;
}

@keyframes spectralCycle {
  0%, 100% { background: radial-gradient(circle at 50% 20%, var(--facts-glow), transparent 60%); }
  33%      { background: radial-gradient(circle at 50% 20%, var(--beliefs-glow), transparent 60%); }
  66%      { background: radial-gradient(circle at 50% 20%, var(--questions-glow), transparent 60%); }
}

.spectral-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  animation: spectralCycle 24s ease-in-out infinite;
}
```

No video. This is a working tool, not a launch page.

---

## Corner Instrument (replaces the nav bar entirely)

```tsx
/**
 * The entire navigation surface for Prism. No bar, no container spanning
 * the width. Two independent elements anchored to opposite corners.
 */
export function CornerInstrument({ blobCount, namespacePulse }: {
  blobCount: number
  namespacePulse: { facts: boolean; beliefs: boolean; questions: boolean }
}) {
  return (
    <>
      <div className="fixed top-6 left-8 z-50">
        <span className="font-display italic text-xl text-[var(--text-primary)] tracking-tight">
          Prism
        </span>
      </div>

      <div className="fixed top-6 right-8 z-50 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <InstrumentDot colour="var(--facts)" pulsing={namespacePulse.facts} />
          <InstrumentDot colour="var(--beliefs)" pulsing={namespacePulse.beliefs} />
          <InstrumentDot colour="var(--questions)" pulsing={namespacePulse.questions} />
        </div>
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {blobCount} blobs on mainnet
        </span>
      </div>
    </>
  )
}
```

**Proximity dot with cursor-reactive glow:**

```tsx
import { motion, useMotionValue, useTransform } from 'motion/react'

/**
 * A single namespace dot in the corner instrument. Glows brighter as the
 * cursor nears it, and pulses when a new blob writes to its namespace.
 */
function InstrumentDot({ colour, pulsing }: { colour: string; pulsing: boolean }) {
  const proximity = useMotionValue(0)
  const glow = useTransform(proximity, [0, 1], [0.3, 1])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    const dist = Math.sqrt(dx * dx + dy * dy)
    proximity.set(Math.max(0, 1 - dist / 120))
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => proximity.set(0)}
      animate={pulsing ? { scale: [1, 1.6, 1] } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ opacity: glow }}
      className="w-2 h-2 rounded-full"
    >
      <div className="w-full h-full rounded-full" style={{ backgroundColor: colour }} />
    </motion.div>
  )
}
```

---

## Intro Strip

```tsx
/**
 * One-line pitch plus a restated proof cluster, sits directly below the
 * corner instrument with generous top padding so nothing feels cramped
 * against the fixed corners.
 */
export function IntroStrip({ blobCount }: { blobCount: number }) {
  return (
    <section className="pt-32 pb-16 px-8 max-w-4xl mx-auto text-center">
      <motion.p
        initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="font-display italic text-3xl md:text-4xl text-[var(--text-primary)] leading-snug"
      >
        Facts, beliefs and questions, kept apart on purpose.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="font-mono text-xs text-[var(--text-secondary)] mt-4"
      >
        {blobCount} blobs written this session, live on Walrus Mainnet
      </motion.p>
    </section>
  )
}
```

---

## Workbench (split layout)

```tsx
<section className="w-full px-8 pb-24">
  <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-6">
    <ConversationPane />
    <NamespacePanel />
  </div>
</section>
```

### Conversation pane

Liquid glass container, message list, input with a cursor-tracking focus glow.

```tsx
/**
 * Text input for the conversation pane. Border glow tracks the cursor
 * position while focused instead of a flat focus ring.
 */
function ConsoleInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)

  return (
    <div
      className="liquid-glass rounded-[var(--radius-lg)] p-1 transition-shadow duration-300"
      style={focused ? { boxShadow: '0 0 0 1px var(--accent-glow), 0 0 24px var(--accent-glow)' } : {}}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) { onSend(value); setValue('') } }}
        placeholder="Tell it something"
        className="w-full bg-transparent px-4 py-3 text-[var(--text-primary)] font-body placeholder:text-[var(--text-muted)] outline-none"
      />
    </div>
  )
}
```

### Namespace panel

Three columns, `border-t` and `divide-y` inside each column rather than boxing every card, per the dashboard hardening rule. The column header carries the namespace colour, the cards stay near-neutral so the colour reads as classification, not decoration.

```tsx
function NamespaceColumn({ label, colour, glow, items }: {
  label: string; colour: string; glow: string; items: BlobRecord[]
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 pb-3">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colour }} />
        <span className="font-mono text-xs uppercase tracking-widest" style={{ color: colour }}>
          {label}
        </span>
      </div>
      <div className="border-t border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
        {items.length === 0 ? (
          <p className="py-6 text-sm text-[var(--text-muted)] font-body">Nothing here yet</p>
        ) : items.map((item) => (
          <NamespaceCard key={item.blobId} item={item} colour={colour} glow={glow} />
        ))}
      </div>
    </div>
  )
}
```

**Namespace card with tinted hover shadow:**

```tsx
/**
 * A single memory card. Hover shadow tints to the namespace colour
 * rather than a generic dark drop shadow.
 */
function NamespaceCard({ item, colour, glow }: { item: BlobRecord; colour: string; glow: string }) {
  return (
    <motion.a
      href={`https://walruscan.com/blob/${item.blobId}`}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="block py-3 px-1 transition-shadow duration-200"
      style={{ '--hover-shadow': glow } as React.CSSProperties}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 8px 24px ${glow}`)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <p className="text-sm text-[var(--text-primary)] font-body leading-snug">{item.text}</p>
      <p className="font-mono text-[10px] text-[var(--text-muted)] mt-1">{item.blobId.slice(0, 12)}...</p>
    </motion.a>
  )
}
```

---

## The Light Split (signature interaction)

When a new blob confirms, a single dot travels from the corner instrument's blob counter down to the correct namespace column before the card appears. This is the one interaction a judge should remember.

```tsx
import { motion, AnimatePresence } from 'motion/react'

/**
 * Animates a single point of light travelling from the corner counter
 * to the target namespace column when a blob confirms.
 */
export function LightSplit({ active, targetColour, targetX, targetY }: {
  active: boolean; targetColour: string; targetX: number; targetY: number
}) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ top: 24, right: 96, opacity: 1, scale: 1, backgroundColor: 'var(--accent)' }}
          animate={{ top: targetY, left: targetX, right: 'auto', backgroundColor: targetColour, scale: 1.4 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="fixed w-2 h-2 rounded-full z-40 pointer-events-none"
        />
      )}
    </AnimatePresence>
  )
}
```

Trigger this once per confirmed blob, target coordinates measured from the destination column's bounding rect at the moment the write resolves.

---

## Prompt Panel

Spring physics expand, not linear easing.

```tsx
function PromptPanel({ open, onToggle, promptText }: { open: boolean; onToggle: () => void; promptText: string }) {
  return (
    <section className="max-w-4xl mx-auto px-8 pb-24">
      <button
        onClick={onToggle}
        className="liquid-glass rounded-full px-5 py-2.5 text-sm font-body text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
      >
        {open ? 'Hide the prompt' : 'View the prompt'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            className="overflow-hidden"
          >
            <pre className="liquid-glass-strong rounded-[var(--radius-lg)] p-6 mt-4 font-mono text-xs text-[var(--text-secondary)] whitespace-pre-wrap">
              {promptText}
            </pre>
            <CopyPromptButton text={promptText} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
```

**Magnetic copy button:**

```tsx
import { Magnet } from '@/components/ui/Magnet'
import { Copy, Check } from 'lucide-react'

function CopyPromptButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Magnet padding={60} strength={4}>
      <button
        onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) }}
        className="liquid-glass-strong rounded-full px-5 py-2.5 mt-3 flex items-center gap-2 text-sm font-body text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors group"
      >
        <span>{copied ? 'Copied' : 'Copy prompt'}</span>
        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform duration-200">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </span>
      </button>
    </Magnet>
  )
}
```

---

## Footer Strip

```tsx
<footer className="border-t border-[var(--border-subtle)] px-8 py-8">
  <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[var(--text-muted)]">
    <span>Agent: {agentAddress.slice(0, 10)}...</span>
    <div className="flex items-center gap-6">
      <a href="https://github.com/MystenLabs/MemWal" className="hover:text-[var(--text-secondary)] transition-colors">Feedback</a>
      <a href="https://discord.com/invite/walrusprotocol" className="hover:text-[var(--text-secondary)] transition-colors">Discord</a>
      <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">X</a>
    </div>
  </div>
</footer>
```

---

## Component Rules

- CSS class-based hover states only, no inline JS onMouseEnter setting style unless a dynamic tint value requires it, as in the namespace card above
- `min-h-[100dvh]` never `h-screen`, though this page does not need a full-height hero
- CSS Grid for the workbench split, never flex percentage math
- Tinted shadows matched to namespace hue, never a generic dark drop shadow
- No pure black or pure white anywhere
- No gradient text on headings
- Spring physics on every interactive expand or collapse
- Skeleton shimmer for the namespace panel while the initial session state loads, never a spinner

---

## Responsive Behaviour

Below `lg`, the workbench stacks: conversation pane first, namespace panel below it as three columns still side by side but narrower, never collapsing to a single stacked column since comparing the three is the point. The corner instrument stays fixed at both corners at every breakpoint, shrinking the blob count label to just the number below 400px width.
