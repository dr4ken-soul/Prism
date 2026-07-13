import { useEffect, useState } from 'react'
import { fetchNamespaces } from '../lib/api'
import { useConsoleStore } from '../store/useConsoleStore'

/**
 * Loads the session namespace feed on mount and tracks initial load state.
 * @returns whether the first hydrate is still in progress
 */
export function useNamespaceFeed(): { loading: boolean } {
  const hydrateNamespaces = useConsoleStore((s) => s.hydrateNamespaces)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    /**
     * Pull session state from the backend once on mount.
     */
    async function load() {
      try {
        const data = await fetchNamespaces()
        if (!cancelled) {
          hydrateNamespaces(data)
        }
      } catch {
        // Empty panel is an honest start state if the server is not up yet
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [hydrateNamespaces])

  return { loading }
}
