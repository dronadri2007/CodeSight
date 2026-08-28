import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  accent?: boolean
  dark?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  as?: 'div' | 'section' | 'article'
}

const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }

export function Card({ hover, accent, dark, padding = 'md', as: Tag = 'div', className, children, ...props }: CardProps) {
  return (
    <Tag
      className={clsx(
        'rounded-2xl transition-all duration-200',
        dark
          ? 'bg-navy-surface border border-navy-border text-white'
          : 'bg-light-card border border-light-border text-light-text shadow-card',
        hover && (dark
          ? 'hover:border-aqua/40 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
          : 'hover:border-light-borderStrong hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer'),
        accent && (dark
          ? 'border-aqua/40 bg-aqua/5 shadow-aqua-glow'
          : 'border-aqua bg-aqua-soft/30 shadow-card'),
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: number
  dark?: boolean
  className?: string
}

export function MetricCard({ label, value, subtext, trend, dark, className }: MetricCardProps) {
  return (
    <Card dark={dark} padding="sm" className={clsx('flex flex-col gap-1.5', className)}>
      <span className={clsx('text-xs uppercase tracking-wider font-semibold', dark ? 'text-slate' : 'text-light-textMuted')}>
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={clsx('text-3xl font-extrabold tracking-tight font-mono', dark ? 'text-white' : 'text-navy')}>
          {value}
        </span>
        {trend !== undefined && (
          <span className={clsx('text-xs font-bold font-mono', trend >= 0 ? 'text-success' : 'text-danger')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {subtext && <span className={clsx('text-2xs', dark ? 'text-slate' : 'text-light-textMuted')}>{subtext}</span>}
    </Card>
  )
}
