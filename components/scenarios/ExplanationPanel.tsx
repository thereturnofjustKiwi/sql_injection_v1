'use client'
import { useSimulationStore } from '../../store/simulationStore'
import { explanations } from '../../lib/content/explanations'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function ExplanationPanel() {
  const { scenario, attackType } = useSimulationStore()
  const exp = explanations[scenario as keyof typeof explanations]
  if (!exp) return null

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: attackType !== 'none' ? 'var(--danger)' : 'var(--text-muted)',
        }} />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {exp.label}
        </h3>
        {attackType !== 'none' && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 99, background: 'var(--danger-light)', color: 'var(--danger)',
            letterSpacing: '0.4px', textTransform: 'uppercase',
          }}>
            Active Attack
          </span>
        )}
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Why it works + attack description */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--danger)', marginBottom: 8 }}>
              What Happens
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {exp.attackDescription}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--warn)', marginBottom: 8 }}>
              Why It Works
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {exp.whyItWorks}
            </p>
          </div>
        </div>

        {/* Code comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--danger)', marginBottom: 8 }}>
              Vulnerable Code
            </p>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <SyntaxHighlighter
                language="javascript"
                style={oneLight}
                customStyle={{ margin: 0, fontSize: 12, padding: '14px' }}
              >
                {exp.vulnerableSnippet}
              </SyntaxHighlighter>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--success)', marginBottom: 8 }}>
              Safe Code
            </p>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(22,163,74,0.25)' }}>
              <SyntaxHighlighter
                language="javascript"
                style={oneLight}
                customStyle={{ margin: 0, fontSize: 12, padding: '14px', background: 'rgba(22,163,74,0.03)' }}
              >
                {exp.safeSnippet}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        {/* Fix + prevention */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--success)', marginBottom: 8 }}>
              How to Fix
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {exp.howToFix}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--accent)', marginBottom: 8 }}>
              Prevention Methods
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {exp.preventionMethods.map(m => (
                <span key={m} style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 10px',
                  borderRadius: 99, background: 'var(--accent-light)',
                  color: 'var(--accent)', border: '1px solid rgba(37,99,235,0.15)',
                }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
