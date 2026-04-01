export type TokenType = 'keyword' | 'string' | 'injected' | 'normal' | 'comment'

export type Token = {
  text: string
  type: TokenType
}

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'INSERT', 'UPDATE',
  'DELETE', 'DROP', 'TABLE', 'UNION', 'ALL', 'NULL', 'IS', 'IN',
  'LIKE', 'BETWEEN', 'JOIN', 'ON', 'AS', 'ORDER', 'BY', 'GROUP',
  'HAVING', 'LIMIT', 'OFFSET', 'CREATE', 'ALTER', 'INTO', 'VALUES',
  'SET', 'SLEEP', 'WAITFOR', 'DELAY', 'CONCAT', 'CONVERT', 'CAST',
  'VERSION', 'DATABASE', 'SCHEMA', 'USER', '*'
]

export function tokenize(query: string, injectedPart: string): Token[] {
  const tokens: Token[] = []

  // Find where the injected part lives (case-insensitive)
  const injectedLower = injectedPart.toLowerCase()
  const queryLower = query.toLowerCase()
  const injectedIdx = injectedLower ? queryLower.indexOf(injectedLower) : -1

  // Split into pre-injection, injection, post-injection segments
  const segments: { text: string; isInjected: boolean }[] = []

  if (injectedIdx >= 0 && injectedPart.length > 0) {
    if (injectedIdx > 0) segments.push({ text: query.slice(0, injectedIdx), isInjected: false })
    segments.push({ text: query.slice(injectedIdx, injectedIdx + injectedPart.length), isInjected: true })
    const remaining = query.slice(injectedIdx + injectedPart.length)
    if (remaining) segments.push({ text: remaining, isInjected: false })
  } else {
    segments.push({ text: query, isInjected: false })
  }

  for (const seg of segments) {
    if (seg.isInjected) {
      tokens.push({ text: seg.text, type: 'injected' })
      continue
    }

    // Tokenize non-injected segments
    const raw = seg.text
    let i = 0
    while (i < raw.length) {
      // Comments: -- or /*
      if (raw[i] === '-' && raw[i + 1] === '-') {
        const end = raw.indexOf('\n', i)
        tokens.push({ text: raw.slice(i, end === -1 ? raw.length : end), type: 'comment' })
        i = end === -1 ? raw.length : end
        continue
      }
      if (raw[i] === '/' && raw[i + 1] === '*') {
        const end = raw.indexOf('*/', i)
        tokens.push({ text: raw.slice(i, end === -1 ? raw.length : end + 2), type: 'comment' })
        i = end === -1 ? raw.length : end + 2
        continue
      }
      // String literals
      if (raw[i] === "'") {
        const end = raw.indexOf("'", i + 1)
        tokens.push({ text: raw.slice(i, end === -1 ? raw.length : end + 1), type: 'string' })
        i = end === -1 ? raw.length : end + 1
        continue
      }
      // Words (keywords or normal)
      if (/\w/.test(raw[i])) {
        const match = raw.slice(i).match(/^\w+/)!
        const word = match[0]
        const type: TokenType = SQL_KEYWORDS.includes(word.toUpperCase()) ? 'keyword' : 'normal'
        tokens.push({ text: word, type })
        i += word.length
        continue
      }
      // Punctuation / whitespace — attach to previous normal or emit as normal
      if (tokens.length && tokens[tokens.length - 1].type === 'normal') {
        tokens[tokens.length - 1].text += raw[i]
      } else {
        tokens.push({ text: raw[i], type: 'normal' })
      }
      i++
    }
  }

  return tokens
}
