export interface MicroCheckOption {
  id: string;
  label: string;
  codeSnippet?: string;
  isCorrect: boolean;
  explanation: string;
}

export interface MicroCheckQuestion {
  id: string;
  question: string;
  codeContext?: string;
  options: MicroCheckOption[];
}

export interface Concept {
  id: string;
  title: string;
  moduleNumber: string;
  defectClassId: string;
  summary: string;
  whyItHappens: string;
  beforeSnippet: {
    filename: string;
    code: string;
    badLineNumber: number;
    annotation: string;
  };
  afterSnippet: {
    filename: string;
    code: string;
    goodLineNumber: number;
    annotation: string;
  };
  mentalModel: {
    name: string;
    description: string;
    sourceLabel: string;
    sourceExample: string;
    flowLabel: string;
    flowState: string;
    sinkLabel: string;
    sinkExample: string;
  };
  patternToRemember: string;
  microChecks: MicroCheckQuestion[];
  targetedExerciseId: string;
}

export const CONCEPTS: Record<string, Concept> = {
  "error-handling-returns": {
    id: "error-handling-returns",
    title: "Unchecked Return Values & Silent Failures",
    moduleNumber: "03",
    defectClassId: "error-handling",
    summary: "External API clients, file system operations, and database drivers often return status payloads rather than throwing runtime exceptions. Assuming success without explicit return validation causes silent data corruption.",
    whyItHappens: "Developers accustomed to try/catch blocks often assume anything that does not throw is healthy. When downstream services return HTTP 200 with `{ status: 'FAILED' }`, execution continues as if successful.",
    beforeSnippet: {
      filename: "paymentProcessor.ts",
      code: `async function processPayment(orderId, paymentToken) {\n  // Source: Calls external payment provider\n  const result = await gateway.charge(paymentToken);\n  \n  // BUG: Mutates state without inspecting result.status\n  await db.orders.markPaid(orderId);\n  return { success: true };\n}`,
      badLineNumber: 6,
      annotation: "Unconditionally marks order as PAID"
    },
    afterSnippet: {
      filename: "paymentProcessor.ts",
      code: `async function processPayment(orderId, paymentToken) {\n  // Source: Calls external payment provider\n  const result = await gateway.charge(paymentToken);\n  \n  // FIX: Explicit guard clause on response status\n  if (!result || result.status !== 'CAPTURED') {\n    await db.orders.markFailed(orderId, result?.reason);\n    return { success: false, error: 'Charge declined' };\n  }\n  \n  await db.orders.markPaid(orderId);\n  return { success: true };\n}`,
      goodLineNumber: 6,
      annotation: "Guards against non-captured transaction statuses"
    },
    mentalModel: {
      name: "Status Object vs Throw Contract",
      description: "Never equate 'did not throw an error' with 'operation was successful'. Always inspect the payload status contract.",
      sourceLabel: "Invocation",
      sourceExample: "gateway.charge()",
      flowLabel: "Return Contract",
      flowState: "{ status: 'DECLINED' }",
      sinkLabel: "State Mutation",
      sinkExample: "orders.markPaid()"
    },
    patternToRemember: "Always inspect return objects before mutating downstream state.",
    microChecks: [
      {
        id: "mc-err-1",
        question: "Which implementation correctly handles an API client that returns `{ ok: false, error: 'Rate limit' }`?",
        options: [
          {
            id: "opt-a",
            label: "Option A",
            codeSnippet: `try {\n  const res = await api.send(payload);\n  return res.data;\n} catch (e) {\n  log(e);\n}`,
            isCorrect: false,
            explanation: "Incorrect. If the API returns `{ ok: false }` with an HTTP 200 status code, the catch block never executes."
          },
          {
            id: "opt-b",
            label: "Option B",
            codeSnippet: `const res = await api.send(payload);\nif (!res.ok) {\n  throw new ApiError(res.error);\n}\nreturn res.data;`,
            isCorrect: true,
            explanation: "Correct! Explicitly checking `!res.ok` ensures unsuccessful statuses are handled even when no network exception occurs."
          }
        ]
      },
      {
        id: "mc-err-2",
        question: "Why is swallowing an exception with an empty `catch {}` harmful in background workers?",
        options: [
          {
            id: "opt-a",
            label: "It silently hides batch failures from callers and telemetry",
            isCorrect: true,
            explanation: "Correct! The orchestrator thinks 100% of jobs succeeded, preventing automated retries and error monitoring."
          },
          {
            id: "opt-b",
            label: "It increases memory consumption by 50%",
            isCorrect: false,
            explanation: "Incorrect. The danger is loss of error visibility and corrupted batch state, not immediate memory inflation."
          }
        ]
      }
    ],
    targetedExerciseId: "unhandled-promise-rejection"
  },
  "injection-sql-flow": {
    id: "injection-sql-flow",
    title: "SQL Injection via Flow Analysis",
    moduleNumber: "01",
    defectClassId: "injection",
    summary: "Understanding how tainted data moves from an untrusted source to a sensitive sink is critical. We don't just look at single lines; we trace the execution path.",
    whyItHappens: "Direct string interpolation or formatting bypasses SQL query planning, allowing input text containing SQL control characters (`'`, `--`, `UNION`) to alter query logic.",
    beforeSnippet: {
      filename: "searchService.py",
      code: `def getUserProfile(req, res):\n  # Source: Untrusted input from URL\n  userId = req.query.id\n  \n  # Flow: Tainted string concatenation\n  query = f"SELECT * FROM users WHERE id = '{userId}'"\n  \n  # Sink: Execution without sanitization\n  db.execute(query, lambda err, result: res.send(result))`,
      badLineNumber: 6,
      annotation: "String interpolation injects raw text into SQL statement"
    },
    afterSnippet: {
      filename: "searchService.py",
      code: `def getUserProfile(req, res):\n  # Source remains untrusted\n  userId = req.query.id\n  \n  # Flow: Parameterized Query Structure\n  query = "SELECT * FROM users WHERE id = ?"\n  \n  # Sink: Data binding separates code from data\n  db.execute(query, [userId], lambda err, result: res.send(result))`,
      goodLineNumber: 6,
      annotation: "Placeholders (?) ensure input is treated strictly as data"
    },
    mentalModel: {
      name: "Source → Sink Data Flow",
      description: "Vulnerabilities rarely exist in isolation; they manifest when untrusted data flows from a Source to an unparameterized execution Sink.",
      sourceLabel: "Source",
      sourceExample: "req.query.id",
      flowLabel: "Data Flow",
      flowState: "Tainted String",
      sinkLabel: "Sink",
      sinkExample: "db.execute()"
    },
    patternToRemember: "Always parameterize query bindings. Never concatenate strings into executable commands.",
    microChecks: [
      {
        id: "mc-inj-1",
        question: "Which query construction is completely immune to SQL injection?",
        options: [
          {
            id: "opt-a",
            label: "Option A",
            codeSnippet: `db.query(\`SELECT * FROM items WHERE name = '\${sanitize(input)}'\`)`,
            isCorrect: false,
            explanation: "Incorrect. Custom regex sanitizers frequently have bypass vectors. Parameterization is the only safe standard."
          },
          {
            id: "opt-b",
            label: "Option B",
            codeSnippet: `db.query('SELECT * FROM items WHERE name = $1', [input])`,
            isCorrect: true,
            explanation: "Correct! Parameterized queries separate SQL compilation from data parameters, making syntax manipulation impossible."
          }
        ]
      },
      {
        id: "mc-inj-2",
        question: "Why is input length validation alone insufficient to prevent SQL injection?",
        options: [
          {
            id: "opt-a",
            label: "A dangerous injection payload like `' OR 1=1--` fits within 12 characters",
            isCorrect: true,
            explanation: "Correct! Devastating SQL injection attacks require very few characters to alter boolean logic or bypass auth."
          },
          {
            id: "opt-b",
            label: "Length validation causes buffer overflows in JavaScript",
            isCorrect: false,
            explanation: "Incorrect. Length checks do not affect string syntax safety."
          }
        ]
      }
    ],
    targetedExerciseId: "unchecked-return-values"
  },
  "auth-data-exposure": {
    id: "auth-data-exposure",
    title: "Data Exposure & Direct Entity Serialization",
    moduleNumber: "02",
    defectClassId: "auth",
    summary: "Returning raw database entity records directly over API responses leaks sensitive fields (passwords, MFA secrets, internal flags).",
    whyItHappens: "Developers return `{ data: user }` for speed, inadvertently exposing every internal column on the user table to public callers.",
    beforeSnippet: {
      filename: "userController.ts",
      code: `export const getProfile = async (req, res) => {\n  const user = await User.findById(req.params.id);\n  // BUG: Leaks passwordHash, resetTokens, stripeCustomerId\n  return res.json({ user });\n};`,
      badLineNumber: 4,
      annotation: "Direct serialization of internal DB model"
    },
    afterSnippet: {
      filename: "userController.ts",
      code: `export const getProfile = async (req, res) => {\n  const user = await User.findById(req.params.id);\n  // FIX: Explicit DTO projection\n  const safeProfile = {\n    id: user.id,\n    username: user.username,\n    avatarUrl: user.avatarUrl\n  };\n  return res.json({ user: safeProfile });\n};`,
      goodLineNumber: 4,
      annotation: "Only whitelist-approved public fields are returned"
    },
    mentalModel: {
      name: "DTO Boundary Projection",
      description: "Always map internal domain entities into explicit outward-facing Data Transfer Objects (DTOs) before sending over HTTP.",
      sourceLabel: "Database Model",
      sourceExample: "User { id, hash, salt }",
      flowLabel: "Boundary",
      flowState: "DTO Projection",
      sinkLabel: "Client Response",
      sinkExample: "{ id, username }"
    },
    patternToRemember: "Never serialize raw database records across network boundaries.",
    microChecks: [
      {
        id: "mc-auth-1",
        question: "What is the safest way to prevent accidental field leaks when database schemas change?",
        options: [
          {
            id: "opt-a",
            label: "Use an explicit whitelist DTO or mapper function",
            isCorrect: true,
            explanation: "Correct! Whitelisting ensures newly added database columns are never sent to clients by default."
          },
          {
            id: "opt-b",
            label: "Use `delete user.password` on the model object",
            isCorrect: false,
            explanation: "Incorrect. Blacklisting (`delete`) fails when new sensitive fields are added to the schema in the future."
          }
        ]
      },
      {
        id: "mc-auth-2",
        question: "In `if (user.isArchived = true)`, what is the critical flaw?",
        options: [
          {
            id: "opt-a",
            label: "Single `=` assigns `true` to `isArchived` and evaluates as truthy",
            isCorrect: true,
            explanation: "Correct! Assignment inside conditional statements mutates the object and triggers false positive branches."
          },
          {
            id: "opt-b",
            label: "JavaScript booleans cannot be compared with `true`",
            isCorrect: false,
            explanation: "Incorrect. The bug is assignment (`=`) instead of strict comparison (`===`)."
          }
        ]
      }
    ],
    targetedExerciseId: "jwt-token-verification"
  },
  "concurrency-races": {
    id: "concurrency-races",
    title: "Concurrency & Cache Stampede Dynamics",
    moduleNumber: "04",
    defectClassId: "concurrency",
    summary: "Asynchronous check-then-act sequences create race conditions under concurrent workloads without coordination or locking.",
    whyItHappens: "When multiple requests miss a cache simultaneously, all requests initiate expensive duplicate backend tasks (Thundering Herd).",
    beforeSnippet: {
      filename: "cache.ts",
      code: `async function getData(key) {\n  const cached = await redis.get(key);\n  if (!cached) {\n    // BUG: 50 concurrent requests all trigger upstream work\n    const fresh = await fetchUpstream(key);\n    await redis.set(key, fresh);\n    return fresh;\n  }\n  return cached;\n}`,
      badLineNumber: 5,
      annotation: "Unsynchronized cache miss triggers concurrent thundering herd"
    },
    afterSnippet: {
      filename: "cache.ts",
      code: `async function getData(key) {\n  const cached = await redis.get(key);\n  if (!cached) {\n    // FIX: Single-flight promise deduplication\n    return await singleFlight.do(key, async () => {\n      const fresh = await fetchUpstream(key);\n      await redis.set(key, fresh, 'EX', 300);\n      return fresh;\n    });\n  }\n  return cached;\n}`,
      goodLineNumber: 5,
      annotation: "Coalesces concurrent requests into a single upstream promise"
    },
    mentalModel: {
      name: "Check-Then-Act Window",
      description: "Any time interval between checking state and writing state is vulnerable to concurrent interference.",
      sourceLabel: "Concurrent Miss",
      sourceExample: "100 parallel requests",
      flowLabel: "Async Window",
      flowState: "Uncoordinated fetch",
      sinkLabel: "Upstream Overload",
      sinkExample: "Database collapse"
    },
    patternToRemember: "Coordinate async misses with distributed locks or single-flight deduplication.",
    microChecks: [
      {
        id: "mc-conc-1",
        question: "What is a 'Cache Stampede'?",
        options: [
          {
            id: "opt-a",
            label: "When simultaneous cache misses cause massive concurrent load on upstream data sources",
            isCorrect: true,
            explanation: "Correct! All requests try to recompute the expired key simultaneously."
          },
          {
            id: "opt-b",
            label: "When Redis runs out of memory and crashes",
            isCorrect: false,
            explanation: "Incorrect. A stampede is about concurrent miss storms overloading the primary database or API."
          }
        ]
      },
      {
        id: "mc-conc-2",
        question: "How does promise single-flighting resolve the thundering herd problem?",
        options: [
          {
            id: "opt-a",
            label: "It shares one in-flight Promise among all concurrent callers for the same key",
            isCorrect: true,
            explanation: "Correct! Only one upstream network call executes; all waiting callers resolve with the same result."
          },
          {
            id: "opt-b",
            label: "It disables caching completely",
            isCorrect: false,
            explanation: "Incorrect. Single-flighting deduplicates concurrent in-flight computations."
          }
        ]
      }
    ],
    targetedExerciseId: "memory-leak-closures"
  },
  "logic-boundary-offbyone": {
    id: "logic-boundary-offbyone",
    title: "Boundary Conditions & Off-by-One Offsets",
    moduleNumber: "05",
    defectClassId: "logic-boundary",
    summary: "Boundary errors occur when inclusive and exclusive ranges, 0-based vs 1-based indexing, and loop terminal conditions are mixed.",
    whyItHappens: "`Array.prototype.slice(start, end)` is zero-indexed and non-inclusive of `end`. Adding unnecessary increments leaks items across page boundaries.",
    beforeSnippet: {
      filename: "pagination.ts",
      code: `function paginate(items, page, pageSize) {\n  const start = (page - 1) * pageSize;\n  // BUG: Adds 1 to exclusive end, returning pageSize + 1 items\n  const end = page * pageSize + 1;\n  return items.slice(start, end);\n}`,
      badLineNumber: 4,
      annotation: "Returns 11 items instead of 10 for page size 10"
    },
    afterSnippet: {
      filename: "pagination.ts",
      code: `function paginate(items, page, pageSize) {\n  const start = (page - 1) * pageSize;\n  // FIX: Exact exclusive boundary\n  const end = start + pageSize;\n  return items.slice(start, end);\n}`,
      goodLineNumber: 4,
      annotation: "Returns exactly pageSize items"
    },
    mentalModel: {
      name: "Half-Open Range [start, end)",
      description: "Length of a half-open range is always `end - start`. If pageSize is 10 and start is 0, end must be 10.",
      sourceLabel: "Page Request",
      sourceExample: "Page 1, Size 10",
      flowLabel: "Index Math",
      flowState: "start: 0, end: 10",
      sinkLabel: "Array Slice",
      sinkExample: "items.slice(0, 10)"
    },
    patternToRemember: "For half-open ranges [start, end), total item count equals end - start.",
    microChecks: [
      {
        id: "mc-log-1",
        question: "If `items.length = 20`, what does `items.slice(0, 10)` return?",
        options: [
          {
            id: "opt-a",
            label: "10 items (indexes 0 through 9)",
            isCorrect: true,
            explanation: "Correct! The `end` index (10) is excluded, yielding items at indexes 0,1,2,3,4,5,6,7,8,9."
          },
          {
            id: "opt-b",
            label: "11 items (indexes 0 through 10)",
            isCorrect: false,
            explanation: "Incorrect. `slice` is non-inclusive of the end parameter."
          }
        ]
      },
      {
        id: "mc-log-2",
        question: "When reviewing defensive pagination, what should you verify on empty array inputs?",
        options: [
          {
            id: "opt-a",
            label: "That `totalPages` does not divide by zero and returns at least 1 or 0 safely",
            isCorrect: true,
            explanation: "Correct! Boundary math on empty arrays must avoid NaN or negative index errors."
          },
          {
            id: "opt-b",
            label: "That all strings are uppercase",
            isCorrect: false,
            explanation: "Incorrect. The boundary check concerns empty lists and integer ranges."
          }
        ]
      }
    ],
    targetedExerciseId: "sql-injection-flow"
  },
  "resource-memory-closures": {
    id: "resource-memory-closures",
    title: "Closure Retention & Event Listener Leaks",
    moduleNumber: "06",
    defectClassId: "resource-performance",
    summary: "Registering anonymous event handlers on persistent or singleton event emitters captures outer scope variables indefinitely.",
    whyItHappens: "When ephemeral objects (e.g. per-request sockets, DOM elements) attach listeners to long-lived objects without detaching on destroy, garbage collection is prevented.",
    beforeSnippet: {
      filename: "emitter.ts",
      code: `class Session {\n  constructor(socket) {\n    this.data = new Array(1000000);\n    // BUG: Global emitter holds reference to this closure forever\n    globalEvents.on('tick', () => this.update(socket));\n  }\n}`,
      badLineNumber: 5,
      annotation: "Global event emitter prevents Session garbage collection"
    },
    afterSnippet: {
      filename: "emitter.ts",
      code: `class Session {\n  constructor(socket) {\n    this.data = new Array(1000000);\n    this.handler = () => this.update(socket);\n    globalEvents.on('tick', this.handler);\n  }\n  destroy() {\n    // FIX: Explicitly detach listener on teardown\n    globalEvents.off('tick', this.handler);\n  }\n}`,
      goodLineNumber: 8,
      annotation: "Detaching listener allows GC to reclaim Session and socket"
    },
    mentalModel: {
      name: "Long-Lived Parent → Ephemeral Child Root",
      description: "Any reference path from a Root/Global object to a transient object prevents garbage collection.",
      sourceLabel: "Singleton",
      sourceExample: "globalEmitter",
      flowLabel: "Closure Chain",
      flowState: "Holds this.socket reference",
      sinkLabel: "Heap Retention",
      sinkExample: "Uncollectible 1MB buffers"
    },
    patternToRemember: "Always detach event listeners and unregister callbacks when transient instances are destroyed.",
    microChecks: [
      {
        id: "mc-res-1",
        question: "Why does `emitter.on('event', () => this.render())` leak memory in UI components?",
        options: [
          {
            id: "opt-a",
            label: "The singleton `emitter` keeps a reference to the component instance via `this`",
            isCorrect: true,
            explanation: "Correct! The closure binds `this`, preventing the component from being garbage collected after unmount."
          },
          {
            id: "opt-b",
            label: "Arrow functions allocate 100MB of stack memory",
            isCorrect: false,
            explanation: "Incorrect. The memory leak is caused by reference retention, not arrow function overhead."
          }
        ]
      },
      {
        id: "mc-res-2",
        question: "What is the standard pattern to clean up event listeners?",
        options: [
          {
            id: "opt-a",
            label: "Save the named function reference and call `emitter.off(event, handler)` in teardown",
            isCorrect: true,
            explanation: "Correct! Passing the exact function reference removes it from the emitter's internal array."
          },
          {
            id: "opt-b",
            label: "Call `window.location.reload()` periodically",
            isCorrect: false,
            explanation: "Incorrect. Proper resource cleanup must be handled via deterministic lifecycle methods."
          }
        ]
      }
    ],
    targetedExerciseId: "race-condition-cache"
  }
};

export function getConcept(id: string): Concept {
  const found = CONCEPTS[id];
  return found || CONCEPTS["error-handling-returns"];
}
