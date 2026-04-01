import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SQLi Sim — SQL Injection Simulation Platform',
  description:
    'An interactive, educational platform to understand and simulate SQL injection attacks. Learn Classic, Blind, Time-Based, and Error-Based SQLi with live query visualization.',
  keywords: ['SQL injection', 'cybersecurity', 'educational', 'web security', 'SQLi simulation'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
