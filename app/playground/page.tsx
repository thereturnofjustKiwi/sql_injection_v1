'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '../../components/layout/Navbar'
import { mockDB } from '../../lib/db/mockDatabase'
import { classifyAttack, attackLabels } from '../../lib/engine/attackClassifier'

// ─── Types ────────────────────────────────────────────────────────────────────
interface QueryResult {
  rows: Record<string, unknown>[]
  error: string | null
  affected: string
  execMs: number
  isMalicious: boolean
  leakType: string | null
}

interface HistoryEntry {
  query: string
  result: QueryResult
  ts: string
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const SCHEMA = [
  {
    table: 'users',
    columns: [
      { name: 'id',       type: 'INT',          pk: true  },
      { name: 'username', type: 'VARCHAR(50)',   pk: false },
      { name: 'password', type: 'VARCHAR(255)',  pk: false },
      { name: 'role',     type: 'VARCHAR(20)',   pk: false },
      { name: 'email',    type: 'VARCHAR(100)',  pk: false },
    ],
    rows: 4,
    color: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  {
    table: 'secrets',
    columns: [
      { name: 'id',   type: 'INT',          pk: true  },
      { name: 'data', type: 'VARCHAR(500)',  pk: false },
    ],
    rows: 4,
    color: '#fff1f2',
    borderColor: '#fecdd3',
  },
  {
    table: 'audit_log',
    columns: [
      { name: 'id',        type: 'INT',          pk: true  },
      { name: 'action',    type: 'VARCHAR(100)',  pk: false },
      { name: 'timestamp', type: 'DATETIME',      pk: false },
    ],
    rows: 3,
    color: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
]

// ─── Quick Examples ───────────────────────────────────────────────────────────
const EXAMPLES = [
  {
    category: 'Normal Queries',
    items: [
      { label: 'Select all users',       q: `SELECT * FROM users` },
      { label: 'Filter by username',     q: `SELECT * FROM users WHERE username = 'alice'` },
      { label: 'Filter by id',           q: `SELECT * FROM users WHERE id = 2` },
      { label: 'Select secrets',         q: `SELECT * FROM secrets` },
      { label: 'View audit log',         q: `SELECT * FROM audit_log` },
    ],
  },
  {
    category: 'Injection Attacks',
    items: [
      { label: 'Tautology bypass',       q: `SELECT * FROM users WHERE username = '' OR '1'='1` },
      { label: "Comment strip",          q: `SELECT * FROM users WHERE username = 'admin'--` },
      { label: 'UNION data exfil',       q: `SELECT * FROM users UNION SELECT id, data, '', '', '' FROM secrets` },
      { label: 'Error-based leak',       q: `SELECT * FROM users WHERE id = 1 AND 1=CONVERT(int, @@version)--` },
      { label: 'Time-based blind',       q: `SELECT * FROM users WHERE username='a'; WAITFOR DELAY '0:0:5'--` },
      { label: 'DROP TABLE attempt',     q: `SELECT * FROM users; DROP TABLE users--` },
    ],
  },
]

// ─── Attack Meta ─────────────────────────────────────────────────────────────
const ATTACK_META: Record<string, { color: string; bg: string; border: string; icon: string; gain: string; fix: string }> = {
  classic_tautology: { color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: '🔓', gain: 'Authentication bypass — all rows returned', fix: 'Use parameterized queries: WHERE username = ?' },
  blind_boolean:     { color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe', icon: '👁',  gain: 'Boolean inference — schema structure revealed', fix: 'Validate input; reject unexpected characters' },
  time_based:        { color: '#0369a1', bg: '#eff6ff', border: '#bfdbfe', icon: '⏱',  gain: 'Timing confirms vulnerability without visible output', fix: 'Use ORM or prepared statements with timeouts' },
  error_based:       { color: '#9f1239', bg: '#fff1f2', border: '#fecdd3', icon: '⚠',  gain: 'DB version / schema metadata leaked via error message', fix: 'Suppress detailed error messages in production' },
  union_based:       { color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0', icon: '⛓',  gain: 'Cross-table data exfiltration', fix: 'Whitelist allowed columns; use parameterized queries' },
  comment_injection: { color: '#3730a3', bg: '#eef2ff', border: '#c7d2fe', icon: '💬', gain: 'Logic stripped — WHERE clause bypassed', fix: 'Sanitize or reject -- and # characters' },
  ddl_drop:          { color: '#7f1d1d', bg: '#fef2f2', border: '#fecaca', icon: '💣', gain: 'Destructive DDL — table deletion attempt', fix: 'Use least-privilege DB accounts; disable stacked queries' },
}

// ─── Query Engine ─────────────────────────────────────────────────────────────
function runQuery(query: string): QueryResult {
  const rawQ = query.trim()
  const q    = rawQ.toLowerCase()
  const t0   = Date.now()
  const fakeMs = () => Math.floor(Math.random() * 8) + 1

  const mal  = classifyAttack(rawQ)
  const isMalicious = mal !== 'none'

  // Destructive
  if (/drop\s+table/i.test(rawQ)) {
    return { rows: [], error: `ERROR: DROP TABLE blocked — execution halted by WAF rule. Attack classified: DDL Injection`, affected: '—', execMs: fakeMs(), isMalicious: true, leakType: 'ddl_drop' }
  }

  // Error-based
  if (/convert\s*\(int.*@@version|cast\s*\(.*@@version|extractvalue|updatexml/i.test(rawQ)) {
    return {
      rows: [], execMs: fakeMs(), isMalicious: true, leakType: 'error_based', affected: '0 rows',
      error: `ERROR 1105: Conversion failed when converting the nvarchar value 'Microsoft SQL Server 2019 (RTM-CU12) 15.0.4153.1 (X64) on Windows Server 2019' to data type int.\n` +
             `Schema: [dbo]  Tables: users, secrets, audit_log\n` +
             `Current DB User: sa  Hostname: DBSRV-PROD-01`,
    }
  }

  // UNION SELECT
  if (/union\s+select/i.test(rawQ)) {
    const leaked = [
      ...mockDB.users as Record<string, unknown>[],
      ...mockDB.secrets.map(s => ({ id: s.id, username: '---', password: s.data, role: 'LEAKED', email: '---' })) as Record<string, unknown>[],
    ]
    return { rows: leaked, error: null, execMs: fakeMs(), isMalicious: true, leakType: 'union_based', affected: `${leaked.length} rows (cross-table leak via UNION)` }
  }

  // WAITFOR / SLEEP
  if (/waitfor\s+delay|sleep\s*\(/i.test(rawQ)) {
    return { rows: [], error: null, execMs: 2500 + Math.floor(Math.random() * 200), isMalicious: true, leakType: 'time_based', affected: '0 rows — delay confirms injectable endpoint' }
  }

  // Tautology: OR '1'='1 or OR 1=1
  if (/'?\s*or\s*'?1'?\s*=\s*'?1|or\s+1\s*=\s*1|\sor\s+true/i.test(rawQ)) {
    const tbl = q.includes('secrets') ? mockDB.secrets as Record<string, unknown>[]
               : q.includes('audit')  ? mockDB.audit_log as Record<string, unknown>[]
               : mockDB.users as Record<string, unknown>[]
    return { rows: tbl, error: null, execMs: fakeMs(), isMalicious: true, leakType: 'classic_tautology', affected: `${tbl.length} rows (all rows leaked via tautology)` }
  }

  // Comment injection — strip after --
  const cleanQuery = rawQ.replace(/--.*$/m, '').replace(/\/\*[\s\S]*?\*\//g, '').trim()
  const cq = cleanQuery.toLowerCase()

  // WHERE username = 'x'
  const unameMatch = cleanQuery.match(/where\s+username\s*=\s*'([^']*)'/i)
  if (unameMatch) {
    const uname = unameMatch[1]
    // Empty string due to comment stripping → return all
    if (uname === '' && rawQ.includes("'--") ) {
      return { rows: mockDB.users as Record<string, unknown>[], error: null, execMs: fakeMs(), isMalicious: true, leakType: 'comment_injection', affected: `${mockDB.users.length} rows (comment stripped WHERE clause)` }
    }
    const rows = mockDB.users.filter(u => u.username === uname) as Record<string, unknown>[]
    return { rows, error: null, execMs: fakeMs(), isMalicious: false, leakType: null, affected: `${rows.length} row(s)` }
  }

  // WHERE id = N
  const idMatch = cleanQuery.match(/where\s+id\s*=\s*(\d+)/i)
  if (idMatch) {
    const id = parseInt(idMatch[1])
    const fromMatch2 = cq.match(/from\s+(users|secrets|audit_log)/)
    const tbl2 = fromMatch2?.[1] ?? 'users'
    const source = tbl2 === 'secrets' ? mockDB.secrets : tbl2 === 'audit_log' ? mockDB.audit_log : mockDB.users
    const rows = source.filter((r: Record<string,unknown>) => r.id === id) as Record<string, unknown>[]
    return { rows, error: null, execMs: fakeMs(), isMalicious: false, leakType: null, affected: `${rows.length} row(s)` }
  }

  // SELECT * FROM [table]
  const fromMatch = cq.match(/from\s+(users|secrets|audit_log)/)
  if (fromMatch) {
    const tbl = fromMatch[1]
    const rows =
      tbl === 'users'     ? mockDB.users as Record<string, unknown>[] :
      tbl === 'secrets'   ? mockDB.secrets as Record<string, unknown>[] :
                            mockDB.audit_log as Record<string, unknown>[]

    // Specific column selection (not *)
    const colMatch = cleanQuery.match(/select\s+(.+?)\s+from/i)
    if (colMatch && colMatch[1].trim() !== '*') {
      const cols = colMatch[1].split(',').map(c => c.trim().toLowerCase())
      const filtered = rows.map(r =>
        Object.fromEntries(cols.filter(c => c in r).map(c => [c, r[c]]))
      ).filter(r => Object.keys(r).length > 0)
      return { rows: filtered, error: null, execMs: fakeMs(), isMalicious: false, leakType: null, affected: `${filtered.length} row(s)` }
    }

    return { rows, error: null, execMs: fakeMs(), isMalicious: false, leakType: null, affected: `${rows.length} row(s)` }
  }

  // INSERT detection (no real insert, just educational)
  if (/insert\s+into/i.test(rawQ)) {
    return { rows: [], error: `INSERT operations are disabled in the sandbox (read-only mode). In a real attack, stacked queries could execute arbitrary INSERT statements.`, execMs: fakeMs(), isMalicious: isMalicious, leakType: isMalicious ? mal : null, affected: '0 rows' }
  }

  return { rows: [], error: null, execMs: fakeMs(), isMalicious, leakType: null, affected: '0 rows — no matching data' }
}

// ─── Token Highlighter ───────────────────────────────────────────────────────
const KEYWORDS = new Set(['select','from','where','and','or','not','union','insert','update','delete','drop','create','table','as','join','on','limit','offset','order','by','group','having','in','like','between','null','is','distinct','all','exists','case','when','then','else','end','into','values','set','inner','left','right','outer','cross'])
const DANGER_KEYWORDS = new Set(['drop','union','delete','truncate','exec','execute','waitfor','sleep','cast','convert','extractvalue','updatexml','xp_cmdshell','benchmark'])

function highlightSQL(sql: string): React.ReactNode[] {
  const tokens = sql.split(/(\s+|'[^']*'|"[^"]*"|--[^\n]*|\/\*[\s\S]*?\*\/|[(),;=<>!])/g)
  return tokens.map((tok, i) => {
    if (!tok) return null
    const low = tok.toLowerCase().trim()
    if (/^'[^']*'$/.test(tok) || /^"[^"]*"$/.test(tok)) return <span key={i} style={{ color: '#d97706' }}>{tok}</span>
    if (/^(--.*)$/.test(tok) || /^\/\*/.test(tok)) return <span key={i} style={{ color: '#94a3b8', fontStyle: 'italic' }}>{tok}</span>
    if (/^\d+$/.test(low)) return <span key={i} style={{ color: '#7c3aed' }}>{tok}</span>
    if (DANGER_KEYWORDS.has(low)) return <span key={i} style={{ color: '#dc2626', fontWeight: 700 }}>{tok}</span>
    if (KEYWORDS.has(low)) return <span key={i} style={{ color: '#2563eb', fontWeight: 600 }}>{tok}</span>
    if (/^@@\w+/.test(tok)) return <span key={i} style={{ color: '#c026d3', fontWeight: 600 }}>{tok}</span>
    if (/^[(),;=<>!]$/.test(tok)) return <span key={i} style={{ color: '#64748b' }}>{tok}</span>
    return <span key={i}>{tok}</span>
  })
}

// ─── The Page ─────────────────────────────────────────────────────────────────
export default function PlaygroundPage() {
  const [query, setQuery]       = useState(`SELECT * FROM users WHERE username = 'alice'`)
  const [result, setResult]     = useState<QueryResult | null>(null)
  const [history, setHistory]   = useState<HistoryEntry[]>([])
  const [activeTab, setActiveTab] = useState<'examples'|'history'>('examples')
  const [showPreview, setShowPreview] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const attackType = classifyAttack(query)
  const isMalicious = attackType !== 'none'
  const attackMeta = ATTACK_META[attackType] ?? null

  const handleRun = useCallback(() => {
    const res = runQuery(query)
    setResult(res)
    setHistory(prev => [{ query, result: res, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 15))
  }, [query])

  // Ctrl+Enter to run
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleRun()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleRun])

  const threatLevel =
    attackType === 'ddl_drop'          ? { label: 'CRITICAL', color: '#dc2626', bg: '#fef2f2' } :
    attackType === 'error_based'       ? { label: 'HIGH',     color: '#b91c1c', bg: '#fff1f2' } :
    attackType === 'union_based'       ? { label: 'HIGH',     color: '#b91c1c', bg: '#fff1f2' } :
    attackType === 'classic_tautology' ? { label: 'HIGH',     color: '#d97706', bg: '#fffbeb' } :
    isMalicious                        ? { label: 'MEDIUM',   color: '#92400e', bg: '#fffbeb' } :
                                         { label: 'SAFE',     color: '#047857', bg: '#f0fdf4' }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
              SQL Sandbox
            </p>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text-primary)', marginBottom: 6 }}>
              Playground
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Write free-form SQL against the mock DB. Injection detection + execution stats run automatically. <kbd style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, padding: '1px 5px', fontFamily: 'JetBrains Mono, monospace' }}>Ctrl+Enter</kbd> to run.
            </p>
          </div>
          {/* Threat badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: threatLevel.bg, border: `1px solid ${isMalicious ? 'rgba(220,38,38,0.2)' : 'rgba(5,150,105,0.2)'}`, borderRadius: 99, transition: 'all 0.25s' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: threatLevel.color, display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: threatLevel.color, letterSpacing: '0.4px' }}>
              {threatLevel.label}
            </span>
            {isMalicious && attackType && (
              <span style={{ fontSize: 12, color: threatLevel.color, opacity: 0.8 }}>
                — {attackLabels[attackType]}
              </span>
            )}
          </div>
        </div>

        {/* ── Layout: Sidebar + Main ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>

          {/* ── Left Sidebar ── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Schema */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Database Schema
                </span>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {SCHEMA.map(t => (
                  <div
                    key={t.table}
                    style={{ borderRadius: 8, border: `1px solid ${t.borderColor}`, background: t.color, overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => { setQuery(`SELECT * FROM ${t.table}`); setResult(null) }}
                    title={`Click to query ${t.table}`}
                  >
                    <div style={{ padding: '7px 10px', borderBottom: `1px solid ${t.borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>{t.table}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.rows} rows</span>
                    </div>
                    <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {t.columns.map(c => (
                        <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: c.pk ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: c.pk ? 700 : 400 }}>
                            {c.pk ? '🔑 ' : ''}{c.name}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{c.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Examples / History tabs */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {(['examples', 'history'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ flex: 1, padding: '10px 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: activeTab === tab ? 'var(--accent-light)' : 'transparent', color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)', borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s' }}>
                    {tab}
                    {tab === 'history' && history.length > 0 && (
                      <span style={{ marginLeft: 5, background: 'var(--accent)', color: '#fff', borderRadius: 99, padding: '0px 5px', fontSize: 9 }}>
                        {history.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div style={{ padding: '10px 10px', maxHeight: 340, overflowY: 'auto' }}>
                {activeTab === 'examples' ? (
                  EXAMPLES.map(group => (
                    <div key={group.category} style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '2px 6px', marginBottom: 4 }}>
                        {group.category}
                      </p>
                      {group.items.map(({ label, q }) => (
                        <button key={label} onClick={() => { setQuery(q); setResult(null) }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', marginBottom: 2, background: query === q ? 'var(--accent-light)' : 'transparent', border: '1px solid', borderColor: query === q ? 'rgba(37,99,235,0.2)' : 'transparent', borderRadius: 6, fontSize: 12, color: query === q ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: query === q ? 600 : 400, transition: 'all 0.12s' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  ))
                ) : history.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No queries yet</p>
                ) : (
                  history.map((h, i) => (
                    <button key={i} onClick={() => { setQuery(h.query); setResult(h.result) }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 4, background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: h.result.isMalicious ? '#dc2626' : '#047857', fontWeight: 700 }}>
                          {h.result.isMalicious ? '⚠ MALICIOUS' : '✓ SAFE'}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{h.ts}</span>
                      </div>
                      <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                        {h.query}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* ── Right: Editor + Results ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Editor card ── */}
            <div style={{ background: 'var(--bg-surface)', border: `1.5px solid ${isMalicious ? 'rgba(220,38,38,0.4)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: isMalicious ? '0 0 0 3px rgba(220,38,38,0.08)' : 'var(--shadow)', transition: 'border-color 0.25s, box-shadow 0.25s' }}>
              {/* Editor toolbar */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#60a5fa' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    SQL Query Editor
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => setShowPreview(v => !v)}
                    style={{ fontSize: 11, padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 6, background: showPreview ? 'var(--accent-light)' : 'transparent', color: showPreview ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}>
                    {showPreview ? '✦ Preview on' : '◇ Preview off'}
                  </button>
                  <button onClick={() => { setQuery(''); setResult(null); textareaRef.current?.focus() }}
                    style={{ fontSize: 11, padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    Clear
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setResult(null) }}
                rows={5}
                spellCheck={false}
                placeholder="Write your SQL here… try SELECT, WHERE, UNION, or injection payloads"
                style={{ width: '100%', padding: '18px 20px', border: 'none', outline: 'none', resize: 'vertical', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, lineHeight: 1.75, color: 'var(--text-primary)', background: 'transparent', boxSizing: 'border-box' }}
              />

              {/* Live preview */}
              {showPreview && query.trim() && (
                <div style={{ padding: '10px 20px 14px', borderTop: '1px dashed var(--border)', background: 'rgba(248,249,255,0.7)' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>
                    Syntax Preview
                  </p>
                  <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {highlightSQL(query)}
                  </pre>
                </div>
              )}

              {/* Toolbar bottom */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {query.length} chars · {query.split('\n').length} line{query.split('\n').length !== 1 ? 's' : ''}
                </span>
                <button onClick={handleRun}
                  style={{ padding: '9px 22px', background: isMalicious ? '#dc2626' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s, transform 0.1s', display: 'flex', alignItems: 'center', gap: 7 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.12)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = '' }}>
                  ▶ Run Query
                </button>
              </div>
            </div>

            {/* ── Attack Warning ── */}
            {isMalicious && attackMeta && (
              <div style={{ padding: '16px 20px', background: attackMeta.bg, border: `1px solid ${attackMeta.border}`, borderRadius: 'var(--radius-lg)', display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '0 20px', alignItems: 'start' }}>
                <div style={{ fontSize: 26, gridRow: '1 / 3', paddingRight: 4, paddingTop: 2 }}>{attackMeta.icon}</div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: attackMeta.color, marginBottom: 4 }}>
                    Attack Classified
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: attackMeta.color, margin: 0 }}>{attackLabels[attackType]}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: attackMeta.color, marginBottom: 4 }}>
                    Attacker Gains
                  </p>
                  <p style={{ fontSize: 13, color: attackMeta.color, margin: 0, opacity: 0.85 }}>{attackMeta.gain}</p>
                </div>
                <div style={{ gridColumn: '2 / 4', marginTop: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 6, border: `1px solid ${attackMeta.border}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: attackMeta.color }}>✓ Fix: </span>
                  <span style={{ fontSize: 12, color: attackMeta.color, opacity: 0.85 }}>{attackMeta.fix}</span>
                </div>
              </div>
            )}

            {/* ── Results ── */}
            {result && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                {/* Result header with stats */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: result.error ? '#fff1f2' : result.isMalicious ? '#fffbeb' : 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: result.error ? '#b91c1c' : result.isMalicious ? '#b45309' : '#047857' }}>
                      {result.error ? '❌ Error returned' : result.isMalicious ? '⚠ Injection succeeded' : '✅ Query executed'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {result.affected}
                    </span>
                    <span style={{ fontSize: 11, color: result.execMs > 1000 ? '#dc2626' : 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', background: result.execMs > 1000 ? '#fef2f2' : 'transparent', padding: result.execMs > 1000 ? '1px 6px' : '0', borderRadius: 4 }}>
                      {result.execMs > 1000 ? `⏱ ${(result.execMs/1000).toFixed(1)}s delay detected` : `${result.execMs}ms`}
                    </span>
                  </div>
                </div>

                {result.error ? (
                  <div style={{ padding: '16px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: '#b91c1c', lineHeight: 1.75, background: '#fff1f2', whiteSpace: 'pre-wrap' }}>
                    {result.error}
                  </div>
                ) : result.rows.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    {result.execMs > 1000 ? (
                      <div>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                        <p style={{ fontWeight: 600, color: '#b45309' }}>Time-based delay confirmed</p>
                        <p style={{ fontSize: 13 }}>The server paused for {(result.execMs/1000).toFixed(1)}s — this confirms the endpoint is injectable, even without visible output.</p>
                      </div>
                    ) : (
                      <p>No rows returned</p>
                    )}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg-subtle)' }}>
                          {Object.keys(result.rows[0]).map(c => (
                            <th key={c} style={{ textAlign: 'left', padding: '9px 16px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row, i) => {
                          const isLeaked = result.isMalicious && (String(row.role) === 'LEAKED' || String(row.password ?? '').startsWith('FLAG{'))
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: isLeaked ? '#fff7ed' : i % 2 ? 'rgba(0,0,0,0.01)' : 'transparent', transition: 'background 0.1s' }}
                              onMouseEnter={e => { if (!isLeaked) (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)' }}
                              onMouseLeave={e => { if (!isLeaked) (e.currentTarget as HTMLElement).style.background = i % 2 ? 'rgba(0,0,0,0.01)' : 'transparent' }}>
                              {Object.values(row).map((val, j) => {
                                const s = String(val)
                                const isSensitive = s.startsWith('FLAG{') || s.startsWith('$2b$') || s === 'LEAKED'
                                return (
                                  <td key={j} style={{ padding: '9px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: isSensitive ? '#dc2626' : 'var(--text-primary)', fontWeight: isSensitive ? 600 : 400 }}>
                                    {s}
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {result.isMalicious && (
                      <div style={{ padding: '10px 16px', background: '#fffbeb', borderTop: '1px solid #fde68a', fontSize: 12, color: '#92400e' }}>
                        ⚠ <strong>Data leaked via injection.</strong> In a real system, this data would be fully accessible to the attacker. Rows highlighted in orange contain exfiltrated records.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </>
  )
}
