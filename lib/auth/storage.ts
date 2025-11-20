const TOKEN_KEY = 'auth_access_token'
const USER_KEY = 'auth_user'

const isBrowser = () => typeof window !== 'undefined'

export function getAccessToken(): string | null {
  if (!isBrowser()) return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error('Error reading access token from storage:', error)
    return null
  }
}

export function setAccessToken(token: string | null) {
  if (!isBrowser()) return
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token)
    } else {
      window.localStorage.removeItem(TOKEN_KEY)
    }
  } catch (error) {
    console.error('Error writing access token to storage:', error)
  }
}

export function getUser<T = unknown>(): T | null {
  if (!isBrowser()) return null
  try {
    const item = window.localStorage.getItem(USER_KEY)
    if (!item) return null
    return JSON.parse(item) as T
  } catch (error) {
    console.error('Error reading user from storage:', error)
    return null
  }
}

export function setUser<T = unknown>(user: T | null) {
  if (!isBrowser()) return
  try {
    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(USER_KEY)
    }
  } catch (error) {
    console.error('Error writing user to storage:', error)
  }
}

export function clearAuth() {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error('Error clearing auth storage:', error)
  }
}

export function isAuthenticated() {
  return !!getAccessToken() && !!getUser()
}



