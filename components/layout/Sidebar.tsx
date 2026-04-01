'use client'
import { scenarioMeta } from '../../lib/content/scenarioMeta'

type Props = {
  scenario: string
  currentStep?: number
}

export default function Sidebar({ scenario, currentStep = 0 }: Props) {
  const meta = scenarioMeta.find(s => s.slug === scenario)
  if (!meta) return null

  const diffColor =
    meta.difficulty === 'Beginner'     ? '#1d4ed8' :
    meta.difficulty === 'Intermediate' ? '#92400e' : '#991b1b'
  const diffBg =
    meta.difficulty === 'Beginner'     ? '#dbeafe' :
    meta.difficulty === 'Intermediate' ? '#fef3c7' : '#fee2e2'

  return (
    <aside style={{
      width: 264,
      minHeight: '100%',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      flexShrink: 0,
    }}>
      {/* Scenario info */}
      <div>
        <div style={{ fontSize: 22, marginBottom: 8 }}>{meta.icon}</div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {meta.title}
        </h2>
        <span style={{
          display: 'inline-block',
          fontSize: 11,
          fontWeight: 600,
          padding: '2px 9px',
          borderRadius: 99,
          background: diffBg,
          color: diffColor,
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
        }}>
          {meta.difficulty}
        </span>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {meta.description}
        </p>
      </div>

      {/* Steps */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>
          Attack Steps
        </p>
        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {meta.steps.map((step, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                opacity: i <= currentStep ? 1 : 0.45,
                transition: 'opacity 0.3s',
              }}
            >
              <span style={{
                width: 20, height: 20,
                borderRadius: '50%',
                background: i < currentStep ? 'var(--success)' : i === currentStep ? 'var(--accent)' : 'var(--border)',
                color: i <= currentStep ? '#fff' : 'var(--text-muted)',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                marginTop: 1,
                transition: 'background 0.3s',
              }}>
                {i < currentStep ? '✓' : i + 1}
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Quick payloads */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
          Test Payloads
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {scenarioMeta.find(s => s.slug === scenario) && [
            scenario === 'classic'    ? `' OR '1'='1` :
            scenario === 'blind'      ? `admin' AND 1=1--` :
            scenario === 'time-based' ? `'; WAITFOR DELAY '0:0:3'--` :
                                        `' AND 1=CONVERT(int, @@version)--`,
            scenario === 'classic'    ? `admin'--` :
            scenario === 'blind'      ? `admin' AND 1=2--` :
            scenario === 'time-based' ? `'; SLEEP(3)--` :
                                        `' AND 1=CONVERT(int, (SELECT table_name FROM information_schema.tables))--`,
          ].map((payload, i) => (
            <code
              key={i}
              style={{
                display: 'block',
                fontSize: 11,
                padding: '6px 10px',
                background: '#f1f5f9',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--danger)',
                fontFamily: 'JetBrains Mono, monospace',
                wordBreak: 'break-all',
                lineHeight: 1.5,
              }}
            >
              {payload}
            </code>
          ))}
        </div>
      </div>
    </aside>
  )
}
