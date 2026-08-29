import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Code2, Wrench, BarChart3, Swords, AlertTriangle, Heart, Trophy,
} from 'lucide-react'
import { BrandLogo } from '../components/ui/BrandLogo'
import { defectClasses } from '../tokens'
import { useThemeStore } from '../store/themeStore'

import { FullscreenPixelHero } from '../components/landing/FullscreenPixelHero'

/* -------------------------------------------------------------------------- *
 *  CodeSight landing page.
 *
 *  Motto: you are graded on how good the code is — its time and space
 *  complexity against the best achievable for the problem — not on a green
 *  checkmark. Two tracks: write optimal code from scratch, or repair broken
 *  AI-generated code. Six levels, each gated by a timed promotion exam.
 *
 *  Locked by earlier direction:
 *   - FullscreenPixelHero (the canvas animation) is the hero and is untouched.
 *   - Palette: #000000 ground, #1A130D panels, #3A2F1D lines, #E5DFC9 ink.
 *     Emphasis comes from weight, never a brighter tint.
 *   - The only interactive control here is "Get Started". Login / Create
 *     Account live inside FullscreenPixelHero.
 * -------------------------------------------------------------------------- */

const EASE = [0.16, 1, 0.3, 1] as const

const SUBMISSION = [
  'def has_pair(nums, target):',
  '    for i in range(len(nums)):',
  '        for j in range(i + 1, len(nums)):',
  '            if nums[i] + nums[j] == target:',
  '                return True',
  '    return False',
]
const SUBMISSION_FLAG = 3

const VERDICT = [
  { label: 'Time', detail: 'submitted O(n²) · optimal O(n)', score: '25 / 50' },
  { label: 'Space', detail: 'submitted O(1) · optimal O(n)', score: '50 / 50' },
]

const TRACKS = [
  {
    icon: Code2,
    audience: 'Student track',
    title: 'Write optimal code',
    body: "Solve from scratch. We don't grade pass or fail — we grade your time and space complexity against the best achievable for that problem. A brute-force answer that passes still leaves points on the table.",
  },
  {
    icon: Wrench,
    audience: 'AI Engineer track',
    title: 'Fix what the AI shipped',
    body: "Repair broken, AI-generated code in the editor. Points for the real bugs you catch and the efficiency you recover — points off for “fixing” what was never broken.",
  },
]

const LEVELS = [
  'Student · Beginner',
  'Student · Intermediate',
  'Student · Pro',
  'AI Eng · Beginner',
  'AI Eng · Intermediate',
  'AI Eng · Pro',
]
// desktop-only rise: earlier levels sit lower, later levels climb toward the top
const LEVEL_RISE = ['sm:mt-[7.5rem]', 'sm:mt-24', 'sm:mt-[4.5rem]', 'sm:mt-12', 'sm:mt-6', 'sm:mt-0']

// illustrative catch-rate data for the weakness chart
const CATCH_RATES = [78, 61, 84, 46, 90, 55]

const STACK = ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Gemini', 'Railway']

/* -------------------------------------------------------------------------- */

function CodeLine({ n, text, flagged }: { n: number; text: string; flagged: boolean }) {
  return (
    <div className={`flex ${flagged ? 'bg-[#3A2F1D]' : ''}`}>
      <span className="w-10 flex-shrink-0 select-none border-r border-[#3A2F1D] pr-3 text-right tabular-nums text-[#E5DFC9]/35">
        {n}
      </span>
      <code
        className={`whitespace-pre pl-4 pr-5 ${
          flagged ? 'font-medium text-[#E5DFC9]' : 'text-[#E5DFC9]/80'
        }`}
      >
        {text || ' '}
      </code>
    </div>
  )
}

