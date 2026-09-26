import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/cn'

export interface SelectMenuOption {
  readonly value: string
  readonly label: string
}

interface SelectMenuProps {
  /** Id lands on the trigger so an error summary can move focus to it. */
  id: string
  /** Form field name, exposed for autofill heuristics and test targeting. */
  name?: string
  /** Id of the visible `<label>`, so the popup keeps a stable accessible name. */
  labelId?: string
  value: string
  options: readonly SelectMenuOption[]
  onChange: (value: string) => void
  /** Called when the menu closes, mirroring a native select's blur. */
  onClose?: () => void
  placeholder?: string
  invalid?: boolean
  describedBy?: string
  className?: string
  buttonClassName?: string
}

/** How long a typed prefix stays active for type-ahead, in milliseconds. */
const TYPE_AHEAD_WINDOW = 600
/** Matches the height of the other form controls. */
const TRIGGER_HEIGHT = 'h-12'

/**
 * Custom listbox that replaces the native `<select>`.
 *
 * Follows the WAI-ARIA listbox pattern with `aria-activedescendant`: DOM focus
 * never leaves the trigger, so tabbing away behaves normally, while arrow keys
 * move a virtual cursor through the options. A native select cannot be styled
 * beyond the OS widget, and this keeps the control on-brand on every platform.
 */
export function SelectMenu({
  id,
  name,
  labelId,
  value,
  options,
  onChange,
  onClose,
  placeholder = 'Select an option',
  invalid = false,
  describedBy,
  className,
  buttonClassName,
}: SelectMenuProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dropUp, setDropUp] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const typeAhead = useRef({ query: '', at: 0 })

  const listId = `${id}-listbox`
  // Stable across renders so `scrollActiveIntoView` does not need rebuilding.
  const optionId = useCallback((index: number) => `${id}-option-${index}`, [id])

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null

  const prefersReducedMotion = useReducedMotion()

  const close = useCallback(
    (options?: { focusTrigger?: boolean }) => {
      setOpen((wasOpen) => {
        if (wasOpen) onClose?.()
        return false
      })
      if (options?.focusTrigger) triggerRef.current?.focus()
    },
    [onClose],
  )

  /* Choose above/below based on the space actually available. */
  useLayoutEffect(() => {
    if (!open) return

    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    // Roughly the tallest the panel should ever get.
    const desired = Math.min(options.length * 44 + 12, 288)

    setDropUp(spaceBelow < Math.min(desired, 220) && spaceAbove > spaceBelow)
  }, [open, options.length])

  const scrollActiveIntoView = useCallback(
    (index: number) => {
      const node = panelRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(index))}`)
      node?.scrollIntoView({ block: 'nearest' })
    },
    [optionId],
  )

  const openMenu = useCallback(() => {
    // Start the cursor on the current choice so Enter re-selects it.
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }, [selectedIndex])

  const commit = useCallback(
    (index: number) => {
      const option = options[index]
      if (option) onChange(option.value)
      close({ focusTrigger: true })
    },
    [close, onChange, options],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const lastIndex = options.length - 1

      if (!open) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openMenu()
        }
        return
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setActiveIndex((index) => {
            const next = index >= lastIndex ? 0 : index + 1
            scrollActiveIntoView(next)
            return next
          })
          break

        case 'ArrowUp':
          event.preventDefault()
          setActiveIndex((index) => {
            const next = index <= 0 ? lastIndex : index - 1
            scrollActiveIntoView(next)
            return next
          })
          break

        case 'Home':
          event.preventDefault()
          setActiveIndex(0)
          scrollActiveIntoView(0)
          break

        case 'End':
          event.preventDefault()
          setActiveIndex(lastIndex)
          scrollActiveIntoView(lastIndex)
          break

        case 'Enter':
        case ' ':
          event.preventDefault()
          commit(activeIndex)
          break

        case 'Escape':
          event.preventDefault()
          close({ focusTrigger: true })
          break

        case 'Tab':
          // Let focus move on, but do not leave an orphaned popup behind.
          close()
          break

        default: {
          // Type-ahead: typing "mob" jumps to "Mobile App Development".
          if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) break
          const now = Date.now()
          const state = typeAhead.current
          state.query = now - state.at > TYPE_AHEAD_WINDOW ? event.key : state.query + event.key
          state.at = now

          const match = options.findIndex((option) =>
            option.label.toLowerCase().startsWith(state.query.toLowerCase()),
          )
          if (match >= 0) {
            event.preventDefault()
            setActiveIndex(match)
            scrollActiveIntoView(match)
          }
        }
      }
    },
    [activeIndex, close, commit, open, openMenu, options, scrollActiveIntoView],
  )

  /* Dismiss on any outside interaction. */
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      close()
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [close, open])

  return (
    <div className={cn('relative', className)} data-field={name}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        // The popup is a sibling of the trigger, not a descendant, so the
        // ownership must be declared for aria-activedescendant to resolve.
        aria-owns={open ? listId : undefined}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-required={undefined}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-xl border bg-ink-800/45 px-4 text-left',
          'text-[0.9375rem] leading-relaxed transition-colors duration-300',
          TRIGGER_HEIGHT,
          open ? 'border-electric-500' : 'hover:border-bone-500/40',
          invalid && 'border-critical/70 hover:border-critical',
          buttonClassName,
        )}
      >
        <span className={cn('truncate', selected ? 'text-bone-100' : 'text-bone-600')}>
          {selected?.label ?? placeholder}
        </span>

        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-bone-500 transition-transform duration-300',
            open && 'rotate-180 text-electric-400',
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            id={listId}
            role="listbox"
            // Name the popup from the field's label, not the current selection,
            // so the accessible name does not change as the value changes.
            aria-labelledby={labelId}
            // Keep focus on the trigger, so stop the panel swallowing it.
            onMouseDown={(event) => event.preventDefault()}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: dropUp ? 6 : -6, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: dropUp ? 6 : -6, scale: 0.985 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute z-50 max-h-72 w-full min-w-full origin-top overflow-y-auto overscroll-contain',
              'rounded-2xl border border-line-strong bg-ink-850/98 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl',
              dropUp ? 'bottom-full mb-2' : 'top-full mt-2',
            )}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value
              const isActive = index === activeIndex

              return (
                <div
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  /* Lets tests target the stored value, not the display copy. */
                  data-value={option.value}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(index)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5',
                    'text-[0.9375rem] transition-colors duration-150',
                    isActive ? 'bg-electric-500/12 text-bone-50' : 'text-bone-300',
                    isSelected && !isActive && 'bg-white/[0.04]',
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? (
                    <Check aria-hidden="true" className="size-4 shrink-0 text-electric-400" />
                  ) : null}
                </div>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
