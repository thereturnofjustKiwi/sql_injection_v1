import { mockDB } from '../../db/mockDatabase'

export function runVulnerable(username: string, _password: string) {
  const queryStr = `SELECT COUNT(*) FROM users WHERE username = '${username}'`

  const hasInjection = /AND\s+1\s*=\s*[12]|'--|OR\s+1\s*=\s*1/i.test(username)
  const isTrue       = /AND\s+1\s*=\s*1/i.test(username)

  if (hasInjection) {
    const baseUser = username.split("'")[0]
    const userExists = mockDB.users.some(u => u.username === baseUser)
    return {
      rows: [],
      queryStr,
      injectedPart: username,
      breached: isTrue,
      userExists: isTrue ? userExists : false,
      booleanResult: isTrue,
      rowCount: 0,
    }
  }

  const exists = mockDB.users.some(u => u.username === username)
  return {
    rows: [],
    queryStr,
    injectedPart: '',
    breached: false,
    userExists: exists,
    booleanResult: exists,
    rowCount: 0,
  }
}

export function runSafe(username: string, _password: string) {
  const exists = mockDB.users.some(u => u.username === username)
  return {
    rows: [],
    queryStr: `SELECT COUNT(*) FROM users WHERE username = ?`,
    injectedPart: '',
    breached: false,
    userExists: exists,
    booleanResult: exists,
    rowCount: 0,
  }
}
