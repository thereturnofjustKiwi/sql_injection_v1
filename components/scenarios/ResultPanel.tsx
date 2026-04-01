'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulationStore } from '../../store/simulationStore'

function DataTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length) return (
    <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
      No rows returned
    </p>
  )
  const cols = Object.keys(rows[0])
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {cols.map(c => (
              <th key={c} style={{
                textAlign: 'left', padding: '6px 10px',
                fontWeight: 600, color: 'var(--text-secondary)',
                textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.5px',
              }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}>
              {cols.map(c => (
                <td key={c} style={{
                  padding: '6px 10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11.5,
                  color: 'var(--text-primary)',
                }}>
                  {String(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TimeProgress({ isLoading }: { isLoading: boolean }) {
  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }}
        />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Executing... WAITFOR DELAY active
        </span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: 'var(--accent)', borderRadius: 99 }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.5, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

export default function ResultPanel() {
  const { vulnResult, safeResult, breached, isLoading, scenario } = useSimulationStore()

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 0,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      {/* Vulnerable side */}
      <motion.div
        animate={breached ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : {}}
        transition={{ duration: 0.5 }}
        style={{
          padding: '20px',
          borderRight: '1px solid var(--border)',
          borderTop: `3px solid ${breached ? 'var(--danger)' : 'var(--border)'}`,
          background: breached ? 'rgba(220,38,38,0.02)' : 'transparent',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--danger)', marginBottom: 4 }}>
          ❌ Vulnerable
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          String concatenation — no sanitization
        </p>

        {isLoading && scenario === 'time-based' ? (
          <TimeProgress isLoading={isLoading} />
        ) : vulnResult ? (
          <>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 99, marginBottom: 12,
              background: vulnResult.breached ? 'var(--danger-light)' : 'var(--bg-subtle)',
              border: `1px solid ${vulnResult.breached ? 'rgba(220,38,38,0.2)' : 'var(--border)'}`,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: vulnResult.breached ? 'var(--danger)' : 'var(--text-secondary)' }}>
                {vulnResult.breached ? `⚠ ${vulnResult.rowCount} row(s) leaked` : `${vulnResult.rowCount} row(s) returned`}
              </span>
            </div>

            {/* Error-based error message */}
            {'errorMessage' in vulnResult && vulnResult.errorMessage ? (
              <div style={{
                padding: '12px', background: '#fff1f2',
                border: '1px solid #fecdd3', borderRadius: 8,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5,
                color: '#991b1b', lineHeight: 1.6, wordBreak: 'break-all',
              }}>
                {vulnResult.errorMessage as string}
              </div>
            ) : /* Blind boolean result */ 'booleanResult' in vulnResult ? (
              <div style={{
                padding: '16px', textAlign: 'center',
                background: (vulnResult.booleanResult as boolean) ? 'rgba(22,163,74,0.05)' : 'rgba(220,38,38,0.05)',
                border: `1px solid ${(vulnResult.booleanResult as boolean) ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>
                  {(vulnResult.userExists as boolean) ? '✓' : '✗'}
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: (vulnResult.userExists as boolean) ? 'var(--success)' : 'var(--danger)' }}>
                  {(vulnResult.userExists as boolean) ? 'User exists — condition TRUE' : 'User not found — condition FALSE'}
                </p>
              </div>
            ) : (
              <DataTable rows={vulnResult.rows as Record<string, unknown>[]} />
            )}
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Type in the form above to simulate a query…
          </p>
        )}
      </motion.div>

      {/* Safe side */}
      <div style={{
        padding: '20px',
        borderTop: '3px solid var(--success)',
        background: 'rgba(22,163,74,0.015)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--success)', marginBottom: 4 }}>
          ✅ Safe
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          Parameterized query — input is data only
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 99, marginBottom: 12,
          background: 'var(--success-light)',
          border: '1px solid rgba(22,163,74,0.2)',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>
            0 rows returned — Login failed
          </span>
        </div>

        <div style={{
          padding: '16px', background: 'var(--success-light)',
          border: '1px solid rgba(22,163,74,0.2)',
          borderRadius: 8, textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🔒</div>
          <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, marginBottom: 4 }}>
            Injection neutralized
          </p>
          <p style={{ fontSize: 12, color: '#166534' }}>
            Input treated as literal data — no SQL logic executed
          </p>
        </div>
      </div>
    </div>
  )
}
