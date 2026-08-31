import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserLevel = 
  | 'Student Beginner'
  | 'Student Intermediate'
  | 'Student Pro'
  | 'AI Engineer Beginner'
  | 'AI Engineer Intermediate'
  | 'AI Engineer Pro';

export const LEVEL_TIERS: UserLevel[] = [
  'Student Beginner',
  'Student Intermediate',
  'Student Pro',
  'AI Engineer Beginner',
  'AI Engineer Intermediate',
  'AI Engineer Pro'
];

export type DefectClass = 
  | 'SQL Injection'
  | 'Unchecked Returns'
  | 'Race Conditions'
  | 'Infinite Loops'
  | 'Resource Leaks'
  | 'Type Mismatches';

export interface SubmissionRecord {
  id: string;
  problemId: string;
  title: string;
  score: number;
  date: string;
  mode: 'student' | 'engineer';
  userTimeComplexity: string;
  userSpaceComplexity: string;
  optimalTimeComplexity: string;
  optimalSpaceComplexity: string;
  feedback: string;
  defectClass: DefectClass;
}

export interface UserProfile {
  name: string;
  handle: string;
  avatar: string;
  level: UserLevel;
  levelIndex: number;
  xp: number;
  globalRank: number;
  streakDays: number;
  solvedCount: number;
  history: SubmissionRecord[];
  defectStats: Record<DefectClass, { successful: number; total: number }>;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Morgan',
  handle: '@alexm',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  level: 'Student Beginner',
  levelIndex: 0,
  xp: 2450,
  globalRank: 3,
  streakDays: 3,
  solvedCount: 12,
  history: [
    {
      id: 'sub-1',
      problemId: 'python-loops-medium',
      title: 'Normalize the readings',
      score: 100,
      date: '2026-08-28',
      mode: 'student',
      userTimeComplexity: 'O(N)',
      userSpaceComplexity: 'O(1)',
      optimalTimeComplexity: 'O(N)',
      optimalSpaceComplexity: 'O(1)',
      feedback: 'Excellent optimal solution! No unnecessary allocations made.',
      defectClass: 'Infinite Loops'
    },
    {
      id: 'sub-2',
      problemId: 'javascript-conditions-easy',
      title: 'Guard the threshold',
      score: 75,
      date: '2026-08-27',
      mode: 'student',
      userTimeComplexity: 'O(N²)',
      userSpaceComplexity: 'O(1)',
      optimalTimeComplexity: 'O(N)',
      optimalSpaceComplexity: 'O(1)',
      feedback: 'Correct output, but quadratic loop penalizes time complexity score.',
      defectClass: 'Unchecked Returns'
    }
  ],
  defectStats: {
    'SQL Injection': { successful: 4, total: 5 },
    'Unchecked Returns': { successful: 6, total: 8 },
    'Race Conditions': { successful: 2, total: 4 },
    'Infinite Loops': { successful: 7, total: 8 },
    'Resource Leaks': { successful: 3, total: 5 },
    'Type Mismatches': { successful: 5, total: 6 }
  }
};

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  login: (name: string) => void;
  logout: () => void;
  addSubmission: (sub: Omit<SubmissionRecord, 'id' | 'date'>) => void;
  promoteUserLevel: () => boolean;
  updateWeakness: (defect: DefectClass, success: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('codesight_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_PROFILE;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('codesight_authed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('codesight_user_profile', JSON.stringify(user));
  }, [user]);

  const login = (name: string) => {
    setUser(prev => ({ ...prev, name }));
    setIsAuthenticated(true);
    localStorage.setItem('codesight_authed', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('codesight_authed');
  };

  const addSubmission = (sub: Omit<SubmissionRecord, 'id' | 'date'>) => {
    const record: SubmissionRecord = {
      ...sub,
      id: `sub-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };

    setUser(prev => {
      const updatedHistory = [record, ...prev.history].slice(0, 20);
      const updatedStats = { ...prev.defectStats };
      const current = updatedStats[sub.defectClass] || { successful: 0, total: 0 };
      updatedStats[sub.defectClass] = {
        successful: current.successful + (sub.score >= 70 ? 1 : 0),
        total: current.total + 1
      };

      return {
        ...prev,
        xp: prev.xp + sub.score,
        solvedCount: prev.solvedCount + (sub.score >= 50 ? 1 : 0),
        history: updatedHistory,
        defectStats: updatedStats
      };
    });
  };

  const promoteUserLevel = (): boolean => {
    if (user.levelIndex < LEVEL_TIERS.length - 1) {
      const nextIndex = user.levelIndex + 1;
      setUser(prev => ({
        ...prev,
        levelIndex: nextIndex,
        level: LEVEL_TIERS[nextIndex]
      }));
      return true;
    }
    return false;
  };

  const updateWeakness = (defect: DefectClass, success: boolean) => {
    setUser(prev => {
      const current = prev.defectStats[defect] || { successful: 0, total: 0 };
      return {
        ...prev,
        defectStats: {
          ...prev.defectStats,
          [defect]: {
            successful: current.successful + (success ? 1 : 0),
            total: current.total + 1
          }
        }
      };
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, addSubmission, promoteUserLevel, updateWeakness }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
