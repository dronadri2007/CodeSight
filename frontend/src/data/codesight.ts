/* Design philosophy: Diagnostic Terminal. Keep product data concise, inspectable, and semantic so UI states teach debugging rather than decorate it. */
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type Challenge = { id: number; title: string; summary: string; difficulty: Difficulty; language: string; bugType: string; xp: number; time: string; completed: boolean; color: string };
export type ResourceType = 'lesson' | 'practice' | 'reference' | 'video';
export type PhaseOneResource = { id: string; title: string; description: string; detail: string; type: ResourceType; topic: string; language: string; route?: string; url?: string; duration: string };
export type PhaseOneProblem = { id: string; language: string; topic: string; subtopic: string; difficulty: Difficulty; title: string; description: string; prompt: string; starterCode: string; starter: string; expectedOutput: string; hints: string[]; learningConcept: string; concept: string; analysis: { type: string; location: string; why: string; suggestion: string }; resources: PhaseOneResource[] };

export const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Problems', href: '/problems', icon: 'Code2' },
  { label: 'Write Lab', href: '/write', icon: 'Code2' },
  { label: 'Code Review', href: '/code-review', icon: 'Bug' },
  { label: 'Code X-Ray', href: '/code-xray', icon: 'Sparkles' },
  { label: 'False Positive', href: '/false-positive', icon: 'Shield' },
  { label: 'Debug Arena', href: '/arena', icon: 'Bug' },
  { label: 'Challenges', href: '/challenges', icon: 'Layers3' },
  { label: 'Learn', href: '/learn', icon: 'BookOpen' },
  { label: 'Progress', href: '/progress', icon: 'ChartNoAxesCombined' },
  { label: 'Leaderboard', href: '/leaderboard', icon: 'Trophy' },
];

export const challenges: Challenge[] = [
  { id: 1, title: 'The Vanishing Index', summary: 'A loop quietly skips the final item in a collection.', difficulty: 'Easy', language: 'Python', bugType: 'Off-by-One', xp: 120, time: '04 min', completed: true, color: 'mint' },
  { id: 2, title: 'Scope of the Problem', summary: 'A value looks right—until the function returns.', difficulty: 'Medium', language: 'JavaScript', bugType: 'Logic Error', xp: 180, time: '08 min', completed: false, color: 'cyan' },
  { id: 3, title: 'Null at Runtime', summary: 'Trace the object access that turns a request into a crash.', difficulty: 'Medium', language: 'TypeScript', bugType: 'Null / None', xp: 220, time: '11 min', completed: false, color: 'amber' },
  { id: 4, title: 'The Quiet Recursion', summary: 'A missing base case keeps the call stack climbing.', difficulty: 'Hard', language: 'C++', bugType: 'Infinite Loop', xp: 320, time: '16 min', completed: false, color: 'coral' },
  { id: 5, title: 'Sorting the Evidence', summary: 'One comparator flips a reliable algorithm on its head.', difficulty: 'Expert', language: 'Python', bugType: 'Performance', xp: 450, time: '24 min', completed: false, color: 'violet' },
  { id: 6, title: 'A Condition Apart', summary: 'Read the branch that makes valid input look invalid.', difficulty: 'Easy', language: 'JavaScript', bugType: 'Incorrect Condition', xp: 140, time: '05 min', completed: true, color: 'mint' },
];

export type WeeklyActivityPoint = { day: string; value: number; solved: number; xp: number; note: string };
export const weeklyActivity: WeeklyActivityPoint[] = [
  { day: 'MON', value: 25, solved: 2, xp: 50, note: 'Signal established' },
  { day: 'TUE', value: 48, solved: 4, xp: 90, note: 'Steady pace' },
  { day: 'WED', value: 36, solved: 3, xp: 70, note: 'Trace active' },
  { day: 'THU', value: 62, solved: 5, xp: 120, note: 'Strong momentum' },
  { day: 'FRI', value: 49, solved: 4, xp: 95, note: 'Consistent flow' },
  { day: 'SAT', value: 86, solved: 8, xp: 210, note: 'Peak focus!' },
  { day: 'SUN', value: 54, solved: 5, xp: 110, note: 'Chain intact' },
];

