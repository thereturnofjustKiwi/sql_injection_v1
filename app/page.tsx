import Navbar from '../components/layout/Navbar'
import HeroSection from '../components/landing/HeroSection'
import AttackTypeGrid from '../components/landing/AttackTypeGrid'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <AttackTypeGrid />

        {/* Footer CTA */}
        <section style={{
          padding: '80px 24px',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)', marginBottom: 14 }}>
            Ready to go deeper?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32 }}>
            Try the free-form SQL sandbox or explore the theory behind each attack type.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/playground"
              style={{
                padding: '12px 24px',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 9,
                fontSize: 14, fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              }}
            >
              Open Playground
            </Link>
            <Link
              href="/learn"
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1.5px solid var(--border-strong)',
                borderRadius: 9,
                fontSize: 14, fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Browse Learning Hub
            </Link>
          </div>
        </section>

        <footer style={{
          padding: '24px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
        }}>
          SQLi Sim — An educational SQL injection simulation platform. For learning purposes only.
        </footer>
      </main>
    </>
  )
}
