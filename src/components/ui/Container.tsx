import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

const widths = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
} as const

export interface ContainerProps {
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'main'
  width?: keyof typeof widths
  className?: string
  children: ReactNode
}

/** Consistent horizontal rhythm and measure for every section on the site. */
export function Container({
  as: Tag = 'div',
  width = 'default',
  className,
  children,
}: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-5 sm:px-8 lg:px-12', widths[width], className)}>
      {children}
    </Tag>
  )
}
