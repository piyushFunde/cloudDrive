import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { HardDrive, Share2, Star, Trash2, Cloud, LogOut, Search } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import StorageBar from '../StorageBar'

export default function Sidebar() {
  const { user, logout } = useAuthStore()

  const navItems = [
    { name: 'My Drive', path: '/drive', icon: HardDrive },
    { name: 'Shared', path: '/shared', icon: Share2 },
    { name: 'Starred', path: '/starred', icon: Star },
    { name: 'Trash', path: '/trash', icon: Trash2 },
    { name: 'Search', path: '/search', icon: Search },
  ]

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col h-full justify-between">
      {/* Brand Header */}
      <div className="p-6">
        <Link to="/drive" className="flex items-center gap-3 select-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-sm">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">CloudDrive</h1>
            <p className="text-xs text-text-muted">Secure Cloud Storage</p>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Storage and User Panel */}
      <div className="p-4 border-t border-border bg-background/30 space-y-4">
        {user && (
          <>
            {/* Storage Quota Usage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-text-secondary">Storage Used</span>
                <span className="text-white">
                  {formatBytes(user.storageUsed)} of 5 GB
                </span>
              </div>
              <StorageBar usage={user.storageUsed} limit={5 * 1024 * 1024 * 1024} />
            </div>

            {/* Profile Info */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-text-muted truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
export { formatBytes }
