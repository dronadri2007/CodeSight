export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type DefectClass = 
  | 'SQL Injection'
  | 'Race Condition'
  | 'Resource Leak'
  | 'Type Mismatch'
  | 'Buffer Overflow'
  | 'Null Pointer Dereference'
  | 'Infinite Loop'
  | 'Improper Authentication'
  | 'Memory Leak'
  | 'Algorithmic Inefficiency';

export type ProblemStatus = 'Approved' | 'Pending' | 'Draft' | 'Archived';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSample?: boolean;
  isHidden?: boolean;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  defectClass: DefectClass;
  tags: string[];
  status: ProblemStatus;
  statement: string;
  starterCode: {
    python?: string;
    javascript?: string;
    cpp?: string;
    java?: string;
  };
  solutionCode?: {
    python?: string;
    javascript?: string;
    cpp?: string;
    java?: string;
  };
  optimalTimeComplexity: string;
  optimalSpaceComplexity: string;
  testCases: TestCase[];
  author?: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'lead' | 'user';
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lead' | 'superadmin';
  avatarUrl?: string;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
