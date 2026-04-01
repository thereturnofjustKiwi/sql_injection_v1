'use client'
import { use } from 'react'
import Navbar from '../../../components/layout/Navbar'
import Link from 'next/link'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'


const topicContent: Record<string, {
  title: string
  icon: string
  sections: { heading: string; body: string; code?: { lang: string; snippet: string } }[]
}> = {
  'what-is-sqli': {
    title: 'What is SQL Injection?',
    icon: '🔐',
    sections: [
      {
        heading: 'The Core Problem',
        body: `SQL Injection (SQLi) occurs when user-supplied data is incorporated into a database query without proper separation between code and data. The database engine receives and executes the attacker's input as if it were part of the original SQL program.\n\nIt has been the #1 web application vulnerability for over two decades and remains OWASP A03:2021 — "Injection."`,
      },
      {
        heading: 'Why Databases Are Vulnerable',
        body: `SQL is a text-based language. When an application builds queries by string concatenation, a single quote (') in user input can break out of the intended string context and introduce arbitrary SQL logic. The database has no way to distinguish between "developer SQL" and "attacker SQL" once they are concatenated together.`,
        code: {
          lang: 'sql',
          snippet: `-- Developer intended:
SELECT * FROM users WHERE username = 'alice'

-- Attacker input: alice' OR '1'='1
-- Resulting query:
SELECT * FROM users WHERE username = 'alice' OR '1'='1'
-- Condition is always TRUE — all rows returned`,
        },
      },
      {
        heading: 'The Fix in One Line',
        body: `Parameterized queries (prepared statements) solve this entirely. The SQL template is sent to the database first, then the user data is sent separately. The database never interprets the data as code — regardless of what it contains.`,
        code: {
          lang: 'javascript',
          snippet: `// ❌ Vulnerable — string concatenation
db.query("SELECT * FROM users WHERE username = '" + username + "'")

// ✅ Safe — parameterized
db.query("SELECT * FROM users WHERE username = ?", [username])`,
        },
      },
    ],
  },
  classic: {
    title: 'Classic & Tautology Attacks',
    icon: '🔑',
    sections: [
      {
        heading: 'The Tautology Pattern',
        body: `A tautology is a condition that is always true. By injecting OR 1=1 into a WHERE clause, an attacker turns a selective filter into a universal one — returning every row in the table. This is the most common authentication bypass technique.`,
        code: {
          lang: 'sql',
          snippet: `-- Target query
SELECT * FROM users WHERE username = '[INPUT]' AND password = '[PASS]'

-- Payload: ' OR '1'='1
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '...'
-- '1'='1' is always true → entire users table returned`,
        },
      },
      {
        heading: 'Comment-Based Bypass',
        body: `The -- sequence starts a SQL comment, causing everything after it to be ignored. An attacker can inject admin'-- to match the admin user and comment out the password check entirely.`,
        code: {
          lang: 'sql',
          snippet: `-- Payload: admin'--
SELECT * FROM users WHERE username = 'admin'--' AND password = '...'
-- Everything after -- is ignored
-- Authenticated as admin without any password`,
        },
      },
    ],
  },
  blind: {
    title: 'Blind Boolean Injection',
    icon: '👁',
    sections: [
      {
        heading: 'No Output — Just True or False',
        body: `In blind SQLi, the application returns no query data — only a behavioral difference (e.g., "User found" vs "Not found"). Attackers systematically probe the database by injecting boolean conditions and observing these binary signals.`,
        code: {
          lang: 'sql',
          snippet: `-- TRUE condition — user exists response
SELECT * FROM users WHERE username = 'admin' AND 1=1--'

-- FALSE condition — not found response
SELECT * FROM users WHERE username = 'admin' AND 1=2--'

-- By automating this, attackers extract: table names,
-- column names, row counts, even individual characters`,
        },
      },
      {
        heading: 'Automated Extraction',
        body: `Tools like sqlmap automate blind extraction by bisecting the ASCII character space. Each loop iteration narrows down one character of the target value. Extracting a 32-character password hash takes roughly 200 requests.`,
      },
    ],
  },
  'time-based': {
    title: 'Time-Based Blind Injection',
    icon: '⏱',
    sections: [
      {
        heading: 'The Timing Side Channel',
        body: `When the application returns identical content for all inputs, the boolean signal disappears. Time-based injection introduces a new signal: response latency. SLEEP(5) or WAITFOR DELAY '0:0:5' forces the database to pause — if the response is slow, the condition was true.`,
        code: {
          lang: 'sql',
          snippet: `-- If admin user exists, delay 5 seconds
SELECT * FROM users WHERE username = 'admin'
  AND IF(1=1, SLEEP(5), 0)--

-- Attacker measures response time:
-- > 5 seconds → condition TRUE
-- < 1 second  → condition FALSE`,
        },
      },
    ],
  },
  'error-based': {
    title: 'Error-Based Extraction',
    icon: '⚠',
    sections: [
      {
        heading: 'Metadata in Error Messages',
        body: `SQL Server and MySQL embed expression values inside type-conversion error messages. By deliberately causing a CONVERT(int, @@version) failure, the attacker reads the database version from the error text itself — no UNION or JOIN required.`,
        code: {
          lang: 'sql',
          snippet: `-- Payload forces a type error containing @@version
' AND 1=CONVERT(int, @@version)--

-- Error returned:
-- Conversion failed when converting the nvarchar value
-- 'Microsoft SQL Server 2019 (RTM)...' to data type int.
-- ^ Version string embedded in the error message`,
        },
      },
    ],
  },
  prevention: {
    title: 'Prevention & Defense',
    icon: '🛡',
    sections: [
      {
        heading: 'Parameterized Queries — The Primary Defense',
        body: `Parameterized queries (prepared statements) are the single most effective countermeasure. By separating SQL code from user data, the database driver ensures that input can never alter query logic — it is always treated as a string value.`,
        code: {
          lang: 'javascript',
          snippet: `// Node.js (mysql2)
const [rows] = await db.execute(
  'SELECT * FROM users WHERE username = ? AND password = ?',
  [username, password]   // Data sent separately, never interpolated
)

// Python (psycopg2)
cursor.execute(
  "SELECT * FROM users WHERE username = %s",
  (username,)
)`,
        },
      },
      {
        heading: 'Additional Layers',
        body: `Defense in depth means never relying on a single control.\n\n• **Input validation**: Reject inputs that don't match expected format before they reach the database layer.\n• **Least privilege**: Application DB user should only have SELECT on the tables it needs — never DROP or CREATE.\n• **WAF rules**: Block payloads at the network edge as a secondary layer.\n• **Error handling**: Never expose raw database error messages — return only generic messages to users.`,
      },
    ],
  },
  detection: {
    title: 'Detection Techniques',
    icon: '🔍',
    sections: [
      {
        heading: 'Query-Level Anomaly Detection',
        body: `Monitor all database queries for patterns characteristic of injection: unusual OR conditions, UNION SELECT, comment sequences (--), or calls to system functions (@@version, information_schema). Baseline normal query shapes and alert on deviations.`,
      },
      {
        heading: 'Application-Level Signals',
        body: `Log all authentication failures, unusual response sizes (sudden large result sets), and inputs containing SQL keywords. Correlate with IP address and session data. A single IP cycling through boolean payloads is a strong signal of automated blind injection.`,
      },
    ],
  },
  owasp: {
    title: 'OWASP & Industry Context',
    icon: '📋',
    sections: [
      {
        heading: 'OWASP A03:2021 — Injection',
        body: `SQL Injection has appeared in every OWASP Top 10 list since 2003. It was ranked #1 from 2010–2017 and remains in the top three. OWASP defines it as occurring when "user-supplied data is not validated, filtered, or sanitized by the application."`,
      },
      {
        heading: 'Historical Incidents',
        body: `Notable SQLi breaches include the 2008 Heartland Payment Systems breach (130M+ card records via SQLi), the 2012 LinkedIn breach, the 2014 Talk Talk breach (UK, £77M fine under GDPR predecessor), and countless smaller incidents.\n\nThe 2015 UK TalkTalk breach resulted in the first major ICO fine specifically citing SQL injection as a preventable, negligent vulnerability.`,
      },
    ],
  },
}

