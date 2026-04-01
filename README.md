# SQLi Sim — SQL Injection Simulation Platform

> An interactive, educational platform for understanding SQL injection attacks through hands-on simulation. Built with Next.js 14, TypeScript, and Framer Motion.

![Platform Preview](public/next.svg)

---

## Overview

**SQLi Sim** is a fully frontend-based SQL injection learning tool. It lets you type real payloads, watch raw SQL queries assemble live, and see exactly how parameterized queries prevent attacks — all in a safe, sandboxed environment with no real database.

Designed for students, developers, and security enthusiasts who want to understand SQL injection by *doing*, not just reading.

---

## Features

- 🎯 **4 Attack Scenarios** — Classic, Blind Boolean, Time-Based, and Error-Based SQLi
- 🔬 **Live Query Visualizer** — watch the SQL build token-by-token as you type
- ⚔️ **Split Result Panel** — see vulnerable vs safe (parameterized) query side-by-side
- 🧪 **SQL Playground** — free-form sandbox with live syntax highlighting, query history, and attack classification
- 📚 **Learning Hub** — deep-dive articles on each attack type + defense strategies
- 🌧️ **Matrix Rain Background** — animated SQL keyword rain on the landing page
- ⚡ **Zero backend** — everything runs in the browser; no APIs, no database, no env vars

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/thereturnofjustKiwi/sql_injection_v1.git
cd sql_injection_v1
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with animated SQL matrix rain hero |
| `/scenarios` | Browse all 4 attack type scenario cards |
| `/scenarios/classic` | Classic SQLi — authentication bypass via tautology |
| `/scenarios/blind` | Blind SQLi — boolean inference without visible output |
| `/scenarios/timebased` | Time-Based SQLi — delay confirms vulnerability |
| `/scenarios/errorbased` | Error-Based SQLi — schema leak via type conversion errors |
| `/playground` | Free-form SQL sandbox with history and attack detection |
| `/learn` | Learning hub — topic cards linking to deep-dive articles |
| `/learn/[topic]` | Deep-dive article with code comparisons and defenses |

---

## Mock Database

All data is in-memory. Nothing is stored or sent anywhere.

### `users`
| id | username | role |
|----|----------|------|
| 1 | `admin` | admin |
| 2 | `alice` | user |
| 3 | `bob` | user |
| 4 | `charlie` | user |

### `secrets`
```
FLAG{sqli_classic_complete}
FLAG{blind_injection_master}
FLAG{time_based_extracted}
FLAG{error_based_schema_leak}
```

### `audit_log`
Three rows — `LOGIN_SUCCESS`, `LOGIN_FAILED`, `RECORD_ACCESS`

---

## Attack Scenarios — Quick Reference

### Classic SQLi
```sql
-- Type in Username field:
' OR '1'='1
admin'--
```
Bypasses the WHERE clause so all rows are returned, simulating authentication bypass.

### Blind SQLi
```sql
' AND 1=1--   -- True: data found
' AND 1=2--   -- False: no data
```
Infers database structure using binary true/false responses (no visible error).

### Time-Based SQLi
```sql
'; WAITFOR DELAY '0:0:3'--
```
The server-side delay (simulated 2.5s) confirms the endpoint is injectable even with no output.

### Error-Based SQLi
```sql
1 AND 1=CONVERT(int, @@version)--
```
Forces a type conversion error that leaks DB version, hostname, and schema metadata.

---

## Playground

Go to `/playground` for a free-form SQL sandbox:

```sql
-- Try these:
SELECT * FROM users
SELECT * FROM users WHERE username = 'alice'
SELECT * FROM users WHERE id = 2
SELECT * FROM users WHERE username = '' OR '1'='1
SELECT * FROM users UNION SELECT id, data, '', '', '' FROM secrets
SELECT * FROM users; DROP TABLE users--
```

**Keyboard shortcut:** `Ctrl + Enter` to run a query.

---

## Tech Stack

| | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| State | Zustand (in-memory) |
| Fonts | Inter · JetBrains Mono |

---

## Project Structure

```
sql_injection_v1/
├── app/                        # Next.js pages (App Router)
│   ├── page.tsx                # Landing page
│   ├── scenarios/[type]/       # Dynamic scenario pages
│   ├── playground/             # SQL sandbox
│   └── learn/[topic]/          # Deep-dive articles
├── components/
│   ├── landing/                # Hero, Matrix rain, How-it-works, Grid
│   ├── layout/                 # Navbar, Sidebar
│   └── scenarios/              # InputPanel, QueryVisualizer, ResultPanel, ExplanationPanel
├── lib/
│   ├── db/                     # Mock database + schema types
│   ├── engine/                 # Query engine, tokenizer, attack classifier
│   │   └── scenarios/          # Per-attack simulation logic
│   └── content/                # Scenario metadata + article content
├── store/                      # Zustand simulation store
├── hooks/                      # useQuerySimulation hook
└── howtouse.md                 # Detailed usage guide
```

---

## Deployment

Ready to deploy to Vercel — no environment variables required:

```bash
npm i -g vercel
vercel
```

Or connect the GitHub repo to [vercel.com](https://vercel.com) for automatic deploys on every push.

---

## Purpose

This project was built as a seminar demonstration to teach SQL injection concepts hands-on. It is **strictly educational** — no real SQL is executed, no real data is accessed, and all payloads are sandboxed entirely in the browser.

---

## License

MIT
