import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import RoleSelect from './pages/RoleSelect'

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
      {/* Public & Onboarding */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/role-select" element={<RoleSelect />} />

      {/* Student Track Routes */}
      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/practice" element={<StudentPracticeLibrary />} />
      <Route path="/student/practice/:id" element={<StudentWorkspace />} />
      <Route path="/student/analysis/:id" element={<StudentAnalysisResult />} />
      <Route path="/student/learn/:conceptId" element={<StudentLearnConcept />} />
      <Route path="/student/learn/:conceptId/check" element={<StudentMicroCheck />} />
      <Route path="/student/progress" element={<StudentProgress />} />

      {/* Professional Track Routes */}
      <Route path="/pro" element={<Navigate to="/pro/dashboard" replace />} />
      <Route path="/pro/dashboard" element={<ProDashboard />} />
      <Route path="/pro/review/:id" element={<ProReviewWorkspace />} />
      <Route path="/pro/xray" element={<ProCodeXRay />} />
      <Route path="/pro/results/:id" element={<ProReviewResults />} />
      <Route path="/pro/versus" element={<ProAIVsHuman />} />
      <Route path="/pro/false-positive" element={<ProFalsePositive />} />

      {/* Shared & Arena */}
      <Route path="/battle" element={<MultiplayerLobby />} />
      <Route path="/battle/:roomId" element={<MultiplayerBattle />} />
      <Route path="/battle/:roomId/results" element={<MultiplayerResults />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />

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