const fallback = {
  title: 'Topic Not Found',
  icon: '❓',
  sections: [{ heading: 'Coming Soon', body: 'This topic page is being written. Check back soon or explore the scenarios.' }],
}

export default function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = use(params)
  const content = topicContent[topic] ?? fallback


  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 96px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36, fontSize: 13, color: 'var(--text-muted)' }}>
          <Link href="/learn" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Learning Hub
          </Link>
          <span>→</span>
          <span>{content.title}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>{content.icon}</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {content.title}
          </h1>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {content.sections.map((sec, i) => (
            <section key={i}>
              <h2 style={{
                fontSize: 18, fontWeight: 700, color: 'var(--text-primary)',
                marginBottom: 14, letterSpacing: '-0.3px',
                paddingBottom: 10, borderBottom: '1px solid var(--border)',
              }}>
                {sec.heading}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {sec.body.split('\n').map((para, j) => (
                  para.trim() && (
                    <p key={j} style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                      {para.replace(/\*\*(.+?)\*\*/g, '$1')}
                    </p>
                  )
                ))}
                {sec.code && (
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', marginTop: 4 }}>
                    <div style={{
                      padding: '8px 14px',
                      background: 'var(--bg-subtle)',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                      fontFamily: 'JetBrains Mono, monospace',
                      letterSpacing: '0.4px',
                    }}>
                      {sec.code.lang.toUpperCase()}
                    </div>
                    <SyntaxHighlighter
                      language={sec.code.lang}
                      style={oneLight}
                      customStyle={{ margin: 0, fontSize: 13, padding: '16px' }}
                    >
                      {sec.code.snippet}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Footer nav */}
        <div style={{
          marginTop: 64, paddingTop: 24,
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Link href="/learn" style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
            ← Back to Learning Hub
          </Link>
          <Link href="/scenarios" style={{
            padding: '10px 20px',
            background: 'var(--accent)', color: '#fff',
            borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>
            Try the Simulation →
          </Link>
        </div>
      </main>
    </>
  )
}
