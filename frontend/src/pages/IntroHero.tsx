import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Code2, Bot, Shield, ChevronRight, Sun, Moon, Sparkles, BookOpen } from 'lucide-react'
import { FullscreenPixelHero } from '../components/landing/FullscreenPixelHero'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { BrandLogo } from '../components/ui/BrandLogo'
import { useThemeStore } from '../store/themeStore'

const SLIDES = [
  {
    step: '01',
    badge: 'STUDENT MODE',
    title: 'Students write code. We grade on algorithmic efficiency.',
    description: 'Write solutions from scratch. We evaluate Time Complexity (TC) and Space Complexity (SC) against optimal achievable bounds — not just basic pass/fail assertions.',
    icon: Code2,
    highlight: 'TC / SC Relative Complexity Grading',
  },
  {
    step: '02',
    badge: 'AI ENGINEER MODE',
    title: 'AI Engineers review & fix broken AI-generated code.',
    description: 'Inspect flawed AI snippets directly in the Monaco IDE. Maximize efficiency deltas, fix security leaks, and avoid penalizing false-positive traps.',
    icon: Bot,
    highlight: 'Direct Code Editing & False-Positive Guardrails',
  },
  {
    step: '03',
    badge: 'TIERED PROMOTION',
    title: 'Level up through 6 tiers. Track your weakness profile.',
    description: 'Advance from Student Beginner to AI Engineer Pro by clearing proctored Promotion Exams. Master 6 universal defect classes with live catch rates.',
    icon: Shield,
    highlight: '6 Strict Tiers & Promotion Exams',
  },
]

export default function IntroHero() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const { theme, toggleTheme } = useThemeStore()

  const slide = SLIDES[currentSlide]
  const Icon = slide.icon

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col overflow-hidden selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      {/* Background Pixel Canvas */}
      <FullscreenPixelHero />

      {/* Top Header - Single Clean Placement for CTAs and Theme */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo size="md" variant={theme === 'light' ? 'light' : 'dark'} />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/about"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#E5DFC9]/80 hover:text-[#E5DFC9] hover:bg-[#1A130D]/50 transition-colors"
          >
            <BookOpen size={13} />
            <span>About CodeSight</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-8 h-8 rounded-xl bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9]/80 hover:text-[#E5DFC9] flex items-center justify-center transition-colors"
            title={`Current: ${theme === 'dark' ? 'Dark Mode' : 'Light Mode'} (Click to toggle)`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <Link
            to="/auth"
            className="px-4 py-1.5 rounded-xl border border-[#3A2F1D] bg-[#1A130D] text-xs font-semibold text-[#E5DFC9] hover:border-[#E5DFC9]/40 transition-colors"
          >
            Sign In
          </Link>

          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/auth')}
            className="font-bold text-xs shadow-md"
            iconRight={<ArrowRight size={13} />}
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Main Slideshow Container */}
      <main className="relative z-20 flex-1 max-w-5xl w-full mx-auto px-6 flex flex-col justify-center py-12">
        <div className="max-w-3xl space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <Badge variant="navy" size="sm">
                  {slide.badge} · STEP {slide.step} OF 03
                </Badge>
                <span className="text-2xs font-mono text-[#E5DFC9]/60">{slide.highlight}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#E5DFC9] tracking-tight leading-[1.1]">
                {slide.title}
              </h1>

              <p className="text-base sm:text-lg text-[#E5DFC9]/80 leading-relaxed max-w-2xl">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Stepper Dots & Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-[#3A2F1D]/60">
            {/* Slide Navigation Dots */}
            <div className="flex items-center gap-2">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide
                      ? 'w-8 bg-[#E5DFC9]'
                      : 'w-2 bg-[#3A2F1D] hover:bg-[#E5DFC9]/50'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Stepper Next / Enter Button */}
            <div className="flex items-center gap-3">
              {currentSlide < SLIDES.length - 1 ? (
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => setCurrentSlide((prev) => prev + 1)}
                  iconRight={<ChevronRight size={16} />}
                  className="text-xs"
                >
                  Next Step ({currentSlide + 2}/3)
                </Button>
              ) : (
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => navigate('/auth')}
                  iconRight={<ArrowRight size={16} className="text-[#000000]" />}
                  className="font-bold text-xs shadow-lg"
                >
                  Start Learning Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 border-t border-[#3A2F1D]/40 flex flex-col sm:flex-row items-center justify-between text-2xs text-[#E5DFC9]/50 gap-2">
        <span>CodeSight 2.0 · Algorithmic Complexity &amp; AI Code Review Platform</span>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:text-[#E5DFC9] underline font-mono">
            Read Comprehensive Overview →
          </Link>
        </div>
      </footer>
    </div>
  )
}
