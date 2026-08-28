import type { Concept } from '../types'

export const mockConcepts: Concept[] = [
  {
    id: 'injection',
    defectClassId: 'injection',
    title: 'Injection & Input Validation',
    shortTitle: 'Injection',
    description: 'When user-controlled input reaches a sensitive interpreter without sanitization',
    what: `SQL injection occurs when untrusted user input is concatenated directly into a SQL query string. The database interprets attacker-controlled input as SQL syntax rather than data, allowing them to bypass authentication, exfiltrate data, or destroy records.

The fundamental error is treating user input as trusted code rather than untrusted data.`,
    vulnerableCode: `# VULNERABLE: String concatenation with user input
username = request.form.get('username')
query = "SELECT * FROM users WHERE username = '" + username + "'"
cursor.execute(query)

# An attacker can input: ' OR '1'='1
# Resulting query: SELECT * FROM users WHERE username = '' OR '1'='1'`,
    saferCode: `# SAFE: Parameterized query — input is always treated as data
username = request.form.get('username')
query = "SELECT * FROM users WHERE username = %s"
cursor.execute(query, (username,))

# The database driver handles escaping. Input cannot be misinterpreted as SQL.`,
    language: 'python',
    whyItMatters: `SQL injection is consistently ranked #1 in the OWASP Top 10. A single vulnerable endpoint can expose your entire database. Attackers can dump user credentials, personally identifiable information, or financial records. In severe cases they can execute system commands on the database host.

The fix is simple but must be applied consistently. One forgotten concatenation is enough.`,
    commonPattern: `Watch for these signatures:
• String concatenation involving request.form, request.args, request.json, params, body
• f-strings or .format() calls in SQL strings
• Template literals in database queries (JavaScript)
• ORM raw() or execute() calls with user-controlled strings`,
    resourceTitle: 'OWASP SQL Injection Prevention Cheat Sheet',
    resourceUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
  },
  {
    id: 'auth',
    defectClassId: 'auth',
    title: 'Authentication & Access Control',
    shortTitle: 'Auth',
    description: 'Flaws in how identity is verified and how access is granted to resources',
    what: `Authentication defects cover a wide range of issues — from password handling to session management to JWT misuse. The common thread is that the system either fails to verify identity correctly, or grants access based on an assumption that can be violated.

Timing attacks are a subtle but real class of authentication bypass: a function that returns faster for one case than another leaks information about which path was taken.`,
    vulnerableCode: `# VULNERABLE: Normal string comparison leaks timing information
stored_hash = get_stored_hash(username)
if stored_hash == hash_password(password):   # timing varies
    return True

# An attacker making many requests can measure response times
# to determine whether a username exists, even with "invalid credentials"`,
    saferCode: `import hmac

# SAFE: Constant-time comparison — same duration regardless of where mismatch occurs
stored_hash = get_stored_hash(username)
if hmac.compare_digest(stored_hash, hash_password(password)):
    return True

# hmac.compare_digest() always compares all bytes, preventing timing side channels`,
    language: 'python',
    whyItMatters: `Timing attacks are not theoretical. Researchers have demonstrated remote timing attacks over the internet with enough samples. For authentication endpoints that receive high traffic (login pages, API keys), timing leaks can allow attackers to enumerate valid usernames or confirm token values.

Using hmac.compare_digest (Python), crypto.timingSafeEqual (Node.js), or equivalent is a one-line fix with no downside.`,
    commonPattern: `Watch for:
• == or != comparisons involving passwords, tokens, hashes, API keys
• Early return paths in authentication functions (one path is faster than another)
• JWT libraries that accept algorithm: "none" from token headers
• Session tokens generated with weak randomness (time-based, sequential)`,
    resourceTitle: 'OWASP Authentication Cheat Sheet',
    resourceUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html',
  },
  {
    id: 'error-handling',
    defectClassId: 'error-handling',
    title: 'Error & Exception Handling',
    shortTitle: 'Error Handling',
    description: 'Missed errors, swallowed exceptions, and unchecked return values',
    what: `Error handling defects occur when a function that can fail is called, but the failure case is not handled. In JavaScript this often means an async function whose rejection is never caught. In Go, it means ignoring an error return value. In Python, it means a bare try/except that swallows all errors silently.

The result: operations appear to succeed while silently failing, causing data corruption, partial state, or silent data loss.`,
    vulnerableCode: `// VULNERABLE: Promise rejection is never caught
async function processTask(task) {
  const result = await executeTask(task)   // can reject
  await markComplete(task.id, result)      // never reached if above rejects
}

// processTask() is called but not awaited — rejection goes nowhere
workerLoop(task => processTask(task))`,
    saferCode: `// SAFE: Every async path is handled
async function processTask(task) {
  try {
    const result = await executeTask(task)
    await markComplete(task.id, result)
  } catch (err) {
    await markFailed(task.id, err.message)
    logger.error('Task failed', { taskId: task.id, error: err })
  }
}`,
    language: 'javascript',
    whyItMatters: `Unhandled rejections in Node.js previously caused silent failures. Since Node 15+, an unhandled rejection crashes the entire process. Even before that, tasks would fail silently with no trace in logs or dead-letter queues.

In production systems, silent failures are often worse than loud ones. At least a crash is visible. Silently lost data can go undetected for days.`,
    commonPattern: `Watch for:
• async functions called without await and without .catch()
• try/catch blocks with empty catch bodies: catch(e) {}
• Go code that ignores error returns: result, _ := someFunc()
• Promise chains without a final .catch()
• Callbacks without error parameter handling`,
    resourceTitle: 'Node.js Unhandled Rejections and Error Best Practices',
    resourceUrl: 'https://nodejs.org/en/docs/guides/dont-block-the-event-loop',
  },
]

export const getConceptById = (id: string): Concept | undefined =>
  mockConcepts.find(c => c.id === id)
