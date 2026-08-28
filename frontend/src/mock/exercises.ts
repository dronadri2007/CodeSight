import type { Exercise } from '../types'

export const mockExercises: Exercise[] = [
  {
    id: 'ex-01',
    number: 1,
    title: 'Flask Login Endpoint',
    repo: 'flask-auth-api',
    language: 'Python',
    difficulty: 'Easy',
    defectClass: 'Injection / Input Validation',
    defectClassId: 'injection',
    estimatedMinutes: 2,
    status: 'completed',
    buggyLines: [14, 15],
    conceptId: 'injection',
    referenceExplanation: 'User-controlled input is passed directly into a SQL query string without parameterization, enabling SQL injection.',
    teachingPoints: [
      'Never concatenate user input into SQL strings',
      'Always use parameterized queries or an ORM',
      'Validate and sanitize all user-supplied data before use',
    ],
    pattern: 'Watch for user input flowing directly into a query string, file path, or command.',
    fixDiff: `- query = "SELECT * FROM users WHERE username = '" + username + "'"
+ query = "SELECT * FROM users WHERE username = %s"
+ cursor.execute(query, (username,))`,
    code: `from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect('users.db')
    return conn

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
    cursor = get_db().cursor()
    cursor.execute(query)
    user = cursor.fetchone()

    if user:
        return jsonify({'status': 'success', 'user': user[0]})
    else:
        return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(debug=True)`,
  },
  {
    id: 'ex-02',
    number: 2,
    title: 'JWT Token Verification',
    repo: 'node-api-gateway',
    language: 'JavaScript',
    difficulty: 'Medium',
    defectClass: 'Auth & Access Control',
    defectClassId: 'auth',
    estimatedMinutes: 3,
    status: 'needs-practice',
    buggyLines: [8, 9],
    conceptId: 'auth',
    referenceExplanation: 'The JWT verification accepts "none" as a valid algorithm, allowing unsigned tokens to bypass authentication.',
    teachingPoints: [
      'Always explicitly specify allowed algorithms in JWT verification',
      'Never trust the algorithm field from the token header',
      'Use a strict allowlist of expected algorithms',
    ],
    pattern: 'Watch for JWT verification that accepts algorithm choices from the token itself rather than enforcing a fixed list.',
    fixDiff: `- const decoded = jwt.verify(token, secret)
+ const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] })`,
    code: `const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET = process.env.JWT_SECRET || 'fallback-secret';

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const decoded = jwt.verify(token, SECRET);
  req.user = decoded;
  next();
}

app.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.get('/admin', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json({ data: 'admin-only data' });
});

app.listen(3000);`,
  },
  {
    id: 'ex-03',
    number: 3,
    title: 'File Upload Handler',
    repo: 'media-upload-service',
    language: 'Python',
    difficulty: 'Medium',
    defectClass: 'Injection / Input Validation',
    defectClassId: 'injection',
    estimatedMinutes: 3,
    status: 'not-started',
    buggyLines: [12, 13, 14],
    conceptId: 'injection',
    referenceExplanation: 'The filename from the user upload is used directly in a filesystem path without sanitization, enabling path traversal.',
    teachingPoints: [
      'Never use user-supplied filenames directly in filesystem operations',
      'Use os.path.basename() to strip directory components',
      'Validate file extensions against an allowlist',
    ],
    pattern: 'Watch for user-controlled strings used in file paths or shell commands without sanitization.',
    fixDiff: `- filepath = os.path.join(UPLOAD_DIR, filename)
+ safe_filename = os.path.basename(filename)
+ filepath = os.path.join(UPLOAD_DIR, safe_filename)`,
    code: `import os
from flask import Flask, request, jsonify

app = Flask(__name__)
UPLOAD_DIR = '/var/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'gif', 'pdf'}

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    filename = file.filename
    filepath = os.path.join(UPLOAD_DIR, filename)
    file.save(filepath)
    
    return jsonify({'status': 'uploaded', 'path': filepath})

@app.route('/download/<filename>')
def download_file(filename):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        return open(filepath, 'rb').read()
    return jsonify({'error': 'Not found'}), 404`,
  },
  {
    id: 'ex-04',
    number: 4,
    title: 'Database Connection Pool',
    repo: 'backend-service-core',
    language: 'Go',
    difficulty: 'Hard',
    defectClass: 'Resource & Performance',
    defectClassId: 'resource',
    estimatedMinutes: 4,
    status: 'not-started',
    buggyLines: [18, 19, 20],
    conceptId: 'resource',
    referenceExplanation: 'Database connections are never closed after use, causing a connection pool exhaustion over time.',
    teachingPoints: [
      'Always close database resources in a defer statement',
      'Use defer immediately after acquiring a resource',
      'Test for connection leaks under load',
    ],
    pattern: 'Look for acquired resources (files, connections, locks) that have no corresponding close or release.',
    fixDiff: `  db, err := sql.Open("postgres", dsn)
  if err != nil {
    return nil, err
  }
+ defer db.Close()`,
    code: `package main

import (
  "database/sql"
  "fmt"
  "log"
  _ "github.com/lib/pq"
)

func getUserByID(id int) (*User, error) {
  dsn := "host=localhost user=app dbname=prod sslmode=disable"
  db, err := sql.Open("postgres", dsn)
  if err != nil {
    return nil, fmt.Errorf("failed to open db: %w", err)
  }

  row := db.QueryRow("SELECT id, name, email FROM users WHERE id = $1", id)
  user := &User{}
  err = row.Scan(&user.ID, &user.Name, &user.Email)
  if err != nil {
    return nil, fmt.Errorf("scan error: %w", err)
  }
  return user, nil
}

type User struct {
  ID    int
  Name  string
  Email string
}`,
  },
  {
    id: 'ex-05',
    number: 5,
    title: 'Async Task Queue Worker',
    repo: 'task-runner-service',
    language: 'JavaScript',
    difficulty: 'Hard',
    defectClass: 'Error & Exception Handling',
    defectClassId: 'error-handling',
    estimatedMinutes: 4,
    status: 'not-started',
    buggyLines: [9, 10],
    conceptId: 'error-handling',
    referenceExplanation: 'The async worker does not handle rejected promises, causing unhandled rejections that silently fail tasks.',
    teachingPoints: [
      'Always handle errors in async functions with try/catch or .catch()',
      'Unhandled promise rejections in Node.js can crash the process',
      'Log failures before discarding them',
    ],
    pattern: 'Watch for async operations without error handling — especially in worker loops or queues.',
    fixDiff: `- async function processTask(task) {
-   const result = await executeTask(task)
-   await markComplete(task.id, result)
+ async function processTask(task) {
+   try {
+     const result = await executeTask(task)
+     await markComplete(task.id, result)
+   } catch (err) {
+     await markFailed(task.id, err.message)
+     logger.error('Task failed', { taskId: task.id, error: err })
+   }
  }`,
    code: `const logger = require('./logger')
const { executeTask, markComplete, markFailed, fetchNextTask } = require('./taskService')

async function processTask(task) {
  const result = await executeTask(task)
  await markComplete(task.id, result)
}

async function workerLoop() {
  while (true) {
    const task = await fetchNextTask()
    if (task) {
      processTask(task)
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

async function startWorker() {
  logger.info('Worker starting...')
  await workerLoop()
}

startWorker()`,
  },
  {
    id: 'ex-06',
    number: 6,
    title: 'User Permissions Check',
    repo: 'rbac-middleware',
    language: 'Python',
    difficulty: 'Easy',
    defectClass: 'Auth & Access Control',
    defectClassId: 'auth',
    estimatedMinutes: 2,
    status: 'not-started',
    buggyLines: [11],
    conceptId: 'auth',
    referenceExplanation: 'The permission check uses a loose equality check that can be bypassed with type coercion in some interpreters.',
    teachingPoints: [
      'Use strict equality checks for security-critical comparisons',
      'Prefer explicit string matching over truthiness checks',
      'Log authorization failures for audit purposes',
    ],
    pattern: 'Watch for authorization checks that can be bypassed through type coercion or falsy comparisons.',
    fixDiff: `- if user.role == 'admin' or user.is_superuser:
+ if user.role == 'admin' and user.is_active and not user.is_deleted:`,
    code: `from functools import wraps
from flask import g, abort, request

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = g.current_user
        if not user:
            abort(401)
        
        if user.role == 'admin' or user.is_superuser:
            return f(*args, **kwargs)
        
        abort(403)
    return decorated

def require_permission(permission):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = g.current_user
            if permission in user.permissions:
                return f(*args, **kwargs)
            abort(403)
        return decorated
    return decorator`,
  },
  {
    id: 'ex-07',
    number: 7,
    title: 'Concurrent Counter',
    repo: 'analytics-service',
    language: 'Go',
    difficulty: 'Hard',
    defectClass: 'Concurrency & State',
    defectClassId: 'concurrency',
    estimatedMinutes: 5,
    status: 'not-started',
    buggyLines: [8, 9, 10, 11],
    conceptId: 'concurrency',
    referenceExplanation: 'The counter is accessed from multiple goroutines without synchronization, causing a data race.',
    teachingPoints: [
      'Shared mutable state in concurrent code requires synchronization',
      'Use sync.Mutex or sync/atomic for thread-safe counters',
      'Run tests with -race flag to detect data races',
    ],
    pattern: 'Look for shared variables modified across goroutines without a mutex or atomic operation.',
    fixDiff: `+ var mu sync.Mutex
  var counter int

  func increment() {
+   mu.Lock()
+   defer mu.Unlock()
    counter++
  }`,
    code: `package analytics

import (
  "sync"
  "fmt"
)

var counter int

func increment() {
  counter++
}

func getCount() int {
  return counter
}

func trackEvents(events []Event) {
  var wg sync.WaitGroup
  for _, event := range events {
    wg.Add(1)
    go func(e Event) {
      defer wg.Done()
      processEvent(e)
      increment()
    }(event)
  }
  wg.Wait()
  fmt.Printf("Processed %d events\\n", getCount())
}

type Event struct {
  Name string
  Data map[string]interface{}
}

func processEvent(e Event) {}`,
  },
  {
    id: 'ex-08',
    number: 8,
    title: 'Flask Authentication Patch',
    repo: 'flask-auth-service',
    language: 'Python',
    difficulty: 'Medium',
    defectClass: 'Auth & Access Control',
    defectClassId: 'auth',
    estimatedMinutes: 2,
    status: 'not-started',
    buggyLines: [15, 16],
    conceptId: 'auth',
    referenceExplanation: 'Password comparison uses a timing-unsafe string equality check, enabling timing attacks to enumerate valid usernames.',
    teachingPoints: [
      'Use constant-time comparison functions for secrets',
      'hmac.compare_digest() prevents timing side channels',
      'Never use == for comparing password hashes or tokens',
    ],
    pattern: 'Watch for secret values (passwords, tokens, API keys) compared with == instead of a constant-time function.',
    fixDiff: `- if stored_hash == hash_password(password):
+ if hmac.compare_digest(stored_hash, hash_password(password)):`,
    code: `import hashlib
import hmac
from flask import Flask, request, jsonify, session

app = Flask(__name__)
app.secret_key = 'dev-secret-key'

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_stored_hash(username: str) -> str | None:
    users = {'afrid': hash_password('hunter2'), 'admin': hash_password('admin123')}
    return users.get(username)

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', '')
    password = request.json.get('password', '')
    
    stored_hash = get_stored_hash(username)
    if stored_hash is None:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if stored_hash == hash_password(password):
        session['user'] = username
        return jsonify({'status': 'ok'})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout')
def logout():
    session.clear()
    return jsonify({'status': 'ok'})`,
  },
  {
    id: 'ex-09',
    number: 9,
    title: 'Array Bounds Validator',
    repo: 'data-processor-lib',
    language: 'JavaScript',
    difficulty: 'Easy',
    defectClass: 'Logic & Boundary',
    defectClassId: 'logic',
    estimatedMinutes: 2,
    status: 'not-started',
    buggyLines: [5],
    conceptId: 'logic',
    referenceExplanation: 'The loop condition uses <= instead of <, causing an off-by-one error that reads beyond the last valid index.',
    teachingPoints: [
      'Off-by-one errors are extremely common boundary mistakes',
      'Array indexing is 0-based; last valid index is length-1',
      'Use < array.length not <= array.length in loop conditions',
    ],
    pattern: 'Check loop conditions carefully — off-by-one errors are silent and often context-dependent.',
    fixDiff: `- for (let i = 0; i <= data.length; i++) {
+ for (let i = 0; i < data.length; i++) {`,
    code: `function processDataBatch(data) {
  const results = []

  for (let i = 0; i <= data.length; i++) {
    const item = data[i]
    if (item === undefined) {
      results.push(null)
      continue
    }
    results.push(transform(item))
  }

  return results
}

function transform(item) {
  return {
    id: item.id,
    value: item.value * 2,
    processed: true,
  }
}

function batchSummary(results) {
  const valid = results.filter(r => r !== null)
  return {
    total: results.length,
    valid: valid.length,
    failed: results.length - valid.length,
  }
}`,
  },
  {
    id: 'ex-10',
    number: 10,
    title: 'Memory Cache Manager',
    repo: 'cache-layer',
    language: 'Python',
    difficulty: 'Medium',
    defectClass: 'Resource & Performance',
    defectClassId: 'resource',
    estimatedMinutes: 3,
    status: 'not-started',
    buggyLines: [20, 21],
    conceptId: 'resource',
    referenceExplanation: 'Cache entries are never evicted, causing unbounded memory growth in long-running processes.',
    teachingPoints: [
      'In-memory caches must have an eviction strategy (TTL, LRU, max size)',
      'Growing dicts in long-running services leak memory silently',
      'Use functools.lru_cache or a proper cache library',
    ],
    pattern: 'Look for data structures that grow without bounds — especially caches and queues in long-running services.',
    fixDiff: `- _cache: dict = {}
+ from functools import lru_cache
  
- def get_cached(key: str):
-     if key in _cache:
-         return _cache[key]
+ @lru_cache(maxsize=1024)
+ def get_cached(key: str):`,
    code: `import time
import hashlib
from typing import Any, Optional

_cache: dict = {}

def make_key(args: tuple, kwargs: dict) -> str:
    raw = str(args) + str(sorted(kwargs.items()))
    return hashlib.md5(raw.encode()).hexdigest()

def get_cached(key: str) -> Optional[Any]:
    if key in _cache:
        return _cache[key]
    return None

def set_cached(key: str, value: Any) -> None:
    _cache[key] = value

def cached_query(sql: str, *args, **kwargs):
    key = make_key((sql,) + args, kwargs)
    result = get_cached(key)
    if result is not None:
        return result
    
    result = execute_query(sql, *args, **kwargs)
    set_cached(key, result)
    return result

def execute_query(sql: str, *args, **kwargs):
    pass`,
  },
]

export const getExerciseById = (id: string): Exercise | undefined =>
  mockExercises.find(ex => ex.id === id)

export const getExercisesByClass = (classId: string): Exercise[] =>
  mockExercises.filter(ex => ex.defectClassId === classId)
