import React, { createContext, useContext, useState, useEffect } from 'react';
import { EXERCISES, Exercise, getExercise } from '../data/exercises';
import { DEFECT_CLASSES } from '../data/defectClasses';
import { getConcept } from '../data/concepts';

export interface ReviewAttempt {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  defectClassId: string;
  timestamp: number;
  score: number;
  confirmedFindings: number;
  missedDefects: number;
  falsePositives: number;
  hintsUsed: number;
  selectedLines: number[];
  userExplanation: string;
}

export interface UserProfile {
  name: string;
  overallSkill: number;
  defectClassScores: Record<string, number>;
  actionableWeaknessId: string;
  weaknessDetail: string;
  reviewsCompleted: number;
  streakDays: number;
  completedConceptIds: string[];
  reviewHistory: ReviewAttempt[];
}

export interface ReviewSubmissionResult {
  exerciseId: string;
  score: number;
  confirmedFindings: number;
  missedDefects: number;
  falsePositives: number;
  hintsUsed: number;
  selectedLines: number[];
  userExplanation: string;
  whereSnippet: string;
  whereLine: string | number;
  whyYouMissedIt: string;
  patternToWatch: string;
  tags: string[];
  beforeSnippet: string;
  afterSnippet: string;
  isCleanCodeTrap?: boolean;
}

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  userProfile: UserProfile;
  lastReviewResult: ReviewSubmissionResult | null;
  submitReview: (exerciseId: string, selectedLines: number[], explanation: string, hintsUsed: number) => ReviewSubmissionResult;
  markConceptComplete: (conceptId: string) => void;
  resetProgress: () => void;
  getWeakestExercise: () => Exercise;
}

