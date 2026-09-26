import { ArrowUp, Mail, MapPin, Phone } from 'lucide-react'

import { ContactForm } from '@/components/contact/ContactForm'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PageHeader } from '@/components/ui/PageHeader'
import { activeSocials, contact, site } from '@/config/site'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { cn } from '@/lib/cn'

const TITLE = 'Contact'
const DESCRIPTION =
  'Tell us what you are building and where you are stuck. The more concrete the brief, the more useful our first reply will be.'

const expectations = [
  {
    title: 'What to include',
    body: 'The problem, the users, and any deadline that is genuinely fixed. Rough is fine.',
  },
  {
    title: 'What happens next',
    body: 'You get questions, a recommended approach and a realistic range. No obligation.',
  },
  {
    title: 'Where your data goes',
    body: 'Only into the inbox above, and only so we can reply to you.',
  },
]

export default function ContactPage() {
  useDocumentMeta({ title: TITLE, description: DESCRIPTION })

  return (
    <>
      <PageHeader eyebrow="Get in touch" title="Let's start with a conversation." description={DESCRIPTION} />

      <Container className="pb-24 sm:pb-28 lg:pb-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left rail: direct details and expectations */}
          <div className="lg:col-span-4">
            <Eyebrow index="01">Direct</Eyebrow>

            <ul className="mt-7 space-y-5">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="group flex items-start gap-3.5"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-bone-400 transition-colors duration-300 group-hover:border-electric-500/45 group-hover:text-electric-300">
                    <Mail aria-hidden="true" className="size-4" strokeWidth={1.5} />
                  </span>
                  <span>
                    <span className="label-xs block text-bone-600">Email</span>
                    <span className="mt-1.5 block break-all text-sm text-bone-100 transition-colors duration-300 group-hover:text-bone-50">
                      {contact.email}
                    </span>
                  </span>
                </a>
              </li>

              {contact.phone ? (
                <li>
                  <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="group flex items-start gap-3.5">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-bone-400 transition-colors duration-300 group-hover:border-electric-500/45 group-hover:text-electric-300">
                      <Phone aria-hidden="true" className="size-4" strokeWidth={1.5} />
                    </span>
                    <span>
                      <span className="label-xs block text-bone-600">Phone</span>
                      <span className="mt-1.5 block text-sm text-bone-100 transition-colors duration-300 group-hover:text-bone-50">
                        {contact.phone}
                      </span>
                    </span>
                  </a>
                </li>
              ) : null}

              {contact.location ? (
                <li className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-bone-400">
                    <MapPin aria-hidden="true" className="size-4" strokeWidth={1.5} />
                  </span>
                  <span>
                    <span className="label-xs block text-bone-600">Location</span>
                    <span className="mt-1.5 block text-sm text-bone-100">{contact.location}</span>
                  </span>
                </li>
              ) : null}
            </ul>

            {activeSocials.length > 0 ? (
              <div className="mt-9 border-t border-line pt-7">
                <h2 className="label-xs text-bone-600">Elsewhere</h2>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {activeSocials.map((social) => (
                    <li key={social.key}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noreferrer noopener me"
                        className="group inline-flex items-center gap-1 text-sm text-bone-400 transition-colors duration-300 hover:text-bone-50"
                      >
                        {social.label}
                        <ArrowUp
                          aria-hidden="true"
                          className="size-3 rotate-45 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-9 border-t border-line pt-7">
              <h2 className="label-xs text-bone-600">Good to know</h2>
              <dl className="mt-5 space-y-5">
                {expectations.map((item) => (
                  <div key={item.title}>
                    <dt className="text-sm font-medium text-bone-100">{item.title}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-bone-500">{item.body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Right: the form */}
          <div className="lg:col-span-8">
            <Eyebrow index="02">Project brief</Eyebrow>
            <div className={cn('mt-7')}>
              <ContactForm />
            </div>

            <p className="mt-5 text-xs leading-relaxed text-bone-600">
              Messages are handled by {site.legalName}. We never sell or share the details you
              provide here.
            </p>
          </div>
        </div>
      </Container>
    </>
  )
}
