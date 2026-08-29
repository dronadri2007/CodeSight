import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  accent?: boolean
  dark?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  as?: 'div' | 'section' | 'article'
}

const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }

export function Card({ hover, accent, dark = true, padding = 'md', as: Tag = 'div', className, children, ...props }: CardProps) {
  return (
    <Tag
      className={clsx(
        'rounded-2xl transition-all duration-200',
        'bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9] shadow-[0_2px_8px_rgba(0,0,0,0.5)]',
        hover && 'hover:border-[#E5DFC9]/35 hover:bg-[#3A2F1D]/40 hover:shadow-[0_12px_32px_rgba(0,0,0,0.7)] hover:-translate-y-0.5 cursor-pointer',
        accent && 'border-[#E5DFC9]/35 bg-[#3A2F1D]/50 shadow-[0_0_20px_rgba(229,223,201,0.08)]',
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

export function MetricCard({ label, value, subtext, trend, dark = true, className }: MetricCardProps) {
  return (
    <Card dark={dark} padding="sm" className={clsx('flex flex-col gap-1.5', className)}>
      <span className="text-xs uppercase tracking-wider font-semibold text-[#E5DFC9]/60">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight font-mono text-[#E5DFC9]">
          {value}
        </span>
        {trend !== undefined && (
          <span className="text-xs font-bold font-mono text-[#E5DFC9]/85">
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {subtext && <span className="text-2xs text-[#E5DFC9]/50">{subtext}</span>}
    </Card>
  )
}
