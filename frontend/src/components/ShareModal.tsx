import React from 'react'
import { X, Send, Copy, Check, ShieldAlert, KeyRound } from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { useShare } from '../hooks/useShare'
import { toast } from 'react-hot-toast'

export default function ShareModal() {
  const { shareModalOpen, shareModalResourceId, shareModalResourceType, closeShareModal } = useUIStore()
  const { shareWithUser, createPublicLink, isSharing, isCreatingLink } = useShare()

  const [email, setEmail] = React.useState('')
  const [userRole, setUserRole] = React.useState<'VIEWER' | 'EDITOR'>('VIEWER')

  // Public link settings
  const [linkRole, setLinkRole] = React.useState<'VIEWER' | 'EDITOR'>('VIEWER')
  const [password, setPassword] = React.useState('')
  const [expiresInDays, setExpiresInDays] = React.useState<number | null>(null)
  const [generatedLink, setGeneratedLink] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  if (!shareModalOpen || !shareModalResourceId || !shareModalResourceType) return null

  const handleShareWithUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      await shareWithUser({
        resourceId: shareModalResourceId,
        resourceType: shareModalResourceType,
        targetEmail: email.trim(),
        role: userRole,
      })
      setEmail('')
    } catch {
      // Toast notification is managed by hook
    }
  }

  const handleCreatePublicLink = async () => {
    let expiresAt: string | undefined
    if (expiresInDays !== null) {
      const date = new Date()
      date.setDate(date.getDate() + expiresInDays)
      expiresAt = date.toISOString()
    }

    try {
      const res = await createPublicLink({
        resourceId: shareModalResourceId,
        resourceType: shareModalResourceType,
        role: linkRole,
        expiresAt,
        password: password.trim() || undefined,
      })
      setGeneratedLink(res.shareUrl)
    } catch {
      // Toast managed by hook
    }
  }

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="modal-overlay select-none" onClick={closeShareModal}>
      <div className="modal-panel animate-scale-in max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Share Options</h2>
            <p className="text-[11px] text-text-secondary uppercase tracking-wider">
              {shareModalResourceType} Permissions
            </p>
          </div>
          <button
            onClick={closeShareModal}
            className="p-1 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section 1: User sharing */}
        <div className="space-y-4">
          <form onSubmit={handleShareWithUser} className="space-y-2.5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wide">
              Share with People
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input py-2 text-xs flex-1"
                placeholder="Email address"
                required
              />
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="bg-surface border border-white/10 rounded-xl px-2 text-xs text-white focus:outline-none focus:border-primary/50"
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
              </select>
              <button
                type="submit"
                disabled={isSharing}
                className="btn-primary py-2 px-4 rounded-xl shrink-0 flex items-center justify-center"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          <div className="border-t border-white/5 my-4" />

          {/* Section 2: Public Share Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wide">
              Create Public Link
            </h3>

            {!generatedLink ? (
              <div className="bg-background/40 border border-border p-3.5 rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="label text-[11px]">Permission</label>
                    <select
                      value={linkRole}
                      onChange={(e) => setLinkRole(e.target.value as any)}
                      className="bg-surface border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus:border-primary/50 w-full"
                    >
                      <option value="VIEWER">Anyone can view</option>
                      <option value="EDITOR">Anyone can edit</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-[11px]">Expiry</label>
                    <select
                      value={expiresInDays === null ? 'none' : String(expiresInDays)}
                      onChange={(e) => {
                        const val = e.target.value
                        setExpiresInDays(val === 'none' ? null : Number(val))
                      }}
                      className="bg-surface border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus:border-primary/50 w-full"
                    >
                      <option value="none">No expiry</option>
                      <option value="1">1 Day</option>
                      <option value="7">7 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="relative text-xs">
                  <label className="label text-[11px] flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5 text-text-muted" />
                    <span>Optional Password</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input py-2 text-xs"
                    placeholder="Require password to download"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreatePublicLink}
                  disabled={isCreatingLink}
                  className="btn-primary w-full text-xs py-2 rounded-xl"
                >
                  Generate Share Link
                </button>
              </div>
            ) : (
              <div className="bg-background/60 border border-border p-3.5 rounded-xl space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="input py-2 text-xs text-text-secondary select-all flex-1 truncate bg-surface/50 cursor-default"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="btn-secondary py-2 px-3.5 flex items-center justify-center shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => setGeneratedLink(null)}
                  className="text-xs text-primary hover:text-white transition-colors"
                >
                  Create another public link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
