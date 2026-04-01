import { MockDB } from './schema'

export const mockDB: MockDB = {
  users: [
    { id: 1, username: 'admin',   password: '$2b$10$xK9mNpLhashed1234abcde', role: 'admin', email: 'admin@corp.com'   },
    { id: 2, username: 'alice',   password: '$2b$10$aB3cDehashed5678fghij', role: 'user',  email: 'alice@corp.com'   },
    { id: 3, username: 'bob',     password: '$2b$10$fG7hIjhashed9012klmno', role: 'user',  email: 'bob@corp.com'     },
    { id: 4, username: 'charlie', password: '$2b$10$kL1mNohashed3456pqrst', role: 'user',  email: 'charlie@corp.com' },
  ],
  secrets: [
    { id: 1, data: 'FLAG{sqli_classic_complete}'   },
    { id: 2, data: 'FLAG{blind_injection_master}'  },
    { id: 3, data: 'FLAG{time_based_extracted}'    },
    { id: 4, data: 'FLAG{error_based_schema_leak}' },
  ],
  audit_log: [
    { id: 1, action: 'LOGIN_SUCCESS', timestamp: '2024-01-15 09:12:00' },
    { id: 2, action: 'LOGIN_FAILED',  timestamp: '2024-01-15 09:13:44' },
    { id: 3, action: 'RECORD_ACCESS', timestamp: '2024-01-15 09:15:02' },
  ],
}
