export const scenarioMeta = [
  {
    slug: 'classic',
    title: 'Classic SQLi',
    difficulty: 'Beginner' as const,
    description: 'Bypass authentication using tautology-based payload injection. The most fundamental attack — and still devastatingly effective.',
    icon: '🔑',
    color: 'blue',
    steps: [
      'Type a normal username in the input field',
      "Observe how the SQL query assembles in the Query Visualizer",
      "Now inject: ' OR '1'='1 as the username",
      "Watch the query logic collapse — all rows are returned",
      "Compare: safe parameterized query returns 0 rows",
    ],
  },
  {
    slug: 'blind',
    title: 'Blind SQLi',
    difficulty: 'Intermediate' as const,
    description: 'Infer database structure without any visible error messages, using binary true/false application responses as an oracle.',
    icon: '👁',
    color: 'amber',
    steps: [
      "Enter: admin' AND 1=1-- (true condition)",
      "The response confirms user exists",
      "Now enter: admin' AND 1=2-- (false condition)",
      "Response changes — confirming boolean oracle works",
      "Safe mode returns same response regardless",
    ],
  },
  {
    slug: 'time-based',
    title: 'Time-Based SQLi',
    difficulty: 'Intermediate' as const,
    description: 'Use artificial database delays to confirm vulnerabilities even when the response content is identical for all inputs.',
    icon: '⏱',
    color: 'violet',
    steps: [
      "Enter a normal username — response is instant",
      "Now inject: '; WAITFOR DELAY '0:0:3'--",
      "Watch the vulnerable side pause for 2.5 seconds",
      "The progress bar fills during the fake delay",
      "Safe side responds instantly regardless of payload",
    ],
  },
  {
    slug: 'error-based',
    title: 'Error-Based SQLi',
    difficulty: 'Advanced' as const,
    description: 'Trigger database type-conversion errors to leak schema metadata — version, table names, column types — directly in the response.',
    icon: '⚠',
    color: 'red',
    steps: [
      "Enter: ' AND 1=CONVERT(int, @@version)--",
      "The vulnerable query triggers a type-mismatch error",
      "DB version and schema are embedded in the error text",
      "Safe parameterized query raises no such error",
      "Never expose raw DB errors — always use generic messages",
    ],
  },
]

export type ScenarioMeta = (typeof scenarioMeta)[number]
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
