/* =============================================================================
 * CONTACT FORM — VALIDATION
 * -----------------------------------------------------------------------------
 * Dependency-free validators plus a single `validateContactForm` entry point.
 * Rules are intentionally conservative: required fields, a plausible email and
 * a minimum length on the brief, so people are not asked to retype everything
 * because of one stray character.
 * ========================================================================== */

export const PROJECT_TYPE_OPTIONS = [
  { value: '', label: 'Select a project type' },
  { value: 'website', label: 'Website Development' },
  { value: 'mobile-app', label: 'Mobile App Development' },
  { value: 'custom-software', label: 'Custom Software Development' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'admin-panel', label: 'Admin Panel Development' },
  { value: 'backend-database', label: 'Backend and Database Integration' },
  { value: 'payment-integration', label: 'Payment Gateway Integration' },
  { value: 'seo-performance', label: 'SEO and Performance Optimization' },
  { value: 'deployment-maintenance', label: 'Deployment, Hosting and Maintenance' },
  { value: 'other', label: 'Something else' },
] as const

export const BUDGET_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'under-1k', label: 'Under $1,000' },
  { value: '1k-5k', label: '$1,000 – $5,000' },
  { value: '5k-15k', label: '$5,000 – $15,000' },
  { value: '15k-40k', label: '$15,000 – $40,000' },
  { value: '40k-plus', label: '$40,000+' },
  { value: 'undecided', label: 'Not sure yet' },
] as const

export interface ContactFormValues {
  name: string
  email: string
  phone: string
  projectType: string
  budget: string
  details: string
  /** Honeypot — must stay empty. Real users never see or fill this. */
  company: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>

export const EMPTY_CONTACT_FORM: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  projectType: '',
  budget: '',
  details: '',
  company: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
/** Permissive on purpose: spaces, brackets and + are all valid in real numbers. */
const PHONE_PATTERN = /^[+()\d][\d\s()+.-]{5,24}$/

export const MIN_DETAILS_LENGTH = 20

export function validateField(
  field: keyof ContactFormValues,
  value: string,
): string | undefined {
  const trimmed = value.trim()

  switch (field) {
    case 'name':
      if (!trimmed) return 'Please tell us your name.'
      if (trimmed.length < 2) return 'That name looks too short.'
      return undefined

    case 'email':
      if (!trimmed) return 'An email address is required so we can reply.'
      if (!EMAIL_PATTERN.test(trimmed)) return 'Please enter a valid email address.'
      return undefined

    case 'phone':
      if (!trimmed) return undefined
      if (!PHONE_PATTERN.test(trimmed)) return 'Please enter a valid phone number.'
      return undefined

    case 'projectType':
      if (!trimmed) return 'Please choose the closest project type.'
      return undefined

    case 'details':
      if (!trimmed) return 'Please describe your project.'
      if (trimmed.length < MIN_DETAILS_LENGTH)
        return `A little more detail helps — at least ${MIN_DETAILS_LENGTH} characters.`
      return undefined

    default:
      return undefined
  }
}

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {}

  for (const field of ['name', 'email', 'phone', 'projectType', 'details'] as const) {
    const message = validateField(field, values[field])
    if (message) errors[field] = message
  }

  return errors
}

export function hasErrors(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length > 0
}

/** Human-readable label for a project type / budget value. */
export function optionLabel(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? '—'
}
