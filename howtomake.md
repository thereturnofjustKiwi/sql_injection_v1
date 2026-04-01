# How to Make: SQL Injection Simulation Website

A step-by-step guide to building a multipage, frontend-only educational SQLi simulation
platform using Next.js, Tailwind CSS, Zustand, and Framer Motion.

---

## Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** v18 or higher
- **npm** or **yarn**
- Basic familiarity with React, TypeScript, and Next.js App Router

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework + routing |
| TypeScript | Type safety across engine and UI |
| Tailwind CSS | Styling |
| Framer Motion | Animations and transitions |
| Zustand | Lightweight global state |
| react-syntax-highlighter | Code block rendering in /learn pages |
| JetBrains Mono | Monospace font for query display |

---

## Step 1 — Project Initialization

```bash
npx create-next-app@latest sqli-sim --typescript --tailwind --app --no-src-dir
cd sqli-sim
npm install zustand framer-motion react-syntax-highlighter
npm install -D @types/react-syntax-highlighter
```

Then clean up the boilerplate:
- Delete contents of `app/page.tsx`
- Delete `app/globals.css` default styles (keep the Tailwind directives)
- Remove the default `public/` SVG files

---

## Step 2 — Folder Structure Setup

Create the following folders manually or via terminal:

```bash
mkdir -p app/scenarios/classic
mkdir -p app/scenarios/blind
mkdir -p app/scenarios/time-based
mkdir -p app/scenarios/error-based
mkdir -p app/learn/\[topic\]
mkdir -p app/playground

mkdir -p components/layout
mkdir -p components/landing
mkdir -p components/scenarios
mkdir -p components/learn
mkdir -p components/playground

mkdir -p lib/db
mkdir -p lib/engine/scenarios
mkdir -p lib/content

mkdir -p store
mkdir -p hooks
mkdir -p public/icons
```

Your final structure should look like this:

```
sqli-sim/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── scenarios/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── classic/page.tsx
│   │   ├── blind/page.tsx
│   │   ├── time-based/page.tsx
│   │   └── error-based/page.tsx
│   ├── learn/
│   │   ├── page.tsx
│   │   └── [topic]/page.tsx
│   └── playground/
│       └── page.tsx
├── components/
│   ├── layout/
│   ├── landing/
│   ├── scenarios/
│   ├── learn/
│   └── playground/
├── lib/
│   ├── db/
│   ├── engine/
│   │   └── scenarios/
│   └── content/
├── store/
└── hooks/
```

---

## Step 3 — Font and Global Style Setup

In `app/layout.tsx`, import JetBrains Mono from Google Fonts and set the dark base theme:

```tsx
import { JetBrains_Mono, Inter } from 'next/font/google'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})
```

In `styles/globals.css`, define your CSS variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-base: #0a0a0f;
  --bg-panel: #111118;
  --border-color: #1e1e2e;
  --accent-red: #ff4444;
  --accent-green: #00ff88;
  --accent-blue: #4488ff;
  --text-muted: #666680;
}

body {
  background-color: var(--bg-base);
  color: #e0e0f0;
}
```

---

## Step 4 — Build the Mock Database

This is the foundation everything else runs on. Create `lib/db/schema.ts` first:

```ts
export type UserRow = {
  id: number
  username: string
  password: string   // bcrypt-style fake hash
  role: 'admin' | 'user'
  email: string
}

export type SecretRow = {
  id: number
  data: string
}

export type AuditRow = {
  id: number
  action: string
  timestamp: string
}

export type MockDB = {
  users: UserRow[]
  secrets: SecretRow[]
  audit_log: AuditRow[]
}
```

Then create `lib/db/mockDatabase.ts`:

```ts
import { MockDB } from './schema'

