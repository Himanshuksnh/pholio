import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Eyebrow } from './Eyebrow'

export interface SectionHeadingProps {
  eyebrow?: ReactNode
  /** Visible heading. Rendered as an `h2` by default. */
  title: ReactNode
  description?: ReactNode
  /** Right-aligned control, typically a "view all" link. */
  action?: ReactNode
  align?: 'left' | 'center'
  /** Heading level, for correct document outline when nested. */
  as?: 'h1' | 'h2' | 'h3'
  id?: string
  className?: string
  titleClassName?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  as: Heading = 'h2',
  id,
  className,
  titleClassName,
}: SectionHeadingProps) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        action && !centered && 'sm:flex-row sm:items-end sm:justify-between sm:gap-10',
        className,
      )}
    >
      <div className={cn('max-w-2xl', centered && 'mx-auto text-center')}>
        {eyebrow ? <Eyebrow className="justify-center sm:justify-start">{eyebrow}</Eyebrow> : null}
        <Heading
          id={id}
          className={cn(
            'text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]',
            eyebrow && 'mt-6',
            titleClassName,
          )}
        >
          {title}
        </Heading>
        {description ? (
          <p className={cn('mt-5 text-base leading-relaxed text-bone-400 sm:text-[1.0625rem]')}>
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
