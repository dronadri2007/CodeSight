import { Link } from 'react-router-dom'
import { Shield, Lock, AlertTriangle, Zap, GitBranch, Gauge, ArrowRight } from 'lucide-react'

interface WeaknessChartProps {
  catchRates: Record<string, number>
}

const DEFECT_TAXONOMY = [
  { id: 'logic', name: 'Logic & Boundary Conditions', icon: Gauge, desc: 'Loop invariants, off-by-one, quadratic searches' },
  { id: 'injection', name: 'Injection & Input Validation', icon: Shield, desc: 'SQL injection, command injection, unescaped params' },
  { id: 'auth', name: 'Auth & Access Control', icon: Lock, desc: 'Timing attacks, session hijacking, broken ACLs' },
  { id: 'concurrency', name: 'Concurrency & Race Conditions', icon: GitBranch, desc: 'Deadlocks, non-deterministic lock ordering' },
  { id: 'error-handling', name: 'Error & Exception Handling', icon: AlertTriangle, desc: 'NoneType subscript errors, swallowed exceptions' },
  { id: 'resource', name: 'Resource Leaks & Performance', icon: Zap, desc: 'Unbounded memory loads, unclosed descriptors' },
]

export function WeaknessChart({ catchRates }: WeaknessChartProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#E5DFC9]">Concept Mastery & Weakness Profile</h3>
          <p className="text-xs text-[#E5DFC9]/60">
            Real-time catch rate tracking across the 6 defect classes based on test suite execution.
          </p>
        </div>
        <span className="text-2xs font-mono text-[#E5DFC9]/50">6 Defect Classes</span>
      </div>

      <div className="space-y-3 pt-1">
        {DEFECT_TAXONOMY.map((defect) => {
          const rate = catchRates[defect.id] ?? 50
          const Icon = defect.icon

          return (
            <div
              key={defect.id}
              className="p-4 rounded-2xl bg-[#1A130D] border border-[#3A2F1D] space-y-2 hover:border-[#E5DFC9]/30 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
                    <Icon size={13} />
                  </div>
                  <div>
                    <span className="font-bold text-[#E5DFC9]">{defect.name}</span>
                    <span className="text-2xs text-[#E5DFC9]/50 block sm:inline sm:ml-2">({defect.desc})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#E5DFC9]">{rate}%</span>
                  <Link
                    to={`/learn/${defect.id}`}
                    className="text-2xs text-[#E5DFC9]/60 hover:text-[#E5DFC9] flex items-center gap-0.5 underline font-medium"
                  >
                    Deep Dive <ArrowRight size={10} />
                  </Link>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2 rounded-full bg-[#000000] border border-[#3A2F1D] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#E5DFC9] transition-all duration-700 ease-out"
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
