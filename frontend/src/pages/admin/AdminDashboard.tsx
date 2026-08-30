import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Plus, Search, LogOut, RefreshCw, AlertTriangle } from 'lucide-react'
import { BrandLogo } from '../../components/ui/BrandLogo'
import { Button } from '../../components/ui/Button'
import { useThemeStore } from '../../store/themeStore'
import { useAdminStore } from '../../store/adminStore'
import { adminStats, adminListExercises } from '../../api/admin'
import { ApiError } from '../../api/client'
import { ADMIN_DEFECT_CLASSES, type AdminExerciseRow, type AdminStats } from '../../api/types'
import { AdminExerciseDrawer, type DrawerMode } from './AdminExerciseDrawer'

const EASE = [0.16, 1, 0.3, 1] as const

const STATUS_OPTIONS = ['All', 'Approved', 'Pending', 'Draft', 'Archived'] as const
const DIFF_OPTIONS = ['All', 'Easy', 'Medium', 'Hard'] as const
const SOURCE_OPTIONS = ['All', 'curated', 'generated', 'admin'] as const

const selectCls =
  'rounded-lg border border-[#3A2F1D] bg-[#1A130D] px-2.5 py-2 text-[12px] text-[#E5DFC9] outline-none focus:border-[#E5DFC9]/50'

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#3A2F1D] bg-[#1A130D] px-4 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E5DFC9]/40">{label}</p>
      <p className="mt-1 font-mono text-[1.5rem] font-bold leading-none tabular-nums text-[#E5DFC9]">
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-[#E5DFC9]/45">{sub}</p>}
    </div>
  )
}

