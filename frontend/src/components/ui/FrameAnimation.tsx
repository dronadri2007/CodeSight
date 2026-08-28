import { useState, useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { Play, Pause, RotateCcw, Sparkles, Maximize2 } from 'lucide-react'

interface FrameAnimationProps {
  frameCount?: number
  fps?: number
  autoPlay?: boolean
  className?: string
  aspectRatio?: string
  showControls?: boolean
}

export function FrameAnimation({
  frameCount = 300,
  fps = 20,
  autoPlay = true,
  className,
  aspectRatio = 'aspect-video',
  showControls = true,
}: FrameAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentFrame, setCurrentFrame] = useState(1)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [loadedCount, setLoadedCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const frameIndexRef = useRef(1)

  const getFramePath = (index: number) => {
    const padded = index.toString().padStart(3, '0')
    return `/animation/ezgif-frame-${padded}.png`
  }

  // Preload initial and progressive frames
  useEffect(() => {
    let mounted = true
    const images: HTMLImageElement[] = []
    let loaded = 0

    // Load initial 30 frames first for instant playback, then load rest
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      img.src = getFramePath(i)
      img.onload = () => {
        if (!mounted) return
        loaded++
        setLoadedCount(loaded)
        if (loaded >= Math.min(30, frameCount)) {
          setIsLoaded(true)
        }
      }
      images.push(img)
    }

    imagesRef.current = images

    return () => {
      mounted = false
    }
  }, [frameCount])

  // Animation Loop on Canvas
  useEffect(() => {
    let animationFrameId: number
    let lastTime = performance.now()
    const frameInterval = 1000 / fps

    const render = (time: number) => {
      if (isPlaying && imagesRef.current.length > 0) {
        const delta = time - lastTime
        if (delta >= frameInterval) {
          lastTime = time - (delta % frameInterval)

          const nextIndex = frameIndexRef.current >= frameCount ? 1 : frameIndexRef.current + 1
          frameIndexRef.current = nextIndex
          setCurrentFrame(nextIndex)

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

    animationFrameId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isPlaying, fps, frameCount])

  // Initial draw of frame 1
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const initialImg = new Image()
      initialImg.src = getFramePath(1)
      initialImg.onload = () => {
        if (canvas && ctx) {
          canvas.width = initialImg.naturalWidth
          canvas.height = initialImg.naturalHeight
          ctx.drawImage(initialImg, 0, 0)
        }
      }
    }
  }, [])

  return (
    <div className={clsx('relative rounded-2xl overflow-hidden border border-navy-border bg-navy-midnight shadow-2xl group select-none', aspectRatio, className)}>
      {/* Canvas Player */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover object-center"
      />

      {/* Subtle Overlay Glow & Controls */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-navy-midnight/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-midnight/80 backdrop-blur-md border border-navy-border text-2xs font-mono text-aqua">
              <Sparkles size={11} />
              <span>Midnight Review Atmosphere</span>
            </div>

            <div className="text-2xs font-mono text-slate bg-navy-midnight/80 px-2 py-0.5 rounded border border-navy-border">
              {currentFrame}/{frameCount}
            </div>
          </div>

          <div className="flex items-center justify-between pointer-events-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-xl bg-navy-midnight/90 backdrop-blur-md border border-navy-border text-xs text-white hover:border-aqua/50 flex items-center gap-1.5 transition-colors"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            {loadedCount < frameCount && (
              <div className="text-2xs text-slate font-mono">
                Buffering: {Math.round((loadedCount / frameCount) * 100)}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
