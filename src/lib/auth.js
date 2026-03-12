// Simple password hashing for internal use
// Uses SHA-256 with a salt prefix

const SALT_PREFIX = 'asr-profit-sim-'

export async function hashPassword(password) {
  const data = new TextEncoder().encode(SALT_PREFIX + password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password, hash) {
  const computedHash = await hashPassword(password)
  return computedHash === hash
}

// Session management
const SESSION_KEY = 'asr_session'

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    ...user,
    loginTime: Date.now()
  }))
}

export function getSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY)
    if (!data) return null

    const session = JSON.parse(data)
    // Sessions expire after 7 days
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - session.loginTime > SEVEN_DAYS) {
      clearSession()
      return null
    }
    return session
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
