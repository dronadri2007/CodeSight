import type { ConceptDetail } from '../types'

export const mockConceptDetails: ConceptDetail[] = [
  {
    id: 'logic',
    defectClassId: 'logic',
    title: 'Logic & Boundary Conditions',
    shortTitle: 'Logic & Bounds',
    description: 'Off-by-one errors, quadratic pair loops, empty edge cases, and arithmetic overflows.',
    deepDive: `Logic errors occur when program flow fails at the extremes of data ranges — empty lists, single-element collections, maximum integer boundaries, or nested quadratic searches where linear hash lookups exist.

The difference between senior and junior implementation is defensive boundary checks and choosing optimal algorithmic data structures.`,
    vulnerableCode: `# Suboptimal / Flawed: O(n^2) nested pair search
def find_pair_target(nums: list[int], target: int):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return None`,
    saferCode: `# Optimal: O(n) Time, O(n) Space single-pass lookup
def find_pair_target(nums: list[int], target: int):
    seen = {}
    for i, val in enumerate(nums):
        diff = target - val
        if diff in seen:
            return [seen[diff], i]
        seen[val] = i
    return None`,
    language: 'python',
    whyItMatters: `Suboptimal algorithms cause exponential latency spikes under production load. A double loop over 100,000 items performs 10,000,000,000 operations, causing thread starvation and service outages.`,
    commonPatternsToWatch: [
      'Nested loops comparing elements in the same list',
      'Missing bounds checks for len(array) == 0 or index >= len(array)',
      'Inclusive vs exclusive slice indices causing off-by-one bugs',
    ],
    youtubeVideo: {
      id: 'KLlXCFG5TnA',
      title: 'Two Sum - LeetCode 1 - Python Algorithm Solution Explained',
      channel: 'NeetCode',
      duration: '7:24',
      embedUrl: 'https://www.youtube.com/embed/KLlXCFG5TnA',
    },
    miniCheckQuestions: [
      {
        id: 'q-logic-1',
        question: 'What is the time complexity difference between nested loop pair lookup and a hash map lookup?',
        options: [
          'Nested loops are O(n^2), Hash map is O(n)',
          'Both are O(n log n)',
          'Hash map is O(n^2), Nested loops are O(n)',
          'Nested loops are O(1), Hash map is O(n)',
        ],
        correctIndex: 0,
        explanation: 'A hash map allows O(1) average lookup time per item, bringing the total time complexity down from O(n^2) to O(n).',
      },
      {
        id: 'q-logic-2',
        question: 'Which edge case is most commonly forgotten in array indexing?',
        options: [
          'Array with exactly 1,000 elements',
          'Empty array len == 0 or single-element list',
          'Array with only negative values',
          'Array sorted in reverse',
        ],
        correctIndex: 1,
        explanation: 'Empty or single-element inputs frequently trigger IndexError or divide-by-zero exceptions if not checked defensively.',
      },
    ],
  },
  {
    id: 'injection',
    defectClassId: 'injection',
    title: 'Injection & Input Validation',
    shortTitle: 'Injection',
    description: 'Concatenating untrusted user input directly into SQL, shell, or template interpreters.',
    deepDive: `SQL and Command Injection happens when untrusted user input is treated as executable code by an underlying interpreter. 

Parameterized queries prevent this by sending SQL syntax and user data across two separate communication channels to the database driver.`,
    vulnerableCode: `# VULNERABLE: String concatenation inside query
def get_user(username: str, cursor):
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query) # Attacker payload: ' OR '1'='1`,
    saferCode: `# SAFE: Parameterized tuple placeholder
def get_user(username: str, cursor):
    query = "SELECT * FROM users WHERE username = %s"
    cursor.execute(query, (username,)) # Driver escapes data safely`,
    language: 'python',
    whyItMatters: `SQL injection ranks at the top of security vulnerabilities. A single unparameterized query can dump customer credentials, bypass login checks, or allow remote arbitrary commands.`,
    commonPatternsToWatch: [
      'f-strings, % formatting, or + concatenation in SQL statements',
      'Raw execute() or text() calls in ORMs with unescaped variables',
      'Direct interpolation into os.system() or subprocess.Popen(shell=True)',
    ],
    youtubeVideo: {
      id: '_jKylhJtPmI',
      title: 'SQL Injection Attack - Computerphile',
      channel: 'Computerphile',
      duration: '11:32',
      embedUrl: 'https://www.youtube.com/embed/_jKylhJtPmI',
    },
    miniCheckQuestions: [
      {
        id: 'q-inj-1',
        question: 'Why do parameterized queries prevent SQL injection?',
        options: [
          'They compress SQL strings before execution',
          'The database driver parses the query structure before inserting parameters as literal data',
          'They convert SQL queries into JSON format',
          'They run regular expressions on user input',
        ],
        correctIndex: 1,
        explanation: 'Parameterized queries compile the query abstract syntax tree first, meaning parameters can never alter query logic.',
      },
      {
        id: 'q-inj-2',
        question: 'Which pattern indicates a potential SQL injection vulnerability in Python?',
        options: [
          'cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))',
          'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")',
          'db.session.query(User).filter_by(id=user_id)',
          'cursor.fetchone()',
        ],
        correctIndex: 1,
        explanation: 'Using an f-string evaluates user_id directly into the query string before sending it to the database.',
      },
    ],
  },
  {
    id: 'auth',
    defectClassId: 'auth',
    title: 'Authentication & Access Control',
    shortTitle: 'Auth & Access',
    description: 'Timing side-channel leaks, broken authorization, unvalidated claims, and token leakage.',
    deepDive: `Authentication vulnerabilities allow attackers to impersonate users or bypass role authorization. 

Timing attacks exploit subtle differences in CPU comparison cycles when evaluating passwords or HMAC signatures using standard equality operators.`,
    vulnerableCode: `# VULNERABLE: Standard string equality returns early on mismatch
def check_token(received_token: str, secret_token: str) -> bool:
    return received_token == secret_token # Leaks byte-by-byte timing!`,
    saferCode: `# SAFE: Constant-time comparison
import hmac

def check_token(received_token: str, secret_token: str) -> bool:
    return hmac.compare_digest(received_token.encode(), secret_token.encode())`,
    language: 'python',
    whyItMatters: `Standard string comparison leaks prefix matching times over network latency statistics, allowing attackers to systematically guess security tokens byte-by-byte.`,
    commonPatternsToWatch: [
      'Using == to compare cryptographic tokens, password hashes, or API keys',
      'Trusting client-provided user_id in request bodies without validating session claims',
      'Storing secrets in plaintext in version control or logging them to stdout',
    ],
    youtubeVideo: {
      id: 'm2OZ_45L6_Q',
      title: 'Timing Attacks Explained - Computerphile',
      channel: 'Computerphile',
      duration: '9:45',
      embedUrl: 'https://www.youtube.com/embed/m2OZ_45L6_Q',
    },
    miniCheckQuestions: [
      {
        id: 'q-auth-1',
        question: 'What is a timing attack in string comparison?',
        options: [
          'An attack where the server crashes due to slow clock speed',
          'Measuring response time differences based on how many characters match before returning False',
          'A DDoS attack targeting NTP servers',
          'An attack that alters timezone headers',
        ],
        correctIndex: 1,
        explanation: 'Standard string equality returns early on the first mismatched byte, creating measurable latency differences.',
      },
    ],
  },
  {
    id: 'concurrency',
    defectClassId: 'concurrency',
    title: 'Concurrency & Race Conditions',
    shortTitle: 'Concurrency',
    description: 'Deadlocks from out-of-order locking, dirty reads, and un-synchronized shared state.',
    deepDive: `Concurrent applications face race conditions when multiple threads access and mutate shared state without synchronization, or deadlocks when acquiring multiple locks in non-deterministic orders.`,
    vulnerableCode: `# VULNERABLE: Circular wait deadlock hazard
def transfer(acc1, acc2, amt):
    acc1.lock.acquire()
    acc2.lock.acquire() # Deadlock if another thread calls transfer(acc2, acc1)!
    acc1.balance -= amt
    acc2.balance += amt
    acc2.lock.release()
    acc1.lock.release()`,
    saferCode: `# SAFE: Deterministic lock ordering & context manager
def transfer(acc1, acc2, amt):
    first, second = (acc1, acc2) if acc1.id < acc2.id else (acc2, acc1)
    with first.lock:
        with second.lock:
            acc1.balance -= amt
            acc2.balance += amt`,
    language: 'python',
    whyItMatters: `Deadlocks freeze production application worker pools, requiring container restarts and corrupting account balances during high-concurrency spikes.`,
    commonPatternsToWatch: [
      'Acquiring multiple mutex locks in arbitrary argument order',
      'Mutating global dicts or lists across async tasks without locking',
      'Forgetting to release locks in exception catch blocks (use context managers)',
    ],
    youtubeVideo: {
      id: '7ENFeb-J75k',
      title: 'Deadlock in Operating Systems & Concurrency',
      channel: 'Gate Smashers',
      duration: '10:15',
      embedUrl: 'https://www.youtube.com/embed/7ENFeb-J75k',
    },
    miniCheckQuestions: [
      {
        id: 'q-conc-1',
        question: 'How do you prevent circular wait deadlocks when locking multiple resources?',
        options: [
          'Acquire locks in a globally deterministic sorted order',
          'Remove all locks and use sleep timeouts',
          'Run only one thread per server',
          'Lock only the destination resource',
        ],
        correctIndex: 0,
        explanation: 'Enforcing a global order (such as by resource ID) guarantees threads never wait for each other in a circle.',
      },
    ],
  },
  {
    id: 'error-handling',
    defectClassId: 'error-handling',
    title: 'Error & Exception Handling',
    shortTitle: 'Error Handling',
    description: 'NoneType subscript crashes, swallowed exceptions, and missing fallback boundaries.',
    deepDive: `Robust production software assumes every external call (network, database, file system) will eventually fail or return empty data. Defensive checks and custom exception hierarchies prevent catastrophic cascades.`,
    vulnerableCode: `# VULNERABLE: Direct access without null check
def get_user_email(user_id, cursor):
    cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
    row = cursor.fetchone()
    return row[0] # TypeError: 'NoneType' object is not subscriptable!`,
    saferCode: `# SAFE: Defensive None-check with specific domain exception
class UserNotFoundError(Exception):
    pass

def get_user_email(user_id, cursor):
    cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
    row = cursor.fetchone()
    if row is None:
        raise UserNotFoundError(f"User {user_id} not found")
    return row[0]`,
    language: 'python',
    whyItMatters: `Unhandled NoneType exceptions are the #1 cause of HTTP 500 internal server errors in production web applications.`,
    commonPatternsToWatch: [
      'Accessing row[0] or obj["key"] without checking if row/obj is None',
      'Bare except: pass blocks that swallow fatal bugs silently',
      'Ignoring return error codes from system APIs',
    ],
    youtubeVideo: {
      id: 'nlCKrKGHSSo',
      title: 'Python Error & Exception Handling Best Practices',
      channel: 'Corey Schafer',
      duration: '15:20',
      embedUrl: 'https://www.youtube.com/embed/nlCKrKGHSSo',
    },
    miniCheckQuestions: [
      {
        id: 'q-err-1',
        question: 'What happens when cursor.fetchone() finds no matching record?',
        options: [
          'It returns None',
          'It raises an IndexError',
          'It returns an empty tuple ()',
          'It returns 0',
        ],
        correctIndex: 0,
        explanation: 'fetchone() returns None when no rows match, making row[0] throw a TypeError.',
      },
    ],
  },
  {
    id: 'resource',
    defectClassId: 'resource',
    title: 'Resource Leaks & Performance',
    shortTitle: 'Resource & Perf',
    description: 'Memory leaks, unclosed file descriptors, unbounded reads, and thread exhaustion.',
    deepDive: `Resource leaks occur when allocations (sockets, file descriptors, database connections, memory buffers) are not released after use, eventually causing Out-Of-Memory or File-Descriptor-Limit crashes.`,
    vulnerableCode: `# VULNERABLE: Loading multi-gigabyte file into memory & unclosed fd
def search_log(path, term):
    f = open(path)
    lines = f.readlines() # O(N) memory allocation crashes on large files!
    return [l for l in lines if term in l]`,
    saferCode: `# SAFE: O(1) Memory streaming generator with context manager
def search_log(path, term):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f: # Streams line-by-line in O(1) memory
            if term in line:
                yield line`,
    language: 'python',
    whyItMatters: `Production log files or data exports can easily exceed available RAM. Streaming data line-by-line ensures predictable, constant memory usage regardless of file size.`,
    commonPatternsToWatch: [
      'Using readlines() or read() on unbounded file inputs',
      'Failing to use with context managers for files and connections',
      'Retaining large object caches in global module scope',
    ],
    youtubeVideo: {
      id: 'THtuvcM2Z_k',
      title: 'Python Memory Management & Generators',
      channel: 'mCoding',
      duration: '12:45',
      embedUrl: 'https://www.youtube.com/embed/THtuvcM2Z_k',
    },
    miniCheckQuestions: [
      {
        id: 'q-res-1',
        question: 'What is the space complexity advantage of iterating with "for line in f:" versus "f.readlines()"?',
        options: [
          'Line iteration uses O(1) constant memory while readlines() allocates O(N) memory for the whole file',
          'readlines() is faster and uses less memory',
          'Both use identical memory',
          'Line iteration copies the file to disk',
        ],
        correctIndex: 0,
        explanation: 'Line iteration streams lines on demand without loading the full file into memory at once.',
      },
    ],
  },
]

export const mockConcepts = mockConceptDetails.map((c) => ({
  ...c,
  what: c.deepDive,
  commonPattern: c.commonPatternsToWatch.join('\n'),
  resourceTitle: c.youtubeVideo.title,
  resourceUrl: c.youtubeVideo.embedUrl,
}))

export function getConceptById(id: string) {
  return mockConcepts.find((c) => c.id === id || c.defectClassId === id) || mockConcepts[0]
}
