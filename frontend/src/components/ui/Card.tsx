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
        'bg-[#151C24] border border-[#29333A] text-[#F4F1E8] shadow-[0_2px_8px_rgba(0,0,0,0.35)]',
        hover && 'hover:border-[#35C6B0]/50 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 cursor-pointer',
        accent && 'border-[#35C6B0]/50 bg-[rgba(53,198,176,0.06)] shadow-[0_0_24px_rgba(53,198,176,0.2)]',
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
      <span className="text-xs uppercase tracking-wider font-semibold text-[#AEB7B2]">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight font-mono text-[#F4F1E8]">
          {value}
        </span>
        {trend !== undefined && (
          <span className={clsx('text-xs font-bold font-mono', trend >= 0 ? 'text-[#35B889]' : 'text-[#E0646D]')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {subtext && <span className="text-2xs text-[#AEB7B2]">{subtext}</span>}
    </Card>
  )
}
