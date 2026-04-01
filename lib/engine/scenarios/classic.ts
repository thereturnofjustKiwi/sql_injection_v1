import { mockDB } from '../../db/mockDatabase'

export function runVulnerable(username: string, password: string) {
  const queryStr = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`

  const isTautology      = /'?\s*OR\s*'?1'?\s*=\s*'?1|'\s*OR\s*1\s*=\s*1/i.test(username)
  const hasComment       = /--|#|\/\*/.test(username)
  const hasUnion         = /UNION\s+SELECT/i.test(username)

  if (isTautology || hasComment || hasUnion) {
    return {
      rows: mockDB.users,
      queryStr,
      injectedPart: username,
      breached: true,
      rowCount: mockDB.users.length,
    }
  }

  const rows = mockDB.users.filter(u => u.username === username)
  return { rows, queryStr, injectedPart: '', breached: false, rowCount: rows.length }
}

export function runSafe(username: string, password: string) {
  const rows = mockDB.users.filter(
    u => u.username === username && u.password === password
  )
  return {
    rows,
    queryStr: `SELECT * FROM users WHERE username = ? AND password = ?`,
    injectedPart: '',
    breached: false,
    rowCount: rows.length,
  }
}
