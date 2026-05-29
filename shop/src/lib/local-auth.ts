export interface LocalUser {
  id: string
  email: string
  name: string
}

interface StoredUser extends LocalUser {
  password: string
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('_users') ?? '[]')
  } catch {
    return []
  }
}

export function localSignUp(email: string, password: string, name: string): string | null {
  const users = getStoredUsers()
  if (users.find(u => u.email === email)) return '이미 가입된 이메일이에요'
  const user: StoredUser = { id: crypto.randomUUID(), email, name, password }
  users.push(user)
  localStorage.setItem('_users', JSON.stringify(users))
  localStorage.setItem('_session', JSON.stringify({ id: user.id, email, name }))
  window.dispatchEvent(new Event('auth-change'))
  return null
}

export function localSignIn(email: string, password: string): string | null {
  const users = getStoredUsers()
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) return '이메일 또는 비밀번호가 틀렸어요'
  localStorage.setItem('_session', JSON.stringify({ id: user.id, email: user.email, name: user.name }))
  window.dispatchEvent(new Event('auth-change'))
  return null
}

export function localSignOut() {
  localStorage.removeItem('_session')
  window.dispatchEvent(new Event('auth-change'))
}

export function localCreateSession(email: string, name: string) {
  localStorage.setItem('_session', JSON.stringify({ id: 'admin-' + email, email, name }))
  window.dispatchEvent(new Event('auth-change'))
}

export function getLocalUser(): LocalUser | null {
  if (typeof window === 'undefined') return null
  try {
    const s = localStorage.getItem('_session')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}
