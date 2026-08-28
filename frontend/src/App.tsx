import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Toast } from './components/ui/Overlays'
import { LoadingSkeleton } from './components/ui/LoadingSkeleton'

// Lazy load all pages
const Landing = React.lazy(() => import('./pages/Landing'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const ExerciseLibrary = React.lazy(() => import('./pages/ExerciseLibrary'))
const ReviewWorkspace = React.lazy(() => import('./pages/ReviewWorkspace'))
const ReviewResult = React.lazy(() => import('./pages/ReviewResult'))
const LearnConcept = React.lazy(() => import('./pages/LearnConcept'))
const MicroCheck = React.lazy(() => import('./pages/MicroCheck'))
const ProgressProfile = React.lazy(() => import('./pages/ProgressProfile'))
const ConceptLibrary = React.lazy(() => import('./pages/ConceptLibrary'))
const AIVsYou = React.lazy(() => import('./pages/AIVsYou'))
const FalsePositiveChallenge = React.lazy(() => import('./pages/FalsePositiveChallenge'))
const MultiplayerLobby = React.lazy(() => import('./pages/MultiplayerLobby'))
const MultiplayerBattle = React.lazy(() => import('./pages/MultiplayerBattle'))
const MultiplayerResults = React.lazy(() => import('./pages/MultiplayerResults'))
const CodeXRay = React.lazy(() => import('./pages/CodeXRay'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Settings = React.lazy(() => import('./pages/Settings'))
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  )
}

function ShellRoute({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Marketing */}
        <Route path="/" element={<Suspense fallback={<PageLoader />}><Landing /></Suspense>} />

        {/* App shell routes */}
        <Route path="/dashboard" element={<ShellRoute><Dashboard /></ShellRoute>} />
        <Route path="/practice" element={<ShellRoute><ExerciseLibrary /></ShellRoute>} />
        <Route path="/practice/:id" element={<ShellRoute><ReviewWorkspace /></ShellRoute>} />
        <Route path="/practice/:id/result" element={<ShellRoute><ReviewResult /></ShellRoute>} />
        <Route path="/learn" element={<ShellRoute><ConceptLibrary /></ShellRoute>} />
        <Route path="/learn/:conceptId" element={<ShellRoute><LearnConcept /></ShellRoute>} />
        <Route path="/learn/:conceptId/check" element={<ShellRoute><MicroCheck /></ShellRoute>} />
        <Route path="/progress" element={<ShellRoute><ProgressProfile /></ShellRoute>} />
        <Route path="/versus" element={<ShellRoute><AIVsYou /></ShellRoute>} />
        <Route path="/false-positives" element={<ShellRoute><FalsePositiveChallenge /></ShellRoute>} />
        <Route path="/battle" element={<ShellRoute><MultiplayerLobby /></ShellRoute>} />
        <Route path="/battle/:roomId" element={<ShellRoute><MultiplayerBattle /></ShellRoute>} />
        <Route path="/battle/:roomId/results" element={<ShellRoute><MultiplayerResults /></ShellRoute>} />
        <Route path="/xray" element={<ShellRoute><CodeXRay /></ShellRoute>} />
        <Route path="/leaderboard" element={<ShellRoute><Leaderboard /></ShellRoute>} />
        <Route path="/profile" element={<ShellRoute><Profile /></ShellRoute>} />
        <Route path="/settings" element={<ShellRoute><Settings /></ShellRoute>} />
        <Route path="/help" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