function Bars({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...entries.map(([, v]) => v))
  return (
    <div className="rounded-xl border border-[#3A2F1D] bg-[#1A130D] p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E5DFC9]/40">{title}</p>
      <div className="space-y-2">
        {entries.map(([k, v], i) => (
          <div key={k} className="flex items-center gap-3">
            <span className="w-28 flex-shrink-0 truncate font-mono text-[11px] text-[#E5DFC9]/60">{k}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#3A2F1D]">
              <motion.div
                className="h-full rounded-full bg-[#E5DFC9]"
                initial={{ width: '0%' }}
                animate={{ width: `${(v / max) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.05 * i, ease: EASE }}
              />
            </div>
            <span className="w-8 flex-shrink-0 text-right font-mono text-[11px] tabular-nums text-[#E5DFC9]/70">
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { theme } = useThemeStore()
  const token = useAdminStore((s) => s.token)!
  const logout = useAdminStore((s) => s.logout)

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [rows, setRows] = useState<AdminExerciseRow[]>([])
  const [meta, setMeta] = useState<{ total: number; matched: number }>({ total: 0, matched: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<string>('All')
  const [status, setStatus] = useState<string>('All')
  const [source, setSource] = useState<string>('All')
  const [classFilter, setClassFilter] = useState<string>('All')

  const [drawer, setDrawer] = useState<DrawerMode | null>(null)

  const onAuthLost = useCallback(() => {
    logout()
  }, [logout])

  const load = useCallback(
    async (soft = false) => {
      soft ? setRefreshing(true) : setLoading(true)
      setError(null)
      try {
        const [s, list] = await Promise.all([
          adminStats(token),
          adminListExercises(token, { search, difficulty, status, source }),
        ])
        setStats(s)
        setRows(list.exercises)
        setMeta({ total: list.total, matched: list.matched })
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return onAuthLost()
        setError(e instanceof ApiError ? `Request failed (${e.status})` : 'Could not reach the server.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [token, search, difficulty, status, source, onAuthLost],
  )

  // debounce the server round-trip on filter changes
  useEffect(() => {
    const t = setTimeout(() => load(true), 300)
    return () => clearTimeout(t)
  }, [load])

  // first paint
  useEffect(() => {
    load(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibleRows = useMemo(
    () => (classFilter === 'All' ? rows : rows.filter((r) => r.defect_class === classFilter)),
    [rows, classFilter],
  )

  const afterChange = useCallback(() => load(true), [load])

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] selection:bg-[#E5DFC9]/25">
      {/* top bar */}
      <header className="border-b border-[#3A2F1D]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <BrandLogo size="sm" variant={theme === 'light' ? 'light' : 'dark'} />
            </Link>
            <span className="hidden font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5DFC9]/40 sm:inline">
              Corpus admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[12px]"
              loading={refreshing}
              icon={!refreshing ? <RefreshCw size={13} /> : undefined}
              onClick={() => load(true)}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-[12px]"
              icon={<LogOut size={13} />}
              onClick={logout}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-[#E5DFC9]/50" size={22} />
          </div>
        ) : (
          <>
            {error && (
              <p className="mb-6 flex items-start gap-2 rounded-lg border border-[#3A2F1D] bg-[#3A2F1D]/40 px-3 py-2 text-[12px] text-[#E5DFC9]">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                {error}
              </p>
            )}

            {/* stats strip */}
            {stats && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <StatCard label="Exercises" value={stats.total} />
                  <StatCard
                    label="Approved"
                    value={stats.by_status.Approved ?? 0}
                    sub={`${stats.by_status.Pending ?? 0} pending`}
                  />
                  <StatCard label="Reported" value={stats.reported} sub={`${stats.hidden} hidden`} />
                  <StatCard label="Sessions" value={stats.sessions} />
                  <StatCard label="Attempts" value={stats.attempts} />
                  <StatCard label="Reporters" value={stats.distinct_reporters} />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <Bars title="By defect class" data={stats.by_defect_class} />
                  <Bars title="By difficulty" data={stats.by_difficulty} />
                </div>
              </>
            )}

            {/* filter row */}
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[200px] flex-1">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#E5DFC9]/40"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, id, defect class…"
                  className="w-full rounded-lg border border-[#3A2F1D] bg-[#1A130D] py-2 pl-9 pr-3 text-[12px] text-[#E5DFC9] outline-none placeholder:text-[#E5DFC9]/30 focus:border-[#E5DFC9]/50"
                />
              </div>
              <select className={selectCls} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                <option value="All">All classes</option>
                {ADMIN_DEFECT_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select className={selectCls} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {DIFF_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o === 'All' ? 'All difficulty' : o}
                  </option>
                ))}
              </select>
              <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o === 'All' ? 'All status' : o}
                  </option>
                ))}
              </select>
              <select className={selectCls} value={source} onChange={(e) => setSource(e.target.value)}>
                {SOURCE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o === 'All' ? 'All sources' : o}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="primary"
                className="text-[12px]"
                icon={<Plus size={14} />}
                onClick={() => setDrawer({ kind: 'create' })}
              >
                New exercise
              </Button>
            </div>

            <p className="mt-3 font-mono text-[11px] text-[#E5DFC9]/40">
              {visibleRows.length} shown · {meta.matched} match the filter · {meta.total} in corpus
            </p>

            {/* table */}
            <div className="mt-3 overflow-x-auto rounded-xl border border-[#3A2F1D]">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#3A2F1D] font-mono text-[10px] uppercase tracking-[0.12em] text-[#E5DFC9]/40">
                    <th className="px-4 py-2.5 font-medium">ID</th>
                    <th className="px-4 py-2.5 font-medium">Title</th>
                    <th className="px-4 py-2.5 font-medium">Class</th>
                    <th className="px-4 py-2.5 font-medium">Difficulty</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium">Reports</th>
                    <th className="px-4 py-2.5 text-right font-medium">Lines</th>
                    <th className="px-4 py-2.5 text-right font-medium">Hints</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setDrawer({ kind: 'view', id: r.id })}
                      className="cursor-pointer border-b border-[#3A2F1D]/60 text-[12.5px] transition-colors last:border-0 hover:bg-[#1A130D]"
                    >
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[#E5DFC9]/55">{r.id}</td>
                      <td className="px-4 py-2.5 text-[#E5DFC9]">{r.title}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[#E5DFC9]/70">{r.defect_class}</td>
                      <td className="px-4 py-2.5 text-[#E5DFC9]/70">{r.difficulty_label}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                            r.status_label === 'Approved'
                              ? 'border-[#E5DFC9]/30 bg-[#3A2F1D] text-[#E5DFC9]'
                              : 'border-[#3A2F1D] bg-[#000000] text-[#E5DFC9]/60'
                          }`}
                        >
                          {r.status_label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#E5DFC9]/70">
                        {r.reports || '·'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#E5DFC9]/70">
                        {r.line_count}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#E5DFC9]/70">
                        {r.hint_count}
                      </td>
                    </tr>
                  ))}
                  {visibleRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-[#E5DFC9]/45">
                        No exercises match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {drawer && (
        <AdminExerciseDrawer
          token={token}
          mode={drawer}
          onClose={() => setDrawer(null)}
          onChanged={afterChange}
          onAuthLost={onAuthLost}
        />
      )}
    </div>
  )
}
