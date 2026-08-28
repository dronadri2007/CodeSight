import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  accent?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  as?: 'div' | 'section' | 'article'
}

const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }

export function Card({ hover, accent, padding = 'md', as: Tag = 'div', className, children, ...props }: CardProps) {
  return (
    <Tag
      className={clsx(
        'rounded-xl border border-border bg-bg-surface transition-all duration-200',
        hover && 'hover:border-border-strong hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        accent && 'border-accent/30 bg-accent-subtle',
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
  accent?: boolean
  className?: string
}

export function MetricCard({ label, value, subtext, trend, accent, className }: MetricCardProps) {
  return (
    <Card className={clsx('flex flex-col gap-1', className)}>
      <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
      <div className="flex items-end gap-2">
        <span className={clsx('text-3xl font-bold tracking-tight', accent ? 'text-gradient-accent' : 'text-text-primary')}>
          {value}
        </span>
        {trend !== undefined && (
          <span className={clsx('text-sm font-medium mb-1', trend >= 0 ? 'text-success' : 'text-danger')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {subtext && <span className="text-xs text-text-muted">{subtext}</span>}
    </Card>
  )
}
