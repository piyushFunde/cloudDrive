import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  // Prevent double search boxes on Search Page
  const isSearchPage = location.pathname.startsWith('/search')

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get('search')?.toString() || ''
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
      {/* Search Header - Only shown if not already on search page */}
      {!isSearchPage ? (
        <form onSubmit={handleSearchSubmit} className="relative w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            name="search"
            placeholder="Search files, folders..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
          />
        </form>
      ) : (
        <div className="text-sm font-semibold text-white">Search Center</div>
      )}

      {/* Right Toolbar / Quick Avatar */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 border border-border bg-background/50 rounded-xl px-3 py-1.5">
            <span className="text-xs font-semibold text-white">{user.name}</span>
            <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
