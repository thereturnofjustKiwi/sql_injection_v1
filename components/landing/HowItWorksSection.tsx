'use client'
import { motion, Variants } from 'framer-motion'

const steps = [
  {
    n: '01',
    title: 'Type a Payload',
    desc: 'Enter a SQL injection payload into the vulnerable login form — the same way an attacker would.',
    icon: '⌨️',
  },
  {
    n: '02',
    title: 'Watch the Query Build',
    desc: 'The Query Visualizer assembles the raw SQL in real-time. Injected portions are highlighted red.',
    icon: '🔍',
  },
  {
    n: '03',
    title: 'Compare Safe vs Vulnerable',
    desc: 'Side by side: see exactly what data leaks through the vulnerable path, and why the safe path is immune.',
    icon: '⚖️',
  },
  {
    n: '04',
    title: 'Read the Explanation',
    desc: 'Each attack type comes with an in-depth breakdown of why it works, and the exact code fix required.',
    icon: '📖',
  },
]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item: Variants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function HowItWorksSection() {
  return (
    <section style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: '80px 24px',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
            How It Works
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text-primary)' }}>
            Learning by Doing
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 32,
          }}
        >
          {steps.map((s, i) => (
            <motion.div
              key={i}
              variants={item}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {s.icon}
                </span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, fontWeight: 600, color: 'var(--accent)',
                  letterSpacing: '0.5px',
                }}>
                  {s.n}
                </span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {s.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
