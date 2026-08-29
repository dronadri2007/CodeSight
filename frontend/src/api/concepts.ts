import { api } from './client'

/**
 * Concept micro-check — GET/POST /concept/{id}/micro-check.
 * Falls back to a local question bank + local grading when VITE_API_BASE_URL
 * is unset, so the offline demo keeps working (same pattern as api/exercises).
 */

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

export interface MicroCheckQuestion {
  id: string
  prompt: string
  options: string[]
}

export interface MicroCheckData {
  concept_id: string
  questions: MicroCheckQuestion[]
}

export interface MicroCheckAnswer {
  question_id: string
  choice_index: number
}

export interface MicroCheckQuestionResult {
  question_id: string
  correct: boolean
  your_index: number | null
  correct_index: number
  explanation: string
}

export interface MicroCheckResult {
  concept_id: string
  total: number
  correct: number
  score: number // 0..1
  passed: boolean // score >= 2/3
  results: MicroCheckQuestionResult[]
  practice_exercise_ids: string[]
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Mirrors backend app/data/concepts.json -> micro_check. Keep in sync if the
// backend bank changes; only used when there is no VITE_API_BASE_URL.
type BankQ = { id: string; prompt: string; options: string[]; answer_index: number; explanation: string }

const MOCK_BANK: Record<string, BankQ[]> = {
  injection: [
    {
      id: 'q1',
      prompt: 'Which change most reliably prevents SQL injection?',
      options: [
        'Escaping quote characters in the input string',
        'Using a parameterised query with bound values',
        'Rejecting inputs longer than 100 characters',
        'Running the query as a low-privilege database user',
      ],
      answer_index: 1,
      explanation:
        'Bound parameters keep the value as data, so it can never be parsed as SQL. Escaping and length limits are bypassable; least privilege only limits the blast radius.',
    },
    {
      id: 'q2',
      prompt:
        'Code builds a shell command by concatenating a user-supplied hostname and runs it through the shell. The safest fix is to:',
      options: [
        'Wrap the call in try/except',
        'Strip semicolons and backticks from the hostname',
        'Run the command via an argument list with the shell disabled',
        'Log the command before running it',
      ],
      answer_index: 2,
      explanation:
        'Passing an argv list with the shell disabled means the OS never interprets shell metacharacters. Blocklisting characters is a losing game.',
    },
    {
      id: 'q3',
      prompt: 'During review, which pattern is the red flag for an injection defect?',
      options: [
        'A value read from an environment variable',
        'A hard-coded constant used in a query',
        'A user-supplied value concatenated into a query/command/path string',
        'A value checked against an allowlist before use',
      ],
      answer_index: 2,
      explanation:
        'Injection is untrusted input reaching an interpreter without separation. Concatenating a user value into an instruction string is the classic shape.',
    },
  ],
  auth: [
    {
      id: 'q1',
      prompt: 'An endpoint loads a record by an id from the URL but never checks who owns it. This is:',
      options: ['A SQL injection', 'An IDOR / broken access control bug', 'A race condition', 'A resource leak'],
      answer_index: 1,
      explanation:
        'Authenticated but not authorised: any logged-in user can read another user’s data by changing the id. Add an ownership check.',
    },
    {
      id: 'q2',
      prompt: 'The correct fix for the IDOR in get_invoice(invoice_id) is to:',
      options: [
        'Hash the invoice_id in the URL so it can’t be guessed',
        'Add Invoice.user_id == current_user.id to the query',
        'Rate-limit the endpoint',
        'Return 404 instead of 403',
      ],
      answer_index: 1,
      explanation:
        'Scope the query to the current user so a foreign id simply returns nothing. Obscuring the id is not access control.',
    },
    {
      id: 'q3',
      prompt: "Why is `if user.role != 'admin' or True:` inside a permission check a defect?",
      options: [
        'It is slower than a direct comparison',
        'role should be an enum, not a string',
        'The `or True` makes the condition always pass, so the guard is dead',
        'It should use `and` instead of `or`',
      ],
      answer_index: 2,
      explanation:
        'The condition can never be false, so the check can never deny. A permission guard must actually be able to reject.',
    },
  ],
  'error-handling': [
    {
      id: 'q1',
      prompt: 'Why is `try: ... except Exception: pass` a problem?',
      options: [
        'It is slower than letting the error propagate',
        'It swallows the failure, so the caller proceeds on bad or missing data',
        '`Exception` should be `BaseException`',
        '`pass` is not valid inside an except block',
      ],
      answer_index: 1,
      explanation:
        'Silently discarding the error hides the failure; downstream code then fails later with a confusing symptom. Catch a specific exception and act on it.',
    },
    {
      id: 'q2',
      prompt: 'You catch an exception you cannot fully handle. Best practice is to:',
      options: [
        'Catch the specific type, then re-raise or signal failure clearly',
        'Catch bare Exception and return None',
        'Catch bare Exception and print it',
        'Avoid try/except entirely',
      ],
      answer_index: 0,
      explanation:
        'Narrow the catch and keep the failure visible: re-raise, return an explicit error result, or wrap it in a domain exception.',
    },
    {
      id: 'q3',
      prompt: 'A function returns None on failure and the caller never checks the return value. This is:',
      options: [
        'Fine, since None is falsy',
        'A concurrency bug',
        'An unchecked-error defect: the caller acts on a missing value',
        'Only a style issue',
      ],
      answer_index: 2,
      explanation:
        'An error path that isn’t checked is the same class of bug as a swallowed exception: the program continues on invalid state.',
    },
  ],
  concurrency: [
    {
      id: 'q1',
      prompt: '`if key not in cache: cache[key] = compute()` run by multiple threads can:',
      options: [
        'Leak memory',
        'Compute the value twice or corrupt the dict, due to a check-then-act race',
        'Raise SyntaxError',
        'Deadlock immediately',
      ],
      answer_index: 1,
      explanation:
        'Another thread can slip between the check and the assignment. Make the read-modify-write atomic with a lock, or use a thread-safe structure.',
    },
    {
      id: 'q2',
      prompt: 'Why is `def add(x, items=[]):` that appends to items buggy?',
      options: [
        'Lists cannot be default arguments',
        'It should be written as items=list()',
        'The default list is created once and shared across all calls',
        'append is not thread-safe',
      ],
      answer_index: 2,
      explanation:
        'The default is evaluated once at definition time; every call with no argument mutates the same list. Use items=None and create it inside.',
    },
    {
      id: 'q3',
      prompt: 'Most reliable fix for a counter incremented by many threads without a lock:',
      options: [
        'Make the counter a float',
        'Add a short sleep before each update',
        'Guard the update with a lock, or use an atomic primitive',
        'Use a larger integer type',
      ],
      answer_index: 2,
      explanation:
        '`n += 1` is read-modify-write and not atomic. A lock (or an atomic counter) makes the update safe.',
    },
  ],
  logic: [
    {
      id: 'q1',
      prompt: '`for i in range(len(arr)): if arr[i] == arr[i + 1]:` fails because:',
      options: [
        'range is exclusive of its end value',
        'On the last i, arr[i + 1] is out of bounds',
        '== should be `is`',
        'The loop is O(n^2)',
      ],
      answer_index: 1,
      explanation:
        'The loop should stop at len(arr) - 1. Classic off-by-one / boundary defect: no crash until the final iteration.',
    },
    {
      id: 'q2',
      prompt: 'A boundary or logic bug typically shows up as:',
      options: [
        'An immediate crash on any input',
        'Correct-looking runs that return subtly wrong results at the edges',
        'A memory leak',
        'A CORS error',
      ],
      answer_index: 1,
      explanation:
        'Logic and off-by-one bugs usually run fine and just compute the wrong thing. Trace the edge cases (0, 1, last element) by hand.',
    },
    {
      id: 'q3',
      prompt: 'Using `if age > 18:` to allow adults is likely wrong because:',
      options: [
        'age might be a string',
        '18-year-olds are excluded; it should be >=',
        'It should be elif',
        'Integers cannot be compared with >',
      ],
      answer_index: 1,
      explanation:
        'Off-by-one on the comparison operator. Decide whether the boundary value is included and choose > vs >= deliberately.',
    },
  ],
  resource: [
    {
      id: 'q1',
      prompt: '`if item not in out:` where out is a list, inside a loop over items, is slow because:',
      options: [
        'List membership is O(n), making the loop O(n^2)',
        'Lists cannot hold duplicates',
        '`in` copies the list each time',
        'It allocates a new list each iteration',
      ],
      answer_index: 0,
      explanation:
        'Each `x in list` scans the whole list. Track seen values in a set for O(1) membership.',
    },
    {
      id: 'q2',
      prompt: 'Opening a database connection inside a loop and never closing it is a:',
      options: [
        'Logic bug',
        'Resource leak: use a context manager or connection pool',
        'Race condition',
        'Injection risk',
      ],
      answer_index: 1,
      explanation:
        'Unreleased handles accumulate until the process runs out. Use `with` or a pool so each connection is returned.',
    },
    {
      id: 'q3',
      prompt: 'A cache backed by a plain dict that only ever grows will eventually:',
      options: [
        'Raise KeyError',
        'Exhaust memory; it needs a size bound or eviction policy',
        'Become read-only',
        'Slow `in` down to O(n)',
      ],
      answer_index: 1,
      explanation: 'An unbounded cache is a slow memory leak. Bound it with an LRU, a max size, or a TTL.',
    },
  ],
}

function mockBank(conceptId: string): BankQ[] {
  return MOCK_BANK[conceptId] ?? MOCK_BANK.injection
}

export async function getMicroCheck(conceptId: string): Promise<MicroCheckData> {
  if (USE_MOCK) {
    await delay(200)
    return {
      concept_id: conceptId,
      questions: mockBank(conceptId).map(({ id, prompt, options }) => ({ id, prompt, options })),
    }
  }
  return api.get<MicroCheckData>(`/concept/${conceptId}/micro-check`)
}

export async function submitMicroCheck(
  conceptId: string,
  answers: MicroCheckAnswer[],
): Promise<MicroCheckResult> {
  if (USE_MOCK) {
    await delay(300)
    const qs = mockBank(conceptId)
    const picked = new Map(answers.map((a) => [a.question_id, a.choice_index]))
    let correct = 0
    const results: MicroCheckQuestionResult[] = qs.map((q) => {
      const raw = picked.has(q.id) ? (picked.get(q.id) as number) : null
      const your = raw !== null && raw >= 0 && raw < q.options.length ? raw : null
      const ok = your === q.answer_index
      if (ok) correct++
      return {
        question_id: q.id,
        correct: ok,
        your_index: your,
        correct_index: q.answer_index,
        explanation: q.explanation,
      }
    })
    const score = qs.length ? correct / qs.length : 0
    return {
      concept_id: conceptId,
      total: qs.length,
      correct,
      score: Math.round(score * 100) / 100,
      passed: score >= 2 / 3,
      results,
      practice_exercise_ids: [],
    }
  }
  return api.post<MicroCheckResult>(`/concept/${conceptId}/micro-check`, { answers })
}

// --- concept library — GET /concepts · GET /concept/{id} --------------
import type { Concept, ConceptSummary } from './types'
import { mockConcepts, getConceptById } from '../mock/concepts'

function conceptFromMock(c: (typeof mockConcepts)[number]): Concept {
  return {
    id: c.id,
    title: c.title ?? c.id,
    summary: (c as unknown as { description?: string }).description ?? '',
    example_bad: (c as unknown as { vulnerableCode?: string }).vulnerableCode ?? '',
    example_good: (c as unknown as { saferCode?: string }).saferCode ?? '',
    videos: (c as unknown as { resourceUrl?: string; resourceTitle?: string }).resourceUrl
      ? [{ title: (c as unknown as { resourceTitle?: string }).resourceTitle ?? 'Reference', url: (c as unknown as { resourceUrl?: string }).resourceUrl as string }]
      : [],
    practice_exercise_ids: [],
    micro_check_count: (mockBank(c.id) ?? []).length,
  }
}

export async function getConcepts(): Promise<ConceptSummary[]> {
  if (USE_MOCK) {
    await delay(150)
    return mockConcepts.map((c) => ({ id: c.id, title: c.title ?? c.id }))
  }
  return api.get<ConceptSummary[]>('/concepts')
}

export async function getConcept(conceptId: string): Promise<Concept> {
  if (USE_MOCK) {
    await delay(150)
    const c = getConceptById(conceptId) ?? mockConcepts[0]
    return conceptFromMock(c)
  }
  return api.get<Concept>(`/concept/${conceptId}`)
}
