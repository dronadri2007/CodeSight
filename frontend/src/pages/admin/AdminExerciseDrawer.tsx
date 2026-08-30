import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Pencil, Trash2, Check, AlertTriangle, Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import {
  adminGetExercise,
  adminCreateExercise,
  adminUpdateExercise,
  adminDeleteExercise,
  adminSetReview,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import {
  ADMIN_DEFECT_CLASSES,
  ADMIN_TIERS,
  type AdminExerciseFull,
  type AdminReviewStatus,
} from '../../api/types'

const EASE = [0.16, 1, 0.3, 1] as const

const REVIEW_ACTIONS: { status: AdminReviewStatus; label: string }[] = [
  { status: 'approved', label: 'Approve' },
  { status: 'edited', label: 'Draft' },
  { status: 'unreviewed', label: 'Pending' },
  { status: 'rejected', label: 'Archive' },
]

export type DrawerMode = { kind: 'view'; id: string } | { kind: 'create' }

interface Props {
  token: string
  mode: DrawerMode
  onClose: () => void
  onChanged: () => void // refetch list + stats
  onAuthLost: () => void // 401 -> bounce to login
}

interface FormState {
  title: string
  defect_class: string
  difficulty: string
  filename: string
  code: string
  real_lines: string // "3, 7, 12"
  hints: string // one per line
  fix_diff: string
  reference: string
  review_status: string // create only
}

const EMPTY_FORM: FormState = {
  title: '',
  defect_class: 'logic',
  difficulty: 'beginner',
  filename: 'snippet.py',
  code: '',
  real_lines: '',
  hints: '',
  fix_diff: '',
  reference: '',
  review_status: 'approved',
}

function toForm(x: AdminExerciseFull): FormState {
  return {
    title: x.title,
    defect_class: x.defect_class,
    difficulty: x.difficulty,
    filename: x.filename,
    code: x.code,
    real_lines: x.real_lines.join(', '),
    hints: x.hints.join('\n'),
    fix_diff: x.fix_diff,
    reference: x.reference,
    review_status: x.review_status || 'approved',
  }
}

function parseLines(s: string): number[] {
  return s
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
}

const fieldCls =
  'w-full rounded-lg border border-[#3A2F1D] bg-[#000000] px-3 py-2 text-[13px] text-[#E5DFC9] outline-none transition-colors placeholder:text-[#E5DFC9]/30 focus:border-[#E5DFC9]/55'
const labelCls = 'mb-1 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#E5DFC9]/45'

export function AdminExerciseDrawer({ token, mode, onClose, onChanged, onAuthLost }: Props) {
  const creating = mode.kind === 'create'

  const [full, setFull] = useState<AdminExerciseFull | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editing, setEditing] = useState(creating)
  const [loading, setLoading] = useState(!creating)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleErr = useCallback(
    (e: unknown, fallback: string) => {
      if (e instanceof ApiError && e.status === 401) return onAuthLost()
      setError(e instanceof ApiError ? `${fallback} — ${e.body.slice(0, 200)}` : fallback)
    },
    [onAuthLost],
  )

  useEffect(() => {
    if (creating) {
      setForm(EMPTY_FORM)
      setEditing(true)
      setLoading(false)
      return
    }
    let dead = false
    setLoading(true)
    setError(null)
    setNotice(null)
    setEditing(false)
    setConfirmDelete(false)
    adminGetExercise(token, mode.id)
      .then((x) => {
        if (dead) return
        setFull(x)
        setForm(toForm(x))
      })
      .catch((e) => !dead && handleErr(e, 'Could not load this exercise'))
      .finally(() => !dead && setLoading(false))
    return () => {
      dead = true
    }
  }, [creating, token, mode, handleErr])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const codeLines = useMemo(() => (full ? full.code.split('\n') : []), [full])
  const realSet = useMemo(() => new Set(full?.real_lines ?? []), [full])

  const save = async () => {
    setError(null)
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.code.trim()) return setError('Code is required.')
    const payload = {
      title: form.title.trim(),
      defect_class: form.defect_class,
      difficulty: form.difficulty,
      filename: form.filename.trim() || 'snippet.py',
      code: form.code,
      real_lines: parseLines(form.real_lines),
      hints: form.hints.split('\n').map((h) => h.trim()).filter(Boolean),
      fix_diff: form.fix_diff,
      reference: form.reference.trim(),
    }
    setSaving(true)
    try {
      if (creating) {
        await adminCreateExercise(token, { ...payload, review_status: form.review_status })
      } else {
        await adminUpdateExercise(token, mode.id, payload)
      }
      onChanged()
      onClose()
    } catch (e) {
      handleErr(e, creating ? 'Create failed' : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const review = async (status: AdminReviewStatus) => {
    if (creating) return
    setSaving(true)
    setError(null)
    try {
      const r = await adminSetReview(token, mode.id, status)
      setFull((f) => (f ? { ...f, review_status: r.review_status } : f))
      setForm((f) => ({ ...f, review_status: r.review_status }))
      setNotice(`Marked ${r.review_status}.`)
      onChanged()
    } catch (e) {
      handleErr(e, 'Could not update review status')
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    if (creating) return
    setSaving(true)
    setError(null)
    try {
      await adminDeleteExercise(token, mode.id)
      onChanged()
      onClose()
    } catch (e) {
      handleErr(e, 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="scrim"
        className="fixed inset-0 z-40 bg-[#000000]/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        key="panel"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-[#3A2F1D] bg-[#1A130D] shadow-2xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-[#3A2F1D] px-6 py-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#E5DFC9]/40">
              {creating ? 'New exercise' : full?.id ?? mode.id}
            </p>
            <h2 className="truncate text-[15px] font-bold text-[#E5DFC9]">
              {creating ? 'Add to the corpus' : full?.title ?? '…'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#E5DFC9]/50 hover:bg-[#3A2F1D] hover:text-[#E5DFC9]"
          >
            <X size={16} />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="animate-spin text-[#E5DFC9]/50" size={20} />
            </div>
          ) : editing ? (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Title</label>
                <input className={fieldCls} value={form.title} onChange={(e) => set('title', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Defect class</label>
                  <select
                    className={fieldCls}
                    value={form.defect_class}
                    onChange={(e) => set('defect_class', e.target.value)}
                  >
                    {ADMIN_DEFECT_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Difficulty</label>
                  <select
                    className={fieldCls}
                    value={form.difficulty}
                    onChange={(e) => set('difficulty', e.target.value)}
                  >
                    {ADMIN_TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Filename</label>
                  <input
                    className={fieldCls}
                    value={form.filename}
                    onChange={(e) => set('filename', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Real (buggy) lines</label>
                  <input
                    className={fieldCls}
                    placeholder="3, 7, 12"
                    value={form.real_lines}
                    onChange={(e) => set('real_lines', e.target.value)}
                  />
                </div>
              </div>

              {creating && (
                <div>
                  <label className={labelCls}>Initial review status</label>
                  <select
                    className={fieldCls}
                    value={form.review_status}
                    onChange={(e) => set('review_status', e.target.value)}
                  >
                    <option value="approved">approved</option>
                    <option value="edited">edited (draft)</option>
                    <option value="unreviewed">unreviewed (pending)</option>
                  </select>
                </div>
              )}

              <div>
                <label className={labelCls}>Code</label>
                <textarea
                  className={`${fieldCls} min-h-[220px] resize-y font-mono text-[12px] leading-relaxed`}
                  spellCheck={false}
                  value={form.code}
                  onChange={(e) => set('code', e.target.value)}
                />
                <p className="mt-1 text-[11px] text-[#E5DFC9]/40">
                  Must parse as Python — the server rejects a SyntaxError.
                </p>
              </div>

              <div>
                <label className={labelCls}>Hints — one per line</label>
                <textarea
                  className={`${fieldCls} min-h-[80px] resize-y`}
                  value={form.hints}
                  onChange={(e) => set('hints', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Fix diff (optional)</label>
                <textarea
                  className={`${fieldCls} min-h-[80px] resize-y font-mono text-[12px]`}
                  spellCheck={false}
                  value={form.fix_diff}
                  onChange={(e) => set('fix_diff', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Reference (optional)</label>
                <input
                  className={fieldCls}
                  value={form.reference}
                  onChange={(e) => set('reference', e.target.value)}
                />
              </div>
            </div>
          ) : full ? (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                <span className="rounded border border-[#3A2F1D] bg-[#000000] px-2 py-0.5 text-[#E5DFC9]/70">
                  {full.defect_class}
                </span>
                <span className="rounded border border-[#3A2F1D] bg-[#000000] px-2 py-0.5 text-[#E5DFC9]/70">
                  {full.difficulty}
                </span>
                <span className="rounded border border-[#3A2F1D] bg-[#000000] px-2 py-0.5 text-[#E5DFC9]/70">
                  {full.source}
                </span>
                <span className="rounded border border-[#E5DFC9]/30 bg-[#3A2F1D] px-2 py-0.5 font-semibold text-[#E5DFC9]">
                  {full.review_status || 'unreviewed'}
                </span>
              </div>

              <div>
                <p className={labelCls}>{full.filename}</p>
                <div className="overflow-x-auto rounded-lg border border-[#3A2F1D] bg-[#000000]">
                  <pre className="min-w-full py-3 font-mono text-[12px] leading-relaxed">
                    {codeLines.map((ln, i) => {
                      const n = i + 1
                      const bug = realSet.has(n)
                      return (
                        <div
                          key={n}
                          className={bug ? 'bg-[#3A2F1D]/60' : undefined}
                        >
                          <span className="inline-block w-10 flex-shrink-0 select-none pr-3 text-right text-[#E5DFC9]/30">
                            {n}
                          </span>
                          <span className={bug ? 'text-[#E5DFC9]' : 'text-[#E5DFC9]/80'}>{ln || ' '}</span>
                        </div>
                      )
                    })}
                  </pre>
                </div>
                <p className="mt-1 text-[11px] text-[#E5DFC9]/40">
                  {full.real_lines.length
                    ? `Buggy line${full.real_lines.length > 1 ? 's' : ''}: ${full.real_lines.join(', ')}`
                    : 'No buggy lines recorded (clean sample).'}
                </p>
              </div>

              {full.hints.length > 0 && (
                <div>
                  <p className={labelCls}>Hints</p>
                  <ol className="list-decimal space-y-1 pl-5 text-[13px] text-[#E5DFC9]/75">
                    {full.hints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ol>
                </div>
              )}

              {full.fix_diff && (
                <div>
                  <p className={labelCls}>Fix diff</p>
                  <pre className="overflow-x-auto rounded-lg border border-[#3A2F1D] bg-[#000000] p-3 font-mono text-[12px] leading-relaxed text-[#E5DFC9]/80">
                    {full.fix_diff}
                  </pre>
                </div>
              )}

              {full.reference && (
                <div>
                  <p className={labelCls}>Reference</p>
                  <p className="text-[13px] leading-relaxed text-[#E5DFC9]/75">{full.reference}</p>
                </div>
              )}
            </div>
          ) : null}

          {error && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#3A2F1D] bg-[#3A2F1D]/40 px-3 py-2 text-[12px] text-[#E5DFC9]">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              {error}
            </p>
          )}
          {notice && !error && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#3A2F1D] bg-[#000000] px-3 py-2 text-[12px] text-[#E5DFC9]/80">
              <Check size={14} className="mt-0.5 flex-shrink-0" />
              {notice}
            </p>
          )}
        </div>

        {/* footer actions */}
        <div className="border-t border-[#3A2F1D] px-6 py-4">
          {editing ? (
            <div className="flex items-center justify-between gap-3">
              <Button
                size="md"
                variant="outline"
                className="text-[13px]"
                disabled={saving}
                onClick={() => {
                  if (creating) return onClose()
                  setEditing(false)
                  setError(null)
                  if (full) setForm(toForm(full))
                }}
              >
                Cancel
              </Button>
              <Button
                size="md"
                variant="primary"
                className="text-[13px]"
                loading={saving}
                onClick={save}
                icon={creating ? <Plus size={14} /> : <Check size={14} />}
              >
                {creating ? 'Create exercise' : 'Save changes'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {REVIEW_ACTIONS.map((a) => (
                  <Button
                    key={a.status}
                    size="sm"
                    variant={full?.review_status === a.status ? 'secondary' : 'outline'}
                    className="text-[12px]"
                    disabled={saving || !full}
                    onClick={() => review(a.status)}
                  >
                    {full?.review_status === a.status && <Check size={12} />}
                    {a.label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3">
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#E5DFC9]/70">Delete for good?</span>
                    <Button size="sm" variant="secondary" className="text-[12px]" loading={saving} onClick={doDelete}>
                      Yes, delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[12px]"
                      disabled={saving}
                      onClick={() => setConfirmDelete(false)}
                    >
                      Keep
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[12px]"
                    disabled={saving || !full}
                    icon={<Trash2 size={13} />}
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  size="md"
                  variant="primary"
                  className="text-[13px]"
                  disabled={saving || !full}
                  icon={<Pencil size={13} />}
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
