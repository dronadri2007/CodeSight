import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import RoleSelect from './pages/RoleSelect'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Student Track Pages
import StudentDashboard from './pages/student/StudentDashboard'
import StudentPracticeLibrary from './pages/student/StudentPracticeLibrary'
import StudentWorkspace from './pages/student/StudentWorkspace'
import StudentAnalysisResult from './pages/student/StudentAnalysisResult'
import StudentLearnConcept from './pages/student/StudentLearnConcept'
import StudentMicroCheck from './pages/student/StudentMicroCheck'
import StudentProgress from './pages/student/StudentProgress'

// Professional Track Pages
import ProDashboard from './pages/pro/ProDashboard'
import ProReviewWorkspace from './pages/pro/ProReviewWorkspace'
import ProCodeXRay from './pages/pro/ProCodeXRay'
import ProReviewResults from './pages/pro/ProReviewResults'
import ProAIVsHuman from './pages/pro/ProAIVsHuman'
import ProFalsePositive from './pages/pro/ProFalsePositive'

// Shared & Multiplayer Pages
import Leaderboard from './pages/shared/Leaderboard'
import Profile from './pages/shared/Profile'
import Settings from './pages/shared/Settings'
import MultiplayerLobby from './pages/shared/MultiplayerLobby'
import MultiplayerBattle from './pages/shared/MultiplayerBattle'
import MultiplayerResults from './pages/shared/MultiplayerResults'

export default function App() {
  return (
    <Routes>
      {/* Public Pages: ONLY visible before login */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      {/* Role Selection: Requires login */}
      <Route
        path="/role-select"
        element={
          <ProtectedRoute>
            <RoleSelect />
          </ProtectedRoute>
        }
      />

      {/* Protected Student Track Routes */}
      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/practice"
        element={
          <ProtectedRoute>
            <StudentPracticeLibrary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/practice/:id"
        element={
          <ProtectedRoute>
            <StudentWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/analysis/:id"
        element={
          <ProtectedRoute>
            <StudentAnalysisResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/learn/:conceptId"
        element={
          <ProtectedRoute>
            <StudentLearnConcept />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/learn/:conceptId/check"
        element={
          <ProtectedRoute>
            <StudentMicroCheck />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/progress"
        element={
          <ProtectedRoute>
            <StudentProgress />
          </ProtectedRoute>
        }
      />

      {/* Protected Professional Track Routes */}
      <Route path="/pro" element={<Navigate to="/pro/dashboard" replace />} />
      <Route
        path="/pro/dashboard"
        element={
          <ProtectedRoute>
            <ProDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/review/:id"
        element={
          <ProtectedRoute>
            <ProReviewWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/xray"
        element={
          <ProtectedRoute>
            <ProCodeXRay />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/results/:id"
        element={
          <ProtectedRoute>
            <ProReviewResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/versus"
        element={
          <ProtectedRoute>
            <ProAIVsHuman />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/false-positive"
        element={
          <ProtectedRoute>
            <ProFalsePositive />
          </ProtectedRoute>
        }
      />

      {/* Protected Shared & Arena Routes */}
      <Route
        path="/battle"
        element={
          <ProtectedRoute>
            <MultiplayerLobby />
          </ProtectedRoute>
        }
      />
      <Route
        path="/battle/:roomId"
        element={
          <ProtectedRoute>
            <MultiplayerBattle />
          </ProtectedRoute>
        }
      />
      <Route
        path="/battle/:roomId/results"
        element={
          <ProtectedRoute>
            <MultiplayerResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Legacy Fallbacks */}
      <Route path="/practice" element={<Navigate to="/student/practice" replace />} />
      <Route path="/practice/:id" element={<Navigate to="/student/practice/stu-01" replace />} />
      <Route path="/learn" element={<Navigate to="/student/learn/injection" replace />} />
      <Route path="/learn/:conceptId" element={<Navigate to="/student/learn/error-handling" replace />} />
      <Route path="/progress" element={<Navigate to="/student/progress" replace />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
