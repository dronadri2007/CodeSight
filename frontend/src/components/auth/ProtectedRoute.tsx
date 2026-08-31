import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Route gate. Renders `children` only for a signed-in user. While Firebase is
 * still resolving the initial auth state it shows a minimal loader; once we know
 * the user is signed out it stashes the attempted path in
 * `sessionStorage['codesight_next']` and redirects to `/`, where the landing /
 * AuthModal flow can send them back after login.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authReady, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      try {
        sessionStorage.setItem('codesight_next', location);
      } catch {
        /* private mode / storage disabled — redirect anyway */
      }
      setLocation('/');
    }
  }, [authReady, isAuthenticated, location, setLocation]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0A0F] text-[#AAA2B5] text-xs">
        Loading…
      </div>
    );
  }
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

export default ProtectedRoute;
