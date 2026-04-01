'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import Sidebar from '../../../components/layout/Sidebar'
import InputPanel from '../../../components/scenarios/InputPanel'
import QueryVisualizer from '../../../components/scenarios/QueryVisualizer'
import ResultPanel from '../../../components/scenarios/ResultPanel'
import ExplanationPanel from '../../../components/scenarios/ExplanationPanel'
import SuccessBanner from '../../../components/scenarios/SuccessBanner'
import { useSimulationStore } from '../../../store/simulationStore'
import { useQuerySimulation } from '../../../hooks/useQuerySimulation'
import { ScenarioType } from '../../../lib/engine/queryEngine'

const VALID_SCENARIOS: ScenarioType[] = ['classic', 'blind', 'time-based', 'error-based']

export default function ScenarioPage() {
  const params = useParams()
  const type = params?.type as string
  const { setScenario, breached } = useSimulationStore()

  useQuerySimulation()

  useEffect(() => {
    if (VALID_SCENARIOS.includes(type as ScenarioType)) {
      setScenario(type as ScenarioType)
    }
  }, [type])

  if (!VALID_SCENARIOS.includes(type as ScenarioType)) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, color: 'var(--danger)' }}>Unknown Scenario</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>
            Valid scenarios: classic, blind, time-based, error-based
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
        <Sidebar scenario={type} currentStep={breached ? 4 : 0} />
        <main style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
          <AnimatePresence>
            {breached && <SuccessBanner key="banner" />}
          </AnimatePresence>
          <InputPanel />
          <QueryVisualizer />
          <ResultPanel />
          <ExplanationPanel />
        </main>
      </div>
    </>
  )
}