const INITIAL_PROFILE: UserProfile = {
  name: "Alex",
  overallSkill: 74,
  defectClassScores: {
    "injection": 88,
    "auth": 92,
    "error-handling": 41,
    "concurrency": 65,
    "logic-boundary": 80,
    "resource-performance": 77
  },
  actionableWeaknessId: "error-handling",
  weaknessDetail: "You've missed 3 unchecked return-value bugs recently during mock reviews.",
  reviewsCompleted: 14,
  streakDays: 4,
  completedConceptIds: [],
  reviewHistory: [
    {
      id: "rev-1",
      exerciseId: "api-response-sanitization",
      exerciseTitle: "API Response Sanitization",
      defectClassId: "auth",
      timestamp: Date.now() - 86400000 * 2,
      score: 92,
      confirmedFindings: 1,
      missedDefects: 0,
      falsePositives: 0,
      hintsUsed: 0,
      selectedLines: [21],
      userExplanation: "Direct serialization of user database entity leaks internal passwords and tokens."
    },
    {
      id: "rev-2",
      exerciseId: "unchecked-return-values",
      exerciseTitle: "Unchecked Return Values",
      defectClassId: "error-handling",
      timestamp: Date.now() - 86400000 * 1,
      score: 42,
      confirmedFindings: 0,
      missedDefects: 1,
      falsePositives: 1,
      hintsUsed: 1,
      selectedLines: [15],
      userExplanation: "Checked validation on line 15 but missed the uninspected transaction status on line 18."
    },
    {
      id: "rev-3",
      exerciseId: "sql-injection-flow",
      exerciseTitle: "SQL Injection Vectors",
      defectClassId: "injection",
      timestamp: Date.now() - 86400000 * 3,
      score: 88,
      confirmedFindings: 1,
      missedDefects: 0,
      falsePositives: 0,
      hintsUsed: 1,
      selectedLines: [12],
      userExplanation: "User input term is interpolated directly into SQL string without parameterization."
    }
  ]
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const savedTheme = localStorage.getItem('codesight_theme');
      return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
    } catch {
      return 'dark';
    }
  });

  // User profile state with localStorage persistence
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('codesight_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load profile from localStorage", e);
    }
    return INITIAL_PROFILE;
  });

  // Last completed review result for the results page
  const [lastReviewResult, setLastReviewResult] = useState<ReviewSubmissionResult | null>(() => {
    try {
      const saved = localStorage.getItem('codesight_last_result');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Sync theme changes to DOM and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('codesight_theme', theme);
    } catch {}

    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  // Sync profile changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('codesight_profile', JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  // Sync last review result to localStorage
  useEffect(() => {
    if (lastReviewResult) {
      try {
        localStorage.setItem('codesight_last_result', JSON.stringify(lastReviewResult));
      } catch {}
    }
  }, [lastReviewResult]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const submitReview = (
    exerciseId: string,
    selectedLines: number[],
    explanation: string,
    hintsUsed: number
  ): ReviewSubmissionResult => {
    const exercise = getExercise(exerciseId);
    
    // Hint score decay: 0 hints = 100%, 1 hint = 90%, 2 hints = 75%, 3 hints = 50%
    const decayMultiplier = hintsUsed === 0 ? 1.0 : hintsUsed === 1 ? 0.9 : hintsUsed === 2 ? 0.75 : 0.5;

    let confirmedFindings = 0;
    let missedDefects = 0;
    let falsePositives = 0;
    let rawScore = 0;

    if (exercise.isCleanCodeTrap) {
      // Clean code trap: selecting lines means false positives!
      if (selectedLines.length === 0) {
        confirmedFindings = 1;
        rawScore = 100;
      } else {
        falsePositives = selectedLines.length;
        rawScore = Math.max(20, 100 - falsePositives * 30);
      }
    } else {
      // Normal exercise: check selected lines against vulnerable lines
      const vulns = exercise.vulnerableLines;
      const correctlyIdentified = selectedLines.filter((line) => vulns.includes(line));
      const incorrectLines = selectedLines.filter((line) => !vulns.includes(line));

      confirmedFindings = correctlyIdentified.length;
      missedDefects = vulns.length - correctlyIdentified.length;
      falsePositives = incorrectLines.length;

      // Base accuracy score
      const lineAccuracy = vulns.length > 0 ? (confirmedFindings / vulns.length) : 1.0;
      
      // Explanation bonus (if reasonable length)
      const explanationQuality = explanation.trim().length >= 25 ? 1.0 : 0.8;
      
      // False positive deduction
      const fpPenalty = falsePositives * 15;

      const baseCalc = lineAccuracy * 85 * explanationQuality + 15 - fpPenalty;
      rawScore = Math.max(15, Math.min(100, Math.round(baseCalc)));
    }

    const finalScore = Math.round(rawScore * decayMultiplier);

    const result: ReviewSubmissionResult = {
      exerciseId: exercise.id,
      score: finalScore,
      confirmedFindings,
      missedDefects,
      falsePositives,
      hintsUsed,
      selectedLines,
      userExplanation: explanation,
      whereSnippet: exercise.modelSolution.whereSnippet,
      whereLine: exercise.modelSolution.whereLine,
      whyYouMissedIt: exercise.modelSolution.whyYouMissedIt,
      patternToWatch: exercise.modelSolution.patternToWatch,
      tags: exercise.modelSolution.tags,
      beforeSnippet: exercise.modelSolution.beforeSnippet,
      afterSnippet: exercise.modelSolution.afterSnippet,
      isCleanCodeTrap: exercise.isCleanCodeTrap
    };

    setLastReviewResult(result);

    // Update user profile
    setUserProfile((prev) => {
      const currentClassScore = prev.defectClassScores[exercise.defectClassId] ?? 60;
      // Weighted moving average
      const updatedClassScore = Math.round(currentClassScore * 0.7 + finalScore * 0.3);
      
      const newScores = {
        ...prev.defectClassScores,
        [exercise.defectClassId]: Math.min(99, Math.max(25, updatedClassScore))
      };

      // Find new lowest class score
      let lowestClassId = "error-handling";
      let lowestVal = 100;
      Object.entries(newScores).forEach(([k, v]) => {
        if (v < lowestVal) {
          lowestVal = v;
          lowestClassId = k;
        }
      });

      // Calculate new overall skill score
      const scoreValues = Object.values(newScores);
      const newOverall = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);

      const newAttempt: ReviewAttempt = {
        id: `rev-${Date.now()}`,
        exerciseId: exercise.id,
        exerciseTitle: exercise.title,
        defectClassId: exercise.defectClassId,
        timestamp: Date.now(),
        score: finalScore,
        confirmedFindings,
        missedDefects,
        falsePositives,
        hintsUsed,
        selectedLines,
        userExplanation: explanation
      };

      return {
        ...prev,
        overallSkill: newOverall,
        defectClassScores: newScores,
        actionableWeaknessId: lowestClassId,
        reviewsCompleted: prev.reviewsCompleted + 1,
        reviewHistory: [newAttempt, ...prev.reviewHistory]
      };
    });

    return result;
  };

  const markConceptComplete = (conceptId: string) => {
    setUserProfile((prev) => {
      if (prev.completedConceptIds.includes(conceptId)) {
        return prev;
      }
      
      // Dynamically lookup the concept and its associated defect class
      const concept = getConcept(conceptId);
      const targetClassId = concept.defectClassId;
      const currentClassScore = prev.defectClassScores[targetClassId] ?? 50;

      const boostedScores = {
        ...prev.defectClassScores,
        [targetClassId]: Math.min(98, currentClassScore + 10)
      };
      
      // Find new lowest class score
      let lowestClassId = prev.actionableWeaknessId;
      let lowestVal = 100;
      Object.entries(boostedScores).forEach(([k, v]) => {
        if (v < lowestVal) {
          lowestVal = v;
          lowestClassId = k;
        }
      });

      const scoreValues = Object.values(boostedScores);
      const newOverall = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);

      return {
        ...prev,
        overallSkill: newOverall,
        defectClassScores: boostedScores,
        actionableWeaknessId: lowestClassId,
        completedConceptIds: [...prev.completedConceptIds, conceptId]
      };
    });
  };

  const resetProgress = () => {
    setUserProfile(INITIAL_PROFILE);
    setLastReviewResult(null);
    try {
      localStorage.removeItem('codesight_profile');
      localStorage.removeItem('codesight_last_result');
    } catch {}
  };

  const getWeakestExercise = (): Exercise => {
    const weaknessId = userProfile.actionableWeaknessId;
    const match = EXERCISES.find((ex) => ex.defectClassId === weaknessId);
    return match || EXERCISES[0];
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        userProfile,
        lastReviewResult,
        submitReview,
        markConceptComplete,
        resetProgress,
        getWeakestExercise
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
