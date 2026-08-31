import React, { createContext, useContext, useState, useEffect } from 'react';

export type TrackType = 'student' | 'engineer';
export type LevelType = 'beginner' | 'intermediate' | 'pro';

interface TrackContextType {
  track: TrackType;
  level: LevelType;
  setTrack: (track: TrackType) => void;
  setLevel: (level: LevelType) => void;
}

const TrackContext = createContext<TrackContextType | undefined>(undefined);

export function TrackProvider({ children }: { children: React.ReactNode }) {
  const [track, setTrackState] = useState<TrackType>('student');
  const [level, setLevelState] = useState<LevelType>('beginner');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTrack = (localStorage.getItem('codesight_track') as TrackType) || 'student';
      const storedLevel = (localStorage.getItem('codesight_level') as LevelType) || 'beginner';
      setTrackState(storedTrack);
      setLevelState(storedLevel);
    }
  }, []);

  const setTrack = (t: TrackType) => {
    setTrackState(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('codesight_track', t);
    }
  };

  const setLevel = (l: LevelType) => {
    setLevelState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('codesight_level', l);
    }
  };

  return (
    <TrackContext.Provider value={{ track, level, setTrack, setLevel }}>
      {children}
    </TrackContext.Provider>
  );
}

export function useTrack() {
  const context = useContext(TrackContext);
  if (!context) {
    throw new Error('useTrack must be used within a TrackProvider');
  }
  return context;
}
