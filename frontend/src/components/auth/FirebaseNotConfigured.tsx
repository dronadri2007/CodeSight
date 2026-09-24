/**
 * Full-screen guard shown when the Firebase web config is missing at build time.
 * Rendered by <MainContent> (App.tsx) whenever `useAuth().configured` is false,
 * i.e. one or more of the required VITE_FIREBASE_* vars was absent when Vite
 * inlined `import.meta.env`.
 */
export function FirebaseNotConfigured() {
  const missing = (
    [
      ['VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY],
      ['VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID],
      ['VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID],
    ] as const
  )
    .filter(([, v]) => !v)
    .map(([k]) => k);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#0B0A0F] text-[#F5EFE6] p-8 text-center">
      <h1 className="text-lg font-bold">Sign-in isn't configured</h1>
      <p className="text-xs text-[#AAA2B5] max-w-md">
        Set these in <code>frontend/.env.local</code> (and the deploy environment), then rebuild:
      </p>
      <pre className="text-xs text-[#FCA5A5] whitespace-pre-wrap">
        {missing.join('\n') || 'all present — check the browser console for the underlying error'}
      </pre>
    </div>
  );
}

export default FirebaseNotConfigured;
