import { useId } from 'react'

import { site } from '@/config/site'
import { cn } from '@/lib/cn'

type LogoSize = 'sm' | 'lg'

interface LogoProps {
  /**
   * Render only the mark. Useful where the brand name is already set in type
   * (for example directly under the wordmark).
   */
  markOnly?: boolean
  size?: LogoSize
  className?: string
}

/** Mark and wordmark are sized as a pair so they never drift out of alignment. */
const SIZES: Record<LogoSize, { box: string; text: string }> = {
  sm: { box: 'size-8', text: 'text-[1.0625rem]' },
  lg: { box: 'size-10', text: 'text-lg' },
}

/**
 * Pholio brand mark: a geometric "P" monogram set in a gradient squircle.
 *
 * Drawn as strokes rather than a filled glyph outline so it stays crisp at any
 * size, and it uses theme tokens instead of hard-coded hex values so it follows
 * the palette. The wordmark stays real text, so it inherits the site font and
 * remains selectable and translatable.
 */
export function Logo({ markOnly = false, size = 'sm', className }: LogoProps) {
  // The mark is rendered more than once per page (header and footer), so the
  // gradient id must be unique or the first definition wins for every instance.
  const gradientId = useId()
  const { box, text } = SIZES[size]

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg aria-hidden="true" viewBox="0 0 32 32" className={cn('shrink-0', box)}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-electric-400)" />
            <stop offset="55%" stopColor="var(--color-electric-500)" />
            <stop offset="100%" stopColor="var(--color-electric-700)" />
          </linearGradient>
        </defs>

        <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${gradientId})`} />

        {/* Monogram, nudged to sit optically centred in the squircle. The bowl
            radius is kept large relative to the stroke so the counter stays
            open and the mark still reads as a "P" at 24px. */}
        <g transform="translate(0.5 0.4)">
          <path
            d="M12 24.2V7.8"
            fill="none"
            stroke="var(--color-bone-50)"
            strokeWidth="2.9"
            strokeLinecap="round"
          />
          <path
            d="M12 7A7 7 0 0 1 12 21"
            fill="none"
            stroke="var(--color-bone-50)"
            strokeWidth="2.9"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {!markOnly ? (
        <span className={cn('font-semibold tracking-[-0.03em] text-bone-50', text)}>
          {site.name}
        </span>
      ) : null}
    </span>
  )
}
