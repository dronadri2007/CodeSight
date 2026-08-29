import type { Problem } from '../types'

export const mockProblems: Problem[] = [
  // 1. STUDENT MODE: Two Sum Optimization (Logic & Boundary)
  {
    id: 'prob-01',
    number: 1,
    title: 'Two Sum Sub-Quadratic Target',
    mode: 'student',
    difficulty: 'Easy',
    defectClassId: 'logic',
    defectClassName: 'Logic & Boundary Conditions',
    acceptanceRate: 84,
    estimatedMinutes: 5,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

**Complexity Objective**:
- A naive double loop achieves **Time $O(n^2)$**, which is suboptimal.
- Implement an optimal solution achieving **Time $O(n)$** and **Space $O(n)$** using a hash map lookup.`,
    starterCode: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Write an optimal O(n) solution from scratch
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
    solutionCode: `def two_sum(nums: list[int], target: int) -> list[int]:
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []`,
    optimalTC: 'O(n)',
    optimalSC: 'O(n)',
    brokenTC: 'O(n^2)',
    brokenSC: 'O(1)',
    testCases: [
      { input: 'nums=[2,7,11,15], target=9', expected: '[0, 1]', description: 'Basic complement lookup' },
      { input: 'nums=[3,2,4], target=6', expected: '[1, 2]', description: 'Non-zero index complement' },
      { input: 'nums=[3,3], target=6', expected: '[0, 1]', description: 'Duplicate value target' },
    ],
    weaknessPattern: 'Defaulting to nested loops instead of single-pass hash lookups for pairs.',
    conceptId: 'logic',
    youtubeVideoId: 'KLlXCFG5TnA',
    examEligible: true,
  },

  // 2. STUDENT MODE: Safe Database Record Lookup (Error & Exception Handling)
  {
    id: 'prob-02',
    number: 2,
    title: 'Safe User Profile Lookup with Error Boundaries',
    mode: 'student',
    difficulty: 'Medium',
    defectClassId: 'error-handling',
    defectClassName: 'Error & Exception Handling',
    acceptanceRate: 68,
    estimatedMinutes: 6,
    description: `Implement \`fetch_user_profile(user_id, db_conn)\` that safely queries a database cursor, ensures defensive validation against \`NoneType\` subscript exceptions, and handles unexpected timeouts gracefully.

**Complexity & Safety Objective**:
- Single round-trip lookup: **Time $O(1)$**, **Space $O(1)$**.
- Raise \`UserNotFoundError\` if cursor returns \`None\`.`,
    starterCode: `class UserNotFoundError(Exception):
    pass

def fetch_user_profile(user_id: str, db_conn):
    # TODO: Safely execute query and verify row is not None before indexing
    cursor = db_conn.cursor()
    cursor.execute("SELECT id, username, email FROM users WHERE id = %s", (user_id,))
    row = cursor.fetchone()
    
    # Naive access without None-check
    return {"id": row[0], "username": row[1], "email": row[2]}`,
    solutionCode: `class UserNotFoundError(Exception):
    pass

def fetch_user_profile(user_id: str, db_conn):
    if not user_id or not isinstance(user_id, str):
        raise ValueError("Invalid user_id provided")
        
    try:
        cursor = db_conn.cursor()
        cursor.execute("SELECT id, username, email FROM users WHERE id = %s", (user_id,))
        row = cursor.fetchone()
        
        if row is None:
            raise UserNotFoundError(f"User {user_id} does not exist")
            
        return {"id": row[0], "username": row[1], "email": row[2]}
    except Exception as e:
        if isinstance(e, UserNotFoundError):
            raise
        raise RuntimeError(f"Database error during lookup: {e}")`,
    optimalTC: 'O(1)',
    optimalSC: 'O(1)',
    brokenTC: 'O(1)',
    brokenSC: 'O(1)',
    testCases: [
      { input: 'user_id="usr_100"', expected: 'dict object with id, username, email', description: 'Existing user returns record dictionary' },
      { input: 'user_id="usr_missing"', expected: 'UserNotFoundError raised', description: 'Missing user raises UserNotFoundError without crashing on row[0]' },
      { input: 'user_id=""', expected: 'ValueError raised', description: 'Empty string input rejected early' },
    ],
    weaknessPattern: 'Assuming database queries always return populated records without null-checking.',
    conceptId: 'error-handling',
    youtubeVideoId: 'nlCKrKGHSSo',
    examEligible: true,
  },

  // 3. STUDENT MODE: Constant-Time Auth Token Verifier (Auth & Access Control)
  {
    id: 'prob-03',
    number: 3,
    title: 'Constant-Time Authentication Token Verifier',
    mode: 'student',
    difficulty: 'Medium',
    defectClassId: 'auth',
    defectClassName: 'Auth & Access Control',
    acceptanceRate: 61,
    estimatedMinutes: 5,
    description: `Write a token authentication function \`verify_auth_token(provided_token, expected_token)\` that performs constant-time string comparison to completely prevent side-channel timing attacks.

**Complexity Objective**:
- Standard \`==\` returns early upon the first mismatch ($O(k)$ where $k$ is matching prefix length).
- Optimal: **Time $O(n)$** constant-time full traversal where $n = len(token)$, **Space $O(1)$**.`,
    starterCode: `def verify_auth_token(provided_token: str, expected_token: str) -> bool:
    # Intentionally vulnerable timing-unsafe comparison
    if not provided_token or not expected_token:
        return False
    return provided_token == expected_token`,
    solutionCode: `import hmac

def verify_auth_token(provided_token: str, expected_token: str) -> bool:
    if not isinstance(provided_token, str) or not isinstance(expected_token, str):
        return False
    if len(provided_token) != len(expected_token):
        return False
    return hmac.compare_digest(provided_token.encode('utf-8'), expected_token.encode('utf-8'))`,
    optimalTC: 'O(n)',
    optimalSC: 'O(1)',
    brokenTC: 'O(k)',
    brokenSC: 'O(1)',
    testCases: [
      { input: 'provided="sec_tok_99", expected="sec_tok_99"', expected: 'True', description: 'Matching token returns True' },
      { input: 'provided="sec_tok_00", expected="sec_tok_99"', expected: 'False', description: 'Differing token returns False in constant time' },
      { input: 'provided="", expected="sec_tok_99"', expected: 'False', description: 'Empty token returns False cleanly' },
    ],
    weaknessPattern: 'Using standard equality operators for cryptographic secrets allowing timing attacks.',
    conceptId: 'auth',
    youtubeVideoId: 'm2OZ_45L6_Q',
    examEligible: true,
  },

  // 4. AI ENGINEER MODE: Fix Unparameterized SQL Query (Injection)
  {
    id: 'prob-04',
    number: 4,
    title: 'AI Code Review: Unparameterized Search Query Builder',
    mode: 'ai_engineer',
    difficulty: 'Medium',
    defectClassId: 'injection',
    defectClassName: 'Injection & Input Validation',
    acceptanceRate: 74,
    estimatedMinutes: 6,
    description: `**AI-Generated Code Snippet Review**:
An LLM assistant generated this search query builder for a Flask API. It uses string concatenation and f-strings directly inside the raw SQL query.

**Your Goal**:
1. Edit the broken code directly in Monaco to use parameterized query placeholders \`%s\` and tuple argument passing.
2. Ensure input sanitization without breaking the functionality.`,
    starterCode: `# AI-GENERATED CODE - INSPECT & FIX IN MONACO
def search_products(category: str, min_price: float, db_conn) -> list[dict]:
    cursor = db_conn.cursor()
    # Flaw: String formatting introduces critical SQL injection
    query = f"SELECT id, name, price FROM products WHERE category = '{category}' AND price >= {min_price}"
    cursor.execute(query)
    rows = cursor.fetchall()
    return [{"id": r[0], "name": r[1], "price": r[2]} for r in rows]`,
    brokenAiCode: `def search_products(category: str, min_price: float, db_conn) -> list[dict]:
    cursor = db_conn.cursor()
    # Flaw: String formatting introduces critical SQL injection
    query = f"SELECT id, name, price FROM products WHERE category = '{category}' AND price >= {min_price}"
    cursor.execute(query)
    rows = cursor.fetchall()
    return [{"id": r[0], "name": r[1], "price": r[2]} for r in rows]`,
    solutionCode: `def search_products(category: str, min_price: float, db_conn) -> list[dict]:
    if not isinstance(category, str) or not isinstance(min_price, (int, float)):
        raise ValueError("Invalid query parameter types")
        
    cursor = db_conn.cursor()
    query = "SELECT id, name, price FROM products WHERE category = %s AND price >= %s"
    cursor.execute(query, (category, float(min_price)))
    rows = cursor.fetchall()
    return [{"id": r[0], "name": r[1], "price": r[2]} for r in rows]`,
    optimalTC: 'O(n)',
    optimalSC: 'O(n)',
    brokenTC: 'O(n)',
    brokenSC: 'O(n)',
    testCases: [
      { input: 'category="electronics", min_price=50.0', expected: 'list of matching dicts', description: 'Standard parameterized execution' },
      { input: 'category="books\' OR \'1\'=\'1", min_price=0.0', expected: 'safe parameterized query execution', description: 'SQL injection payload treated safely as string literal' },
    ],
    weaknessPattern: 'String interpolation in SQL queries allowing SQL injection exploitation.',
    conceptId: 'injection',
    youtubeVideoId: '_jKylhJtPmI',
    examEligible: true,
  },

  // 5. AI ENGINEER MODE: Fix Mutex Deadlock & Race Condition (Concurrency)
  {
    id: 'prob-05',
    number: 5,
    title: 'AI Code Review: Concurrent Bank Account Transfer Lock',
    mode: 'ai_engineer',
    difficulty: 'Hard',
    defectClassId: 'concurrency',
    defectClassName: 'Concurrency & Race Conditions',
    acceptanceRate: 52,
    estimatedMinutes: 8,
    description: `**AI-Generated Code Snippet Review**:
An AI assistant wrote this account-to-account funds transfer function. It acquires locks on account A and account B in the order passed by the caller, causing a circular wait deadlock when two users transfer funds in opposite directions simultaneously.

**Your Goal**:
1. Fix the deadlock by establishing a strict deterministic lock ordering (e.g. by sorting account IDs).
2. Use Python \`with\` context managers to prevent unreleased lock leaks on exceptions.`,
    starterCode: `import threading

def transfer_funds(from_account, to_account, amount: float):
    # Flaw: Acquiring locks in arbitrary order causes classic deadlock
    from_account.lock.acquire()
    to_account.lock.acquire()
    try:
        if from_account.balance >= amount:
            from_account.balance -= amount
            to_account.balance += amount
            return True
        return False
    finally:
        to_account.lock.release()
        from_account.lock.release()`,
    brokenAiCode: `import threading

def transfer_funds(from_account, to_account, amount: float):
    from_account.lock.acquire()
    to_account.lock.acquire()
    try:
        if from_account.balance >= amount:
            from_account.balance -= amount
            to_account.balance += amount
            return True
        return False
    finally:
        to_account.lock.release()
        from_account.lock.release()`,
    solutionCode: `def transfer_funds(from_account, to_account, amount: float) -> bool:
    if amount <= 0:
        raise ValueError("Transfer amount must be positive")
    if from_account.id == to_account.id:
        return False
        
    # Prevent deadlock via deterministic lock ordering
    first_lock, second_lock = (
        (from_account.lock, to_account.lock)
        if from_account.id < to_account.id
        else (to_account.lock, from_account.lock)
    )
    
    with first_lock:
        with second_lock:
            if from_account.balance >= amount:
                from_account.balance -= amount
                to_account.balance += amount
                return True
            return False`,
    optimalTC: 'O(1)',
    optimalSC: 'O(1)',
    brokenTC: 'O(1) [Deadlock Hazard]',
    brokenSC: 'O(1)',
    testCases: [
      { input: 'acc1 balance 100, acc2 balance 50, amount 30', expected: 'True (acc1=70, acc2=80)', description: 'Standard transfer completes correctly' },
      { input: 'Simultaneous bidirectional transfer acc1 <-> acc2 in 100 threads', expected: 'No deadlock, atomic balances preserved', description: 'Deterministic lock ordering prevents deadlocks' },
    ],
    weaknessPattern: 'Acquiring multiple locks without deterministic global ordering.',
    conceptId: 'concurrency',
    youtubeVideoId: '7ENFeb-J75k',
    examEligible: true,
  },

  // 6. STUDENT MODE: Streaming Large Log Parser (Resource Leaks & Performance)
  {
    id: 'prob-06',
    number: 6,
    title: 'Streaming Log Analyzer with Constant Memory',
    mode: 'student',
    difficulty: 'Medium',
    defectClassId: 'resource',
    defectClassName: 'Resource Leaks & Performance',
    acceptanceRate: 71,
    estimatedMinutes: 6,
    description: `Implement \`count_error_events(file_path)\` to scan a multi-gigabyte log file for lines containing \`"[ERROR]"\`.

**Complexity Objective**:
- Reading the entire file into memory using \`f.readlines()\` is **Space $O(N)$** and triggers Out-Of-Memory crashes.
- Optimal: Stream line-by-line using a generator/context manager achieving **Time $O(N)$** and **Space $O(1)$**.`,
    starterCode: `def count_error_events(file_path: str) -> int:
    # Suboptimal: loads entire file into memory
    f = open(file_path, 'r')
    lines = f.readlines()
    count = sum(1 for line in lines if "[ERROR]" in line)
    return count`,
    solutionCode: `def count_error_events(file_path: str) -> int:
    count = 0
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            if "[ERROR]" in line:
                count += 1
    return count`,
    optimalTC: 'O(N)',
    optimalSC: 'O(1)',
    brokenTC: 'O(N)',
    brokenSC: 'O(N)',
    testCases: [
      { input: 'File with 10 error lines and 500 info lines', expected: '10', description: 'Accurate count of error occurrences' },
      { input: 'Large file stream simulation', expected: 'Space stays under 2MB constant memory', description: 'O(1) memory streaming without leak' },
    ],
    weaknessPattern: 'Reading unbounded files completely into memory instead of line streaming.',
    conceptId: 'resource',
    youtubeVideoId: 'THtuvcM2Z_k',
    examEligible: true,
  },
]
