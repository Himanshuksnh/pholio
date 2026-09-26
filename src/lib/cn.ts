/**
 * Tiny class-name joiner.
 *
 * Deliberately dependency-free: it flattens arrays and drops falsy values.
 * Components always place the incoming `className` last so callers can add
 * utilities on top of a component's defaults.
 */
export type ClassValue =
  | string
  | number
  | bigint
  | null
  | undefined
  | boolean
  | ClassValue[]

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []

  for (const input of inputs) {
    if (!input && input !== 0) continue
    if (Array.isArray(input)) {
      const nested = cn(...input)
      if (nested) out.push(nested)
    } else {
      out.push(String(input))
    }
  }

  return out.join(' ')
}
