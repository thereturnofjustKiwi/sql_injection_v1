'use client'
import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import SQLMatrixRain from './SQLMatrixRain'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55 } },
}

export default function HeroSection() {
  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      minHeight: '88vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '80px 24px',
    }}>

      {/* ── Layer 0: SQL Matrix Rain canvas ── */}
      <SQLMatrixRain />

      {/* ── Layer 1: Dot-grid drawn on top of the rain ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(203,213,225,0.55) 1px, transparent 0)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      {/* ── Layer 2: Radial fade — keeps center clear, bleeds rain at edges ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: [
          'radial-gradient(ellipse 64% 55% at 50% 48%, rgba(248,249,255,0.97) 0%, rgba(248,249,255,0.82) 45%, rgba(248,249,255,0.15) 80%, transparent 100%)',
        ].join(','),
        pointerEvents: 'none',
      }} />

      {/* ── Layer 3: Content ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', zIndex: 3, maxWidth: 720 }}
      >
        <motion.div variants={fadeUp}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--accent-light)', color: 'var(--accent)',
            border: '1px solid rgba(37,99,235,0.2)',
            borderRadius: 99, padding: '5px 14px',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.4px',
            textTransform: 'uppercase', marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Educational Simulation Platform
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: 24,
          }}
        >
          Understand{' '}
          <span style={{
            color: 'var(--accent)',
            position: 'relative',
            display: 'inline-block',
          }}>
            SQL Injection
            <svg
              viewBox="0 0 260 12"
              style={{
                position: 'absolute', bottom: -6, left: 0,
                width: '100%', height: 'auto', overflow: 'visible',
              }}
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 0 8 Q 65 0 130 8 Q 195 16 260 8"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeOpacity="0.35"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
          </span>
          {' '}by Doing
        </motion.h1>

        <motion.p
          variants={fadeUp}
          style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto 40px',
          }}
        >
          Type real payloads. Watch the query assemble live. See exactly why vulnerabilities succeed — and how parameterized queries stop them.
        </motion.p>

        <motion.div
          variants={fadeUp}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link
            href="/scenarios"
            style={{
              padding: '13px 28px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'var(--accent-dark)'
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 6px 16px rgba(37,99,235,0.35)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'var(--accent)'
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = '0 2px 8px rgba(37,99,235,0.3)'
            }}
          >
            Start Simulating →
          </Link>
          <Link
            href="/learn"
            style={{
              padding: '13px 28px',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(6px)',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border-strong)',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'border-color 0.15s, color 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'var(--accent)'
              el.style.color = 'var(--accent)'
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'var(--border-strong)'
              el.style.color = 'var(--text-primary)'
              el.style.transform = 'translateY(0)'
            }}
          >
            Learn the Theory
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{
          position: 'absolute', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: 'var(--text-muted)', fontSize: 12,
          zIndex: 3,
        }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  )
}
