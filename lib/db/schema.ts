export type UserRow = {
  id: number
  username: string
  password: string
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
