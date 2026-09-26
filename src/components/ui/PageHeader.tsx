import type { ReactNode } from 'react'

import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cn } from '@/lib/cn'

export interface PageHeaderProps {
  eyebrow: string
  title: ReactNode
  description: ReactNode
  /** Optional controls rendered under the description (filters, meta, …). */
  children?: ReactNode
  className?: string
}

/** Consistent masthead for every inner page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('pt-32 pb-14 sm:pt-40 sm:pb-16 lg:pt-44', className)}>
      <Container>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-7 max-w-4xl text-[2.5rem] leading-[1.04] tracking-[-0.035em] sm:text-[3.25rem] lg:text-[4rem]">
          {title}
        </h1>
        <div className="mt-7 max-w-2xl">
          <p className="text-base leading-relaxed text-bone-400 sm:text-lg">{description}</p>
        </div>
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </div>
  )
}
