import React from 'react'
import { useParams } from 'react-router-dom'
import { shareService, LinkShareDto } from '../services/shareService'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Download, Cloud, KeyRound, ShieldAlert } from 'lucide-react'
import { formatBytes } from '../components/layout/Sidebar'
import { toast } from 'react-hot-toast'

export default function PublicSharePage() {
  const { token } = useParams<{ token: string }>()
  const [password, setPassword] = React.useState('')
  const [typedPassword, setTypedPassword] = React.useState('')
  const [validationError, setValidationError] = React.useState<string | null>(null)

  // Validate and load public link
  const linkQuery = useQuery<LinkShareDto>({
    queryKey: ['public-link', token, typedPassword],
    queryFn: () => shareService.accessPublicLink(token!, typedPassword || undefined),
    retry: false,
    enabled: !!token,
  })

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setTypedPassword(password)
  }

  // Handle password errors explicitly
  React.useEffect(() => {
    if (linkQuery.error) {
      const err = linkQuery.error as any
      const msg = err.response?.data?.message || 'Access Denied'
      setValidationError(msg)
    }
  }, [linkQuery.error])

  const link = linkQuery.data
  const isPasswordRequired = validationError === 'Incorrect password for this link' || (!link && !linkQuery.error && typedPassword === '')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 select-none">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl3 p-8 shadow-card relative overflow-hidden text-center">
        {/* Logo banner */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow mb-4 animate-pulse-soft">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white">Shared File Link</h1>
          <p className="text-xs text-text-secondary mt-1">CloudDrive Public Storage Download</p>
        </div>

        {/* Loading Spinner */}
        {linkQuery.isLoading && (
          <div className="flex justify-center py-6">
            <div className="spinner" />
          </div>
        )}

        {/* Case 1: Password entry form */}
        {((validationError && isPasswordRequired) || (linkQuery.error && (linkQuery.error as any).response?.status === 401)) && (
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <div className="bg-warning/10 border border-warning/20 p-3.5 rounded-xl text-left flex gap-3 mb-2">
              <ShieldAlert className="h-5 w-5 text-warning shrink-0" />
              <p className="text-[11px] text-text-secondary">
                This public share link is password protected. Enter the password below to download.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="label">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
              {validationError && (
                <p className="text-[10px] text-error mt-1">{validationError}</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full justify-center rounded-xl text-xs py-3.5">
              Unlock Access
            </button>
          </form>
        )}

        {/* Case 2: Validation succeeded or load done */}
        {link && (
          <div className="space-y-5">
            <div className="bg-background/40 border border-border p-4 rounded-xl flex flex-col items-center">
              <span className="text-xs font-bold text-white truncate max-w-[280px] mb-1.5" title={link.resource.name}>
                {link.resource.name}
              </span>
              <span className="badge badge-primary text-[10px]">
                {link.resource.type}
              </span>
            </div>

            {/* Click to Direct download trigger link */}
            <a
              href={`/api/files/local/download?key=users/null/files/${link.resource.id}/download&name=${encodeURIComponent(link.resource.name)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary w-full justify-center rounded-xl text-xs py-3.5 flex items-center gap-2 cursor-pointer"
              onClick={() => toast.success('Starting download...')}
            >
              <Download className="h-4 w-4" />
              <span>Download Resource</span>
            </a>
          </div>
        )}

        {/* Case 3: Permanent Failure/Expired link */}
        {linkQuery.error && !isPasswordRequired && (
          <div className="space-y-4">
            <div className="bg-error/10 border border-error/20 p-4 rounded-xl text-left flex gap-3">
              <ShieldAlert className="h-5 w-5 text-error shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">
                {validationError || 'This share token is invalid, expired, or revoked by the owner.'}
              </p>
            </div>
            <a href="/login" className="btn-secondary w-full justify-center rounded-xl text-xs py-2.5">
              Return to login
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
