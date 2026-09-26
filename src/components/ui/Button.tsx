import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

import { Link } from 'react-router-dom'

import { cn } from '@/lib/cn'

/* -------------------------------------------------------------------------- */
/* Shared appearance                                                          */
/* -------------------------------------------------------------------------- */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch to the full width of the parent. */
  block?: boolean
  className?: string
  children: ReactNode
  /** Decorative element rendered after the label and animated on hover. */
  trailing?: ReactNode
}

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-medium ' +
  'whitespace-nowrap transition-[background-color,border-color,color,transform] duration-300 ' +
  'ease-[cubic-bezier(0.16,1,0.3,1)] select-none active:translate-y-px ' +
  'disabled:pointer-events-none disabled:opacity-55'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-bone-50 text-ink-950 hover:bg-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_14px_34px_-18px_rgba(247,248,250,0.5)]',
  secondary:
    'border border-line-strong bg-white/[0.03] text-bone-100 hover:border-bone-500/45 hover:bg-white/[0.07]',
  ghost: 'text-bone-300 hover:bg-white/[0.05] hover:text-bone-50',
  accent:
    'bg-electric-500 text-white hover:bg-electric-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_16px_38px_-20px_rgba(74,115,255,0.95)]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[0.8125rem]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-[3.25rem] px-7 text-[0.9375rem]',
}

function buttonClasses({ variant = 'primary', size = 'md', block, className }: ButtonStyleProps) {
  return cn(base, variants[variant], sizes[size], block && 'w-full', className)
}

function ButtonContent({ children, trailing }: Pick<ButtonStyleProps, 'children' | 'trailing'>) {
  return (
    <>
      <span>{children}</span>
      {trailing ? (
        <span
          aria-hidden="true"
          className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0.5"
        >
          {trailing}
        </span>
      ) : null}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Variants                                                                   */
/* -------------------------------------------------------------------------- */

export interface ButtonLinkProps
  extends ButtonStyleProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonStyleProps> {
  to: string
  /** Renders the link as an external destination (new tab, no-opener). */
  external?: boolean
}

export function ButtonLink({ to, external, variant, size, block, className, children, trailing, ...rest }: ButtonLinkProps) {
  const classes = buttonClasses({ variant, size, block, className, children, trailing })
  const content = <ButtonContent>{children}</ButtonContent>

  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer noopener" className={classes} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <Link to={to} className={classes} {...rest}>
      {content}
    </Link>
  )
}

export type ButtonAnchorProps = ButtonLinkProps

export interface ButtonProps
  extends ButtonStyleProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonStyleProps | 'children'> {
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  type = 'button',
  variant,
  size,
  block,
  className,
  children,
  trailing,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, block, className, children, trailing })}
      {...rest}
    >
      <ButtonContent>{children}</ButtonContent>
    </button>
  )
}
