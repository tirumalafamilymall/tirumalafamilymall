'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, LogOut, Package, UserCircle, Heart, Settings } from 'lucide-react'
import { loginUser, registerUser } from '@/lib/auth'
import { sendPasswordResetEmail, getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth'
import { app } from '@/lib/firebase'

export default function AccountPage() {
  const router = useRouter()
  const auth = getAuth(app)

  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [dbUser, setDbUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Form State
  const [mode,     setMode]     = useState<'login' | 'register'>('login')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const [form, setForm] = useState({ name: '', email: '', password: '' })

  // Check if user is already logged in & fetch their real name from DB
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        try {
          // Fetch the real DB user record to get the registered name
          const token = await user.getIdToken()
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            setDbUser(data.user)
          }
        } catch (e) {
          console.error('Failed to fetch DB user details')
        }
      }
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [auth])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await loginUser(form.email, form.password)
      } else {
        if (!form.name.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        await registerUser(form.name, form.email, form.password)
      }
    } catch (err: any) {
      const code = err.code || ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') setError('Invalid email or password')
      else if (code === 'auth/email-already-in-use') setError('An account with this email already exists')
      else if (code === 'auth/weak-password') setError('Password must be at least 6 characters')
      else if (code === 'auth/invalid-email') setError('Please enter a valid email address')
      else setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const token = await result.user.getIdToken()

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebase_token: token })
      })
      if (!res.ok) throw new Error('Failed to sync with server')
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') setError(err.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!form.email) return setError('Enter your email address first')
    try {
      await sendPasswordResetEmail(auth, form.email)
      setSuccess('Password reset email sent. Check your inbox.')
    } catch {
      setError('Failed to send reset email. Check the email address.')
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  // --- RENDER: LOGGED IN ACCOUNT DASHBOARD ---
  if (currentUser) {
    // Determine the best name to show (DB Name > Google Name > Fallback)
    const displayName = dbUser?.name || currentUser.displayName || 'Shopper'

    return (
      <div className="min-h-screen bg-[#f8f8f8] py-12 px-6">
        <div className="max-w-[800px] mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="heading-serif italic text-[36px]">My Account</h1>
          </div>
          
          {/* Premium Profile Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 mb-8 relative">
            <div className="h-32 bg-gradient-to-r from-red-900 to-black w-full"></div>
            <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 relative z-10">
              <div className="h-28 w-28 bg-white rounded-full p-1.5 shadow-lg shrink-0">
                <div className="h-full w-full bg-gray-50 rounded-full flex items-center justify-center overflow-hidden text-gray-300">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle size={64} strokeWidth={1} />
                  )}
                </div>
              </div>
              <div className="text-center sm:text-left mb-2">
                <h2 className="text-[24px] font-semibold text-gray-900 leading-tight">{displayName}</h2>
                <p className="text-gray-500 text-[14px] mt-1">{currentUser.email}</p>
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid sm:grid-cols-2 gap-5 mb-8">
            <Link href="/orders" className="bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all flex items-center gap-5 group">
              <div className="h-14 w-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-[16px] text-gray-900 mb-0.5">My Orders</h3>
                <p className="text-[13px] text-gray-500">Track & view purchases</p>
              </div>
            </Link>

            <button className="bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all flex items-center gap-5 group text-left opacity-60 cursor-not-allowed">
              <div className="h-14 w-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center">
                <Heart size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-[16px] text-gray-900 mb-0.5">Wishlist</h3>
                <p className="text-[13px] text-gray-500">Coming soon</p>
              </div>
            </button>

            <button className="bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all flex items-center gap-5 group text-left opacity-60 cursor-not-allowed">
              <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Settings size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-[16px] text-gray-900 mb-0.5">Settings</h3>
                <p className="text-[13px] text-gray-500">Coming soon</p>
              </div>
            </button>
            
            <button onClick={handleLogout} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all flex items-center gap-5 group text-left">
              <div className="h-14 w-14 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                <LogOut size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-[16px] text-gray-900 mb-0.5">Sign Out</h3>
                <p className="text-[13px] text-gray-500">Log out securely</p>
              </div>
            </button>
          </div>

        </div>
      </div>
    )
  }

  // --- RENDER: LOGIN / REGISTER FORM ---
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <img src="/logo.png" alt="Tirumala Family Mall" className="h-11 w-auto group-hover:scale-105 transition-transform" />
            <div className="text-left">
              <p className="text-[14px] font-bold tracking-[0.1em] uppercase text-gray-900 leading-none">Tirumala</p>
              <p className="text-[9.5px] tracking-[0.2em] text-red-500 uppercase leading-none mt-0.5">Family Mall</p>
            </div>
          </Link>
          <p className="text-[12.5px] text-gray-400 mt-5">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {/* Tab toggle */}
          <div className="grid grid-cols-2 bg-gray-50 rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={`py-2 text-[12.5px] font-medium rounded-lg transition-all duration-150
                  ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Google Button */}
          <button onClick={handleGoogleSignIn} disabled={loading}
            className="w-full py-3 bg-white border border-gray-200 text-gray-700 text-[13px] font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 mb-5 disabled:opacity-60">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[10.5px] font-semibold tracking-[0.12em] uppercase text-gray-500 mb-1.5">Full Name</label>
                <input type="text" name="name" placeholder="Your full name" value={form.name} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300 bg-white" />
              </div>
            )}

            <div>
              <label className="block text-[10.5px] font-semibold tracking-[0.12em] uppercase text-gray-500 mb-1.5">Email</label>
              <input type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300 bg-white" />
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold tracking-[0.12em] uppercase text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" placeholder="Enter password" value={form.password}
                  onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-[13px] outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300 bg-white" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right -mt-1">
                <button onClick={handleForgotPassword} className="text-[11.5px] text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {error && <p className="text-[12px] text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-[12px] text-green-600 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">{success}</p>}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3.5 bg-gray-900 text-white text-[13px] font-medium tracking-[0.06em] rounded-xl hover:bg-gray-800 transition-colors mt-1 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}