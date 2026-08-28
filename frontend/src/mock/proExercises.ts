import type { ProExercise } from '../types'

export const mockProExercises: ProExercise[] = [
  {
    id: 'pro-01',
    number: 1,
    title: 'Enterprise Authentication & Session Gateway',
    repo: 'enterprise-auth-gateway/session_service.py',
    language: 'Python',
    linesOfCode: 120,
    difficulty: 'Hard',
    primaryRisk: 'Auth & Access Control',
    defectClassId: 'auth',
    architecturalOverview: 'High-traffic session verification middleware handling OAuth2 tokens, redis cache lookups, and admin permission elevation.',
    code: `import os
import time
import json
import sqlite3
import hashlib
import hmac
from typing import Optional, Dict, Any
from flask import Flask, request, jsonify, g

app = Flask(__name__)
SECRET_KEY = os.environ.get('SESSION_SECRET', 'insecure-dev-fallback-key')
TOKEN_EXPIRY = 3600

class SessionManager:
    def __init__(self, db_path: str = 'auth.db'):
        self.db_path = db_path

    def get_db(self):
        if 'db' not in g:
            g.db = sqlite3.connect(self.db_path)
            g.db.row_factory = sqlite3.Row
        return g.db

    def parse_auth_header(self) -> Optional[str]:
        auth = request.headers.get('Authorization', '')
        if auth.startswith('Bearer '):
            return auth[7:].strip()
        return None

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        # RISK FINDING 1: Loose token validation / none algorithm vulnerability
        if not token or len(token) < 16:
            return None
        
        try:
            payload_raw = token.split('.')[0]
            # Naive decode without verifying signature hash against SECRET_KEY
            data = json.loads(payload_raw)
            if data.get('exp', 0) < time.time():
                return None
            return data
        except Exception:
            return None

    def get_user_permissions(self, user_id: str) -> list:
        # RISK FINDING 2: SQL Injection via unparameterized string formatting
        cursor = self.get_db().cursor()
        query = f"SELECT permission FROM user_perms WHERE user_id = '{user_id}'"
        cursor.execute(query)
        rows = cursor.fetchall()
        return [r['permission'] for r in rows]

manager = SessionManager()

@app.route('/api/v2/auth/login', methods=['POST'])
def login():
    body = request.get_json(silent=True) or {}
    username = body.get('username', '')
    password = body.get('password', '')

    cursor = manager.get_db().cursor()
    cursor.execute("SELECT id, password_hash, is_active FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()

    # RISK FINDING 3: Unhandled missing record -> NoneType subscript
    if not user['is_active']:
        return jsonify({'error': 'Account disabled'}), 403

    # RISK FINDING 4: Timing attack on password hash comparison
    computed_hash = hashlib.sha256(password.encode()).hexdigest()
    if user['password_hash'] == computed_hash:
        token = json.dumps({'uid': user['id'], 'exp': time.time() + TOKEN_EXPIRY})
        return jsonify({'token': token, 'status': 'authenticated'})

    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/v2/admin/elevate', methods=['POST'])
def elevate_user():
    token = manager.parse_auth_header()
    user_data = manager.verify_token(token)
    if not user_data:
        return jsonify({'error': 'Unauthorized'}), 401

    # RISK FINDING 5: Privilege escalation without admin check
    target_user = request.json.get('target_user_id')
    cursor = manager.get_db().cursor()
    cursor.execute("UPDATE users SET is_admin = 1 WHERE id = %s", (target_user,))
    manager.get_db().commit()
    
    return jsonify({'status': 'elevated', 'user': target_user})`,
    groundTruthFindings: [
      {
        id: 'f-1',
        lines: [35, 36, 37, 38],
        riskCategory: 'Auth & Access Control',
        severity: 'Critical',
        explanation: 'JWT payload is parsed and trusted without verifying signature against SECRET_KEY.',
        rule: 'Cryptographic Signature Verification Required',
      },
      {
        id: 'f-2',
        lines: [47, 48, 49],
        riskCategory: 'Injection / Input Validation',
        severity: 'Critical',
        explanation: 'String formatting user_id directly into SQL query string enables SQL injection.',
        rule: 'Parameterized Queries Enforcement',
      },
      {
        id: 'f-3',
        lines: [62, 63],
        riskCategory: 'Error & Exception Handling',
        severity: 'High',
        explanation: "Accessing user['is_active'] before checking if user is None raises TypeError on non-existent usernames.",
        rule: 'Null Reference Safety',
      },
      {
        id: 'f-4',
        lines: [66, 67],
        riskCategory: 'Auth & Access Control',
        severity: 'Medium',
        explanation: 'Standard string equality == on password hashes leaks timing metrics.',
        rule: 'Constant Time Comparison',
      },
      {
        id: 'f-5',
        lines: [80, 81, 82, 83],
        riskCategory: 'Auth & Access Control',
        severity: 'Critical',
        explanation: 'elevate_user does not verify that the requesting caller has admin permissions before elevating target.',
        rule: 'Role-Based Access Control',
      },
    ],
    fixDiff: `- query = f"SELECT permission FROM user_perms WHERE user_id = '{user_id}'"
+ query = "SELECT permission FROM user_perms WHERE user_id = %s"
+ cursor.execute(query, (user_id,))
...
- if user['password_hash'] == computed_hash:
+ if user and hmac.compare_digest(user['password_hash'], computed_hash):`,
  },
]