export default function Landing() {
  const { theme } = useThemeStore()

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9]">
      {/* ================================================================
          HERO — canvas animation + its own headline / CTAs (UNCHANGED)
          ================================================================ */}
      <FullscreenPixelHero />

      <main className="overflow-x-clip">
        {/* ==============================================================
            1 · THE MOTTO  — oversized statement, panel offset to the side
            ============================================================== */}
        <span id="platform" />
        <section
          id="start-exploring"
          className="relative px-6 pb-28 pt-16 scroll-mt-24"
        >
          <div className="bg-warm-glow pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-y-12 lg:grid-cols-12 lg:items-center lg:gap-x-10">
            <div className="lg:col-span-5">
              <h2 className="text-[2.5rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-balance text-[#E5DFC9] sm:text-[3.4rem]">
                Graded on how good it is.
                <span className="text-[#E5DFC9]/45"> Not whether it runs.</span>
              </h2>
              <p className="mt-6 max-w-[40ch] text-[15px] leading-relaxed text-[#E5DFC9]/70">
                Passing the tests is the floor. CodeSight measures the time and space
                complexity of what you wrote against the best achievable for the problem,
                splits the score evenly between the two, and Claude explains every point
                you left behind.
              </p>
              <Link
                to="/role-select"
                className="group mt-9 inline-flex items-center gap-2 rounded text-sm font-bold text-[#E5DFC9] outline-none transition-[gap] hover:gap-3 focus-visible:ring-2 focus-visible:ring-[#E5DFC9]/60 focus-visible:ring-offset-4 focus-visible:ring-offset-[#000000]"
              >
                <span>Get Started</span>
                <ArrowRight size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* editor + score breakdown — offset down and toward the edge */}
            <div className="lg:col-span-7 lg:mt-14 lg:-mr-6 xl:-mr-16">
              <div className="overflow-hidden rounded-2xl border border-[#3A2F1D] bg-[#1A130D] shadow-xl">
                <div className="flex items-center gap-2 border-b border-[#3A2F1D] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3A2F1D]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3A2F1D]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3A2F1D]" />
                  <span className="ml-2 font-mono text-[12px] text-[#E5DFC9]/55">has_pair.py</span>
                  <span className="ml-auto text-[10px] font-medium uppercase tracking-[0.16em] text-[#E5DFC9]/35">
                    submitted
                  </span>
                </div>

                <pre className="overflow-x-auto py-3.5 font-mono text-[12.5px] leading-[1.75]">
                  {SUBMISSION.map((line, i) => (
                    <CodeLine key={i} n={i + 1} text={line} flagged={i + 1 === SUBMISSION_FLAG} />
                  ))}
                </pre>

                <div className="space-y-2 border-t border-[#3A2F1D] px-4 py-4 font-mono text-[12px]">
                  {VERDICT.map((row, i) => (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.5, delay: i * 0.12, ease: EASE }}
                      className="flex items-baseline justify-between gap-4"
                    >
                      <span className="text-[#E5DFC9]/70">
                        {row.label} <span className="text-[#E5DFC9]/45">· {row.detail}</span>
                      </span>
                      <span className="flex-shrink-0 text-[#E5DFC9]">{row.score}</span>
                    </motion.div>
                  ))}
                  <div className="my-1 h-px bg-[#3A2F1D]" />
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, delay: 0.24, ease: EASE }}
                    className="flex items-baseline justify-between gap-4 font-semibold text-[#E5DFC9]"
                  >
                    <span>Score</span>
                    <span>75 / 100</span>
                  </motion.div>
                </div>

                <div className="flex items-start gap-2 border-t border-[#3A2F1D] bg-[#000000] px-4 py-3">
                  <AlertTriangle size={13} strokeWidth={2} className="mt-0.5 flex-shrink-0 text-[#E5DFC9]/60" />
                  <p className="font-mono text-[11.5px] leading-relaxed text-[#E5DFC9]/60">
                    Correct — but the nested scan is O(n²). A hash set collapses it into a
                    single pass. Claude walks you through the rewrite.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==============================================================
            2 · TWO TRACKS  — a diagonal fork in the road
            ============================================================== */}
        <section id="features" className="relative isolate overflow-hidden border-y border-[#3A2F1D]">
          <div
            className="absolute inset-y-0 right-0 w-full bg-[#1A130D]"
            style={{ clipPath: 'polygon(58% 0, 100% 0, 100% 100%, 42% 100%)' }}
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-y-14 px-6 py-24 md:grid-cols-2 md:gap-x-20 md:py-28">
            {TRACKS.map(({ icon: Icon, audience, title, body }, i) => (
              <div key={title} className={i === 1 ? 'md:pl-4' : ''}>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3A2F1D] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#E5DFC9]">
                  <Icon size={13} strokeWidth={2} />
                  {audience}
                </span>
                <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.025em] text-[#E5DFC9] sm:text-[1.75rem]">
                  {title}
                </h3>
                <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-[#E5DFC9]/70">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ==============================================================
            3 · THE CLIMB  — six levels, each gate a real exam
            ============================================================== */}
        <section id="developer" className="relative overflow-hidden px-6 py-24 scroll-mt-24">
          <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-[34rem]">
              <h2 className="text-[2rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-balance text-[#E5DFC9] sm:text-[2.6rem]">
                Six levels. Every gate is a real exam.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-[#E5DFC9]/70">
                Solving problems keeps you sharp; it does not move you up. To advance you
                sit a timed promotion exam — full screen, submit only, no run button — and
                clear two to three problems before the clock runs out.
              </p>
            </div>

            {/* ascending staircase of level bars */}
            <ol className="mt-14 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-4">
              {LEVELS.map((lvl, i) => {
                const [group, tier] = lvl.split(' · ')
                const isPro = tier === 'Pro' // the top of each ladder — its own colour
                return (
                  <li
                    key={lvl}
                    className={`sm:flex-1 ${LEVEL_RISE[i]} ${i === 3 ? 'sm:ml-6' : ''}`}
                  >
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#3A2F1D]">
                      <motion.div
                        className={`h-full rounded-full ${
                          isPro
                            ? 'bg-[#E3A24A] shadow-[0_0_16px_rgba(227,162,74,0.4)]'
                            : 'bg-[#E5DFC9] shadow-[0_0_14px_rgba(229,223,201,0.28)]'
                        }`}
                        initial={{ width: '0%' }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.6, delay: 0.1 + i * 0.14, ease: EASE }}
                      />
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span
                        className={`font-mono text-[12px] tabular-nums ${
                          isPro ? 'text-[#E3A24A]/80' : 'text-[#E5DFC9]/40'
                        }`}
                      >
                        0{i + 1}
                      </span>
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E5DFC9]/40">
                          {group}
                        </span>
                        <span
                          className={`block text-[13px] ${
                            isPro
                              ? 'font-bold text-[#E3A24A]'
                              : 'font-medium text-[#E5DFC9]/80'
                          }`}
                        >
                          {tier}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        {/* ==============================================================
            4 · WEAKNESS PROFILE + BATTLE  — 7 / 5 asymmetric
            ============================================================== */}
        <section className="border-t border-[#3A2F1D] px-6 py-24">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-x-16">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} strokeWidth={1.75} className="text-[#E5DFC9]/55" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E5DFC9]/50">
                  Weakness profile
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.025em] text-[#E5DFC9] sm:text-[1.75rem]">
                Know exactly where you miss
              </h3>
              <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-[#E5DFC9]/70">
                Every problem carries one of six defect classes. We track your catch rate
                on each and chart it on your profile, so you practise where it counts.
              </p>

              <div className="mt-8 space-y-2.5">
                {defectClasses.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-4">
                    <span className="w-28 flex-shrink-0 text-right font-mono text-[11px] text-[#E5DFC9]/55 sm:w-36">
                      {c.shortLabel}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#3A2F1D]">
                      <motion.div
                        className="h-full rounded-full bg-[#E5DFC9]/70"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${CATCH_RATES[i]}%` }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, delay: i * 0.07, ease: EASE }}
                      />
                    </div>
                    <span className="w-9 flex-shrink-0 font-mono text-[11px] tabular-nums text-[#E5DFC9]/50">
                      {CATCH_RATES[i]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 lg:border-l lg:border-[#3A2F1D] lg:pl-16">
              <div className="flex items-center gap-2">
                <Swords size={16} strokeWidth={1.75} className="text-[#E5DFC9]/55" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E5DFC9]/50">
                  Multiplayer
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.025em] text-[#E5DFC9] sm:text-[1.75rem]">
                Battle other reviewers
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-[#E5DFC9]/70">
                Friend rooms for low-stakes practice. Ranked one-versus-one with
                skill-based matchmaking, a speed bonus for the first valid fix, and a
                penalty for false positives.
              </p>
            </div>
          </div>
        </section>

        {/* ==============================================================
            5 · MADE WITH ♥
            ============================================================== */}
        <section className="border-t border-[#3A2F1D] px-6 py-16 text-center">
          <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#E5DFC9]">
            Made with
            <Heart size={13} strokeWidth={2} className="fill-[#E5DFC9] text-[#E5DFC9]" />
            for Tech Eximius 2026
          </p>
          <p className="mt-1 font-mono text-[11px] text-[#E5DFC9]/50">by team HackHive</p>

          <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E5DFC9]/35">
            Built with
          </p>
          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {STACK.map((s) => (
              <span key={s} className="text-[13px] font-medium tracking-wide text-[#E5DFC9]/40">
                {s}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="border-t border-[#3A2F1D] px-6 py-14">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
          <BrandLogo size="sm" variant={theme === 'light' ? 'light' : 'dark'} />
          <p className="text-[12px] text-[#E5DFC9]/50">
            Algorithmic complexity &amp; AI code-review practice.
          </p>
          <div className="mt-4 flex w-full flex-col items-center justify-between gap-3 border-t border-[#3A2F1D] pt-6 text-[11px] text-[#E5DFC9]/40 sm:flex-row">
            <span>CodeSight 2.0 · Algorithmic Complexity &amp; AI Code Review Platform</span>
            <span className="flex items-center gap-1.5">
              <Trophy size={11} strokeWidth={2} /> Tech Eximius 2026
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
