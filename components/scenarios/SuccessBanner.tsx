'use client'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../../store/simulationStore'

export default function SuccessBanner() {
  const { breached, scenario } = useSimulationStore()

  if (!breached) return null

  const scenarioLabels: Record<string, string> = {
    classic:    'Authentication Bypass',
    blind:      'Boolean Inference Attack',
    'time-based': 'Timing Oracle Attack',
    'error-based': 'Schema Extraction',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        border: '1px solid rgba(220,38,38,0.25)',
        borderLeft: '4px solid var(--danger)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div style={{
        width: 40, height: 40,
        background: 'var(--danger-light)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>
        ⚠️
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)', marginBottom: 2 }}>
          Breach Simulated — {scenarioLabels[scenario] ?? 'SQL Injection'}
        </p>
        <p style={{ fontSize: 13, color: '#b91c1c', lineHeight: 1.5 }}>
          The vulnerable query was exploited. In a real system, this would expose all database records to the attacker. The parameterized query on the right remains completely secure.
        </p>
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, fontWeight: 700,
        color: 'var(--danger)', letterSpacing: '0.5px',
        background: 'var(--danger-light)',
        padding: '4px 10px', borderRadius: 99,
        border: '1px solid rgba(220,38,38,0.2)',
        whiteSpace: 'nowrap',
      }}>
        VULNERABLE
      </div>
    </motion.div>
  )
}
