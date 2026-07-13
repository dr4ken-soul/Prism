import type { BlobRecord, Namespace } from '../../types'
import { useConsoleStore } from '../../store/useConsoleStore'
import { useNamespaceFeed } from '../../hooks/useNamespaceFeed'
import { FadeIn } from '../ui/FadeIn'
import { NamespaceCard } from './NamespaceCard'

/**
 * One colour-coded namespace column with divider-based cards.
 * @param label - column title
 * @param namespace - namespace key for measurement hooks
 * @param colour - CSS colour token
 * @param glow - CSS glow token
 * @param items - confirmed blobs
 * @param loading - show skeleton while hydrating
 */
function NamespaceColumn({
  label,
  namespace,
  colour,
  glow,
  items,
  loading,
}: {
  label: string
  namespace: Namespace
  colour: string
  glow: string
  items: BlobRecord[]
  loading: boolean
}) {
  return (
    <div className="min-w-0 flex-1" data-namespace={namespace}>
      <div className="flex items-center gap-2 pb-3">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: colour }}
        />
        <span
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: colour }}
        >
          {label}
        </span>
      </div>
      <div className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
        {loading ? (
          <div className="space-y-2 py-4">
            <div className="skeleton-shimmer h-10 rounded-[var(--radius-sm)]" />
            <div className="skeleton-shimmer h-10 rounded-[var(--radius-sm)]" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 font-body text-sm text-[var(--text-muted)]">
            Nothing here yet
          </p>
        ) : (
          items.map((item) => (
            <NamespaceCard
              key={item.blobId}
              item={item}
              colour={colour}
              glow={glow}
            />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Right workbench pane: three live namespace columns.
 */
export function NamespacePanel() {
  const facts = useConsoleStore((s) => s.facts)
  const beliefs = useConsoleStore((s) => s.beliefs)
  const questions = useConsoleStore((s) => s.questions)
  const { loading } = useNamespaceFeed()

  return (
    <FadeIn delay={0.25} className="min-w-0">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
        <div className="mb-4 border-b border-[var(--border-subtle)] pb-3">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)]">
            Namespaces
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto">
          <NamespaceColumn
            label="facts"
            namespace="facts"
            colour="var(--facts)"
            glow="var(--facts-glow)"
            items={facts}
            loading={loading}
          />
          <NamespaceColumn
            label="beliefs"
            namespace="beliefs"
            colour="var(--beliefs)"
            glow="var(--beliefs-glow)"
            items={beliefs}
            loading={loading}
          />
          <NamespaceColumn
            label="questions"
            namespace="questions"
            colour="var(--questions)"
            glow="var(--questions-glow)"
            items={questions}
            loading={loading}
          />
        </div>
      </div>
    </FadeIn>
  )
}
