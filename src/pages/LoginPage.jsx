import { useState } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/admin')
    } catch (err) {
      setError('Invalid credentials. Access denied.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <a href="/" className="text-xl font-bold text-white font-display tracking-tight flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white group-hover:bg-brand-400 transition-colors">
            <i className="fas fa-bolt text-sm" />
          </div>
          AY&apos;s Store
        </a>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md animate-fade-up">
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-surface-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-surface-800 shadow-xl shadow-black/50 text-brand-500">
              <i className="fas fa-fingerprint text-2xl" />
            </div>
            <h1 className="text-3xl font-bold font-display text-white tracking-tight">Admin Gateway</h1>
            <p className="text-surface-400 text-sm mt-3">Enter your credentials to access the command center.</p>
          </div>

          <div className="bg-surface-900/50 backdrop-blur-xl rounded-[32px] border border-surface-800 p-8 shadow-2xl">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-3">
                <i className="fas fa-exclamation-circle" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-surface-300 mb-2 uppercase tracking-wider text-[10px]">Administrator Email</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@aysstore.com"
                    required
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-950 border border-surface-800 text-white font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-600"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-surface-300 mb-2 uppercase tracking-wider text-[10px]">Access Password</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-14 pl-12 pr-12 rounded-2xl bg-surface-950 border border-surface-800 text-white font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-600 tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 text-white h-14 rounded-2xl font-bold text-lg hover:bg-brand-400 hover:shadow-glow transition-all disabled:opacity-50 disabled:hover:bg-brand-500 disabled:hover:shadow-none mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-circle-notch fa-spin" /> Authenticating...
                  </span>
                ) : (
                  'Authorize Access'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm font-medium text-surface-600 mt-8">
            <i className="fas fa-shield-alt mr-2 text-surface-700" />
            Restricted area. Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  )
}