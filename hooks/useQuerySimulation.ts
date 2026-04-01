'use client'
import { useEffect, useRef } from 'react'
import { useSimulationStore } from '../store/simulationStore'
import { runVulnerable, runSafe } from '../lib/engine/queryEngine'
import { classifyAttack } from '../lib/engine/attackClassifier'

export function useQuerySimulation() {
  const { scenario, username, password, setResults, setLoading } = useSimulationStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!username && !password) return

    // Clear any pending timer
    if (timerRef.current) clearTimeout(timerRef.current)

    const attack = classifyAttack(username)
    const safeRes = runSafe(scenario, username, password)
    const vulnRes = runVulnerable(scenario, username, password)

    if (scenario === 'time-based' && attack !== 'none') {
      setLoading(true)
      // Show partial (loading) result immediately
      setResults(
        { ...vulnRes, rows: [], rowCount: 0, breached: false } as never,
        safeRes as never,
        attack,
        false
      )
      timerRef.current = setTimeout(() => {
        setResults(vulnRes as never, safeRes as never, attack, vulnRes.breached)
        setLoading(false)
      }, 2500)
    } else {
      setResults(vulnRes as never, safeRes as never, attack, vulnRes.breached)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [username, password, scenario])
}
