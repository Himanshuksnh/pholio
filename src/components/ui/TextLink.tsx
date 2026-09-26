import type { ReactNode } from 'react'

import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/cn'

interface TextLinkProps {
  to: string
  children: ReactNode
  external?: boolean
  className?: string
  /** Show the trailing arrow icon. */
  arrow?: boolean
  'aria-label'?: string
}

const styles =
  'group/tl inline-flex items-center gap-1.5 text-sm font-medium text-bone-200 transition-colors duration-300 hover:text-bone-50'

/** Understated inline link used for "view all" style navigation. */
export function TextLink({
  to,
  children,
  external = false,
  className,
  arrow = true,
  ...rest
}: TextLinkProps) {
  const content = (
    <>
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-electric-400 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tl:origin-left group-hover/tl:scale-x-100"
        />
      </span>
      {arrow ? (
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 text-bone-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tl:-translate-y-0.5 group-hover/tl:translate-x-0.5 group-hover/tl:text-electric-300"
        />
      ) : null}
    </>
  )

  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(styles, className)}
        {...rest}
      >
        {content}
      </a>
    )
  }

  return (
    <Link to={to} className={cn(styles, className)} {...rest}>
      {content}
    </Link>
  )
}
