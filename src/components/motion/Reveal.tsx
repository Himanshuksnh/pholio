import type { ReactNode } from 'react'

import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'

import { cn } from '@/lib/cn'

export interface RevealProps {
  children: ReactNode
  /** Stagger offset in seconds. */
  delay?: number
  /** Vertical travel in pixels before settling. */
  y?: number
  className?: string
  as?: 'div' | 'li' | 'article' | 'section'
}

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Scroll-triggered fade-and-rise.
 *
 * When the visitor prefers reduced motion the children render immediately with
 * no transform and no transition at all.
 */
export function Reveal({ children, delay = 0, y = 18, className, as = 'div' }: RevealProps) {
  const prefersReducedMotion = useReducedMotion()
  const Tag = motion[as]

  if (prefersReducedMotion) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-72px 0px -72px 0px' }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </Tag>
  )
}

/**
 * Container that staggers its `RevealItem` children into view.
 *
 * `as` must match the semantics of the children: use `ul`/`ol` when the items
 * are `li`, so the markup stays valid.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  stagger?: number
  as?: 'div' | 'ul' | 'ol'
}) {
  const prefersReducedMotion = useReducedMotion()
  const Tag = motion[as]
  const Plain = as

  const body = prefersReducedMotion ? (
    <Plain className={className}>{children}</Plain>
  ) : (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-72px 0px -72px 0px' }}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Tag>
  )

  return body
}

export function RevealItem({
  children,
  className,
  y = 18,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  y?: number
  as?: 'div' | 'li' | 'article'
}) {
  const prefersReducedMotion = useReducedMotion()
  const Tag = motion[as]

  if (prefersReducedMotion) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }

  return (
    <Tag
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </Tag>
  )
}
