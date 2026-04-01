'use client'
import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { scenarioMeta } from '../../lib/content/scenarioMeta'

const colorMap: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
  blue:   { bg: '#eff6ff', border: '#bfdbfe', badge: '#dbeafe', badgeText: '#1d4ed8' },
  amber:  { bg: '#fffbeb', border: '#fde68a', badge: '#fef3c7', badgeText: '#92400e' },
  violet: { bg: '#f5f3ff', border: '#ddd6fe', badge: '#ede9fe', badgeText: '#5b21b6' },
  red:    { bg: '#fff1f2', border: '#fecdd3', badge: '#fee2e2', badgeText: '#991b1b' },
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const card: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function AttackTypeGrid() {
  return (
    <section style={{
      maxWidth: '100%',
      background: 'var(--bg-subtle)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '80px 24px 88px',
      }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
          Attack Scenarios
        </p>
        <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text-primary)' }}>
          Four Classes of SQL Injection
        </h2>
        <p style={{ marginTop: 12, fontSize: 16, color: 'var(--text-secondary)', margin: '12px auto 0' }}>
          Each scenario is a self-contained simulation with live query visualization and educational breakdowns.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
        {scenarioMeta.map((s) => {
          const c = colorMap[s.color]
          const diff =
            s.difficulty === 'Beginner'     ? { bg: '#dbeafe', text: '#1d4ed8' } :
            s.difficulty === 'Intermediate' ? { bg: '#fef3c7', text: '#92400e' } :
                                              { bg: '#fee2e2', text: '#991b1b' }
          return (
            <motion.div key={s.slug} variants={card} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Link
                href={`/scenarios/${s.slug}`}
                style={{ textDecoration: 'none', display: 'flex', flex: 1 }}
              >
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '28px 24px 24px',
                    cursor: 'pointer',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow)',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {/* Top row: icon left, badge right */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ fontSize: 28 }}>{s.icon}</div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 9px',
                      borderRadius: 99, background: diff.bg, color: diff.text,
                      letterSpacing: '0.4px', textTransform: 'uppercase', whiteSpace: 'nowrap',
                      alignSelf: 'center',
                    }}>
                      {s.difficulty}
                    </span>
                  </div>

                  {/* Title — full width, no competition */}
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: 10 }}>
                    {s.title}
                  </h3>

                  {/* Description grows to fill available space */}
                  <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 20, flex: 1 }}>
                    {s.description}
                  </p>

                  {/* Simulate link always pinned to bottom */}
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                    Simulate →
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
      </div>
    </section>
  )
}
