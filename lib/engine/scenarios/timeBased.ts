import { mockDB } from '../../db/mockDatabase'

const FAKE_DELAY_MS = 2500

export function runVulnerable(username: string, _password: string) {
  const queryStr = `SELECT * FROM users WHERE username = '${username}'; WAITFOR DELAY '0:0:3'--`

  const hasTimeBased = /SLEEP\s*\(|WAITFOR\s+DELAY/i.test(username)

  if (hasTimeBased) {
    return {
      rows: mockDB.users.slice(0, 1),
      queryStr,
      injectedPart: username,
      breached: true,
      delayMs: FAKE_DELAY_MS,
      rowCount: 1,
    }
  }

  const rows = mockDB.users.filter(u => u.username === username)
  return { rows, queryStr, injectedPart: '', breached: false, delayMs: 0, rowCount: rows.length }
}

export function runSafe(username: string, _password: string) {
  const rows = mockDB.users.filter(u => u.username === username)
  return {
    rows,
    queryStr: `SELECT * FROM users WHERE username = ?`,
    injectedPart: '',
    breached: false,
    delayMs: 0,
    rowCount: rows.length,
  }
}
