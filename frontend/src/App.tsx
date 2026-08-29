import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// The 10 Primary Pages strictly matching the specification:
import IntroHero from './pages/IntroHero' // PAGE 1: INTRO ANIMATION (3-step slideshow)
import Auth from './pages/Auth' // PAGE 2: LOGIN / REGISTER (Glassmorphic card)
import ProblemListHome from './pages/ProblemListHome' // PAGE 3: HOME (LeetCode Style Problem List)
import Profile from './pages/Profile' // PAGE 4: PROFILE PAGE (Stats, 6-Level Stepper, Weakness Profile)
import PracticeWorkspace from './pages/PracticeWorkspace' // PAGE 5: PRACTICE MODE (3-Column Draggable Monaco Workspace)
import PromotionExam from './pages/PromotionExam' // PAGE 6: EXAM MODE (30-Min Timed Promotion Test)
import ComplexityResults from './pages/ComplexityResults' // PAGE 7: RESULTS SCREEN (TC/SC Gap & Claude Feedback)
import ConceptLearn from './pages/ConceptLearn' // PAGE 8: CONCEPT LEARN PAGE (Deep Dive, YouTube Embed & Mini-checks)
import BattleLobby from './pages/BattleLobby' // PAGE 9: BATTLE LOBBY (Friend Match & Ranked ELO Match)
import BattleRoom from './pages/BattleRoom' // PAGE 10: BATTLE ROOM (Live Multiplayer Room & Podium)
import Landing from './pages/Landing' // Full About / Platform Overview
import RoleSelect from './pages/RoleSelect' // Role / Track Selector

export default function App() {
  return (
    <Routes>
      {/* PAGE 1: INTRO ANIMATION (First-time users) */}
      <Route path="/" element={<IntroHero />} />
      <Route path="/about" element={<Landing />} />

      {/* PAGE 2: LOGIN / REGISTER */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/role-select" element={<RoleSelect />} />

      {/* PAGE 3: HOME (Problem List - LeetCode Style - DEFAULT ACTIVE) */}
      <Route
        path="/problems"
        element={
          <ProtectedRoute>
            <ProblemListHome />
          </ProtectedRoute>
        }
      />
      <Route path="/home" element={<Navigate to="/problems" replace />} />

      {/* PAGE 4: PROFILE PAGE (Stats & Progress) */}
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

      {/* PAGE 5: PRACTICE MODE (Student / AI Engineer - 3-Column Draggable) */}
      <Route
        path="/practice/:id"
        element={
          <ProtectedRoute>
            <PracticeWorkspace />
          </ProtectedRoute>
        }
      />
      <Route path="/practice" element={<Navigate to="/problems" replace />} />

      {/* PAGE 6: EXAM MODE (Promotion Test - Full Screen 30-Min Timer) */}
      <Route
        path="/exam"
        element={
          <ProtectedRoute>
            <PromotionExam />
          </ProtectedRoute>
        }
      />

      {/* PAGE 7: RESULTS SCREEN (Relative TC/SC Complexity & AI Feedback) */}
      <Route
        path="/results/:id"
        element={
          <ProtectedRoute>
            <ComplexityResults />
          </ProtectedRoute>
        }
      />

      {/* PAGE 8: CONCEPT LEARN PAGE (Defect Class, YouTube Masterclass & Mini-checks) */}
      <Route
        path="/learn/:conceptId"
        element={
          <ProtectedRoute>
            <ConceptLearn />
          </ProtectedRoute>
        }
      />

      {/* PAGE 9: BATTLE LOBBY (Create/Join Friend Match & Ranked Match) */}
      <Route
        path="/contest"
        element={
          <ProtectedRoute>
            <BattleLobby />
          </ProtectedRoute>
        }
      />
      <Route path="/battle" element={<Navigate to="/contest" replace />} />

      {/* PAGE 10: BATTLE ROOM (Live Multiplayer IDE & Leaderboard) */}
      <Route
        path="/battle/:roomId"
        element={
          <ProtectedRoute>
            <BattleRoom />
          </ProtectedRoute>
        }
      />

      {/* Backward Compatibility Fallbacks */}
      <Route path="/student/*" element={<Navigate to="/problems" replace />} />
      <Route path="/pro/*" element={<Navigate to="/problems" replace />} />
      <Route path="/leaderboard" element={<Navigate to="/contest" replace />} />
      <Route path="/settings" element={<Navigate to="/profile" replace />} />
      <Route path="*" element={<Navigate to="/problems" replace />} />
    </Routes>
  )
}
