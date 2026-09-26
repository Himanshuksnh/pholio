/* =============================================================================
 * CONTACT FORM — SUBMISSION LAYER  (INTEGRATION POINT)
 * -----------------------------------------------------------------------------
 * This is the only file that talks to a server. Everything else in the app is
 * UI, so wiring up (or removing) a backend is a one-file change.
 *
 * HOW IT WORKS
 *   1. `VITE_CONTACT_ENDPOINT` is set  ->  the payload is POSTed as JSON and
 *      the visitor is only told the message was sent when the endpoint answers
 *      with a 2xx status. Any other outcome is reported as a genuine failure.
 *   2. `VITE_CONTACT_ENDPOINT` is unset ->  the form reports honestly that
 *      direct submission is not configured on this deployment and offers a
 *      `mailto:` handoff with every field pre-filled. Nothing is ever claimed
 *      to have been delivered in this state.
 *
 * ENDPOINT CONTRACT
 *   Request   POST <VITE_CONTACT_ENDPOINT>
 *   Headers   Content-Type: application/json
 *   Body      { name, email, phone, projectType, budget, details, submittedAt }
 *   Success   any 2xx status code
 *   Failure   anything else -> surfaced to the visitor as an error
 *
 *   This matches Formspree, Basin, Web3Forms, a Cloudflare Worker, a Vercel
 *   function or any custom endpoint without modification. See `.env.example`.
 * ========================================================================== */

import { contact } from '@/config/site'
import type { ContactFormValues } from '@/lib/validation'
import { BUDGET_OPTIONS, PROJECT_TYPE_OPTIONS, optionLabel } from '@/lib/validation'

export interface ContactPayload {
  name: string
  email: string
  phone: string
  projectType: string
  projectTypeLabel: string
  budget: string
  budgetLabel: string
  details: string
  submittedAt: string
}

export type SubmitStatus = 'sent' | 'error' | 'unconfigured'

export type SubmitResult =
  | { status: 'sent' }
  | { status: 'error'; message: string }
  | { status: 'unconfigured'; message: string }

const REQUEST_TIMEOUT_MS = 15_000

export function buildPayload(values: ContactFormValues): ContactPayload {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    projectType: values.projectType,
    projectTypeLabel: optionLabel(PROJECT_TYPE_OPTIONS, values.projectType),
    budget: values.budget,
    budgetLabel: optionLabel(BUDGET_OPTIONS, values.budget),
    details: values.details.trim(),
    submittedAt: new Date().toISOString(),
  }
}

export function getContactEndpoint(): string | null {
  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT?.trim()
  if (!endpoint) return null
  try {
    const url = new URL(endpoint)
    return url.protocol === 'https:' || url.hostname === 'localhost' ? url.toString() : null
  } catch {
    return null
  }
}

export function isSubmissionConfigured(): boolean {
  return getContactEndpoint() !== null
}

/** Plain-text version of the brief, used for the `mailto:` fallback. */
export function buildMailtoBody(values: ContactFormValues): string {
  const payload = buildPayload(values)
  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    `Project type: ${payload.projectTypeLabel}`,
    payload.budget ? `Estimated budget: ${payload.budgetLabel}` : null,
    '',
    'Project details:',
    payload.details,
  ].filter((line): line is string => line !== null)

  return lines.join('\n')
}

export function buildMailtoHref(values: ContactFormValues): string {
  const subject = `Project enquiry — ${optionLabel(PROJECT_TYPE_OPTIONS, values.projectType)}`
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    buildMailtoBody(values),
  )}`
}

export async function submitContactForm(values: ContactFormValues): Promise<SubmitResult> {
  const endpoint = getContactEndpoint()

  if (!endpoint) {
    return {
      status: 'unconfigured',
      message:
        'Direct form submission is not configured on this deployment, so nothing has been sent. Use the button below to open your email app with these details filled in, or write to us directly.',
    }
  }

  // A filled honeypot is a bot. Report success so it does not retry, but send
  // nothing. The visitor is never misled because no one is waiting on a reply.
  if (values.company.trim()) {
    return { status: 'sent' }
  }

  const payload = buildPayload(values)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      return {
        status: 'error',
        message: `The server responded with ${response.status}. Please try again, or email us directly.`,
      }
    }

    return { status: 'sent' }
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === 'AbortError'
    return {
      status: 'error',
      message: aborted
        ? 'The request timed out before we got a confirmation. Please try again.'
        : 'We could not reach the server. Check your connection and try again, or email us directly.',
    }
  } finally {
    clearTimeout(timeout)
  }
}
