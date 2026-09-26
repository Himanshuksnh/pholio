import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { RevealItem, RevealGroup } from '@/components/motion/Reveal'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TextLink } from '@/components/ui/TextLink'
import { services } from '@/data/services'

/**
 * Home page services overview.
 *
 * Presented as an editorial list of hairline-separated rows rather than cards,
 * so the Projects page keeps its card grid as the signature treatment.
 */
export function ServicesOverview() {
  return (
    <Section id="services" ariaLabel="Services overview" spacing="lg">
      <SectionHeading
        eyebrow="What we do"
        title="Everything needed to take an idea to production."
        description="Nine practices that cover the full lifecycle. Most engagements combine three or four of them."
        action={<TextLink to="/services">All services</TextLink>}
      />

      <RevealGroup as="ol" className="mt-14 border-t border-line">
        {services.map((service, index) => (
          <RevealItem
            key={service.id}
            as="li"
            className="group border-b border-line"
            y={14}
          >
            <Link
              to="/services"
              className="grid grid-cols-1 items-baseline gap-x-8 gap-y-2 py-7 transition-colors duration-500 hover:bg-white/[0.015] sm:grid-cols-[3rem_1fr] sm:px-2 lg:grid-cols-[3rem_minmax(0,17rem)_1fr_1.5rem] lg:gap-x-10"
            >
              <span
                aria-hidden="true"
                className="label-xs pt-1 text-bone-600 transition-colors duration-500 group-hover:text-electric-400"
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <h3 className="text-lg font-medium tracking-[-0.02em] text-bone-100 transition-colors duration-500 group-hover:text-bone-50 sm:text-xl">
                {service.title}
              </h3>

              <p className="col-start-2 max-w-xl text-sm leading-relaxed text-bone-500 sm:col-start-1 lg:col-start-auto">
                {service.description}
              </p>

              <span
                aria-hidden="true"
                className="hidden self-center justify-self-end text-bone-600 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-electric-400 lg:block"
              >
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  )
}
