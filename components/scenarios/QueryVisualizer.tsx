'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulationStore } from '../../store/simulationStore'
import { tokenize } from '../../lib/engine/tokenizer'

const TOKEN_COLORS: Record<string, string> = {
  keyword:  '#2563eb',
  string:   '#d97706',
  injected: '#dc2626',
  comment:  '#94a3b8',
  normal:   '#0f172a',
}

export default function QueryVisualizer() {
  const { vulnResult, safeResult, username } = useSimulationStore()

  const vulnQuery = vulnResult?.queryStr  ?? `SELECT * FROM users WHERE username = '...' AND password = '...'`
  const safeQuery = safeResult?.queryStr  ?? `SELECT * FROM users WHERE username = ? AND password = ?`
  const injected  = vulnResult?.injectedPart ?? ''

  const vulnTokens = tokenize(vulnQuery, injected)
  const safeTokens = tokenize(safeQuery, '')

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: injected ? 'var(--danger)' : 'var(--text-muted)',
          transition: 'background 0.3s',
        }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          Query Visualizer
        </span>
        {injected && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 11, fontWeight: 600, padding: '2px 8px',
            borderRadius: 99, background: 'var(--danger-light)', color: 'var(--danger)',
          }}>
            Injection Active
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Vulnerable */}
        <div style={{
          padding: '20px',
          borderRight: '1px solid var(--border)',
          borderTop: `2px solid ${injected ? 'var(--danger)' : 'transparent'}`,
          background: injected ? 'rgba(220,38,38,0.015)' : 'transparent',
          transition: 'all 0.3s',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--danger)', marginBottom: 12 }}>
            ❌ Vulnerable Query
          </p>
          <pre style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            margin: 0,
          }}>
            {vulnTokens.map((tok, i) => (
              <motion.span
                key={`${i}-${tok.text}`}
                style={{
                  color: TOKEN_COLORS[tok.type] ?? '#0f172a',
                  background: tok.type === 'injected' ? 'rgba(220,38,38,0.1)' : 'transparent',
                  borderRadius: tok.type === 'injected' ? 3 : 0,
                  padding: tok.type === 'injected' ? '0 3px' : '0',
                  fontWeight: (tok.type === 'keyword' || tok.type === 'injected') ? 600 : 400,
                }}
                animate={tok.type === 'injected' ? {
                  opacity: [1, 0.7, 1],
                } : {}}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              >
                {tok.text}
              </motion.span>
            ))}
          </pre>
        </div>

        {/* Safe */}
        <div style={{
          padding: '20px',
          borderTop: '2px solid var(--success)',
          background: 'rgba(22,163,74,0.015)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--success)', marginBottom: 12 }}>
            ✅ Parameterized Query
          </p>
          <pre style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            margin: 0,
          }}>
            {safeTokens.map((tok, i) => (
              <span
                key={i}
                style={{
                  color: TOKEN_COLORS[tok.type] ?? '#0f172a',
                  fontWeight: tok.type === 'keyword' ? 600 : 400,
                }}
              >
                {tok.text}
              </span>
            ))}
          </pre>
        </div>
      </div>
    </div>
  )
}
