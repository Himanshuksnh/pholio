import { ArrowUp, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Container } from '@/components/ui/Container'
import { activeSocials, contact, navigation, site } from '@/config/site'
import { services } from '@/data/services'

const year = new Date().getFullYear()

const footerServices = services.slice(0, 5)

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink-950/60">
      <Container width="wide" className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-[-0.03em] text-bone-50">{site.name}</span>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-electric-500" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-bone-500">
              {site.description}
            </p>

            {activeSocials.length > 0 ? (
              <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
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
            ) : null}
          </div>

          {/* Navigation */}
          <nav aria-label="Footer" className="lg:col-span-2">
            <h2 className="label-xs text-bone-600">Navigate</h2>
            <ul className="mt-5 space-y-3">
              {navigation.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-bone-400 transition-colors duration-300 hover:text-bone-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <nav aria-label="Services" className="lg:col-span-3">
            <h2 className="label-xs text-bone-600">Services</h2>
            <ul className="mt-5 space-y-3">
              {footerServices.map((service) => (
                <li key={service.id}>
                  <Link
                    to="/services"
                    className="text-sm text-bone-400 transition-colors duration-300 hover:text-bone-50"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-1.5 text-sm text-electric-300 transition-colors duration-300 hover:text-electric-200"
                >
                  All services
                  <ArrowUp aria-hidden="true" className="size-3 rotate-45" />
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="label-xs text-bone-600">Get in touch</h2>
            <a
              href={`mailto:${contact.email}`}
              className="group mt-5 inline-flex items-center gap-2.5 text-sm text-bone-200 transition-colors duration-300 hover:text-bone-50"
            >
              <span className="flex size-8 items-center justify-center rounded-full border border-line-strong text-bone-400 transition-colors duration-300 group-hover:border-electric-500/50 group-hover:text-electric-300">
                <Mail aria-hidden="true" className="size-3.5" />
              </span>
              {contact.email}
            </a>
            {contact.phone ? (
              <a
                href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}
                className="mt-3 block text-sm text-bone-400 transition-colors duration-300 hover:text-bone-50"
              >
                {contact.phone}
              </a>
            ) : null}
            {contact.location ? (
              <p className="mt-3 text-sm text-bone-500">{contact.location}</p>
            ) : null}

            <Link
              to="/contact"
              className="mt-7 inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-sm text-bone-100 transition-colors duration-300 hover:border-bone-500/45 hover:bg-white/[0.06]"
            >
              Start a Project
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-bone-600">
            &copy; {year} {site.legalName}. All rights reserved.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group inline-flex items-center gap-2 text-xs text-bone-500 transition-colors duration-300 hover:text-bone-100"
          >
            Back to top
            <span className="flex size-7 items-center justify-center rounded-full border border-line transition-colors duration-300 group-hover:border-bone-500/45">
              <ArrowUp aria-hidden="true" className="size-3" />
            </span>
          </button>
        </div>
      </Container>
    </footer>
  )
}
