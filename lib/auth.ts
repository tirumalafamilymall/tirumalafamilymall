// lib/auth.ts
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { app } from './firebase'
import { API_BASE } from './config'

const auth = getAuth(app)

/* ─── Get current Firebase ID token (for API calls) ─── */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}

/* ─── Auth header helper ─── */
export async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/* ─── Register ─── */
export async function registerUser(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  const token = await cred.user.getIdToken()

  // Sync with backend
await fetch(`${API_BASE}/api/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ firebase_token: token }),
})

  return cred.user
}

/* ─── Login ─── */
export async function loginUser(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

/* ─── Logout ─── */
export async function logoutUser() {
  await signOut(auth)
}

/* ─── Admin login (returns JWT for admin API calls) ─── */
export async function loginAdmin(email: string, password: string): Promise<string> {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const token = await cred.user.getIdToken()

  // Verify admin role on backend
  const res = await fetch(`${API_BASE}/api/auth/verify-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  if (!res.ok) throw new Error('Not an admin account')

  localStorage.setItem('adminToken', token)
  return token
}

/* ─── Admin token helper ─── */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('adminToken')
}

export async function refreshAdminToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  const token = await user.getIdToken(true) // force refresh
  localStorage.setItem('adminToken', token)
  return token
}

export function logoutAdmin() {
  localStorage.removeItem('adminToken')
  signOut(auth)
}

/* ─── Auth state observer ─── */
export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}

export { auth }