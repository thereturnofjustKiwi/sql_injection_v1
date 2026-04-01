'use client'
import { useSimulationStore } from '../../store/simulationStore'

export default function InputPanel() {
  const { username, password, breached, isLoading, reset, setUsername, setPassword } = useSimulationStore()

  const borderColor = breached ? 'var(--danger)' : 'var(--border-strong)'
  const borderShadow = breached ? '0 0 0 3px rgba(220,38,38,0.12)' : 'none'

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            Login Form
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Simulate a vulnerable user authentication endpoint
          </p>
        </div>
        <button
          onClick={reset}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid var(--border-strong)',
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
        >
          ↺ Reset
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.2px' }}>
            Username
          </span>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="e.g. admin"
            disabled={isLoading}
            style={{
              padding: '10px 12px',
              border: `1.5px solid ${breached ? 'var(--danger)' : 'var(--border-strong)'}`,
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              background: breached ? 'rgba(220,38,38,0.03)' : 'var(--bg-surface)',
              color: 'var(--text-primary)',
              boxShadow: breached ? '0 0 0 3px rgba(220,38,38,0.1)' : 'none',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              opacity: isLoading ? 0.6 : 1,
            }}
          />
        </label>

        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.2px' }}>
            Password
          </span>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="e.g. secret"
            type="password"
            disabled={isLoading}
            style={{
              padding: '10px 12px',
              border: '1.5px solid var(--border-strong)',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s',
              opacity: isLoading ? 0.6 : 1,
            }}
          />
        </label>
      </div>

      {breached && (
        <div style={{
          marginTop: 12,
          padding: '8px 12px',
          background: 'var(--danger-light)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 7,
          fontSize: 12,
          color: 'var(--danger)',
          fontWeight: 500,
        }}>
          ⚠ Injection detected in username field
        </div>
      )}
    </div>
  )
}
