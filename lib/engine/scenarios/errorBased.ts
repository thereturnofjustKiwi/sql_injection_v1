export function runVulnerable(username: string, _password: string) {
  const queryStr = `SELECT * FROM users WHERE username = '${username}'`

  const isErrorBased =
    /CONVERT\s*\(|CAST\s*\(/i.test(username) ||
    /@@version|@@datadir|information_schema/i.test(username)

  if (isErrorBased) {
    const fakeError =
      `ERROR 1105 (HY000): ` +
      `MSSQL Server version: 15.0.2000.5 (RTM) | ` +
      `DB: corp_db | ` +
      `Tables: users, secrets, audit_log, sessions | ` +
      `Schema leaked via CONVERT(int, @@version)`

    return {
      rows: [],
      queryStr,
      injectedPart: username,
      breached: true,
      errorMessage: fakeError,
      rowCount: 0,
    }
  }

  return {
    rows: [],
    queryStr,
    injectedPart: '',
    breached: false,
    errorMessage: null,
    rowCount: 0,
  }
}

export function runSafe(username: string, _password: string) {
  return {
    rows: [],
    queryStr: `SELECT * FROM users WHERE username = ?`,
    injectedPart: '',
    breached: false,
    errorMessage: null,
    rowCount: 0,
  }
}
