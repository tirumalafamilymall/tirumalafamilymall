'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginUser, registerUser } from '@/lib/auth'
import { sendPasswordResetEmail, getAuth } from 'firebase/auth'
import { app } from '@/lib/firebase'

export default function AccountPage() {
  const router = useRouter()
  const auth = getAuth(app)

  const [mode,     setMode]     = useState<'login' | 'register'>('login')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const [form, setForm] = useState({
    name:     '',
    email:    '',
    password: '',
  })

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
        router.push('/')
      } else {
        if (!form.name.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        await registerUser(form.name, form.email, form.password)
        router.push('/')
      }
    } catch (err: any) {
      // Firebase error codes → friendly messages
      const code = err.code || ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists')
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters')
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address')
      } else {
        setError(err.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError('Enter your email address first')
      return
    }
    try {
      await sendPasswordResetEmail(auth, form.email)
      setSuccess('Password reset email sent. Check your inbox.')
    } catch {
      setError('Failed to send reset email. Check the email address.')
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Tirumala Family Mall"
              className="h-11 w-auto group-hover:scale-105 transition-transform"
            />
            <div className="text-left">
              <p className="text-[14px] font-bold tracking-[0.1em] uppercase text-gray-900 leading-none">Tirumala</p>
              <p className="text-[9.5px] tracking-[0.2em] text-red-500 uppercase leading-none mt-0.5">Family Mall</p>
            </div>
          </Link>
          <p className="text-[12.5px] text-gray-400 mt-5">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">

          {/* Tab toggle */}
          <div className="grid grid-cols-2 bg-gray-50 rounded-xl p-1 mb-7">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={`py-2 text-[12.5px] font-medium rounded-lg transition-all duration-150
                  ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div className="space-y-4">

            {mode === 'register' && (
              <div>
                <label className="block text-[10.5px] font-semibold tracking-[0.12em] uppercase text-gray-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300 bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-[10.5px] font-semibold tracking-[0.12em] uppercase text-gray-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold tracking-[0.12em] uppercase text-gray-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-[13px] outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right -mt-1">
                <button
                  onClick={handleForgotPassword}
                  className="text-[11.5px] text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-[12px] text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Success */}
            {success && (
              <p className="text-[12px] text-green-600 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
                {success}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 bg-gray-900 text-white text-[13px] font-medium tracking-[0.06em] rounded-xl hover:bg-gray-800 transition-colors mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading
                ? 'Please wait...'
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>

          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-300">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <a
            href="https://wa.me/919966248223"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-3 border border-gray-200 rounded-xl text-[12.5px] font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contact us on WhatsApp
          </a>

        </div>
      </div>
    </div>
  )
}