export const mockDB: MockDB = {
  users: [
    { id: 1, username: 'admin',   password: '$2b$10$xK9mNpL...hashed', role: 'admin', email: 'admin@corp.com' },
    { id: 2, username: 'alice',   password: '$2b$10$aB3cDe...hashed',  role: 'user',  email: 'alice@corp.com' },
    { id: 3, username: 'bob',     password: '$2b$10$fG7hIj...hashed',  role: 'user',  email: 'bob@corp.com'   },
    { id: 4, username: 'charlie', password: '$2b$10$kL1mNo...hashed',  role: 'user',  email: 'charlie@corp.com'},
  ],
  secrets: [
    { id: 1, data: 'FLAG{sqli_classic_complete}' },
    { id: 2, data: 'FLAG{blind_injection_master}' },
  ],
  audit_log: [
    { id: 1, action: 'LOGIN_SUCCESS', timestamp: '2024-01-15 09:12:00' },
    { id: 2, action: 'LOGIN_FAILED',  timestamp: '2024-01-15 09:13:44' },
  ]
}
```

> Important: This object is imported fresh on each page load. It never mutates.
> All "query results" are computed by filtering this object — nothing is written.

---

## Step 5 — Build the Query Engine

This is the core of the entire app. All simulation logic lives here.

### 5a. Create the tokenizer — `lib/engine/tokenizer.ts`

The tokenizer breaks the assembled SQL string into colored segments for
the QueryVisualizer component. It returns an array of tokens:

```ts
export type TokenType = 'keyword' | 'string' | 'injected' | 'normal' | 'comment'

export type Token = {
  text: string
  type: TokenType
}

export function tokenize(query: string, injectedPart: string): Token[] {
  // Split the query around the injected part
  // Tag SQL keywords (SELECT, FROM, WHERE, OR, AND, DROP) as 'keyword'
  // Tag anything that matches injectedPart as 'injected'
  // Tag string literals as 'string'
  // Everything else is 'normal'
  // Return Token[]
}
```

Color mapping for the UI:
- `keyword` → blue (`#4488ff`)
- `string` → yellow (`#ffcc44`)
- `injected` → red with background (`#ff4444`)
- `comment` → muted gray
- `normal` → white

### 5b. Create the attack classifier — `lib/engine/attackClassifier.ts`

```ts
export type AttackType =
  | 'classic_tautology'
  | 'union_based'
  | 'blind_boolean'
  | 'time_based'
  | 'error_based'
  | 'comment_injection'
  | 'none'

export function classifyAttack(input: string): AttackType {
  // Check for ' OR '1'='1  → classic_tautology
  // Check for UNION SELECT  → union_based
  // Check for AND 1=1 or AND 1=2 → blind_boolean
  // Check for SLEEP or WAITFOR → time_based
  // Check for CONVERT or CAST with mismatched types → error_based
  // Check for -- or /* or # → comment_injection
  // Otherwise → none
}
```

### 5c. Create individual scenario engines — `lib/engine/scenarios/`

Each file exports `runVulnerable(input)` and `runSafe(input)`.

**`classic.ts` example:**

```ts
import { mockDB } from '../../db/mockDatabase'

export function runVulnerable(username: string, password: string) {
  const queryStr = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`

  // Tautology check
  const isTautology = /'\s*OR\s*'1'\s*=\s*'1/i.test(username)
  const hasCommentInjection = /--/.test(username)

  if (isTautology || hasCommentInjection) {
    return {
      rows: mockDB.users,
      queryStr,
      breached: true,
      rowCount: mockDB.users.length
    }
  }

  const rows = mockDB.users.filter(u => u.username === username)
  return { rows, queryStr, breached: false, rowCount: rows.length }
}

export function runSafe(username: string, password: string) {
  // Parameterized — input treated as literal data only
  const rows = mockDB.users.filter(
    u => u.username === username && u.password === password
  )
  return {
    rows,
    queryStr: `SELECT * FROM users WHERE username = ? AND password = ?`,
    breached: false,
    rowCount: rows.length
  }
}
```

Create equivalent files for `blind.ts`, `timeBased.ts`, and `errorBased.ts`:

- **`blind.ts`** — returns only a boolean (user exists: yes/no), no row data
- **`timeBased.ts`** — returns a `delayMs` value the UI uses to fake a slow response with `setTimeout`
- **`errorBased.ts`** — returns a fake error string containing DB metadata (version, table names) when attack is detected

### 5d. Create the main engine — `lib/engine/queryEngine.ts`

```ts
import { runVulnerable as classicVuln, runSafe } from './scenarios/classic'
import { runVulnerable as blindVuln } from './scenarios/blind'
import { runVulnerable as timeVuln } from './scenarios/timeBased'
import { runVulnerable as errorVuln } from './scenarios/errorBased'

