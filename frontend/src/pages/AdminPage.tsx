import React, { useState } from 'react';
import { toast } from 'sonner';
import { Settings2, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const [exercises, setExercises] = useState([
    { id: 1, title: 'Vanishing Index', track: 'Student', category: 'Loops', difficulty: 'Medium' },
    { id: 2, title: 'Payment Balance Race', track: 'AI Engineer', category: 'Concurrency & State', difficulty: 'Hard' },
    { id: 3, title: 'SQL String Interpolation', track: 'AI Engineer', category: 'Injection', difficulty: 'Easy' },
  ]);

  const handleDelete = (id: number) => {
    setExercises(prev => prev.filter(e => e.id !== id));
    toast.success(`Exercise #${id} deleted from repository.`);
  };

  return (
    <div className="space-y-8 pb-12 text-[#17130F]">
      {/* Admin Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#D8D0C0] pb-6 sm:flex-row sm:items-center font-mono">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#746D61]">
            <Settings2 size={14} className="text-[#17130F]" />
            <span>CODESIGHT ADMINISTRATION CONSOLE</span>
          </div>
          <h1 className="mt-1 font-serif text-4xl font-bold text-[#17130F]">
            Repository & Corpus Management
          </h1>
          <p className="mt-1 text-sm text-[#403A32]">
            Author exercises, manage defect taxonomy benchmarks, configure promotion exams, and view system metrics.
          </p>
        </div>

        <button
          onClick={() => toast.info('Exercise Authoring modal ready.')}
          className="flex items-center gap-2 rounded-lg border border-[#17130F] bg-[#17130F] px-5 py-2.5 text-xs font-bold text-[#F8F5EC] hover:bg-[#403A32]"
        >
          <Plus size={16} />
          <span>NEW EXERCISE</span>
        </button>
      </div>

      {/* Admin Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-3 font-mono text-xs">
        <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-5">
          <div className="text-[#746D61]">TOTAL EXERCISES</div>
          <div className="mt-2 font-serif text-3xl font-bold text-[#17130F]">148</div>
        </div>

        <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-5">
          <div className="text-[#746D61]">REGISTERED DEVELOPERS</div>
          <div className="mt-2 font-serif text-3xl font-bold text-[#17130F]">1,280</div>
        </div>

        <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-5">
          <div className="text-[#746D61]">CORPUS VERIFICATION RATE</div>
          <div className="mt-2 font-serif text-3xl font-bold text-[#17130F]">99.4%</div>
        </div>
      </div>

      {/* Exercise Repository Table */}
      <div className="overflow-hidden rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] shadow-sm font-mono text-xs">
        <div className="border-b border-[#D8D0C0] bg-[#F2EEE3] px-6 py-4 font-bold text-[#17130F] uppercase">
          Active Exercise Repository
        </div>

        <div className="divide-y divide-[#D8D0C0]">
          {exercises.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between px-6 py-4 text-[#17130F] hover:bg-[#F8F5EC]">
              <div>
                <span className="font-bold text-[#17130F]">#{ex.id}</span> {ex.title}
                <span className="ml-3 rounded bg-[#EDE7D7] px-2 py-0.5 text-[10px] text-[#403A32]">
                  {ex.track} · {ex.category}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded border border-[#D8D0C0] bg-[#F8F5EC] px-2 py-0.5 text-[10px] font-bold text-[#17130F]">
                  {ex.difficulty}
                </span>
                <button
                  onClick={() => toast.info(`Editing Exercise #${ex.id}`)}
                  className="p-1.5 text-[#746D61] hover:text-[#17130F]"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(ex.id)}
                  className="p-1.5 text-[#C93B2B] hover:text-[#17130F]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
