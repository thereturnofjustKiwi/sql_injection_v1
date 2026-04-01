# SQLi Sim — How to Use

An interactive, frontend-only SQL Injection simulation platform for learning and demonstration purposes.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
sqli-sim/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── scenarios/
│   │   ├── page.tsx              # Scenario browser (all 4 types)
│   │   └── [type]/page.tsx       # Individual scenario simulation
│   ├── playground/page.tsx       # Free-form SQL sandbox
│   └── learn/
│       ├── page.tsx              # Learning hub
│       └── [topic]/page.tsx      # Deep-dive articles
├── components/
│   ├── landing/                  # Landing page components
│   │   ├── HeroSection.tsx       # Hero + SQL matrix rain animation
│   │   ├── SQLMatrixRain.tsx     # Canvas-based matrix rain
│   │   ├── HowItWorksSection.tsx # 4-step guide
│   │   └── AttackTypeGrid.tsx    # 4 attack type cards
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── ScenarioSidebar.tsx
│   └── scenario/                 # Scenario simulation panels
│       ├── InputPanel.tsx        # Login form with injection input
│       ├── QueryVisualizer.tsx   # Live SQL token display
│       ├── ResultPanel.tsx       # Split vulnerable/safe results
│       └── ExplanationPanel.tsx  # Code comparison + fix
├── lib/
│   ├── db/
│   │   ├── mockDatabase.ts       # In-memory mock DB (4 tables)
│   │   └── schema.ts             # TypeScript types
│   ├── engine/
│   │   ├── queryEngine.ts        # Core simulation logic
│   │   ├── tokenizer.ts          # SQL token classifier
│   │   ├── attackClassifier.ts   # Detects attack type from input
│   │   └── scenarios/            # Per-scenario logic
│   └── content/
│       ├── scenarioMeta.ts       # Scenario titles, icons, descriptions
│       └── explanations.ts       # Deep-dive article content
├── store/
│   └── simulationStore.ts        # Zustand state (active simulation)
└── hooks/
    └── useQuerySimulation.ts     # Hook: run simulation on input change
```

---

## Mock Database

The platform simulates a fictional corporate database. All data is in-memory — nothing is stored or sent anywhere.

### Tables

#### `users` (4 rows)
| id | username  | password (hashed)              | role  | email              |
|----|-----------|-------------------------------|-------|--------------------|
| 1  | `admin`   | `$2b$10$xK9mNpLhashed...`     | admin | admin@corp.com     |
| 2  | `alice`   | `$2b$10$aB3cDehashed...`      | user  | alice@corp.com     |
| 3  | `bob`     | `$2b$10$fG7hIjhashed...`      | user  | bob@corp.com       |
| 4  | `charlie` | `$2b$10$kL1mNohashed...`      | user  | charlie@corp.com   |

#### `secrets` (4 rows)
| id | data                            |
|----|---------------------------------|
| 1  | `FLAG{sqli_classic_complete}`   |
| 2  | `FLAG{blind_injection_master}`  |
| 3  | `FLAG{time_based_extracted}`    |
| 4  | `FLAG{error_based_schema_leak}` |

#### `audit_log` (3 rows)
| id | action           | timestamp           |
|----|------------------|---------------------|
| 1  | `LOGIN_SUCCESS`  | 2024-01-15 09:12:00 |
| 2  | `LOGIN_FAILED`   | 2024-01-15 09:13:44 |
| 3  | `RECORD_ACCESS`  | 2024-01-15 09:15:02 |

---

## Pages & Features

### 🏠 Landing Page (`/`)
- Animated SQL matrix rain background (blue falling SQL keywords)
- "How It Works" 4-step guide
- "Four Classes of SQL Injection" scenario cards

---

### 🎯 Scenarios (`/scenarios`, `/scenarios/[type]`)

Four self-contained attack simulations. Each scenario has:

| Panel | What it shows |
|---|---|
| **Left Sidebar** | Attack description, step-by-step guide, test payload chips |
| **Input Panel** | Simulated login form — type payloads in the Username field |
| **Query Visualizer** | Live SQL that assembles as you type, color-coded tokens |
| **Result Panel** | Split view: Vulnerable (data leaks) vs Safe (parameterized) |
| **Explanation Panel** | Why it works, vulnerable code, safe code, prevention methods |

#### How to use a scenario

1. Go to `/scenarios` and pick an attack type
2. Read the **Attack Steps** in the left sidebar
3. Type a **normal username** first (e.g. `alice`) to see a safe query
4. Type an **injection payload** from the sidebar chips
5. Watch the Query Visualizer — injected tokens pulse red
6. Compare the **VULNERABLE** side (data leak) vs **SAFE** side (0 rows)
7. Scroll down to read the full explanation

#### Attack Types & Payloads

| Attack | Path | Key Payloads |
|---|---|---|
| **Classic SQLi** | `/scenarios/classic` | `' OR '1'='1`, `admin'--` |
| **Blind SQLi** | `/scenarios/blind` | `' AND 1=1--`, `' AND 1=2--` |
| **Time-Based SQLi** | `/scenarios/timebased` | `'; WAITFOR DELAY '0:0:3'--` |
| **Error-Based SQLi** | `/scenarios/errorbased` | `1 AND 1=CONVERT(int, @@version)--` |

