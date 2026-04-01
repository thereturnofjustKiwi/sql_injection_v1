'use client'

import Navbar from '../../components/layout/Navbar'
import Link from 'next/link'
import { scenarioMeta } from '../../lib/content/scenarioMeta'


const colorMap: Record<string, { bg: string; border: string }> = {
  blue:   { bg: '#eff6ff', border: '#bfdbfe' },
  amber:  { bg: '#fffbeb', border: '#fde68a' },
  violet: { bg: '#f5f3ff', border: '#ddd6fe' },
  red:    { bg: '#fff1f2', border: '#fecdd3' },
}

export default function ScenariosPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
            Choose a Scenario
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text-primary)', marginBottom: 12 }}>
            SQL Injection Scenarios
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 560 }}>
            Each scenario simulates a distinct class of SQL injection attack. Start with Classic if you&apos;re new to the concept.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {scenarioMeta.map((s) => {
            const c = colorMap[s.color]
            const diff =
              s.difficulty === 'Beginner'     ? { bg: '#dbeafe', text: '#1d4ed8' } :
              s.difficulty === 'Intermediate' ? { bg: '#fef3c7', text: '#92400e' } :
                                                { bg: '#fee2e2', text: '#991b1b' }
            return (
              <Link key={s.slug} href={`/scenarios/${s.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-4px)'
                    el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.09)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'var(--shadow)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontSize: 32 }}>{s.icon}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 9px',
                      borderRadius: 99, background: diff.bg, color: diff.text,
                      letterSpacing: '0.4px', textTransform: 'uppercase',
                    }}>
                      {s.difficulty}
                    </span>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.3px' }}>
                    {s.title}
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 20 }}>
                    {s.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                      Start Simulation
                    </span>
                    <span style={{ color: 'var(--accent)', fontSize: 14 }}>→</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </>
  )
}
