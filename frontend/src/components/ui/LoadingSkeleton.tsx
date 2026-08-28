import { clsx } from 'clsx'

interface LoadingSkeletonProps {
  className?: string
  lines?: number
  variant?: 'text' | 'block' | 'circle'
}

export function LoadingSkeleton({ className, lines = 1, variant = 'block' }: LoadingSkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx('h-4 rounded shimmer-bg bg-bg-elevated', i === lines - 1 && 'w-3/4', className)}
          />
        ))}
      </div>
    )
  }
  return (
    <div
      className={clsx(
        'shimmer-bg bg-bg-elevated',
        variant === 'circle' ? 'rounded-full' : 'rounded-lg',
        className
      )}
    />
  )
}

export function ExerciseCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3">
      <div className="flex justify-between">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton className="h-5 w-16" />
      </div>
      <LoadingSkeleton className="h-5 w-48" />
      <div className="flex gap-2">
        <LoadingSkeleton className="h-5 w-14" />
        <LoadingSkeleton className="h-5 w-20" />
      </div>
    </div>
  )
}

export function GradingLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border border-accent/30 animate-pulse-subtle" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-text-primary font-medium">Analyzing your review…</p>
        <p className="text-text-muted text-sm">This takes a moment.</p>
      </div>
    </div>
  )
}