export const monthlyActivity: WeeklyActivityPoint[] = [
  { day: 'WK 1', value: 42, solved: 14, xp: 350, note: 'Baseline established' },
  { day: 'WK 2', value: 65, solved: 22, xp: 580, note: 'Accelerating' },
  { day: 'WK 3', value: 58, solved: 19, xp: 490, note: 'Consistent trace' },
  { day: 'WK 4', value: 84, solved: 32, xp: 810, note: 'Monthly peak focus!' },
];

export const learningTopics = [
  { title: 'Reading Stack Traces', level: 'Foundations', duration: '12 min', progress: 72, icon: 'Route', description: 'Turn a noisy trace into a path back to the actual failure.' },
  { title: 'Debugging Methodology', level: 'Foundations', duration: '18 min', progress: 38, icon: 'ScanSearch', description: 'A repeatable inspect → detect → explain → fix loop.' },
  { title: 'Logical Debugging', level: 'Core skill', duration: '24 min', progress: 54, icon: 'GitBranch', description: 'Test assumptions and follow the data through each decision.' },
  { title: 'Runtime Debugging', level: 'Core skill', duration: '20 min', progress: 16, icon: 'Activity', description: 'Understand what the program is doing when the code looks fine.' },
  { title: 'Python Debugging', level: 'Language track', duration: '31 min', progress: 84, icon: 'Braces', description: 'Common failure modes in Python collections, scope, and types.' },
  { title: 'JavaScript Debugging', level: 'Language track', duration: '28 min', progress: 41, icon: 'Code2', description: 'Async behavior, scope, and the browser runtime in plain language.' },
];

export const achievements = [
  { title: 'First Fix', detail: 'Fix your first bug.', earned: true, icon: 'Sparkles' },
  { title: 'Bug Hunter', detail: 'Fix 50 bugs.', earned: true, icon: 'Crosshair' },
  { title: 'Logic Detective', detail: 'Solve 25 logic-error challenges.', earned: false, icon: 'Search' },
  { title: '7-Day Streak', detail: 'Debug for seven consecutive days.', earned: false, icon: 'Flame' },
];

export const leaderboard = [
  { rank: 1, name: 'Mina Park', handle: '@minap', xp: 4920, bugs: 184, accuracy: '94%' },
  { rank: 2, name: 'Tobias Reed', handle: '@tobiasr', xp: 4380, bugs: 161, accuracy: '91%' },
  { rank: 3, name: 'You', handle: '@alexm', xp: 2450, bugs: 137, accuracy: '82%' },
  { rank: 4, name: 'Jo Alvarez', handle: '@jo.codes', xp: 2210, bugs: 119, accuracy: '86%' },
  { rank: 5, name: 'Sara Kim', handle: '@sarak', xp: 2040, bugs: 108, accuracy: '80%' },
];

export const phaseOneLanguages = ['Python', 'JavaScript', 'Java', 'C++'];
export const phaseOneTopics = [
  { name: 'Variables', completed: true, accuracy: 96, problems: 4, mistakes: 'None', color: 'mint' },
  { name: 'Data Types', completed: true, accuracy: 88, problems: 3, mistakes: 'Type mismatch', color: 'mint' },
  { name: 'Conditions', completed: true, accuracy: 91, problems: 4, mistakes: 'None', color: 'mint' },
  { name: 'Loops', completed: true, accuracy: 76, problems: 6, mistakes: 'Off-by-one', color: 'amber' },
  { name: 'Functions', completed: true, accuracy: 84, problems: 5, mistakes: 'Scope', color: 'mint' },
  { name: 'Lists', completed: true, accuracy: 79, problems: 5, mistakes: 'Index boundary', color: 'amber' },
  { name: 'Dictionaries', completed: true, accuracy: 82, problems: 3, mistakes: 'None', color: 'mint' },
  { name: 'OOP', completed: false, accuracy: 62, problems: 2, mistakes: 'Inheritance', color: 'coral' },
  { name: 'Recursion', completed: true, accuracy: 73, problems: 4, mistakes: 'Base case', color: 'amber' },
  { name: 'Error Handling', completed: true, accuracy: 89, problems: 3, mistakes: 'None', color: 'mint' },
];

