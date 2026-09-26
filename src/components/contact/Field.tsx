import type { ReactNode, SelectHTMLAttributes } from 'react'
import { useId } from 'react'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/cn'

/* -------------------------------------------------------------------------- */
/* Shared control styling                                                      */
/* -------------------------------------------------------------------------- */

const controlBase =
  'w-full appearance-none rounded-xl border bg-ink-800/45 px-4 text-[0.9375rem] leading-relaxed ' +
  'text-bone-100 placeholder:text-bone-600 transition-colors duration-300 ' +
  'hover:border-bone-500/40 focus:border-electric-500 ' +
  'aria-[invalid=true]:border-critical/70 aria-[invalid=true]:hover:border-critical'

interface FieldShellProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: (aria: {
    id: string
    describedBy: string | undefined
    invalid: boolean
  }) => ReactNode
}

function FieldShell({ id, label, error, hint, required, className, children }: FieldShellProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-sm font-medium text-bone-200">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-1 text-electric-400">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-bone-600">optional</span>
        )}
      </label>

      {children({ id, describedBy: describedBy || undefined, invalid: Boolean(error) })}

      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed text-bone-600">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs leading-relaxed text-critical">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Text input                                                                  */
/* -------------------------------------------------------------------------- */

export interface TextFieldProps {
  label: string
  name: string
  /** Stable id, so an error summary elsewhere can link straight to the input. */
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  required?: boolean
  type?: 'text' | 'email' | 'tel'
  placeholder?: string
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'tel'
  className?: string
}

export function TextField({
  label,
  name,
  id,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  className,
}: TextFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className={cn(controlBase, 'h-12')}
        />
      )}
    </FieldShell>
  )
}

/* -------------------------------------------------------------------------- */
/* Textarea                                                                    */
/* -------------------------------------------------------------------------- */

export interface TextAreaFieldProps {
  label: string
  name: string
  /** Stable id, so an error summary elsewhere can link straight to the input. */
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  required?: boolean
  placeholder?: string
  rows?: number
  /** When set, shows a live countdown to this minimum length. */
  minLength?: number
  className?: string
}

export function TextAreaField({
  label,
  name,
  id,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  placeholder,
  rows = 6,
  minLength,
  className,
}: TextAreaFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const remaining = minLength ? Math.max(0, minLength - value.trim().length) : null

  return (
    <FieldShell
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <textarea
            id={id}
            name={name}
            rows={rows}
            value={value}
            placeholder={placeholder}
            required={required}
            minLength={minLength}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            className={cn(controlBase, 'resize-y py-3.5', remaining !== null && 'pb-8')}
          />
          {remaining !== null ? (
            <p
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute bottom-3 right-4 text-[0.6875rem] tabular-nums',
                remaining > 0 ? 'text-bone-600' : 'text-electric-400/80',
              )}
            >
              {remaining > 0 ? `${remaining} more characters` : 'Looks good'}
            </p>
          ) : null}
        </div>
      )}
    </FieldShell>
  )
}

/* -------------------------------------------------------------------------- */
/* Select                                                                      */
/* -------------------------------------------------------------------------- */

export interface SelectOption {
  readonly value: string
  readonly label: string
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'id'> {
  label: string
  name: string
  /** Stable id, so an error summary elsewhere can link straight to the control. */
  id?: string
  value: string
  options: readonly SelectOption[]
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  required?: boolean
  className?: string
}

export function SelectField({
  label,
  name,
  id,
  value,
  options,
  onChange,
  onBlur,
  error,
  hint,
  required,
  className,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            {...rest}
            id={id}
            name={name}
            value={value}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            className={cn(controlBase, 'h-12 cursor-pointer pr-11')}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-ink-800 text-bone-100">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-bone-500"
          />
        </div>
      )}
    </FieldShell>
  )
}

/* -------------------------------------------------------------------------- */
/* Honeypot                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Spam trap. Visually hidden but still reachable by naive bots, and removed
 * from the tab order and the accessibility tree.
 */
export function HoneypotField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor="company-website">Company website</label>
      <input
        id="company-website"
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
