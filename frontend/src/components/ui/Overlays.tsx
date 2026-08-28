import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { clsx } from 'clsx'

export function Toast() {
  const { activeToast, dismissToast } = useUIStore()

  const icons = { success: CheckCircle, error: AlertCircle, info: Info }
  const styles = {
    success: 'border-success/30 bg-success-subtle text-success',
    error: 'border-danger/30 bg-danger-subtle text-danger',
    info: 'border-accent/30 bg-accent-subtle text-accent',
  }

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          key={activeToast.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl max-w-sm bg-bg-elevated backdrop-blur-sm"
          style={{ borderColor: activeToast.type === 'success' ? 'rgba(54,211,153,0.3)' : activeToast.type === 'error' ? 'rgba(255,92,108,0.3)' : 'rgba(91,124,255,0.3)' }}
        >
          {(() => {
            const Icon = icons[activeToast.type]
            return <Icon size={16} className={styles[activeToast.type].split(' ').find(c => c.startsWith('text-'))!} />
          })()}
          <span className="text-sm text-text-primary flex-1">{activeToast.message}</span>
          <button onClick={dismissToast} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center py-16 px-6 gap-3', className)}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-text-muted mb-2">
          {icon}
        </div>
      )}
      <p className="text-text-primary font-medium">{title}</p>
      {description && <p className="text-text-muted text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={clsx('relative w-full bg-bg-elevated border border-border rounded-2xl shadow-xl', widths[maxWidth])}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                  <X size={16} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={clsx('flex items-center gap-1 p-1 bg-bg-secondary rounded-lg border border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-150',
            active === tab.id
              ? 'bg-bg-elevated text-text-primary shadow-sm border border-border'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx(
              'text-2xs px-1.5 py-0.5 rounded-full font-mono',
              active === tab.id ? 'bg-accent-subtle text-accent' : 'bg-bg-surface text-text-muted'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