const resource = (language: string, topic: string, id: string, title: string, description: string, type: ResourceType, duration: string): PhaseOneResource => ({
  id, title, description, detail: description, type, duration, topic, language,
  route: type === 'practice' ? `/challenges?language=${encodeURIComponent(language)}&topic=${encodeURIComponent(topic)}` : `/learn?topic=${encodeURIComponent(topic)}&language=${encodeURIComponent(language)}`,
});

export const resourcesFor = (language: string, topic: string): PhaseOneResource[] => [
  resource(language, topic, `${language.toLowerCase()}-${topic.toLowerCase().replaceAll(' ', '-')}-lesson`, `${language} ${topic} fundamentals`, `A focused lesson on the ${topic.toLowerCase()} decisions used in this problem.`, 'lesson', '8 min'),
  resource(language, topic, `${language.toLowerCase()}-${topic.toLowerCase().replaceAll(' ', '-')}-practice`, `${topic} practice set`, `Three short ${topic.toLowerCase()} exercises with boundary cases and feedback.`, 'practice', '3 problems'),
  resource(language, topic, `${language.toLowerCase()}-${topic.toLowerCase().replaceAll(' ', '-')}-reference`, `${language} ${topic} reference`, `A structured reference for reviewing ${topic.toLowerCase()} after the analysis.`, 'reference', '10 min'),
];

const starterCodeFor = (language: string, topic: string): string => {
  const slug = topic.toLowerCase().replaceAll(' ', '_');
  if (language === 'Python') return `def solve_${slug}(value):\n    # write your ${topic.toLowerCase()} solution here\n    return value`;
  if (language === 'JavaScript') return `function solve${topic.replaceAll(' ', '')}(value) {\n  // write your ${topic.toLowerCase()} solution here\n  return value;\n}`;
  if (language === 'Java') return `class Solution {\n  static int solve${topic.replaceAll(' ', '')}(int value) {\n    // write your ${topic.toLowerCase()} solution here\n    return value;\n  }\n}`;
  return `int solve_${slug}(int value) {\n  // write your ${topic.toLowerCase()} solution here\n  return value;\n}`;
};

