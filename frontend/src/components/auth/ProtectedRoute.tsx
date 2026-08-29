import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactElement
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const authReady = useAuthStore((s) => s.authReady)
  const location = useLocation()

  // Wait for the first Firebase auth-state callback before deciding.
  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000000] text-[#E5DFC9]">
        <Loader2 size={20} className="animate-spin text-[#E5DFC9]/60" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}