export type ScenarioType = 'classic' | 'blind' | 'time-based' | 'error-based'

export function runVulnerable(scenario: ScenarioType, username: string, password: string) {
  switch (scenario) {
    case 'classic':    return classicVuln(username, password)
    case 'blind':      return blindVuln(username, password)
    case 'time-based': return timeVuln(username, password)
    case 'error-based':return errorVuln(username, password)
  }
}

export { runSafe }
```

---

## Step 6 — Static Content

Create `lib/content/explanations.ts` — this drives the ExplanationPanel on each
scenario page:

```ts
export const explanations = {
  classic: {
    label: 'Classic SQLi — Tautology Attack',
    attackDescription: `The payload breaks out of the string literal using a single quote,
      then appends an OR clause that always evaluates to true. The WHERE condition
      becomes meaningless and all rows are returned.`,
    whyItWorks: `The application concatenates user input directly into the SQL string.
      There is no distinction between data and code.`,
    howToFix: `Use parameterized queries. The database driver then treats all user
      input as a literal string value — it can never be interpreted as SQL code.`,
    vulnerableSnippet: `// ❌ Vulnerable
const query = "SELECT * FROM users WHERE username = '" + username + "'"
db.query(query)`,
    safeSnippet: `// ✅ Safe
db.query("SELECT * FROM users WHERE username = ?", [username])`,
    preventionMethods: ['Prepared Statements', 'Input Validation', 'WAF Rules'],
  },
  blind: { ... },
  'time-based': { ... },
  'error-based': { ... },
}
```

Also create `lib/content/scenarioMeta.ts` for the cards on the `/scenarios` browser page:

```ts
export const scenarioMeta = [
  {
    slug: 'classic',
    title: 'Classic SQLi',
    difficulty: 'Beginner',
    description: 'Bypass authentication using tautology-based payload injection.',
    icon: 'classic.svg',
  },
  {
    slug: 'blind',
    title: 'Blind SQLi',
    difficulty: 'Intermediate',
    description: 'Infer database structure without any visible error messages.',
    icon: 'blind.svg',
  },
  {
    slug: 'time-based',
    title: 'Time-Based SQLi',
    difficulty: 'Intermediate',
    description: 'Use artificial delays to confirm vulnerabilities covertly.',
    icon: 'time.svg',
  },
  {
    slug: 'error-based',
    title: 'Error-Based SQLi',
    difficulty: 'Advanced',
    description: 'Trigger database errors to leak schema and metadata.',
    icon: 'error.svg',
  },
]
```

---

## Step 7 — Global State with Zustand

Create `store/simulationStore.ts`:

```ts
import { create } from 'zustand'
import { ScenarioType } from '../lib/engine/queryEngine'
import { AttackType } from '../lib/engine/attackClassifier'

type SimulationState = {
  scenario: ScenarioType
  username: string
  password: string
  queryStr: string
  vulnResult: any | null
  safeResult: any | null
  attackType: AttackType
  breached: boolean
  isLoading: boolean   // for time-based delay simulation

  setScenario: (s: ScenarioType) => void
  setUsername: (v: string) => void
  setPassword: (v: string) => void
  setResults: (vuln: any, safe: any, query: string, attack: AttackType, breached: boolean) => void
  setLoading: (v: boolean) => void
  reset: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  scenario: 'classic',
  username: '',
  password: '',
  queryStr: '',
  vulnResult: null,
  safeResult: null,
  attackType: 'none',
  breached: false,
  isLoading: false,

  setScenario: (scenario) => set({ scenario, vulnResult: null, safeResult: null, breached: false }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
  setResults: (vulnResult, safeResult, queryStr, attackType, breached) =>
    set({ vulnResult, safeResult, queryStr, attackType, breached }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ username: '', password: '', vulnResult: null, safeResult: null, breached: false }),
}))
```

---

## Step 8 — Custom Hooks

### `hooks/useQuerySimulation.ts`

This hook fires every time the user changes an input. It runs both engines
and pushes results into the store:

```ts
import { useEffect } from 'react'
import { useSimulationStore } from '../store/simulationStore'
import { runVulnerable, runSafe } from '../lib/engine/queryEngine'
import { classifyAttack } from '../lib/engine/attackClassifier'

