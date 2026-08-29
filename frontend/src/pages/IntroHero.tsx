import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Code2, Bot, Shield, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { FullscreenPixelHero } from '../components/landing/FullscreenPixelHero'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { BrandLogo } from '../components/ui/BrandLogo'

const SLIDES = [
  {
    step: '01',
    badge: 'STUDENT MODE',
    title: 'Students write code. We grade on algorithmic efficiency.',
    description: 'Write code from scratch. We evaluate Time Complexity (TC) and Space Complexity (SC) against optimal achievable bounds — not just pass/fail.',
    icon: Code2,
    highlight: 'TC / SC Relative Grading',
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
    highlight: '6 Strict Tiers & 30-Min Promotion Exams',
  },
]

export default function IntroHero() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)

  const slide = SLIDES[currentSlide]
  const Icon = slide.icon

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col overflow-hidden selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      {/* Background Pixel Canvas */}
      <FullscreenPixelHero />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <BrandLogo size="md" variant="dark" />
        <div className="flex items-center gap-3">
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
            className="font-bold text-xs"
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

          {/* Stepper Dots & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-4 border-t border-[#3A2F1D]/60">
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

            {/* CTAs */}
            <div className="flex items-center gap-3">
              {currentSlide < SLIDES.length - 1 ? (
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => setCurrentSlide((prev) => prev + 1)}
                  icon={<ChevronRight size={16} />}
                  className="text-xs"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => navigate('/auth')}
                  icon={<ArrowRight size={16} className="text-[#000000]" />}
                  className="font-bold text-xs shadow-lg"
                >
                  Enter Platform
                </Button>
              )}
              <Button
                size="md"
                variant="primary"
                onClick={() => navigate('/auth')}
                className="font-bold text-xs"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 border-t border-[#3A2F1D]/40 flex flex-col sm:flex-row items-center justify-between text-2xs text-[#E5DFC9]/50 gap-2">
        <span>CodeSight 2.0 · Algorithmic Complexity & AI Code Review Platform</span>
        <span className="font-mono">Time & Space Complexity Grading Engine</span>
      </footer>
    </div>
  )
}
