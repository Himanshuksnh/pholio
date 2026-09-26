import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface EyebrowProps {
  /** Optional section index, e.g. "01". Rendered in front of the label. */
  index?: string
  children: ReactNode
  /** Show the leading accent dot. */
  dot?: boolean
  className?: string
}

/** Small uppercase label used to open a section. */
export function Eyebrow({ index, children, dot = true, className }: EyebrowProps) {
  return (
    <p className={cn('label-xs flex items-center gap-2.5 text-bone-500', className)}>
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-electric-500 shadow-[0_0_0_3px_rgba(74,115,255,0.14)]"
        />
      ) : null}
      {index ? <span className="text-bone-600">{index}</span> : null}
      <span>{children}</span>
    </p>
  )
}
