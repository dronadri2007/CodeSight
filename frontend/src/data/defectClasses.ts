export interface DefectClass {
  id: string;
  name: string;
  shortName: string;
  description: string;
  examples: string[];
  color: string; // Tailwind color token or hex
  badgeColor: string;
  accentBg: string;
  icon: string;
}

export const DEFECT_CLASSES: DefectClass[] = [
  {
    id: "injection",
    name: "Injection / Input Validation",
    shortName: "Injection",
    description: "Unsanitized user inputs flowing into queries, system commands, or file paths.",
    examples: ["SQL Injection", "Command Injection", "Path Traversal", "XSS"],
    color: "#ffb4ab",
    badgeColor: "text-error border-error/30 bg-error-container/20",
    accentBg: "bg-error/10",
    icon: "ShieldAlert"
  },
  {
    id: "auth",
    name: "Auth & Access Control",
    shortName: "Authentication",
    description: "Missing identity checks, broken role validation, and direct object references (IDOR).",
    examples: ["IDOR", "Missing Permission Check", "Token Verification Bypass", "Role Escalation"],
    color: "#adc6ff",
    badgeColor: "text-primary border-primary/30 bg-primary-container/20",
    accentBg: "bg-primary/10",
    icon: "Lock"
  },
  {
    id: "error-handling",
    name: "Error & Exception Handling",
    shortName: "Error Handling",
    description: "Swallowed exceptions, unchecked return values, and unhandled promise rejections.",
    examples: ["Unchecked Return Values", "Swallowed Exception", "Missing Error Propagation", "Null Dereference"],
    color: "#ffb786",
    badgeColor: "text-tertiary border-tertiary/30 bg-tertiary-container/20",
    accentBg: "bg-tertiary/10",
    icon: "AlertTriangle"
  },
  {
    id: "concurrency",
    name: "Concurrency & State",
    shortName: "Concurrency",
    description: "Race conditions, shared mutable state between asynchronous tasks, and ordering defects.",
    examples: ["TOCTOU Race Condition", "Stale State Mutation", "Unsynchronized Cache Write", "Deadlock"],
    color: "#c0c1ff",
    badgeColor: "text-secondary border-secondary/30 bg-secondary-container/20",
    accentBg: "bg-secondary/10",
    icon: "Layers"
  },
  {
    id: "logic-boundary",
    name: "Logic & Boundary",
    shortName: "Business Logic",
    description: "Off-by-one errors, inverted conditional operators, edge case omissions, and assignment bugs.",
    examples: ["Off-by-one in Pagination", "Assignment in Condition (= vs ==)", "Boundary Underflow", "Early Return"],
    color: "#adc6ff",
    badgeColor: "text-primary border-primary/30 bg-primary-container/20",
    accentBg: "bg-primary/10",
    icon: "GitBranch"
  },
  {
    id: "resource-performance",
    name: "Resource & Performance",
    shortName: "Resource Leaks",
    description: "Unclosed connections, memory retention in closures, and accidental O(n²) iterations.",
    examples: ["Unclosed DB Connection", "Closure Memory Retention", "N+1 Query Pattern", "Unbounded Buffer"],
    color: "#c0c1ff",
    badgeColor: "text-secondary border-secondary/30 bg-secondary-container/20",
    accentBg: "bg-secondary/10",
    icon: "Cpu"
  }
];

export function getDefectClass(id: string): DefectClass {
  const found = DEFECT_CLASSES.find((dc) => dc.id === id);
  return found || DEFECT_CLASSES[0];
}
