import type { ReactNode } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/cn'
import type { ProjectCategory } from '@/data/projects'
import { projectCategories } from '@/data/projects'

export type CategoryFilter = ProjectCategory | 'all'

export interface CategoryFilterProps {
  value: CategoryFilter
  counts: Record<CategoryFilter, number>
  onChange: (value: CategoryFilter) => void
  className?: string
}

/** All / Apps / Websites switcher. Counts are derived from the data, not invented. */
export function CategoryFilterBar({ value, counts, onChange, className }: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter projects by category"
      className={cn(
        'inline-flex flex-wrap items-center gap-1 rounded-full border border-line bg-ink-900/50 p-1',
        className,
      )}
    >
      {projectCategories.map((category) => {
        const isActive = value === category.id
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            aria-pressed={isActive}
            className={cn(
              'relative inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm transition-colors duration-300',
              isActive ? 'text-ink-950' : 'text-bone-400 hover:text-bone-100',
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="category-filter-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-bone-50"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              />
            ) : null}
            <span className="relative">{category.label}</span>
            <span
              aria-hidden="true"
              className={cn(
                'relative text-[0.6875rem] tabular-nums transition-colors duration-300',
                isActive ? 'text-ink-950/55' : 'text-bone-600',
              )}
            >
              {counts[category.id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Animated wrapper used for the project grid while filtering. */
export function ProjectGridMotion({
  children,
  layoutKey,
}: {
  children: ReactNode
  layoutKey: string
}) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div key={layoutKey}>{children}</div>
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={layoutKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