const detailedBlueprints: Record<string, Record<Difficulty, { title: string; description: string; prompt: string; starterCode: string; expectedOutput: string; subtopic: string }>> = {
  'Error Handling': {
    Easy: {
      title: 'Safe JSON Dict Key Extraction',
      description: 'Safely extract nested dict values without triggering KeyError or NoneType subscript exceptions.',
      prompt: 'Write a function that safely accesses dict keys and returns a fallback when keys are missing or None.',
      starterCode: 'def solve_safe_json(data, key):\n    if data and isinstance(data, dict) and key in data:\n        return data[key]\n    return "default"',
      expectedOutput: 'default',
      subtopic: 'safe key recovery'
    },
    Medium: {
      title: 'Safe User Profile Lookup with Error Boundaries',
      description: "Implement 'fetch_user_profile(user_id, db_conn)' that safely queries a database cursor, ensures defensive validation against 'NoneType' subscript exceptions, and handles unexpected timeouts gracefully.",
      prompt: "Implement 'fetch_user_profile(user_id, db_conn)' that safely queries a database cursor, ensures defensive validation against 'NoneType' subscript exceptions, and handles unexpected timeouts gracefully.",
      starterCode: 'class UserNotFoundError(Exception):\n    pass\n\ndef fetch_user_profile(user_id: str, db_conn):\n    # TODO: Safely execute query and verify row is not None before indexing\n    cursor = db_conn.cursor()\n    cursor.execute("SELECT id, username, email FROM users WHERE id = %s", (user_id,))\n    row = cursor.fetchone()\n    \n    # Naive access without None-check\n    return {"id": row[0], "username": row[1], "email": row[2]}',
      expectedOutput: 'User profile dict',
      subtopic: 'NoneType validation and exceptions'
    },
    Hard: {
      title: 'Transactional Pipeline Recovery with Retry Backoff',
      description: 'Wrap database pipeline transactions with exponential retry backoff to handle transient database locks.',
      prompt: 'Implement retry backoff with transaction rollback on error.',
      starterCode: 'def execute_with_retry(pipeline_fn, max_retries=3):\n    # Implement retry loop with exponential backoff\n    pass',
      expectedOutput: 'success',
      subtopic: 'transactional recovery'
    },
    Expert: {
      title: 'Distributed Error Boundary Circuit Breaker',
      description: 'Implement a stateful circuit breaker to trip open after 5 consecutive service failures.',
      prompt: 'Implement circuit breaker pattern with closed, open, and half-open states.',
      starterCode: 'class CircuitBreaker:\n    def __init__(self):\n        self.failures = 0\n    def call(self, fn):\n        return fn()',
      expectedOutput: 'tripped',
      subtopic: 'circuit breakers'
    }
  },
  'Resource Leaks & Performance': {
    Easy: {
      title: 'Unclosed File Handle Guard',
      description: 'Ensure file descriptors are closed immediately using context managers to prevent descriptor leaks.',
      prompt: 'Open and read a file safely using context managers.',
      starterCode: 'def read_config_file(filepath):\n    with open(filepath, "r") as f:\n        return f.read()',
      expectedOutput: 'config_data',
      subtopic: 'context managers'
    },
    Medium: {
      title: 'Streaming Log Analyzer with Constant Memory',
      description: 'Process a continuous event log stream to count critical errors without loading full arrays into memory.',
      prompt: 'Process a continuous event log stream to count critical errors without loading full arrays into memory.',
      starterCode: 'def solve_streaming_log_analyzer(log_stream):\n    # Process stream with O(1) auxiliary memory\n    error_count = 0\n    for line in log_stream:\n        if "CRITICAL" in line:\n            error_count += 1\n    return error_count',
      expectedOutput: '42',
      subtopic: 'constant memory streaming'
    },
    Hard: {
      title: 'Bounded Memory Chunked Payload Streamer',
      description: 'Stream large HTTP payloads in fixed 64KB chunks to prevent memory spikes under high concurrency.',
      prompt: 'Stream large HTTP payloads in fixed 64KB chunks.',
      starterCode: 'def stream_chunks(data_stream, chunk_size=65536):\n    while True:\n        chunk = data_stream.read(chunk_size)\n        if not chunk:\n            break\n        yield chunk',
      expectedOutput: 'streamed',
      subtopic: 'chunked streaming'
    },
    Expert: {
      title: 'Zero-Copy Shared Memory Buffer Allocator',
      description: 'Allocate zero-copy shared memory slices across worker processes without IPC serializing overhead.',
      prompt: 'Allocate zero-copy memory slices.',
      starterCode: 'def allocate_shared_buffer(size):\n    pass',
      expectedOutput: 'buffer_ref',
      subtopic: 'zero-copy IPC'
    }
  },
  'Conditions': {
    Easy: {
      title: 'Guard the Threshold',
      description: 'Return true when a score reaches the passing threshold of 70, including exactly 70.',
      prompt: 'Return true when a score reaches 70.',
      starterCode: 'def guard_threshold(score):\n    return score >= 70',
      expectedOutput: 'true',
      subtopic: 'boundary checks'
    },
    Medium: {
      title: 'Off-by-One Binary Search Boundary',
      description: 'Correct the low and high pointers in a binary search to prevent infinite loops on missing target keys.',
      prompt: 'Fix binary search boundary condition pointers.',
      starterCode: 'def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1',
      expectedOutput: 'index',
      subtopic: 'binary search boundary'
    },
    Hard: {
      title: 'Quadratic Sliding Window Optimization',
      description: 'Refactor an O(N²) nested loop sliding window into an optimal O(N) two-pointer window algorithm.',
      prompt: 'Refactor O(N²) nested loop into O(N) sliding window.',
      starterCode: 'def max_subarray_sum(arr, k):\n    # Optimize to O(N)\n    window_sum = sum(arr[:k])\n    max_sum = window_sum\n    for i in range(len(arr) - k):\n        window_sum = window_sum - arr[i] + arr[i + k]\n        max_sum = max(max_sum, window_sum)\n    return max_sum',
      expectedOutput: 'max_val',
      subtopic: 'two-pointer sliding window'
    },
    Expert: {
      title: 'Segment Tree Range Query Invariant',
      description: 'Implement a segment tree for range sum queries with logarithmic update complexity.',
      prompt: 'Implement segment tree range queries.',
      starterCode: 'class SegmentTree:\n    pass',
      expectedOutput: 'range_sum',
      subtopic: 'segment trees'
    }
  },
  'Variables': {
    Easy: {
      title: 'Sanitize Raw URL Parameters',
      description: 'Validate and escape query string parameters before passing them to internal routing handlers.',
      prompt: 'Validate and escape query string parameters.',
      starterCode: 'import html\ndef sanitize_param(param):\n    return html.escape(str(param))',
      expectedOutput: 'escaped_string',
      subtopic: 'input escaping'
    },
    Medium: {
      title: 'Defensive SQL Statement Builder',
      description: 'Replace string concatenation in SQL query building with parameterized query tuples.',
      prompt: 'Replace string concatenation with parameterized SQL query tuples.',
      starterCode: 'def build_query(user_input):\n    return ("SELECT * FROM accounts WHERE username = %s", (user_input,))',
      expectedOutput: 'parameterized_tuple',
      subtopic: 'parameterized queries'
    },
    Hard: {
      title: 'AST-Based Unescaped Input Scanner',
      description: 'Scan Python AST nodes to identify unescaped user inputs passed to system command subprocesses.',
      prompt: 'Scan AST nodes for unescaped user inputs.',
      starterCode: 'import ast\ndef scan_ast(code_str):\n    tree = ast.parse(code_str)\n    return tree',
      expectedOutput: 'vulnerable_nodes',
      subtopic: 'AST analysis'
    },
    Expert: {
      title: 'Tainted Data Flow Analyzer',
      description: 'Perform static taint analysis across inter-procedural function calls.',
      prompt: 'Perform static taint analysis.',
      starterCode: 'def analyze_taint(call_graph):\n    pass',
      expectedOutput: 'tainted_paths',
      subtopic: 'taint analysis'
    }
  },
  'Data Types': {
    Easy: {
      title: 'Constant-Time Token Comparator',
      description: 'Compare authentication token hashes using hmac.compare_digest to prevent timing attacks.',
      prompt: 'Compare authentication token hashes in constant time.',
      starterCode: 'import hmac\ndef compare_tokens(token_a, token_b):\n    return hmac.compare_digest(str(token_a), str(token_b))',
      expectedOutput: 'true',
      subtopic: 'constant-time comparison'
    },
    Medium: {
      title: 'Session Hijacking & ACL Verifier',
      description: 'Verify user session tokens against IP address subnets and ACL role permissions before executing sensitive operations.',
      prompt: 'Verify user session tokens against IP subnets and ACL roles.',
      starterCode: 'def verify_acl(session, user_role, required_role):\n    return bool(session.get("active") and user_role == required_role)',
      expectedOutput: 'true',
      subtopic: 'ACL verification'
    },
    Hard: {
      title: 'Role Hierarchy & Permission Evaluator',
      description: 'Evaluate inherited role permissions across a complex nested RBAC tree with dynamic overrides.',
      prompt: 'Evaluate inherited role permissions in a nested RBAC tree.',
      starterCode: 'def evaluate_permissions(user, action, resource):\n    # Traverse RBAC tree\n    return True',
      expectedOutput: 'permission_granted',
      subtopic: 'RBAC tree traversal'
    },
    Expert: {
      title: 'Zero-Knowledge Proof Token Verifier',
      description: 'Verify Schnorr zero-knowledge proof tokens without revealing identity secrets.',
      prompt: 'Verify zero-knowledge proof tokens.',
      starterCode: 'def verify_zkp(proof, public_key):\n    pass',
      expectedOutput: 'valid_proof',
      subtopic: 'ZKP verification'
    }
  },
  'Loops': {
    Easy: {
      title: 'Atomic Counter Increment',
      description: 'Use thread locks or atomic operations to safely increment a shared counter across parallel threads.',
      prompt: 'Safely increment shared counter with locks.',
      starterCode: 'import threading\nlock = threading.Lock()\ndef increment_counter(shared_obj):\n    with lock:\n        shared_obj.count += 1',
      expectedOutput: 'count_incremented',
      subtopic: 'atomic operations'
    },
    Medium: {
      title: 'Deadlock-Free Lock Ordering Sequence',
      description: 'Enforce a strict global lock acquisition order to prevent deadlocks when transferring balances between accounts.',
      prompt: 'Enforce global lock acquisition order to prevent deadlocks.',
      starterCode: 'def transfer(acc1, acc2, amount):\n    first, second = (acc1, acc2) if acc1.id < acc2.id else (acc2, acc1)\n    with first.lock:\n        with second.lock:\n            acc1.balance -= amount\n            acc2.balance += amount',
      expectedOutput: 'transferred',
      subtopic: 'lock ordering'
    },
    Hard: {
      title: 'Non-Blocking Reader-Writer State Manager',
      description: 'Implement a lock-free copy-on-write state dictionary for high-frequency concurrent read workloads.',
      prompt: 'Implement lock-free copy-on-write state manager.',
      starterCode: 'def update_state_cow(current_dict, key, value):\n    new_dict = current_dict.copy()\n    new_dict[key] = value\n    return new_dict',
      expectedOutput: 'updated_state',
      subtopic: 'lock-free COW'
    },
    Expert: {
      title: 'Lock-Free Ring Buffer Queue',
      description: 'Implement a lock-free single-producer single-consumer ring buffer using atomic compare-and-swap.',
      prompt: 'Implement CAS ring buffer.',
      starterCode: 'class LockFreeRingBuffer:\n    pass',
      expectedOutput: 'enqueued',
      subtopic: 'CAS ring buffer'
    }
  }
};

