import React, { useState } from 'react';
import { CodeSightIntro } from '../components/animations/CodeSightIntro';
import AuthLandingPage from './AuthLandingPage';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return <CodeSightIntro onComplete={() => setShowIntro(false)} />;
  }

  return <AuthLandingPage />;
}
