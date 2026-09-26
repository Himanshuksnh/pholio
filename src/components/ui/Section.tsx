import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Container } from './Container'

const spacing = {
  none: '',
  sm: 'py-16 sm:py-20',
  md: 'py-20 sm:py-24 lg:py-28',
  lg: 'py-24 sm:py-32 lg:py-40',
} as const

const tone = {
  base: '',
  raised: 'bg-ink-900/40',
  sunken: 'bg-ink-950',
} as const

export interface SectionProps {
  as?: 'section' | 'div' | 'article'
  id?: string
  /** Vertical rhythm. Keep `md` as the default for top-level page sections. */
  spacing?: keyof typeof spacing
  tone?: keyof typeof tone
  width?: 'narrow' | 'default' | 'wide'
  /** Accessible label when the section has no visible heading. */
  ariaLabel?: string
  className?: string
  containerClassName?: string
  children: ReactNode
}

export function Section({
  as: Tag = 'section',
  id,
  spacing: space = 'md',
  tone: surface = 'base',
  width = 'default',
  ariaLabel,
  className,
  containerClassName,
  children,
}: SectionProps) {
  return (
    <Tag
      id={id}
      aria-label={ariaLabel}
      className={cn('relative', spacing[space], tone[surface], className)}
    >
      <Container width={width} className={containerClassName}>
        {children}
      </Container>
    </Tag>
  )
}
