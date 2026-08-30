import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { OnboardingRoute } from './components/auth/OnboardingRoute'

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
import ProEntranceTest from './pages/pro/ProEntranceTest'
import ProEntranceResult from './pages/pro/ProEntranceResult'
import ProLevelSelect from './pages/pro/ProLevelSelect'
import ProProblems from './pages/pro/ProProblems'
import ProDebugWorkspace from './pages/pro/ProDebugWorkspace'
import ProReviewResults from './pages/pro/ProReviewResults'

// Contests, Exams & Learn Concepts
import BattleLobby from './pages/BattleLobby'
import BattleRoom from './pages/BattleRoom'
import ConceptLearn from './pages/ConceptLearn'
import PromotionExam from './pages/PromotionExam'

// Admin (shared-password gate, separate from the Firebase auth)
import { AdminGate } from './components/admin/AdminGate'
import AdminDashboard from './pages/admin/AdminDashboard'

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
          <OnboardingRoute>
            <HomeDashboard />
          </OnboardingRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <OnboardingRoute>
            <HomeDashboard />
          </OnboardingRoute>
        }
      />

      {/* Global Problem List */}
      <Route
        path="/problems"
        element={
          <OnboardingRoute>
            <ProblemListHome />
          </OnboardingRoute>
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
          <OnboardingRoute>
            <StudentProblems />
          </OnboardingRoute>
        }
      />
      <Route
        path="/student/practice/:id"
        element={
          <OnboardingRoute>
            <StudentWorkspace />
          </OnboardingRoute>
        }
      />
      <Route
        path="/practice/:id"
        element={
          <OnboardingRoute>
            <StudentWorkspace />
          </OnboardingRoute>
        }
      />
      <Route
        path="/student/results/:id"
        element={
          <OnboardingRoute>
            <StudentResults />
          </OnboardingRoute>
        }
      />
      <Route
        path="/results/:id"
        element={
          <OnboardingRoute>
            <StudentResults />
          </OnboardingRoute>
        }
      />

      {/* ================= AI-ASSISTED PRO TRACK ================= */}
      <Route
        path="/pro/entrance-test"
        element={
          <ProtectedRoute>
            <ProEntranceTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/entrance-result"
        element={
          <ProtectedRoute>
            <ProEntranceResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/level-select"
        element={
          <OnboardingRoute>
            <ProLevelSelect />
          </OnboardingRoute>
        }
      />
      <Route
        path="/pro/problems"
        element={
          <OnboardingRoute>
            <ProProblems />
          </OnboardingRoute>
        }
      />
      <Route
        path="/pro/debug/:id"
        element={
          <OnboardingRoute>
            <ProDebugWorkspace />
          </OnboardingRoute>
        }
      />
      <Route
        path="/pro/practice/:id"
        element={
          <OnboardingRoute>
            <ProDebugWorkspace />
          </OnboardingRoute>
        }
      />
      <Route
        path="/pro/results/:id"
        element={
          <OnboardingRoute>
            <ProReviewResults />
          </OnboardingRoute>
        }
      />

      {/* Profile, Contests, Concepts & Exams */}
      <Route
        path="/profile"
        element={
          <OnboardingRoute>
            <Profile />
          </OnboardingRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <OnboardingRoute>
            <Profile />
          </OnboardingRoute>
        }
      />
      <Route
        path="/contest"
        element={
          <OnboardingRoute>
            <BattleLobby />
          </OnboardingRoute>
        }
      />
      <Route path="/battle" element={<Navigate to="/contest" replace />} />
      <Route
        path="/battle/:roomId"
        element={
          <OnboardingRoute>
            <BattleRoom />
          </OnboardingRoute>
        }
      />
      <Route
        path="/learn/:conceptId"
        element={
          <OnboardingRoute>
            <ConceptLearn />
          </OnboardingRoute>
        }
      />
      <Route
        path="/exam"
        element={
          <OnboardingRoute>
            <PromotionExam />
          </OnboardingRoute>
        }
      />

      {/* Admin — its own password wall, not Firebase-gated */}
      <Route
        path="/admin"
        element={
          <AdminGate>
            <AdminDashboard />
          </AdminGate>
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
