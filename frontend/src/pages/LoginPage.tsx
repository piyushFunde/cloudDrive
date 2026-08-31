import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Cloud, Lock, Mail, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoggingIn } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate('/drive')
    } catch {
      // Handled by hook errors
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 select-none">
      <div className="w-full max-w-md space-y-8 bg-surface border border-border rounded-xl3 p-8 shadow-card relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-accent/5 rounded-full blur-3xl" />

        {/* Logo and title */}
        <div className="flex flex-col items-center justify-center text-center relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow mb-4">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="text-xs text-text-secondary mt-1.5">
            Log in to manage and access your secure cloud files
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="space-y-1.5">
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="btn-primary w-full justify-center py-3 mt-2 rounded-xl text-sm"
          >
            {isLoggingIn ? 'Logging in...' : 'Log In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Register suggestion */}
        <div className="text-center text-xs text-text-secondary relative">
          <span>Don&apos;t have an account? </span>
          <Link to="/register" className="font-semibold text-primary hover:text-white transition-colors">
            Register for free
          </Link>
        </div>
      </div>
    </div>
  )
}
