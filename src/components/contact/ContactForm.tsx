import { useCallback, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

import { CircleAlert, CircleCheck, LoaderCircle, MessageCircle, Send, TriangleAlert } from 'lucide-react'

import { HoneypotField, SelectField, TextAreaField, TextField } from '@/components/contact/Field'
import { Button } from '@/components/ui/Button'
import { contact } from '@/config/site'
import type { SubmitStatus } from '@/lib/contact'
import { buildWhatsappHref, isWhatsappConfigured, submitContactForm } from '@/lib/contact'
import type { ContactFormErrors, ContactFormValues } from '@/lib/validation'
import {
  BUDGET_OPTIONS,
  EMPTY_CONTACT_FORM,
  MIN_DETAILS_LENGTH,
  PROJECT_TYPE_OPTIONS,
  hasErrors,
  validateContactForm,
  validateField,
} from '@/lib/validation'
import { cn } from '@/lib/cn'

type FormState = 'idle' | 'submitting' | SubmitStatus

const FIELD_ORDER: Array<keyof ContactFormValues> = [
  'name',
  'email',
  'phone',
  'projectType',
  'budget',
  'details',
]

const FIELD_LABELS: Record<keyof ContactFormValues, string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  projectType: 'Project type',
  budget: 'Estimated budget',
  details: 'Project details',
  company: 'Company',
}

