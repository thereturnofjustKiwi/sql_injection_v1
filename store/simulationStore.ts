'use client'
import { create } from 'zustand'
import { ScenarioType } from '../lib/engine/queryEngine'
import { AttackType } from '../lib/engine/attackClassifier'

type SimulationResult = {
  rows: Record<string, unknown>[]
  queryStr: string
  injectedPart: string
  breached: boolean
  rowCount: number
  // blind-specific
  userExists?: boolean
  booleanResult?: boolean
  // time-based
  delayMs?: number
  // error-based
  errorMessage?: string | null
}

type SimulationState = {
  scenario: ScenarioType
  username: string
  password: string
  vulnResult: SimulationResult | null
  safeResult: SimulationResult | null
  attackType: AttackType
  breached: boolean
  isLoading: boolean

  setScenario: (s: ScenarioType) => void
  setUsername: (v: string) => void
  setPassword: (v: string) => void
  setResults: (
    vuln: SimulationResult,
    safe: SimulationResult,
    attack: AttackType,
    breached: boolean
  ) => void
  setLoading: (v: boolean) => void
  reset: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  scenario: 'classic',
  username: '',
  password: '',
  vulnResult: null,
  safeResult: null,
  attackType: 'none',
  breached: false,
  isLoading: false,

  setScenario: (scenario) =>
    set({ scenario, vulnResult: null, safeResult: null, breached: false, attackType: 'none', username: '', password: '' }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
  setResults: (vulnResult, safeResult, attackType, breached) =>
    set({ vulnResult, safeResult, attackType, breached }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({ username: '', password: '', vulnResult: null, safeResult: null, breached: false, attackType: 'none' }),
}))
