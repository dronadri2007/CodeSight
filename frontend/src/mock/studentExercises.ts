import type { StudentExercise } from '../types'

export const mockStudentExercises: StudentExercise[] = [
  {
    id: 'stu-01',
    number: 1,
    title: 'Safe User Lookup with Error Handling',
    difficulty: 'Medium',
    defectClass: 'Error & Exception Handling',
    defectClassId: 'error-handling',
    language: 'Python',
    estimatedMinutes: 4,
    description: `Implement a robust function \`fetch_user_profile(user_id, db_conn)\` that queries the database cursor, verifies that a record actually exists before accessing its attributes, and returns a formatted dict or raises a specific \`UserNotFoundError\`.

Key challenge: Ensure you do not suffer from \`NoneType\` subscript errors or swallowed database timeouts.`,
    starterCode: `def fetch_user_profile(user_id: str, db_conn):
    # TODO: Execute query, verify non-None result, handle missing records cleanly
    cursor = db_conn.cursor()
    cursor.execute("SELECT id, username, email FROM users WHERE id = %s", (user_id,))
    row = cursor.fetchone()
    
    # Intentionally naive starter implementation
    return {
        "id": row[0],
        "username": row[1],
        "email": row[2]
    }`,
    solutionCode: `class UserNotFoundError(Exception):
    pass

def fetch_user_profile(user_id: str, db_conn):
    if not user_id:
        raise ValueError("Invalid user_id provided")
        
    try:
        cursor = db_conn.cursor()
        cursor.execute("SELECT id, username, email FROM users WHERE id = %s", (user_id,))
        row = cursor.fetchone()
        
        if row is None:
            raise UserNotFoundError(f"User {user_id} not found in database")
            
        return {
            "id": row[0],
            "username": row[1],
            "email": row[2]
        }
    except Exception as e:
        if isinstance(e, UserNotFoundError):
            raise
        raise RuntimeError(f"Database error during lookup: {e}")`,
    testCases: [
      { input: 'user_id="usr_123"', expected: 'dict object with id, username, email', description: 'Existing user returns formatted dict' },
      { input: 'user_id="usr_missing"', expected: 'UserNotFoundError raised', description: 'Missing user raises UserNotFoundError without crashing on row[0]' },
      { input: 'user_id=""', expected: 'ValueError raised', description: 'Empty user ID handled upfront' },
    ],
    weaknessPattern: 'You frequently assume database cursors always return valid rows and access indices before checking for None.',
    conceptId: 'error-handling',
  },
  {
    id: 'stu-02',
    number: 2,
    title: 'Parameterized Search Query Builder',
    difficulty: 'Easy',
    defectClass: 'Injection / Input Validation',
    defectClassId: 'injection',
    language: 'Python',
    estimatedMinutes: 3,
    description: `Build a safe search filter function \`build_product_query(category, min_price)\` that generates SQL queries with parameter binding instead of string concatenation.`,
    starterCode: `def build_product_query(category: str, min_price: float):
    # Fix the SQL concatenation vulnerability below
    query = f"SELECT * FROM products WHERE category = '{category}' AND price >= {min_price}"
    return query, ()`,
    solutionCode: `def build_product_query(category: str, min_price: float):
    query = "SELECT * FROM products WHERE category = %s AND price >= %s"
    params = (category, float(min_price))
    return query, params`,
    testCases: [
      { input: 'category="electronics", min_price=50', expected: '("SELECT ... %s AND %s", ("electronics", 50.0))', description: 'Standard input parameterized' },
      { input: 'category="\' OR 1=1 --", min_price=0', expected: 'Parameters safely isolated in tuple', description: 'SQL injection payload safely quarantined' },
    ],
    weaknessPattern: 'String interpolation in query statements allows attacker-controlled payload syntax execution.',
    conceptId: 'injection',
  },
  {
    id: 'stu-03',
    number: 3,
    title: 'Constant-Time Token Comparison',
    difficulty: 'Medium',
    defectClass: 'Auth & Access Control',
    defectClassId: 'auth',
    language: 'Python',
    estimatedMinutes: 3,
    description: `Implement \`verify_session_token(supplied_token, expected_token)\` such that character comparison happens in constant time to prevent side-channel timing analysis attacks.`,
    starterCode: `def verify_session_token(supplied_token: str, expected_token: str) -> bool:
    # Notice: Standard == leaks timing info on character mismatch
    return supplied_token == expected_token`,
    solutionCode: `import hmac

def verify_session_token(supplied_token: str, expected_token: str) -> bool:
    if not isinstance(supplied_token, str) or not isinstance(expected_token, str):
        return False
    return hmac.compare_digest(supplied_token, expected_token)`,
    testCases: [
      { input: 'supplied="tok_abc", expected="tok_abc"', expected: 'True', description: 'Matching token returns True' },
      { input: 'supplied="tok_xyz", expected="tok_abc"', expected: 'False (constant-time)', description: 'Mismatched token checked without early-exit leak' },
    ],
    weaknessPattern: 'Using standard equality operators for secret comparison leaves auth endpoints vulnerable to timing inference.',
    conceptId: 'auth',
  },
]
