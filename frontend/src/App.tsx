import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BackgroundLayer } from './components/common/BackgroundLayer';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { WelcomePage } from './pages/WelcomePage';
import { DashboardPage } from './pages/DashboardPage';
import { PracticePage } from './pages/PracticePage';
import { ActiveReviewPage } from './pages/ActiveReviewPage';
import { AnalyzingPage } from './pages/AnalyzingPage';
import { ReviewResultsPage } from './pages/ReviewResultsPage';
import { LearnConceptPage } from './pages/LearnConceptPage';
import { ProgressPage } from './pages/ProgressPage';
import { BattlePage } from './pages/BattlePage';
import { BattleResultsPage } from './pages/BattleResultsPage';
import { AiVsYouPage } from './pages/AiVsYouPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isEditorRoute = location.pathname.startsWith('/review/') && !location.pathname.endsWith('/results') && !location.pathname.endsWith('/analyzing');
  const isBattleRoute = location.pathname === '/battle';

  // For active code editor and battle, keep height locked to screen viewport without global footer scroll
  const isFullscreenMode = isEditorRoute || isBattleRoute;

  return (
    <div className="min-h-screen flex flex-col relative text-on-surface">
      <BackgroundLayer />
      <Navbar />

      <div className={`flex-1 ${isFullscreenMode ? 'pt-16 overflow-hidden' : 'pt-16'}`}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/review/:exerciseId" element={<ActiveReviewPage />} />
          <Route path="/review/:exerciseId/analyzing" element={<AnalyzingPage />} />
          <Route path="/review/:exerciseId/results" element={<ReviewResultsPage />} />
          <Route path="/learn/:conceptId" element={<LearnConceptPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/battle/results" element={<BattleResultsPage />} />
          <Route path="/ai-vs-you" element={<AiVsYouPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {!isFullscreenMode && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppLayout />
      </Router>
    </AppProvider>
  );
};

export default App;
