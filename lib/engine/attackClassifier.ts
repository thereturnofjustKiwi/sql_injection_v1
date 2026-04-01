export type AttackType =
  | 'classic_tautology'
  | 'union_based'
  | 'blind_boolean'
  | 'time_based'
  | 'error_based'
  | 'comment_injection'
  | 'none'

export function classifyAttack(input: string): AttackType {
  const val = input.toUpperCase()

  if (/UNION\s+SELECT/i.test(input))                              return 'union_based'
  if (/SLEEP\s*\(|WAITFOR\s+DELAY/i.test(input))                 return 'time_based'
  if (/CONVERT\s*\(|CAST\s*\(/i.test(input) && /@@|version/i.test(input)) return 'error_based'
  if (/'?\s*OR\s*'?1'?\s*=\s*'?1|'\s*OR\s*1\s*=\s*1/i.test(input)) return 'classic_tautology'
  if (/AND\s+1\s*=\s*[12]/i.test(input))                         return 'blind_boolean'
  if (/--|#|\/\*/.test(input))                                    return 'comment_injection'

  void val
  return 'none'
}

export const attackLabels: Record<AttackType, string> = {
  classic_tautology: 'Classic Tautology',
  union_based:       'UNION-Based',
  blind_boolean:     'Blind Boolean',
  time_based:        'Time-Based',
  error_based:       'Error-Based',
  comment_injection: 'Comment Injection',
  none:              'No Attack Detected',
}