export function useQuerySimulation() {
  const { scenario, username, password, setResults, setLoading } = useSimulationStore()

  useEffect(() => {
    if (!username && !password) return

    const attack = classifyAttack(username)
    const safeResult = runSafe(username, password)

    if (scenario === 'time-based' && attack !== 'none') {
      setLoading(true)
      setTimeout(() => {
        const vulnResult = runVulnerable(scenario, username, password)
        setResults(vulnResult, safeResult, vulnResult.queryStr, attack, vulnResult.breached)
        setLoading(false)
      }, 2500)
    } else {
      const vulnResult = runVulnerable(scenario, username, password)
      setResults(vulnResult, safeResult, vulnResult.queryStr, attack, vulnResult.breached)
    }
  }, [username, password, scenario])
}
```

---

## Step 9 — Build the Components

Build components in this order — each one depends on the previous:

### Order

```
1. layout/Navbar.tsx          — navigation links between all pages
2. layout/Sidebar.tsx         — step-by-step guide for simulation pages
3. scenarios/InputPanel.tsx   — controlled inputs, wired to store
4. scenarios/QueryVisualizer  — reads queryStr + tokens from store, renders colored spans
5. scenarios/ResultPanel.tsx  — split view, reads vulnResult + safeResult
6. scenarios/ExplanationPanel — reads attackType, renders matching explanation
7. scenarios/SuccessBanner    — conditionally renders when breached === true
8. landing/* components       — HeroSection, AttackTypeGrid, HowItWorksSection
9. learn/* components         — TopicCard, CodeBlock, ComparisonTable
10. playground/* components   — SchemaViewer, QueryInput, PlaygroundResult
```

### InputPanel notes
- Controlled inputs — `onChange` calls `setUsername` / `setPassword` on the store
- No form submission needed — simulation runs reactively via the hook
- Include a "Reset" button that calls `store.reset()`
- Show a subtle red border when `breached === true`

### QueryVisualizer notes
- Map the `Token[]` array from `tokenizer.ts` to `<span>` elements
- Each token type gets a CSS class with the corresponding color
- Animate the injected token with a pulse/glow effect using Framer Motion
- Show the raw query string in a monospace code block below the highlighted version

### ResultPanel notes
- Two columns: left panel (red border) = vulnerable result, right panel (green border) = safe result
- Show row count returned
- For the vulnerable side — if `breached`, show the full user table dump
- For the safe side — always show "0 rows returned" or "Login failed"
- For time-based — show a loading spinner on the vulnerable side during the delay

---

## Step 10 — Build the Pages

### `app/page.tsx` — Landing

Compose: `HeroSection` → `AttackTypeGrid` → `HowItWorksSection`

The hero should have a large heading, a one-line description of the platform,
and two CTAs: "Start Simulating" → `/scenarios` and "Learn the Theory" → `/learn`.

Include a subtle animated background — a slowly scrolling fake SQL query stream works
well here using Framer Motion's `animate` with `repeat: Infinity`.

### `app/scenarios/page.tsx` — Scenario Browser

Map over `scenarioMeta` and render a `ScenarioCard` for each.
Each card links to `/scenarios/[slug]`.

### `app/scenarios/[type]/page.tsx` — Simulation

This is the most important page. Structure:

```tsx
export default function ScenarioPage({ params }) {
  // Set scenario in store based on params.type
  // Mount useQuerySimulation hook

  return (
    <div className="grid grid-cols-[280px_1fr]">
      <AttackStepsSidebar scenario={params.type} />
      <main>
        <InputPanel />
        <QueryVisualizer />
        <ResultPanel />
        <ExplanationPanel />
        {breached && <SuccessBanner />}
      </main>
    </div>
  )
}
```

### `app/learn/page.tsx` — Learning Hub

Grid of `TopicCard` components. Topics should map to your presentation sections:
intro, attack types (×4), detection techniques, prevention methods, cryptography's role.

### `app/learn/[topic]/page.tsx` — Topic Deep Dive

Long-form static content page. Use `learnTopics.ts` as the data source.
Render `CodeBlock` comparisons and a `PreventionChecklist` at the bottom.

### `app/playground/page.tsx` — Sandbox

Three-column layout:
- Left: `SchemaViewer` — shows fake table names, column names, row counts
- Center: `QueryInput` — free-form text area + "Run" button
- Bottom: `PlaygroundResult` — output table or error message

The playground runs through the same `queryEngine` but in a less guided way.
Parse the input to detect which table is being targeted and route accordingly.

---

## Step 11 — Styling & Polish

### Tailwind Config

Add custom colors to `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      'bg-base': '#0a0a0f',
      'bg-panel': '#111118',
      'border-dim': '#1e1e2e',
      'accent-red': '#ff4444',
      'accent-green': '#00ff88',
      'accent-blue': '#4488ff',
    },
    fontFamily: {
      mono: ['var(--font-mono)'],
      sans: ['var(--font-sans)'],
    }
  }
}
```

### Animations to add with Framer Motion

- **Landing** — hero text fade-in on mount
- **ScenarioCard** — hover lift effect
- **QueryVisualizer** — injected token pulses red when attack is detected
- **SuccessBanner** — slides down from top when breach triggers
- **ResultPanel** — vulnerable side shakes briefly on breach
- **Time-based scenario** — progress bar fills during the fake delay

---

## Step 12 — Run and Test

```bash
npm run dev
```

Test each scenario manually with these payloads:

| Scenario | Test Input (username field) |
|---|---|
| Classic | `' OR '1'='1` |
| Classic | `admin'--` |
| Blind | `admin' AND 1=1--` |
| Blind | `admin' AND 1=2--` |
| Time-Based | `'; WAITFOR DELAY '0:0:5'--` |
| Error-Based | `' AND 1=CONVERT(int, @@version)--` |

Verify that:
- Vulnerable side returns data / simulates the attack
- Safe side always returns 0 rows
- QueryVisualizer highlights the injected portion in red
- ExplanationPanel shows the correct content for each attack type
- SuccessBanner appears only when `breached === true`

---

## Step 13 — Build for Production

```bash
npm run build
npm run start
```

Or deploy to Vercel:

```bash
npx vercel
```

No environment variables needed — the entire app is frontend-only with no external
API calls or database connections.

---

## Common Pitfalls

- **Don't mutate `mockDB` directly.** All query functions must be pure — filter and
  return, never push or splice.
- **Keep the engine and UI fully decoupled.** Engine files import only from `lib/db/`,
  never from components or the store.
- **Zustand state resets on hard refresh.** This is intentional — each session starts
  fresh. Don't add persistence.
- **Time-based scenario:** The `setTimeout` delay must be cleared on component unmount
  to prevent state updates on an unmounted component. Use a `useRef` to store the
  timeout ID and clear it in the `useEffect` cleanup.

---

## Optional Extensions (Post-MVP)

- **CTF Mode** — hide `FLAG{...}` values in the secrets table, challenge users to
  extract them using the correct attack type
- **WAF Challenge** — add a filter layer between InputPanel and the engine that
  blocks common payloads, force users to find bypass techniques
- **Leaderboard** — track which scenarios a user has completed using `localStorage`
- **PhishGuard crossover** — wire in an ML-style classifier (rule-based on frontend)
  that scores the injected payload for severity
