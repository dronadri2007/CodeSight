import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown, Sparkles, Code2, Play, Pause, Menu, X } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { BrandLogo } from '../ui/BrandLogo'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export function FullscreenPixelHero() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Animation state
  const [isPlaying, setIsPlaying] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const frameIndexRef = useRef(1)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const totalFrames = 300

  // Scroll animations for smooth transition to marketing content
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.15])
  const heroScale = useTransform(scrollYProgress, [0, 0.75], [1, 1.05])
  const textTranslateY = useTransform(scrollYProgress, [0, 0.75], [0, -60])

  const navLinks = [
    { label: 'Platform', href: '#platform' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'For Students', href: '#students' },
    { label: 'For Professionals', href: '#professionals' },
    { label: 'Defect Classes', href: '#defects' },
  ]

  // Preload frames progressively
  useEffect(() => {
    let mounted = true
    const images: HTMLImageElement[] = []

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image()
      const padded = i.toString().padStart(3, '0')
      img.src = `/animation/ezgif-frame-${padded}.png`
      images.push(img)
    }

    imagesRef.current = images

    return () => {
      mounted = false
    }
  }, [totalFrames])

  // Canvas render loop
  useEffect(() => {
    let animationFrameId: number
    let lastTime = performance.now()
    const fps = 20
    const frameInterval = 1000 / fps

    const render = (time: number) => {
      if (isPlaying && imagesRef.current.length > 0) {
        const delta = time - lastTime
        if (delta >= frameInterval) {
          lastTime = time - (delta % frameInterval)

          const nextIndex = frameIndexRef.current >= totalFrames ? 1 : frameIndexRef.current + 1
          frameIndexRef.current = nextIndex

          const canvas = canvasRef.current
          if (canvas) {
            const ctx = canvas.getContext('2d')
            const img = imagesRef.current[nextIndex - 1]
            if (ctx && img && img.complete && img.naturalWidth > 0) {
              if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight
              }
              ctx.drawImage(img, 0, 0)
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(render)
    }

    // Initial immediate draw of frame 1
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const firstImg = new Image()
      firstImg.src = '/animation/ezgif-frame-001.png'
      firstImg.onload = () => {
        if (canvas && ctx) {
          canvas.width = firstImg.naturalWidth
          canvas.height = firstImg.naturalHeight
          ctx.drawImage(firstImg, 0, 0)
        }
      }
    }

    animationFrameId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isPlaying, totalFrames])

  // Subtle pointer parallax (restrained 2-4px)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e
    const { width, height } = currentTarget.getBoundingClientRect()
    const x = (clientX / width - 0.5) * 8
    const y = (clientY / height - 0.5) * 8
    setMouseOffset({ x, y })
  }

  const scrollToContent = () => {
    const content = document.getElementById('platform')
    if (content) {
      content.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen h-screen overflow-hidden bg-[#0D1117] select-none flex flex-col justify-between"
    >
      {/* Background Canvas Layer with Parallax */}
      <motion.div
        style={{
          opacity: heroOpacity,
          scale: heroScale,
          x: mouseOffset.x * 0.5,
          y: mouseOffset.y * 0.5,
        }}
        className="absolute inset-0 w-full h-full z-0 flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-700 ease-out"
        />
      </motion.div>

      {/* Cinematic Gradient Overlays for High Contrast & Readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0D1117]/90 via-[#0D1117]/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0D1117] via-transparent to-[#0D1117]/60 pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_25%_45%,rgba(13,17,23,0.7)_0%,transparent_70%)] pointer-events-none" />

      {/* Top Navigation Bar fixed at the very top */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#0D1117]/85 backdrop-blur-lg border-b border-[#29333A] transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <BrandLogo size="md" variant="dark" />
          </motion.div>

          {/* Center Desktop Navigation Links */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex items-center gap-7 px-6 py-2 rounded-full bg-[#151C24]/80 backdrop-blur-md border border-[#29333A] shadow-lg"
          >
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs font-medium text-[#AEB7B2] hover:text-[#35C6B0] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </motion.nav>

          {/* Right CTA Controls */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden sm:flex items-center gap-3"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-[#AEB7B2] hover:text-[#F4F1E8] text-xs backdrop-blur-md bg-[#151C24]/60 border border-[#29333A]"
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/auth?mode=signup')}
              iconRight={<ArrowRight size={13} />}
              className="text-xs shadow-[0_0_20px_rgba(53,198,176,0.25)] font-bold"
            >
              Create Account
            </Button>
          </motion.div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#F4F1E8] bg-[#151C24] border border-[#29333A] rounded-xl"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-20 left-6 right-6 z-50 p-5 rounded-2xl bg-[#151C24]/95 backdrop-blur-xl border border-[#29333A] shadow-2xl space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#AEB7B2] hover:text-[#35C6B0] py-1"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-[#29333A] flex flex-col gap-2">
            <Button fullWidth variant="dark" size="sm" onClick={() => { navigate('/auth'); setMobileMenuOpen(false) }}>
              Sign In
            </Button>
            <Button fullWidth variant="primary" size="sm" onClick={() => { navigate('/auth?mode=signup'); setMobileMenuOpen(false) }}>
              Create Account
            </Button>
          </div>
        </div>
      )}

      {/* Center-Left Brand Content Overlay */}
      <motion.div
        style={{ y: textTranslateY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 flex-1 flex flex-col justify-center pb-12 pt-24"
      >
        <div className="max-w-2xl space-y-6">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center gap-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151C24]/90 backdrop-blur-md border border-[#35C6B0]/40 text-[#35C6B0] text-xs font-mono font-semibold tracking-wider uppercase shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35C6B0] animate-pulse" />
              CODE REVIEW + LEARNING PLATFORM
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.0 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-[#F4F1E8] leading-[1.05]"
          >
            Train your eye <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#35C6B0] to-[#58D8C5]">
              for code.
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.4 }}
            className="text-base sm:text-lg text-[#DDD9CF] max-w-xl leading-relaxed font-normal"
          >
            Build stronger coding instincts and learn to review AI-assisted code with confidence.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.8 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/auth?mode=signup')}
              iconRight={<ArrowRight size={16} />}
              className="text-sm font-bold shadow-[0_0_24px_rgba(53,198,176,0.3)] hover:scale-[1.02] active:translate-y-[1px] transition-all"
            >
              Create Account
            </Button>

            <Button
              size="lg"
              variant="dark"
              onClick={() => navigate('/auth')}
              className="text-sm font-semibold border-[#29333A] bg-[#151C24]/90 backdrop-blur-md text-[#F4F1E8] hover:bg-[#1A232D] hover:border-[#35C6B0]/50 active:translate-y-[1px] transition-all"
            >
              Login
            </Button>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 2.2 }}
            className="text-2xs text-[#AEB7B2] font-mono tracking-wide"
          >
            For students and AI-assisted engineering practitioners.
          </motion.p>
        </div>
      </motion.div>

      {/* Bottom Exploration Scroll Indicator */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 pb-8 flex items-center justify-between">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.4 }}
          onClick={scrollToContent}
          className="group flex items-center gap-2 text-xs font-mono text-[#AEB7B2] hover:text-[#35C6B0] transition-colors cursor-pointer"
        >
          <span>Explore CodeSight</span>
          <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform animate-bounce text-[#35C6B0]" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.6 }}
          className="flex items-center gap-3 text-2xs text-[#AEB7B2] font-mono"
        >
          <span className="w-2 h-2 rounded-full bg-[#35B889]" />
          <span>Midnight Coding Atmosphere</span>
        </motion.div>
      </footer>
    </div>
  )
}
