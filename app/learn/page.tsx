'use client'
import Navbar from '../../components/layout/Navbar'

import Link from 'next/link'

const topics = [
  {
    slug: 'what-is-sqli',
    icon: '🔐',
    title: 'What is SQL Injection?',
    summary: 'The foundational attack — how unvalidated user input becomes database commands.',
    tags: ['Fundamentals', 'OWASP Top 10'],
    color: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    slug: 'classic',
    icon: '🔑',
    title: 'Classic & Tautology Attacks',
    summary: 'Breaking authentication with OR 1=1. Why it worked in 1998 and still works today.',
    tags: ['Auth Bypass', 'Beginner'],
    color: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    slug: 'blind',
    icon: '👁',
    title: 'Blind Boolean Injection',
    summary: 'No errors, no data — just true/false. How attackers extract entire schemas one bit at a time.',
    tags: ['Inference', 'Intermediate'],
    color: '#fffbeb',
    border: '#fde68a',
  },
  {
    slug: 'time-based',
    icon: '⏱',
    title: 'Time-Based Blind Injection',
    summary: 'When even the boolean signal is hidden. Using database delays as a covert side channel.',
    tags: ['Timing', 'Intermediate'],
    color: '#f5f3ff',
    border: '#ddd6fe',
  },
  {
    slug: 'error-based',
    icon: '⚠',
    title: 'Error-Based Extraction',
    summary: 'Forcing the database to embed schema metadata inside its own error messages.',
    tags: ['Schema Leak', 'Advanced'],
    color: '#fff1f2',
    border: '#fecdd3',
  },
  {
    slug: 'prevention',
    icon: '🛡',
    title: 'Prevention & Defense',
    summary: 'Parameterized queries, input validation, WAF rules, and the principle of least privilege.',
    tags: ['Defense', 'Best Practice'],
    color: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    slug: 'detection',
    icon: '🔍',
    title: 'Detection Techniques',
    summary: 'Anomaly-based detection, query logging, and behavioral heuristics for identifying injection attempts.',
    tags: ['Security Ops', 'Blue Team'],
    color: '#f8f9ff',
    border: '#e2e8f0',
  },
  {
    slug: 'owasp',
    icon: '📋',
    title: 'OWASP & Industry Context',
    summary: 'SQL injection as OWASP A03:2021. Historical incidents, real-world impact, and regulatory implications.',
    tags: ['OWASP', 'Industry'],
    color: '#fefce8',
    border: '#fef08a',
  },
]

export default function LearnPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
            Learning Hub
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text-primary)', marginBottom: 12 }}>
            Theory & Deep Dives
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 560 }}>
            Understand the mechanics behind each attack class — from first principles to real-world exploitation and defense.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 18,
        }}>
          {topics.map(t => (
            <Link key={t.slug} href={`/learn/${t.slug}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: t.color,
                  border: `1px solid ${t.border}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: 'var(--shadow)',
                  cursor: 'pointer',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-3px)'
                  el.style.boxShadow = '0 10px 28px rgba(0,0,0,0.08)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'var(--shadow)'
                }}
              >
                <span style={{ fontSize: 26 }}>{t.icon}</span>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', lineHeight: 1.35 }}>
                  {t.title}
                </h2>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                  {t.summary}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                  {t.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px',
                      borderRadius: 99,
                      background: 'rgba(37,99,235,0.1)', color: 'var(--accent)',
                      letterSpacing: '0.3px',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