---

### 🧪 Playground (`/playground`)

A free-form SQL sandbox. Write any SQL query and execute it against the mock database.

#### Features
- **Live syntax highlighting** — keywords, strings, danger words color-coded as you type
- **Threat level badge** — SAFE / MEDIUM / HIGH / CRITICAL updates instantly
- **Attack breakdown card** — appears when injection detected; shows attack class, what the attacker gains, and the exact fix
- **Query history** — last 15 queries with SAFE/MALICIOUS labels; click any to reload
- **Click-to-query schema** — click any table in the sidebar to auto-run `SELECT * FROM table`
- **Execution stats** — row count, execution time (time-based attacks show 2.5s+ delay)
- **Data leak highlighting** — `FLAG{}` and `LEAKED` rows highlighted in orange

#### Keyboard Shortcut
```
Ctrl + Enter  →  Run Query
```

#### Example Queries to Try

```sql
-- Normal queries
SELECT * FROM users
SELECT * FROM users WHERE username = 'alice'
SELECT * FROM users WHERE id = 2
SELECT id, username, role FROM users

-- Injections
SELECT * FROM users WHERE username = '' OR '1'='1
SELECT * FROM users WHERE username = 'admin'--
SELECT * FROM users UNION SELECT id, data, '', '', '' FROM secrets
SELECT * FROM users WHERE id = 1 AND 1=CONVERT(int, @@version)--
SELECT * FROM users WHERE username='a'; WAITFOR DELAY '0:0:5'--
SELECT * FROM users; DROP TABLE users--
```

---

### 📚 Learn (`/learn`, `/learn/[topic]`)

Deep-dive educational articles on each attack type and defense technique.

| Topic | Path |
|---|---|
| Classic SQL Injection | `/learn/classic-sqli` |
| Blind SQL Injection | `/learn/blind-sqli` |
| Time-Based Blind SQLi | `/learn/time-based` |
| Error-Based SQLi | `/learn/error-based` |
| Parameterized Queries | `/learn/parameterized` |
| Input Validation | `/learn/input-validation` |
| WAF Rules | `/learn/waf` |
| Least Privilege | `/learn/least-privilege` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| State | Zustand (in-memory, resets on refresh) |
| Fonts | Inter (UI), JetBrains Mono (code) |

---

## Important Notes

- **Frontend only** — no backend, no database, no API calls. Everything runs in the browser.
- **Educational purpose only** — payloads are simulated; no real SQL is executed.
- **No persistence** — state resets on page refresh (by design).
- **No environment variables required** — clone and run with just `npm install && npm run dev`.

---

## Deployment

The project is ready to deploy to Vercel with zero configuration:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or push to GitHub and connect to Vercel — it auto-detects Next.js and deploys on every push.
