import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import {
  Code2, AlertTriangle, ArrowRight, TrendingUp, CheckCircle2,
  Clock, Play, BookOpen, Sparkles
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card, MetricCard } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { SkillBar } from '../../components/ui/ProgressBar'
import { defectClasses } from '../../tokens'
import { mockStudentExercises } from '../../mock/studentExercises'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const recommendedEx = mockStudentExercises[0]

  const recentSubmissions = [
    { title: 'Safe User Lookup with Error Handling', class: 'Error Handling', status: 'Needs Work', score: 45, time: '2 hours ago', id: 'stu-01' },
    { title: 'Parameterized Search Query Builder', class: 'Injection', status: 'Strong', score: 88, time: '1 day ago', id: 'stu-02' },
    { title: 'Constant-Time Token Comparison', class: 'Auth', status: 'Developing', score: 65, time: '2 days ago', id: 'stu-03' },
    { title: 'Thread-Safe Global Counter', class: 'Concurrency', status: 'Developing', score: 58, time: '3 days ago', id: 'stu-01' },
    { title: 'Array Binary Partition Bounds', class: 'Logic', status: 'Strong', score: 92, time: '4 days ago', id: 'stu-02' },
  ]

  const classRates = [
    { id: 'logic', name: 'Logic & Boundary', rate: 82, trend: 9, color: '#35B889' },
    { id: 'injection', name: 'Injection / Input Validation', rate: 78, trend: 12, color: '#E0646D' },
    { id: 'resource', name: 'Resource & Performance', rate: 67, trend: 5, color: '#AEB7B2' },
    { id: 'auth', name: 'Auth & Access Control', rate: 61, trend: -4, color: '#D9A441' },
    { id: 'concurrency', name: 'Concurrency & State', rate: 55, trend: 8, color: '#58D8C5' },
    { id: 'error-handling', name: 'Error & Exception Handling', rate: 43, trend: 12, color: '#35C6B0' },
  ]

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F4F1E8] flex flex-col selection:bg-[#35C6B0]/30 selection:text-[#F4F1E8]">
      {/* Top Navbar */}
      <Navbar variant="student" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Welcome Header & Hero Metric */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#29333A]">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#35C6B0]">
              Student Track · Skill Diagnostics
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-[#F4F1E8]">
              Good morning, Afrid.
            </h1>
            <p className="text-sm text-[#AEB7B2] mt-1">
              Let's find your next area to improve.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-[#151C24] p-5 rounded-2xl border border-[#29333A] shadow-xl">
            <div>
              <span className="text-2xs uppercase tracking-wider text-[#AEB7B2] font-semibold block">
                Coding Skill Index
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-[#F4F1E8]">
                72%
              </div>
            </div>
            <div className="h-10 w-px bg-[#29333A]" />
            <div className="space-y-1 text-xs text-[#AEB7B2]">
              <p><span className="font-bold text-[#F4F1E8]">18</span> challenges solved</p>
              <p><span className="font-bold text-[#35B889]">+14%</span> this month</p>
              <p><span className="font-bold text-[#D9A441]">4 days</span> practice streak</p>
            </div>
          </div>
        </div>

        {/* Focus Area: Current Weakness Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-[#D9A441]/40 bg-[rgba(217,164,65,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm" dot>CURRENT WEAKNESS</Badge>
              <span className="text-xs text-[#AEB7B2] font-mono">Catch rate: 43%</span>
            </div>
            <h2 className="text-xl font-bold text-[#F4F1E8]">
              Error &amp; Exception Handling
            </h2>
            <p className="text-sm text-[#DDD9CF] max-w-xl leading-relaxed">
              You frequently miss unchecked return values and assume database queries always return populated records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/student/practice/stu-01')}
              iconRight={<ArrowRight size={14} />}
            >
              Practice This
            </Button>
            <Button
              variant="dark"
              size="md"
              onClick={() => navigate('/student/learn/error-handling')}
            >
              Learn Concept
            </Button>
          </div>
        </motion.div>

        {/* Grid: 6 Skill Classes & Recent Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Skill by Class */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F4F1E8]">Coding Skill by Defect Taxonomy</h3>
              <span className="text-xs text-[#AEB7B2]">Click category to practice</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classRates.map((cls) => (
                <SkillBar
                  key={cls.id}
                  dark={true}
                  name={cls.name}
                  value={cls.rate}
                  trend={cls.trend}
                  color={cls.color}
                  onClick={() => navigate('/student/practice')}
                />
              ))}
            </div>
          </div>

          {/* Right: Recent Coding Analysis & Recommended */}
          <div className="lg:col-span-5 space-y-6">
            {/* Recommended Challenge */}
            <Card className="p-5 border-[#35C6B0]/40 bg-[#151C24] relative overflow-hidden shadow-xl text-[#F4F1E8]">
              <span className="text-2xs uppercase font-mono tracking-wider text-[#35C6B0] font-semibold block mb-2">
                RECOMMENDED PRACTICE
              </span>
              <h4 className="text-base font-bold text-[#F4F1E8] mb-1">{recommendedEx.title}</h4>
              <p className="text-xs text-[#AEB7B2] line-clamp-2 mb-4 leading-relaxed">
                {recommendedEx.description}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-[#29333A]">
                <div className="flex items-center gap-1.5 text-xs text-[#AEB7B2]">
                  <Clock size={12} />
                  <span>{recommendedEx.estimatedMinutes} mins</span>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/student/practice/${recommendedEx.id}`)}
                  icon={<Play size={12} />}
                >
                  Write Solution
                </Button>
              </div>
            </Card>

            {/* Recent Submissions */}
            <Card className="p-5 border-[#29333A] bg-[#151C24] text-[#F4F1E8]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-[#F4F1E8]">Recent Submissions</h4>
                <span className="text-2xs text-[#AEB7B2]">Last 5 attempts</span>
              </div>

              <div className="space-y-3">
                {recentSubmissions.map((sub, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/student/analysis/${sub.id}`)}
                    className="p-2.5 rounded-xl bg-[#0D1117] border border-[#202A31] flex items-center justify-between hover:border-[#35C6B0]/40 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#F4F1E8]">{sub.title}</p>
                      <span className="text-2xs text-[#AEB7B2]">{sub.class} · {sub.time}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-[#F4F1E8] block">{sub.score}%</span>
                      <span className={clsx(
                        'text-2xs font-semibold',
                        sub.status === 'Strong' ? 'text-[#35B889]' : sub.status === 'Needs Work' ? 'text-[#D9A441]' : 'text-[#AEB7B2]'
                      )}>
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
