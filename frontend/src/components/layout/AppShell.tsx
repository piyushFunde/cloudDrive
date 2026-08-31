import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import UploadProgress from '../UploadProgress'

export default function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <TopBar />

        {/* Content view with custom scrollbar */}
        <main className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Persistent Upload Status Dashboard */}
      <UploadProgress />
    </div>
  )
}