const defaultBlueprint = {
  title: 'Algorithmic Practice Problem',
  description: 'Write an optimal solution adhering to optimal Time and Space Complexity bounds.',
  prompt: 'Write an optimal solution adhering to optimal Time and Space Complexity bounds.',
  starterCode: 'def solve(value):\n    return value',
  expectedOutput: '42',
  subtopic: 'algorithmic instincts'
};

const topicBlueprints = [
  { topic: 'Variables', subtopic: 'input escaping', title: 'Sanitize Raw URL Parameters', description: 'Validate and escape query string parameters before passing them to internal routing handlers.', expectedOutput: 'escaped_string', concept: 'Variables' },
  { topic: 'Data Types', subtopic: 'constant-time comparison', title: 'Constant-Time Token Comparator', description: 'Compare authentication token hashes using hmac.compare_digest to prevent timing attacks.', expectedOutput: 'true', concept: 'Data Types' },
  { topic: 'Conditions', subtopic: 'boundary checks', title: 'Guard the Threshold', description: 'Return true when a score reaches the passing threshold of 70, including exactly 70.', expectedOutput: 'true', concept: 'Conditions' },
  { topic: 'Loops', subtopic: 'atomic operations', title: 'Atomic Counter Increment', description: 'Use thread locks or atomic operations to safely increment a shared counter across parallel threads.', expectedOutput: 'count_incremented', concept: 'Loops' },
  { topic: 'Functions', subtopic: 'parameters and return values', title: 'Return the computed signal', description: 'Complete the function so the computed signal is returned to the caller.', expectedOutput: '18', concept: 'Functions' },
  { topic: 'Lists', subtopic: 'index boundaries', title: 'Read the final item', description: 'Return the final item in a list without stepping beyond its valid indexes.', expectedOutput: '21', concept: 'Lists' },
  { topic: 'Dictionaries', subtopic: 'key lookup', title: 'Find the keyed signal', description: 'Read the value stored under the requested key and return a safe result.', expectedOutput: 'active', concept: 'Dictionaries' },
  { topic: 'OOP', subtopic: 'inheritance', title: 'Share the behavior', description: 'Create a specialized type that inherits the base notification behavior.', expectedOutput: 'email: sent', concept: 'OOP' },
  { topic: 'Recursion', subtopic: 'base cases', title: 'Stop the call stack', description: 'Complete the recursive function with a base case that reaches the expected result.', expectedOutput: '5', concept: 'Recursion' },
  { topic: 'Error Handling', subtopic: 'safe recovery', title: 'Safe User Profile Lookup with Error Boundaries', description: 'Implement fetch_user_profile(user_id, db_conn) that safely queries a database cursor.', expectedOutput: 'user_profile', concept: 'Error Handling' },
  { topic: 'Resource Leaks & Performance', subtopic: 'constant memory streaming', title: 'Streaming Log Analyzer with Constant Memory', description: 'Process a continuous event log stream without storing full payload arrays in memory, preserving O(1) space complexity.', expectedOutput: '42', concept: 'Resource Leaks & Performance' },
];

