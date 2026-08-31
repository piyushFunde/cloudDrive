import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DrivePage from './pages/DrivePage'
import SharedPage from './pages/SharedPage'
import StarredPage from './pages/StarredPage'
import TrashPage from './pages/TrashPage'
import SearchPage from './pages/SearchPage'
import PublicSharePage from './pages/PublicSharePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/drive" replace /> : <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

        {/* Public share access — no auth required */}
        <Route path="/share/:token" element={<PublicSharePage />} />

        {/* Protected app routes */}
        <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="/drive" replace />} />
          <Route path="drive" element={<DrivePage />} />
          <Route path="drive/folder/:folderId" element={<DrivePage />} />
          <Route path="shared" element={<SharedPage />} />
          <Route path="starred" element={<StarredPage />} />
          <Route path="trash" element={<TrashPage />} />
          <Route path="search" element={<SearchPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/drive" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
