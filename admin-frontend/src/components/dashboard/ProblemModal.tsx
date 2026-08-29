import React, { useState, useEffect } from 'react';
import { Problem, Difficulty, DefectClass, TestCase, ProblemStatus } from '../../types';
import { InputField } from '../common/InputField';
import { PrimaryButton } from '../common/PrimaryButton';
import { X, Plus, Trash2, Code, FileText, CheckCircle2 } from 'lucide-react';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (problemData: any) => Promise<void>;
  initialData?: Problem | null;
}

export const ProblemModal: React.FC<ProblemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [status, setStatus] = useState<ProblemStatus>('Approved');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [statement, setStatement] = useState('');
  
  // Code Templates
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'javascript' | 'cpp'>('python');
  const [starterPython, setStarterPython] = useState('');
  const [starterJs, setStarterJs] = useState('');
  const [starterCpp, setStarterCpp] = useState('');

  // Complexity benchmarks
  const [timeComplexity, setTimeComplexity] = useState('O(N)');
  const [spaceComplexity, setSpaceComplexity] = useState('O(1)');

  // Test Cases
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: '1', input: '', expectedOutput: '', isSample: true },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDifficulty(initialData.difficulty);
      setStatus(initialData.status);
      setTags(initialData.tags || []);
      setStatement(initialData.statement || '');
      setStarterPython(initialData.starterCode?.python || '');
      setStarterJs(initialData.starterCode?.javascript || '');
      setStarterCpp(initialData.starterCode?.cpp || '');
      setTimeComplexity(initialData.optimalTimeComplexity || 'O(N)');
      setSpaceComplexity(initialData.optimalSpaceComplexity || 'O(1)');
      setTestCases(initialData.testCases?.length ? initialData.testCases : [{ id: '1', input: '', expectedOutput: '', isSample: true }]);
    } else {
      setTitle('');
      setDifficulty('Medium');
      setStatus('Approved');
      setTags(['Algorithms', 'Data Structures']);
      setStatement('### Description\nDescribe the coding problem and optimal objective here.\n\n### Constraints\n- Time Complexity: O(N)\n- Space Complexity: O(1)');
      setStarterPython('def solve(input_data):\n    # Write optimized code here\n    pass');
      setStarterJs('function solve(inputData) {\n  // Write optimized code here\n}');
      setStarterCpp('#include <iostream>\n\nvoid solve() {\n    // Write code\n}');
      setTimeComplexity('O(N)');
      setSpaceComplexity('O(1)');
      setTestCases([{ id: '1', input: 'input = 10', expectedOutput: '20', isSample: true }]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(',', '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      { id: Date.now().toString(), input: '', expectedOutput: '', isSample: false },
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleUpdateTestCase = (index: number, field: keyof TestCase, val: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: val };
    setTestCases(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Problem title is required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        difficulty,
        defectClass: 'Algorithmic Optimization',
        status,
        tags,
        statement,
        starterCode: {
          python: starterPython,
          javascript: starterJs,
          cpp: starterCpp,
        },
        optimalTimeComplexity: timeComplexity,
        optimalSpaceComplexity: spaceComplexity,
        testCases,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save problem');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8">
        <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#111218] border border-slate-200 dark:border-white/15 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08] mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/30">
                <Code size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {initialData ? 'Edit Problem' : 'Create New Problem'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-white/50">
                  Configure problem statement, complexity constraints, and verification test cases.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-white/70 mb-1.5">
                Problem Title
              </label>
              <input
                type="text"
                placeholder="e.g. Reverse Linked List in O(N)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full py-2.5 px-3.5 rounded-xl text-sm bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-white/[0.12] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]"
              />
            </div>

            {/* Meta Row: Difficulty, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-white/70 mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full py-2.5 px-3 rounded-xl text-sm bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-white/[0.12] text-slate-900 dark:text-white focus:outline-none focus:border-[#007AFF]"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-white/70 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProblemStatus)}
                  className="w-full py-2.5 px-3 rounded-xl text-sm bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-white/[0.12] text-slate-900 dark:text-white focus:outline-none focus:border-[#007AFF]"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-white/70 mb-1.5">
                Tags (Press Enter or comma to add)
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.12]">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/30"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[#007AFF] hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={tags.length === 0 ? 'Type tag and hit Enter...' : ''}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none px-2 py-1"
                />
              </div>
            </div>

            {/* Problem Statement (Markdown) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-white/70">
                  Problem Statement (Markdown)
                </label>
                <span className="text-[11px] text-slate-400 dark:text-white/40 flex items-center space-x-1">
                  <FileText size={12} />
                  <span>Supports GFM Markdown</span>
                </span>
              </div>
              <textarea
                rows={5}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Write full problem description, edge cases, and constraints..."
                className="w-full p-3.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.12] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]"
              />
            </div>

            {/* Starter Code Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-white/70">
                  Starter Code Templates
                </label>
                <div className="flex rounded-lg bg-slate-100 dark:bg-white/[0.05] p-0.5 border border-slate-200 dark:border-white/[0.1]">
                  {(['python', 'javascript', 'cpp'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveCodeTab(lang)}
                      className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                        activeCodeTab === lang
                          ? 'bg-[#007AFF] text-white shadow-sm'
                          : 'text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {activeCodeTab === 'python' && (
                <textarea
                  rows={4}
                  value={starterPython}
                  onChange={(e) => setStarterPython(e.target.value)}
                  className="w-full p-3.5 rounded-xl text-xs font-mono bg-[#0D0D0D] border border-slate-200 dark:border-white/[0.12] text-emerald-400 focus:outline-none focus:border-[#007AFF]"
                />
              )}
              {activeCodeTab === 'javascript' && (
                <textarea
                  rows={4}
                  value={starterJs}
                  onChange={(e) => setStarterJs(e.target.value)}
                  className="w-full p-3.5 rounded-xl text-xs font-mono bg-[#0D0D0D] border border-slate-200 dark:border-white/[0.12] text-amber-300 focus:outline-none focus:border-[#007AFF]"
                />
              )}
              {activeCodeTab === 'cpp' && (
                <textarea
                  rows={4}
                  value={starterCpp}
                  onChange={(e) => setStarterCpp(e.target.value)}
                  className="w-full p-3.5 rounded-xl text-xs font-mono bg-[#0D0D0D] border border-slate-200 dark:border-white/[0.12] text-sky-400 focus:outline-none focus:border-[#007AFF]"
                />
              )}
            </div>

            {/* Test Cases Builder */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-white/70">
                  Verification Test Cases ({testCases.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddTestCase}
                  className="inline-flex items-center space-x-1 text-xs text-[#007AFF] hover:underline font-semibold"
                >
                  <Plus size={14} />
                  <span>Add Test Case</span>
                </button>
              </div>

              <div className="space-y-3">
                {testCases.map((tc, idx) => (
                  <div
                    key={tc.id || idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500 dark:text-white/50">Test #{idx + 1}</span>
                      <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-white/60">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!tc.isSample}
                            onChange={(e) =>
                              handleUpdateTestCase(idx, 'isSample', e.target.checked)
                            }
                            className="rounded bg-slate-200 dark:bg-white/10 text-[#007AFF]"
                          />
                          <span>Public Sample</span>
                        </label>
                        {testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Input (e.g. [1, 2, 3])"
                        value={tc.input}
                        onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                        className="p-2.5 rounded-lg text-xs font-mono bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-[#007AFF]"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Expected Output (e.g. true)"
                        value={tc.expectedOutput}
                        onChange={(e) =>
                          handleUpdateTestCase(idx, 'expectedOutput', e.target.value)
                        }
                        className="p-2.5 rounded-lg text-xs font-mono bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-[#007AFF]"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.1] transition-all"
              >
                Cancel
              </button>
              <PrimaryButton
                type="submit"
                loading={saving}
                className="py-2.5 px-6 text-xs font-semibold"
                icon={<CheckCircle2 size={16} />}
              >
                {initialData ? 'Update Problem' : 'Publish Problem'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