export const phaseOneProblems: PhaseOneProblem[] = phaseOneLanguages.flatMap(language => 
  topicBlueprints.flatMap(blueprint => 
    (['Easy', 'Medium', 'Hard'] as Difficulty[]).map(difficulty => {
      const topicDetails = detailedBlueprints[blueprint.topic]?.[difficulty] || {
        title: `${blueprint.title} (${difficulty})`,
        description: blueprint.description,
        prompt: blueprint.description,
        starterCode: starterCodeFor(language, blueprint.topic),
        expectedOutput: blueprint.expectedOutput,
        subtopic: blueprint.subtopic
      };

      return {
        id: `${language.toLowerCase()}-${blueprint.topic.toLowerCase().replaceAll(' ', '-')}-${difficulty.toLowerCase()}`,
        language,
        topic: blueprint.topic,
        subtopic: topicDetails.subtopic,
        difficulty,
        title: topicDetails.title,
        description: topicDetails.description,
        prompt: topicDetails.prompt,
        starterCode: topicDetails.starterCode,
        starter: topicDetails.starterCode,
        expectedOutput: topicDetails.expectedOutput,
        hints: [`Trace the input before choosing a construct.`, `Check the ${topicDetails.subtopic} boundary with the smallest valid example.`, `Compare the expected output with the value your code returns.`],
        learningConcept: `${language} ${blueprint.concept}`,
        concept: `${language} ${blueprint.concept}`,
        analysis: { type: blueprint.topic === 'Loops' ? 'Off-by-one error' : `Review ${topicDetails.subtopic}`, location: 'The highlighted boundary', why: `The current ${topicDetails.subtopic} logic does not match the required behavior.`, suggestion: `Review ${topicDetails.subtopic} with a smallest-valid-input test.` },
        resources: resourcesFor(language, blueprint.topic),
      };
    })
  )
);

export const getPhaseOneProblem = (language: string, topic: string, difficulty: string): PhaseOneProblem | undefined => phaseOneProblems.find(problem => problem.language === language && problem.topic === topic && problem.difficulty === difficulty);
export const getPhaseOneRecommendations = (language: string, topic: string): PhaseOneResource[] => resourcesFor(language, topic);
export const personalizedRecommendations = resourcesFor('Python', 'Loops');
export const phaseMeta = { phaseOne: 'Write Code + Analysis', phaseTwo: 'Find + Fix the Bug' };

export const codeLines = [
  'def average_temperature(readings):',
  '    total = 0',
  '    for index in range(len(readings) - 1):',
  '        total += readings[index]',
  '    return total / len(readings)',
];
