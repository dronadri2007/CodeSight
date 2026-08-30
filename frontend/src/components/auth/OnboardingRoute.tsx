import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface OnboardingRouteProps {
  children: React.ReactElement
}

/**
 * Auth + onboarding gate for the "app" routes.
 *
 *   not authed              -> /auth
 *   authed, not onboarded   -> /role-select  (run the chooser + level/entrance flow)
 *   authed, onboarded       -> children
 *
 * Waits for the first Firestore users/{uid} snapshot (profileReady) before
 * deciding, so a returning onboarded user never flashes the chooser.
 */
export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const authReady = useAuthStore((s) => s.authReady)
  const profileReady = useAuthStore((s) => s.profileReady)
  const onboarded = useAuthStore((s) => s.onboarded)
  const location = useLocation()

  if (!authReady || (isAuthenticated && !profileReady)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000000] text-[#E5DFC9]">
        <Loader2 size={20} className="animate-spin text-[#E5DFC9]/60" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (!onboarded) {
    return <Navigate to="/role-select" replace />
  }

  return children
}