function Notice({
  tone,
  title,
  children,
  action,
}: {
  tone: 'info' | 'success' | 'error'
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  const styles = {
    info: 'border-electric-500/25 bg-electric-500/[0.07] text-bone-200',
    success: 'border-positive/25 bg-positive/[0.07] text-bone-200',
    error: 'border-critical/30 bg-critical/[0.07] text-bone-200',
  } as const

  const Icon = tone === 'success' ? CircleCheck : tone === 'error' ? CircleAlert : TriangleAlert
  const iconTone = {
    info: 'text-electric-300',
    success: 'text-positive',
    error: 'text-critical',
  } as const

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={cn('flex gap-3.5 rounded-2xl border p-5', styles[tone])}
    >
      <Icon aria-hidden="true" className={cn('mt-0.5 size-[1.125rem] shrink-0', iconTone[tone])} />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-medium text-bone-50">{title}</p>
        {children ? <div className="text-sm leading-relaxed text-bone-400">{children}</div> : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  )
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY_CONTACT_FORM)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormValues, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [state, setState] = useState<FormState>('idle')
  const [stateMessage, setStateMessage] = useState('')

  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const busy = state === 'submitting'

  const setField = useCallback(
    (field: keyof ContactFormValues, value: string) => {
      setValues((previous) => ({ ...previous, [field]: value }))

      // Re-validate as soon as the field has been touched (or the form has been
      // submitted once) so errors clear the moment they are fixed.
      if (!submitAttempted && !touched[field]) return

      const message = validateField(field, value)
      setErrors((previous) => {
        const next = { ...previous }
        if (message) next[field] = message
        else delete next[field]
        return next
      })
    },
    [submitAttempted, touched],
  )

  const blurField = useCallback((field: keyof ContactFormValues) => {
    setTouched((previous) => ({ ...previous, [field]: true }))
  }, [])

  const visibleError = useCallback(
    (field: keyof ContactFormValues) => (submitAttempted || touched[field] ? errors[field] : undefined),
    [errors, submitAttempted, touched],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    const nextErrors = validateContactForm(values)
    setErrors(nextErrors)
    setSubmitAttempted(true)

    if (hasErrors(nextErrors)) {
      // Move focus to the summary so the failure is announced, then let the
      // visitor jump straight to the offending field.
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }

    setState('submitting')
    setStateMessage('')

    const result = await submitContactForm(values)
    setState(result.status)
    setStateMessage('message' in result ? result.message : '')
  }

  function resetForm() {
    setValues(EMPTY_CONTACT_FORM)
    setErrors({})
    setTouched({})
    setSubmitAttempted(false)
    setState('idle')
    setStateMessage('')
  }

  const errorList = FIELD_ORDER.filter((field) => errors[field])

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={busy}
      className="rounded-3xl border border-line bg-ink-900/40 p-6 sm:p-8"
    >
      {state === 'whatsapp' ? (
        <div className="mb-7">
          <Notice
            tone="success"
            title="Your message is ready in WhatsApp"
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={resetForm}
                trailing={<MessageCircle className="size-4" />}
              >
                Write another message
              </Button>
            }
          >
            <p>{stateMessage}</p>
            <p className="mt-2">
              WhatsApp did not open?{' '}
              <a
                href={buildWhatsappHref(values)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-bone-100 underline decoration-bone-600 underline-offset-4 transition-colors hover:decoration-electric-400"
              >
                Open the chat on wa.me
              </a>{' '}
              or write to{' '}
              <a
                href={`mailto:${contact.email}`}
                className="font-medium text-bone-100 underline decoration-bone-600 underline-offset-4 transition-colors hover:decoration-electric-400"
              >
                {contact.email}
              </a>
              .
            </p>
            <p className="mt-2">Everything you typed is still below, so nothing has been lost.</p>
          </Notice>
        </div>
      ) : null}

      {state === 'error' ? (
        <div className="mb-7">
          <Notice tone="error" title="We could not send your message">
            <p>{stateMessage}</p>
          </Notice>
        </div>
      ) : null}

      {errorList.length > 0 ? (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-7 rounded-2xl border border-critical/30 bg-critical/[0.06] p-5"
        >
          <p className="flex items-center gap-2.5 text-sm font-medium text-bone-50">
            <CircleAlert aria-hidden="true" className="size-4 text-critical" />
            Please fix {errorList.length === 1 ? '1 field' : `${errorList.length} fields`} before
            sending
          </p>
          <ul className="mt-3 space-y-1.5 pl-6">
            {errorList.map((field) => (
              <li key={field} className="list-disc text-sm text-bone-400">
                <a
                  href={`#contact-${field}`}
                  onClick={(event) => {
                    event.preventDefault()
                    document.getElementById(`contact-${field}`)?.focus()
                  }}
                  className="underline decoration-bone-600 underline-offset-4 transition-colors hover:text-bone-100 hover:decoration-electric-400"
                >
                  {FIELD_LABELS[field]}: {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="relative space-y-6">
        <HoneypotField
          value={values.company}
          onChange={(value) => setField('company', value)}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            id="contact-name"
            label="Name"
            name="name"
            value={values.name}
            onChange={(value) => setField('name', value)}
            onBlur={() => blurField('name')}
            error={visibleError('name')}
            placeholder="Your name"
            autoComplete="name"
            required
          />
          <TextField
            id="contact-email"
            label="Email"
            name="email"
            type="email"
            inputMode="email"
            value={values.email}
            onChange={(value) => setField('email', value)}
            onBlur={() => blurField('email')}
            error={visibleError('email')}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            id="contact-phone"
            label="Phone"
            name="phone"
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(value) => setField('phone', value)}
            onBlur={() => blurField('phone')}
            error={visibleError('phone')}
            placeholder="+1 555 000 0000"
            autoComplete="tel"
          />
          <SelectField
            id="contact-projectType"
            label="Project type"
            name="projectType"
            value={values.projectType}
            options={PROJECT_TYPE_OPTIONS}
            onChange={(value) => setField('projectType', value)}
            onBlur={() => blurField('projectType')}
            error={visibleError('projectType')}
            required
          />
        </div>

        <SelectField
          id="contact-budget"
          label="Estimated budget"
          name="budget"
          value={values.budget}
          options={BUDGET_OPTIONS}
          onChange={(value) => setField('budget', value)}
          onBlur={() => blurField('budget')}
          error={visibleError('budget')}
          hint="A rough range is enough — it helps us scope the right approach."
        />

        <TextAreaField
          id="contact-details"
          label="Project details"
          name="details"
          value={values.details}
          onChange={(value) => setField('details', value)}
          onBlur={() => blurField('details')}
          error={visibleError('details')}
          placeholder="What are you building, who is it for, and is there a deadline we should know about?"
          minLength={MIN_DETAILS_LENGTH}
          required
        />
      </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xs text-xs leading-relaxed text-bone-600">
            {isWhatsappConfigured()
              ? 'Opens WhatsApp with these details. You press send there.'
              : 'We only use these details to reply to your enquiry.'}
          </p>
        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={busy}
          trailing={
            busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )
          }
        >
          {busy ? 'Sending…' : 'Send message'}
        </Button>
      </div>
    </form>
  )
}
