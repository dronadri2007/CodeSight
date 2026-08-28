export interface Hint {
  id: number;
  level: string;
  text: string;
  scoreMultiplier: number; // 1.0 (no hints), 0.9 (hint 1), 0.75 (hint 2), 0.5 (hint 3)
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  timeMinutes: number;
  defectClassId: string;
  filename: string;
  code: string;
  vulnerableLines: number[];
  isCleanCodeTrap?: boolean;
  cleanCodeExplanation?: string;
  hints: Hint[];
  explanationPrompt: string;
  modelSolution: {
    whereLine: number | string;
    whereSnippet: string;
    whyYouMissedIt: string;
    patternToWatch: string;
    tags: string[];
    beforeSnippet: string;
    afterSnippet: string;
  };
  conceptId: string;
  relatedExerciseId?: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: "unchecked-return-values",
    title: "Unchecked Return Values",
    description: "Review the payment webhook processor. Inspect how external API responses and transaction results are handled before committing the order state.",
    language: "TypeScript",
    difficulty: "Intermediate",
    timeMinutes: 8,
    defectClassId: "error-handling",
    filename: "paymentWebhook.ts",
    code: `import { Request, Response } from 'express';
import { paymentGateway } from '../services/gateway';
import { orderStore } from '../database/orders';
import { logger } from '../utils/logger';

export async function handlePaymentWebhook(req: Request, res: Response) {
  const { eventId, orderId, paymentId } = req.body;

  if (!orderId || !paymentId) {
    return res.status(400).json({ error: 'Missing mandatory webhook fields' });
  }

  // Verify transaction status with payment gateway
  const verification = await paymentGateway.verifyTransaction(paymentId);

  // Mark order as completed without validating verification status
  await orderStore.updateStatus(orderId, 'PAID');
  logger.info(\`Order \${orderId} marked as PAID for event \${eventId}\`);

  return res.status(200).json({ success: true });
}`,
    vulnerableLines: [18],
    hints: [
      {
        id: 1,
        level: "Conceptual Direction",
        text: "Consider what happens when the external gateway returns a failed or disputed payment status object.",
        scoreMultiplier: 0.9
      },
      {
        id: 2,
        level: "Specific Direction",
        text: "Inspect the return value of `paymentGateway.verifyTransaction(paymentId)` on line 15 and see where it is evaluated.",
        scoreMultiplier: 0.75
      },
      {
        id: 3,
        level: "Strong Direction",
        text: "Line 18 updates the order status to 'PAID' unconditionally, ignoring whether `verification.status === 'SUCCESS'`.",
        scoreMultiplier: 0.5
      }
    ],
    explanationPrompt: "In one sentence: what breaks, and on which input or condition?",
    modelSolution: {
      whereLine: 18,
      whereSnippet: "await orderStore.updateStatus(orderId, 'PAID');",
      whyYouMissedIt: "It is easy to assume that because `verifyTransaction()` didn't throw an exception, the payment succeeded. However, API clients often return a result object with a `.status` property (e.g., 'FAILED', 'DECLINED') that must be explicitly checked.",
      patternToWatch: "Unconditional state mutations following uninspected external API responses.",
      tags: ["Return Value Check", "Silent Success Assumption", "State Inconsistency"],
      beforeSnippet: `// Vulnerable: ignoring return status
const verification = await paymentGateway.verifyTransaction(paymentId);
await orderStore.updateStatus(orderId, 'PAID');`,
      afterSnippet: `// Secured: explicit status validation
const verification = await paymentGateway.verifyTransaction(paymentId);
if (!verification || verification.status !== 'SUCCESS') {
  await orderStore.updateStatus(orderId, 'PAYMENT_FAILED');
  return res.status(402).json({ error: 'Payment verification declined' });
}
await orderStore.updateStatus(orderId, 'PAID');`
    },
    conceptId: "error-handling-returns",
    relatedExerciseId: "unhandled-promise-rejection"
  },
  {
    id: "api-response-sanitization",
    title: "API Response Sanitization",
    description: "Review the `getUserProfile` handler. Look closely at how user data is extracted and returned to the client. Are we leaking sensitive fields?",
    language: "TypeScript",
    difficulty: "Intermediate",
    timeMinutes: 6,
    defectClassId: "auth",
    filename: "userController.ts",
    code: `import { Request, Response } from 'express';
import { UserModel } from '../models/User';

// Retrieves public profile data for a given user ID
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch user from database
    const userRecord = await UserModel.findById(userId);

    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return profile data
    return res.status(200).json({ data: userRecord });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};`,
    vulnerableLines: [21],
    hints: [
      {
        id: 1,
        level: "Conceptual Direction",
        text: "Check what fields exist on raw database documents compared to what a public API client should receive.",
        scoreMultiplier: 0.9
      },
      {
        id: 2,
        level: "Specific Direction",
        text: "Examine line 21: the raw `userRecord` (including hashed passwords, MFA secrets, and auth tokens) is serialized directly.",
        scoreMultiplier: 0.75
      },
      {
        id: 3,
        level: "Strong Direction",
        text: "Line 21 returns `{ data: userRecord }` without stripping private credentials or mapping to a PublicUserDTO.",
        scoreMultiplier: 0.5
      }
    ],
    explanationPrompt: "In one sentence: what breaks, and why? Be specific about the data exposure.",
    modelSolution: {
      whereLine: 21,
      whereSnippet: "return res.status(200).json({ data: userRecord });",
      whyYouMissedIt: "Returning database models directly creates implicit overexposure (Mass Assignment / Data Leakage). When new sensitive fields are added to the DB model in the future, they automatically leak through this endpoint.",
      patternToWatch: "Direct serialization of internal database entities across public network boundaries.",
      tags: ["Data Exposure", "Overfetching", "Missing DTO projection"],
      beforeSnippet: `// Vulnerable: raw database object returned
return res.status(200).json({ data: userRecord });`,
      afterSnippet: `// Secured: explicit DTO projection
const publicProfile = {
  id: userRecord.id,
  username: userRecord.username,
  displayName: userRecord.displayName,
  avatarUrl: userRecord.avatarUrl
};
return res.status(200).json({ data: publicProfile });`
    },
    conceptId: "auth-data-exposure",
    relatedExerciseId: "jwt-token-verification"
  },
  {
    id: "sql-injection-flow",
    title: "SQL Injection Vectors",
    description: "Analyze how incoming query parameters flow into the backend database client during search queries.",
    language: "Python",
    difficulty: "Intermediate",
    timeMinutes: 5,
    defectClassId: "injection",
    filename: "search_service.py",
    code: `from fastapi import APIRouter, HTTPException, Depends
from db.client import get_database_cursor

router = APIRouter()

@router.get("/users/search")
async def search_users(term: str, cursor = Depends(get_database_cursor)):
    if not term or len(term) > 50:
        raise HTTPException(status_code=400, detail="Invalid search term length")

    # Construct search query with user-provided filter
    query = f"SELECT id, username, email FROM accounts WHERE is_active = TRUE AND username LIKE '%{term}%'"
    
    # Execute query
    cursor.execute(query)
    results = cursor.fetchall()
    
    return {"count": len(results), "users": results}`,
    vulnerableLines: [12],
    hints: [
      {
        id: 1,
        level: "Conceptual Direction",
        text: "Trace where the `term` variable originates and where it reaches the database engine.",
        scoreMultiplier: 0.9
      },
      {
        id: 2,
        level: "Specific Direction",
        text: "Look at the string interpolation `f\"...\"` used on line 12 rather than parameterized bindings.",
        scoreMultiplier: 0.75
      },
      {
        id: 3,
        level: "Strong Direction",
        text: "Line 12 formats `term` directly into the SQL string, allowing SQL injection payload injection via quotes or comments.",
        scoreMultiplier: 0.5
      }
    ],
    explanationPrompt: "In one sentence: what breaks, and on which input?",
    modelSolution: {
      whereLine: 12,
      whereSnippet: "query = f\"SELECT id, username, email FROM accounts WHERE is_active = TRUE AND username LIKE '%{term}%'\"",
      whyYouMissedIt: "Even though length validation was performed on line 9, length checks do not prevent SQL syntax injection (e.g. `' OR '1'='1`). String formatting must never be used to construct SQL statements.",
      patternToWatch: "User input flowing into query strings without parameterization or prepared statements.",
      tags: ["SQL Injection", "Unsanitized Input", "Tainted Data Flow"],
      beforeSnippet: `# Vulnerable: string concatenation/interpolation
query = f"SELECT * FROM accounts WHERE username LIKE '%{term}%'"
cursor.execute(query)`,
      afterSnippet: `# Secured: parameterized query bindings
query = "SELECT * FROM accounts WHERE username LIKE %s"
cursor.execute(query, (f"%{term}%",))`
    },
    conceptId: "injection-sql-flow",
    relatedExerciseId: "unchecked-return-values"
  },
  {
    id: "memory-leak-closures",
    title: "Memory Leaks in Closures",
    description: "Identify how references to high-frequency WebSocket connection handles are held indefinitely in background event listeners.",
    language: "TypeScript",
    difficulty: "Advanced",
    timeMinutes: 12,
    defectClassId: "resource-performance",
    filename: "connectionRegistry.ts",
    code: `import { EventEmitter } from 'events';
import { Socket } from 'net';

const globalEmitter = new EventEmitter();
globalEmitter.setMaxListeners(1000);

export class ConnectionRegistry {
  private activeCount = 0;

  public attachSocket(socket: Socket) {
    this.activeCount++;
    const largeBuffer = Buffer.alloc(1024 * 1024); // 1MB session state

    // Listen for broadcast events
    globalEmitter.on('broadcast_metrics', (metrics) => {
      if (!socket.destroyed) {
        socket.write(JSON.stringify(metrics) + '\\n');
      }
    });

    socket.on('close', () => {
      this.activeCount--;
      // Note: globalEmitter listener is never detached
    });
  }
}`,
    vulnerableLines: [14],
    hints: [
      {
        id: 1,
        level: "Conceptual Direction",
        text: "Think about the lifecycle of `globalEmitter` vs the individual `socket` instances.",
        scoreMultiplier: 0.9
      },
      {
        id: 2,
        level: "Specific Direction",
        text: "Line 14 registers an event listener on the singleton `globalEmitter`. When the socket closes, what happens to that listener?",
        scoreMultiplier: 0.75
      },
      {
        id: 3,
        level: "Strong Direction",
        text: "Line 14 captures `socket` in the callback closure on the persistent emitter without calling `globalEmitter.off()` on socket close.",
        scoreMultiplier: 0.5
      }
    ],
    explanationPrompt: "What causes memory growth over time as connections connect and disconnect?",
    modelSolution: {
      whereLine: 14,
      whereSnippet: "globalEmitter.on('broadcast_metrics', (metrics) => { ... });",
      whyYouMissedIt: "When subscribing to global/singleton event emitters inside ephemeral object scopes, the global emitter retains a reference to the callback closure (and everything it captures) forever unless explicitly removed on tear-down.",
      patternToWatch: "Missing cleanup / removal of global event listeners when transient objects are destroyed.",
      tags: ["Memory Leak", "Closure Retention", "Event Listener Leak"],
      beforeSnippet: `globalEmitter.on('broadcast', handler);
socket.on('close', () => {
  this.activeCount--;
});`,
      afterSnippet: `const handler = (metrics) => { socket.write(...); };
globalEmitter.on('broadcast', handler);
socket.on('close', () => {
  globalEmitter.off('broadcast', handler); // Clean up reference
  this.activeCount--;
});`
    },
    conceptId: "resource-memory-closures",
    relatedExerciseId: "race-condition-cache"
  },
  {
    id: "race-condition-cache",
    title: "Concurrency in Async Cache",
    description: "Trace how async cached state is updated during concurrent requests for stale cache keys.",
    language: "TypeScript",
    difficulty: "Advanced",
    timeMinutes: 10,
    defectClassId: "concurrency",
    filename: "cacheService.ts",
    code: `import { redisClient } from '../db/redis';
import { fetchFromExternalApi } from '../services/upstream';

const cacheLock = new Map<string, boolean>();

export async function getOrComputeStats(reportId: string): Promise<any> {
  const cached = await redisClient.get(\`report:\${reportId}\`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Time-of-check to time-of-use race: Multiple concurrent calls compute upstream simultaneously
  const freshData = await fetchFromExternalApi(reportId);
  await redisClient.set(\`report:\${reportId}\`, JSON.stringify(freshData), 'EX', 300);

  return freshData;
}`,
    vulnerableLines: [13],
    hints: [
      {
        id: 1,
        level: "Conceptual Direction",
        text: "Consider 100 simultaneous requests arriving at the exact instant a cache key expires.",
        scoreMultiplier: 0.9
      },
      {
        id: 2,
        level: "Specific Direction",
        text: "Notice that between line 8 (cache miss) and line 14 (cache set), there is an `await` without a distributed lock or single-flight coordinator.",
        scoreMultiplier: 0.75
      },
      {
        id: 3,
        level: "Strong Direction",
        text: "Line 13 causes a cache stampede (thundering herd): all concurrent callers bypass cache and flood the upstream API.",
        scoreMultiplier: 0.5
      }
    ],
    explanationPrompt: "What occurs under high concurrent traffic when the cache key is cold?",
    modelSolution: {
      whereLine: 13,
      whereSnippet: "const freshData = await fetchFromExternalApi(reportId);",
      whyYouMissedIt: "Under high concurrency, multiple requests experience a cache miss at the same millisecond. Without a lock or single-flight promise deduplication, every thread initiates an expensive upstream call simultaneously (Cache Stampede).",
      patternToWatch: "Unsynchronized cache misses causing thundering herd problems in async services.",
      tags: ["Cache Stampede", "Thundering Herd", "Race Condition"],
      beforeSnippet: `if (!cached) {
  const fresh = await fetchUpstream(id);
  await redis.set(id, fresh);
}`,
      afterSnippet: `if (!cached) {
  return await singleFlight.do(id, async () => {
    const fresh = await fetchUpstream(id);
    await redis.set(id, fresh, 'EX', 300);
    return fresh;
  });
}`
    },
    conceptId: "concurrency-races",
    relatedExerciseId: "memory-leak-closures"
  },
  {
    id: "off-by-one-pagination",
    title: "Pagination Boundary Off-by-One",
    description: "Examine how slice offsets and total page counts are calculated in this list pagination utility.",
    language: "TypeScript",
    difficulty: "Foundational",
    timeMinutes: 5,
    defectClassId: "logic-boundary",
    filename: "pagination.ts",
    code: `export interface PageResult<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
}

export function paginateArray<T>(items: T[], page: number, pageSize: number): PageResult<T> {
  const validPage = Math.max(1, page);
  const totalPages = Math.ceil(items.length / pageSize);

  // Calculate slice boundaries
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = validPage * pageSize + 1; // Off-by-one error

  const pagedItems = items.slice(startIndex, endIndex);

  return {
    items: pagedItems,
    totalPages,
    currentPage: validPage
  };
}`,
    vulnerableLines: [13],
    hints: [
      {
        id: 1,
        level: "Conceptual Direction",
        text: "Recall how `Array.prototype.slice(start, end)` defines the ending index.",
        scoreMultiplier: 0.9
      },
      {
        id: 2,
        level: "Specific Direction",
        text: "Line 13 computes `endIndex = validPage * pageSize + 1`. Check the total item count returned.",
        scoreMultiplier: 0.75
      },
      {
        id: 3,
        level: "Strong Direction",
        text: "Line 13 adds `+ 1` unnecessarily. Because `slice()` is exclusive of `end`, each page returns `pageSize + 1` items instead of `pageSize`.",
        scoreMultiplier: 0.5
      }
    ],
    explanationPrompt: "What is the boundary bug and how does it affect page item count?",
    modelSolution: {
      whereLine: 13,
      whereSnippet: "const endIndex = validPage * pageSize + 1;",
      whyYouMissedIt: "`Array.prototype.slice(start, end)` extracts up to but not including `end`. For a page size of 10, index 0 to 10 yields 10 items. Adding `+ 1` makes it 11 items, causing duplicates across page boundaries.",
      patternToWatch: "Off-by-one indexing on exclusive array slicing functions.",
      tags: ["Off-By-One", "Boundary Logic", "Array Slice"],
      beforeSnippet: `const startIndex = (page - 1) * pageSize;
const endIndex = page * pageSize + 1;
return items.slice(startIndex, endIndex);`,
      afterSnippet: `const startIndex = (page - 1) * pageSize;
const endIndex = startIndex + pageSize; // or: page * pageSize
return items.slice(startIndex, endIndex);`
    },
    conceptId: "logic-boundary-offbyone",
    relatedExerciseId: "sql-injection-flow"
  },
  {
    id: "jwt-token-verification",
    title: "Auth Token Structure & Verification",
    description: "Battle mode challenge: Inspect JWT authorization logic and flag the critical authentication defect.",
    language: "TypeScript",
    difficulty: "Intermediate",
    timeMinutes: 4,
    defectClassId: "auth",
    filename: "auth_service.ts",
    code: `import { JwtPayload } from 'jsonwebtoken';
import { db } from '@database';
import { authUtils } from '../utils/auth';

export async function verifyUserAccess(token: string) {
  /* Validate token presence */
  if (!token || token.length < 10) {
    throw new Error("Invalid token format");
  }

  // Decode token structure
  const decoded = await authUtils.decodeToken(token) as JwtPayload;
  
  // Fetch user record
  const user = await db.users.findUnique({
    where: { id: decoded.userId }
  });

  if (!user) {
    return false;
  }

  // Accidental assignment instead of equality comparison
  if (user.isArchived = true) {
    return false;
  }

  return true;
}`,
    vulnerableLines: [22],
    hints: [
      {
        id: 1,
        level: "Conceptual Direction",
        text: "Inspect the operator used in the conditional check near line 22.",
        scoreMultiplier: 0.9
      },
      {
        id: 2,
        level: "Specific Direction",
        text: "Line 22 uses a single `=` assignment operator instead of `===` or `==`.",
        scoreMultiplier: 0.75
      },
      {
        id: 3,
        level: "Strong Direction",
        text: "Line 22 modifies `user.isArchived` to `true` and always evaluates to truthy, rejecting all valid unarchived users.",
        scoreMultiplier: 0.5
      }
    ],
    explanationPrompt: "What operator error exists and how does it alter the user object?",
    modelSolution: {
      whereLine: 22,
      whereSnippet: "if (user.isArchived = true) {",
      whyYouMissedIt: "A single assignment operator `=` inside an `if` expression assigns the value `true` to `user.isArchived` and evaluates as true, locking out all active users.",
      patternToWatch: "Assignment operators mistakenly used in conditional guard clauses.",
      tags: ["Assignment in Condition", "Broken Access", "Syntax Defect"],
      beforeSnippet: `if (user.isArchived = true) {
  return false;
}`,
      afterSnippet: `if (user.isArchived === true) {
  return false;
}`
    },
    conceptId: "auth-data-exposure"
  },
  {
    id: "clean-data-pipeline",
    title: "Batch Transformation Pipeline",
    description: "Discernment challenge: Review this immutable batch data transformation. Identify whether any defect actually exists.",
    language: "TypeScript",
    difficulty: "Intermediate",
    timeMinutes: 6,
    defectClassId: "logic-boundary",
    filename: "batchTransformer.ts",
    code: `export interface RecordItem {
  id: string;
  amount: number;
  timestamp: number;
}

export function aggregateDailyTotals(records: ReadonlyArray<RecordItem>): Map<string, number> {
  const dailyTotals = new Map<string, number>();

  for (const record of records) {
    if (!record || typeof record.amount !== 'number' || isNaN(record.amount)) {
      continue;
    }

    const dateKey = new Date(record.timestamp).toISOString().slice(0, 10);
    const currentTotal = dailyTotals.get(dateKey) || 0;
    dailyTotals.set(dateKey, currentTotal + record.amount);
  }

  return dailyTotals;
}`,
    vulnerableLines: [],
    isCleanCodeTrap: true,
    cleanCodeExplanation: "This code is completely clean and follows defensive programming best practices: it uses ReadonlyArray, validates NaN and non-number amounts, handles missing map keys gracefully with fallback `|| 0`, and produces no side-effects.",
    hints: [
      {
        id: 1,
        level: "Conceptual Direction",
        text: "Carefully inspect data immutability, NaN checking, and Map get/set semantics before assuming a bug exists.",
        scoreMultiplier: 0.9
      },
      {
        id: 2,
        level: "Specific Direction",
        text: "Notice that invalid records are guarded on line 11 and default map values are safely initialized.",
        scoreMultiplier: 0.75
      },
      {
        id: 3,
        level: "Strong Direction",
        text: "This function contains NO defects. In professional code review, confirming clean code without raising false positives is a critical skill.",
        scoreMultiplier: 0.5
      }
    ],
    explanationPrompt: "If you believe there are defects, explain them. If clean, explain why the defensive practices are sound.",
    modelSolution: {
      whereLine: "Clean",
      whereSnippet: "Entire module verified clean",
      whyYouMissedIt: "Good reviewers must not flag valid code simply because it looks unfamiliar. Training discernment against false alarms preserves team velocity.",
      patternToWatch: "Distinguishing safe defensive patterns from genuine defect vectors.",
      tags: ["False Positive Discernment", "Defensive Code", "Immutable Transform"],
      beforeSnippet: `// This code is clean and safe
const currentTotal = dailyTotals.get(dateKey) || 0;
dailyTotals.set(dateKey, currentTotal + record.amount);`,
      afterSnippet: `// Verified: No modification needed`
    },
    conceptId: "logic-boundary-offbyone"
  },
  {
    id: "unhandled-promise-rejection",
    title: "Swallowed Promise in Async Loop",
    description: "Targeted Practice: Review how background email dispatches are awaited during account activation.",
    language: "TypeScript",
    difficulty: "Foundational",
    timeMinutes: 5,
    defectClassId: "error-handling",
    filename: "activationWorker.ts",
    code: `import { mailService } from '../services/mail';
import { logger } from '../utils/logger';

export async function processActivationBatch(userIds: string[]) {
  const pending = userIds.map(async (userId) => {
    try {
      await mailService.sendWelcomeEmail(userId);
    } catch (err) {
      // Swallowed error: logs silently without alerting caller or retrying
      logger.warn(\`Failed for \${userId}\`);
    }
  });

  // Note: Promise.all returns void for all, caller has no idea 50% failed
  await Promise.all(pending);
  return { processedCount: userIds.length };
}`,
    vulnerableLines: [10],
    hints: [
      {
        id: 1,
        level: "Conceptual Direction",
        text: "Look at the catch block inside the async map handler.",
        scoreMultiplier: 0.9
      },
      {
        id: 2,
        level: "Specific Direction",
        text: "Line 10 logs a warning but swallows the error without returning a failure status or throwing.",
        scoreMultiplier: 0.75
      },
      {
        id: 3,
        level: "Strong Direction",
        text: "Line 10 swallows the exception, causing line 16 to report 100% processed count even when emails fail.",
        scoreMultiplier: 0.5
      }
    ],
    explanationPrompt: "What happens when `sendWelcomeEmail` fails for a user?",
    modelSolution: {
      whereLine: 10,
      whereSnippet: "logger.warn(`Failed for ${userId}`);",
      whyYouMissedIt: "Swallowing exceptions in worker loops masks partial batch failures, making monitoring systems believe all jobs succeeded.",
      patternToWatch: "Swallowed errors in asynchronous batch processing.",
      tags: ["Swallowed Error", "Batch Reliability", "Silent Failure"],
      beforeSnippet: `try {
  await mailService.sendWelcome(id);
} catch (err) {
  logger.warn('Failed');
}`,
      afterSnippet: `try {
  await mailService.sendWelcome(id);
  return { id, success: true };
} catch (err) {
  return { id, success: false, error: err };
}`
    },
    conceptId: "error-handling-returns"
  }
];

export function getExercise(id: string): Exercise {
  const found = EXERCISES.find((ex) => ex.id === id);
  return found || EXERCISES[0];
}
