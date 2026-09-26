import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

/** Calm, deliberate empty state — used when a filtered list returns nothing. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line-strong bg-ink-900/30 px-6 py-20 text-center',
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="text-bone-600">
          {icon}
        </span>
      ) : null}
      <div className="max-w-sm space-y-2">
        <p className="text-base font-medium text-bone-100">{title}</p>
        <p className="text-sm leading-relaxed text-bone-500">{description}</p>
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  )
}
