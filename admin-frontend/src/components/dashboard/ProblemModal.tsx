import React, { useState, useEffect } from 'react';
import { Problem, Difficulty, ProblemStatus } from '../../types';
import { PrimaryButton } from '../common/PrimaryButton';
import { X, Code, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/adminService';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (problemData: any) => Promise<void>;
  initialData?: Problem | null;
}

const DEFECT_CLASSES = ['injection', 'auth', 'error-handling', 'concurrency', 'logic', 'resource', 'clean'];

const BLANK = {
  title: '',
  defect_class: 'injection',
  difficulty: 'Easy' as Difficulty,
  status: 'Approved' as ProblemStatus,
  code: '# paste the short buggy snippet here (3-14 lines)\n',
  real_lines: '',
  fix_diff: '',
  reference: '',
  hints: '',
};

export const ProblemModal: React.FC<ProblemModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [f, setF] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (!initialData) {
      setF({ ...BLANK });
      return;
    }
    setF((p) => ({
      ...p,
      title: initialData.title,
      defect_class: DEFECT_CLASSES.includes(initialData.defectClass as string)
        ? (initialData.defectClass as string)
        : 'injection',
      difficulty: initialData.difficulty,
      status: initialData.status,
    }));
    setLoading(true);
    adminService
      .getExerciseDetail(initialData.id)
      .then((d) => {
        if (!d) return;
        setF((p) => ({
          ...p,
          title: String(d.title ?? p.title),
          defect_class: String(d.defect_class ?? p.defect_class),
          code: String(d.code ?? ''),
          real_lines: Array.isArray(d.real_lines) ? (d.real_lines as number[]).join(', ') : '',
          fix_diff: String(d.fix_diff ?? ''),
          reference: String(d.reference ?? ''),
          hints: Array.isArray(d.hints) ? (d.hints as string[]).join('\n') : '',
        }));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim() || !f.code.trim()) {
      setError('Title and code are required.');
      return;
    }
    const real_lines = f.real_lines
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    const hints = f.hints.split('\n').map((h) => h.trim()).filter(Boolean);

    setSaving(true);
    setError(null);
    try {
      await onSave({
        // review-exercise fields (live backend)
        title: f.title.trim(),
        defect_class: f.defect_class,
        difficulty: f.difficulty,
        status: f.status,
        code: f.code,
        real_lines,
        fix_diff: f.fix_diff,
        reference: f.reference,
        hints,
        // legacy Problem fields (kept so the offline/mock path stays valid)
        slug: f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tags: [f.defect_class],
        statement: f.reference,
        starterCode: {},
        testCases: [],
        optimalTimeComplexity: '-',
        optimalSpaceComplexity: '-',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full py-2.5 px-3 rounded-xl text-sm bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-white/[0.12] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]';
  const mono =
    'w-full p-3.5 rounded-xl text-xs font-mono bg-[#0D0D0D] border border-slate-200 dark:border-white/[0.12] text-emerald-400 focus:outline-none focus:border-[#007AFF]';
  const lbl = 'block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-white/70 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8">
        <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#111218] border border-slate-200 dark:border-white/15 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08] mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/30">
                <Code size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {initialData ? 'Edit review exercise' : 'New review exercise'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-white/50">
                  A buggy snippet, the defect line(s), the fix, and a reference explanation.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>

          {loading && <div className="mb-4 text-xs text-slate-500 dark:text-white/50 animate-pulse">Loading exercise…</div>}
          {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={lbl}>Title</label>
              <input type="text" value={f.title} onChange={(e) => set('title', e.target.value)} required placeholder="e.g. User lookup by email" className={field} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Defect class</label>
                <select value={f.defect_class} onChange={(e) => set('defect_class', e.target.value)} className={field}>
                  {DEFECT_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Difficulty</label>
                <select value={f.difficulty} onChange={(e) => set('difficulty', e.target.value as Difficulty)} className={field}>
                  <option value="Easy">Easy · beginner</option>
                  <option value="Medium">Medium · intermediate</option>
                  <option value="Hard">Hard · pro</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Review status</label>
                <select value={f.status} onChange={(e) => set('status', e.target.value as ProblemStatus)} className={field}>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Draft">Draft (edited)</option>
                  <option value="Archived">Archived (rejected)</option>
                </select>
              </div>
            </div>

            <div>
              <label className={lbl}>Buggy code</label>
              <textarea rows={8} value={f.code} onChange={(e) => set('code', e.target.value)} className={mono} spellCheck={false} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Defect line(s) — comma separated</label>
                <input type="text" value={f.real_lines} onChange={(e) => set('real_lines', e.target.value)} placeholder="2, 3   (blank = clean file)" className={field} />
              </div>
              <div>
                <label className={lbl}>Hints — one per line</label>
                <textarea rows={3} value={f.hints} onChange={(e) => set('hints', e.target.value)} placeholder={'Follow the input value\nLine 2 is where it goes wrong'} className={field + ' font-mono'} />
              </div>
            </div>

            <div>
              <label className={lbl}>Fix diff</label>
              <textarea rows={4} value={f.fix_diff} onChange={(e) => set('fix_diff', e.target.value)} className={field + ' font-mono'} spellCheck={false} placeholder="- buggy line&#10;+ fixed line" />
            </div>

            <div>
              <label className={lbl}>Reference explanation (2–4 sentences)</label>
              <textarea rows={3} value={f.reference} onChange={(e) => set('reference', e.target.value)} placeholder="What the mechanism is and how to fix it." className={field} />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="py-2.5 px-4 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.1] transition-all">
                Cancel
              </button>
              <PrimaryButton type="submit" loading={saving} className="py-2.5 px-6 text-xs font-semibold" icon={<CheckCircle2 size={16} />}>
                {initialData ? 'Save changes' : 'Create exercise'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
