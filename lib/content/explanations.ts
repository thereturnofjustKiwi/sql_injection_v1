export const explanations = {
  classic: {
    label: 'Classic SQLi — Tautology Attack',
    attackDescription: `The payload breaks out of the string literal using a single quote, then appends an OR clause that always evaluates to true. The WHERE condition becomes meaningless and the database returns every row.`,
    whyItWorks: `The application concatenates user input directly into the SQL string with no boundary between data and code. The database engine receives and executes whatever logic the attacker embedded.`,
    howToFix: `Use parameterized queries (prepared statements). The database driver treats all user input as a literal string value — it can never be interpreted as SQL logic, regardless of what it contains.`,
    vulnerableSnippet: `// ❌ Vulnerable — string concatenation
const query = "SELECT * FROM users WHERE username = '" + username + "'"
db.query(query)`,
    safeSnippet: `// ✅ Safe — parameterized query
db.query("SELECT * FROM users WHERE username = ?", [username])`,
    preventionMethods: ['Prepared Statements', 'Input Validation', 'Least Privilege DB User', 'WAF Rules'],
    payloads: [`' OR '1'='1`, `admin'--`, `' OR 1=1--`],
  },
  blind: {
    label: 'Blind SQLi — Boolean Inference',
    attackDescription: `The attacker injects boolean conditions and infers database structure from whether the application behaves "true" or "false" — no data is ever directly returned. By testing AND 1=1 (true) vs AND 1=2 (false), the attacker maps out the database one bit at a time.`,
    whyItWorks: `The application's response changes subtly based on whether the injected condition is true or false. Even with no visible error, the attacker gets a binary oracle they can query systematically.`,
    howToFix: `Parameterized queries eliminate injection entirely. Additionally, make error responses uniform — do not leak any information through differential behavior.`,
    vulnerableSnippet: `// ❌ Vulnerable — boolean leak via behavior
const exists = db.query("SELECT COUNT(*) FROM users WHERE username = '" + username + "'")
res.send(exists > 0 ? "User found" : "Not found")`,
    safeSnippet: `// ✅ Safe — parameterized, uniform response
const exists = db.query("SELECT COUNT(*) FROM users WHERE username = ?", [username])
res.send("Login processed")`,
    preventionMethods: ['Prepared Statements', 'Uniform Error Responses', 'Rate Limiting', 'Intrusion Detection'],
    payloads: [`admin' AND 1=1--`, `admin' AND 1=2--`, `' OR 1=1--`],
  },
  'time-based': {
    label: 'Time-Based Blind SQLi',
    attackDescription: `The attacker injects a SLEEP() or WAITFOR DELAY command into the query. If the database pauses before responding, the injection succeeded. This works even when the page returns identical content for true and false conditions.`,
    whyItWorks: `The database executes the injected timing function as part of the query. The application has no way to distinguish a slow query from a timed injection — it simply waits.`,
    howToFix: `Parameterized queries prevent execution of injected functions. Also set strict database query timeouts and monitor for anomalously slow queries.`,
    vulnerableSnippet: `// ❌ Vulnerable — timing oracle
const query = "SELECT * FROM users WHERE username = '" + username + "'"
// Attacker injects: '; WAITFOR DELAY '0:0:5'--`,
    safeSnippet: `// ✅ Safe — timing injection impossible
db.query("SELECT * FROM users WHERE username = ?", [username])
// WAITFOR DELAY is treated as a literal string, never executed`,
    preventionMethods: ['Prepared Statements', 'Query Timeout Limits', 'Anomaly Detection', 'DB Activity Monitoring'],
    payloads: [`'; WAITFOR DELAY '0:0:5'--`, `'; SLEEP(5)--`],
  },
  'error-based': {
    label: 'Error-Based SQLi — Schema Extraction',
    attackDescription: `The attacker crafts a query that triggers a database error containing useful metadata — version numbers, table names, column types — then reads the error message directly from the response.`,
    whyItWorks: `The application exposes raw database error messages. CONVERT(int, @@version) forces a type-mismatch error; SQL Server includes the value of @@version in the error text, leaking it to the attacker.`,
    howToFix: `Never expose raw database errors to the client. Use parameterized queries to prevent injection, and return only generic error messages to users.`,
    vulnerableSnippet: `// ❌ Vulnerable — error leaks metadata
try {
  db.query("SELECT * FROM users WHERE id = " + id)
} catch (e) {
  res.send(e.message)  // Exposes DB version, table names, etc.
}`,
    safeSnippet: `// ✅ Safe — generic error, parameterized query
try {
  db.query("SELECT * FROM users WHERE id = ?", [id])
} catch (e) {
  res.send("An error occurred")  // Never expose e.message
}`,
    preventionMethods: ['Prepared Statements', 'Custom Error Pages', 'Disable Verbose DB Errors', 'Output Encoding'],
    payloads: [`' AND 1=CONVERT(int, @@version)--`, `' AND 1=CONVERT(int, (SELECT table_name FROM information_schema.tables))--`],
  },
}
