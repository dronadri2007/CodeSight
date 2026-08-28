import { clsx } from 'clsx'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark' | 'auto'
  showText?: boolean
  showTagline?: boolean
  className?: string
}

export function BrandLogo({
  size = 'md',
  variant = 'auto',
  showText = true,
  showTagline = true,
  className,
}: BrandLogoProps) {
  const sizeMap = {
    sm: { circle: 'w-8 h-8 p-1', img: 'h-6 w-auto', text: 'text-sm', tagline: 'text-[9px]' },
    md: { circle: 'w-11 h-11 p-1.5', img: 'h-8 w-auto', text: 'text-lg', tagline: 'text-[10px]' },
    lg: { circle: 'w-14 h-14 p-2', img: 'h-10 w-auto', text: 'text-2xl', tagline: 'text-xs' },
    xl: { circle: 'w-20 h-20 p-2.5', img: 'h-14 w-auto', text: 'text-3xl', tagline: 'text-sm' },
  }

  const currentSize = sizeMap[size]

  return (
    <div className={clsx('inline-flex items-center gap-3 select-none group', className)}>
      {/* Prominent Circular Emblem Badge */}
      <div
        className={clsx(
          'rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-md',
          'bg-[#151C24] border-2 border-[#35C6B0]/60 shadow-[0_0_20px_rgba(53,198,176,0.25)]',
          currentSize.circle
        )}
      >
        <img
          src="/logo.png"
          alt="CodeSight Logo Emblem"
          className={clsx('object-contain max-h-full max-w-full rounded-full', currentSize.img)}
        />
      </div>

      {/* Brand Typography & Tagline */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1">
            <span
              className={clsx(
                'font-extrabold tracking-tight font-sans text-[#F4F1E8]',
                currentSize.text
              )}
            >
              Code<span className="text-[#35C6B0]">Sight</span>
            </span>
          </div>

          {showTagline && (
            <span
              className={clsx(
                'font-mono uppercase font-bold tracking-widest mt-1 text-[#AEB7B2]',
                currentSize.tagline
              )}
            >
              REVIEW. LEARN. IMPROVE.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
