import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Core Navigation & Onboarding
import Landing from './pages/Landing'
import IntroHero from './pages/IntroHero'
import Auth from './pages/Auth'
import RoleSelect from './pages/RoleSelect'
import HomeDashboard from './pages/HomeDashboard'
import ProblemListHome from './pages/ProblemListHome'
import Profile from './pages/Profile'

// Student Track Pages
import StudentLevelSelect from './pages/student/StudentLevelSelect'
import StudentLevelTest from './pages/student/StudentLevelTest'
import StudentProblems from './pages/student/StudentProblems'
import StudentWorkspace from './pages/student/StudentWorkspace'
import StudentResults from './pages/student/StudentResults'

// AI-Assisted Professional Track Pages
import ProPromotionalEntry from './pages/pro/ProPromotionalEntry'
import ProPromotionalTest from './pages/pro/ProPromotionalTest'
import ProPromotionalResult from './pages/pro/ProPromotionalResult'
import ProLevelSelect from './pages/pro/ProLevelSelect'
import ProLevelTest from './pages/pro/ProLevelTest'
import ProProblems from './pages/pro/ProProblems'
import ProDebugWorkspace from './pages/pro/ProDebugWorkspace'
import ProReviewResults from './pages/pro/ProReviewResults'

// Contests, Exams & Learn Concepts
import BattleLobby from './pages/BattleLobby'
import BattleRoom from './pages/BattleRoom'
import ConceptLearn from './pages/ConceptLearn'
import PromotionExam from './pages/PromotionExam'

export default function App() {
  return (
    <Routes>
      {/* Landing & Intro Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<Landing />} />
      <Route path="/intro" element={<IntroHero />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/role-select" element={<RoleSelect />} />

      {/* Main Home Dashboard - Central Experience */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <HomeDashboard />
          </ProtectedRoute>
        }
      />

      {/* Global Problem List */}
      <Route
        path="/problems"
        element={
          <ProtectedRoute>
            <ProblemListHome />
          </ProtectedRoute>
        }
      />

      {/* ================= STUDENT TRACK ================= */}
      <Route
        path="/student/level-select"
        element={
          <ProtectedRoute>
            <StudentLevelSelect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/level-test"
        element={
          <ProtectedRoute>
            <StudentLevelTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/problems"
        element={
          <ProtectedRoute>
            <StudentProblems />
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
        path="/practice/:id"
        element={
          <ProtectedRoute>
            <StudentWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results/:id"
        element={
          <ProtectedRoute>
            <StudentResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/:id"
        element={
          <ProtectedRoute>
            <StudentResults />
          </ProtectedRoute>
        }
      />

      {/* ================= AI-ASSISTED PRO TRACK ================= */}
      <Route
        path="/pro/promotional-entry"
        element={
          <ProtectedRoute>
            <ProPromotionalEntry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/promotional-test"
        element={
          <ProtectedRoute>
            <ProPromotionalTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/promotional-result"
        element={
          <ProtectedRoute>
            <ProPromotionalResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/level-select"
        element={
          <ProtectedRoute>
            <ProLevelSelect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/level-test"
        element={
          <ProtectedRoute>
            <ProLevelTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/problems"
        element={
          <ProtectedRoute>
            <ProProblems />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/debug/:id"
        element={
          <ProtectedRoute>
            <ProDebugWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/practice/:id"
        element={
          <ProtectedRoute>
            <ProDebugWorkspace />
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

      {/* Profile, Contests, Concepts & Exams */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contest"
        element={
          <ProtectedRoute>
            <BattleLobby />
          </ProtectedRoute>
        }
      />
      <Route path="/battle" element={<Navigate to="/contest" replace />} />
      <Route
        path="/battle/:roomId"
        element={
          <ProtectedRoute>
            <BattleRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/:conceptId"
        element={
          <ProtectedRoute>
            <ConceptLearn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam"
        element={
          <ProtectedRoute>
            <PromotionExam />
          </ProtectedRoute>
        }
      />

      {/* Fallback Redirects */}
      <Route path="/student" element={<Navigate to="/student/problems" replace />} />
      <Route path="/pro" element={<Navigate to="/pro/problems" replace />} />
      <Route path="/settings" element={<Navigate to="/profile" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
