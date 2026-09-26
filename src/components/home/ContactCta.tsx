import { ArrowRight } from 'lucide-react'

import { Reveal } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'

/** Closing call to action, used at the foot of every page. */
export function ContactCta() {
  return (
    <section aria-labelledby="cta-heading" className="relative py-24 sm:py-32 lg:py-36">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-ink-900/40 px-6 py-16 text-center sm:px-12 sm:py-20 lg:py-24">
            {/* Restrained accent wash, clipped by the panel. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(74,115,255,0.14) 0%, transparent 70%)',
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-electric-400/45 to-transparent"
            />

            <div className="relative">
              <Eyebrow className="justify-center">Start a project</Eyebrow>

              <h2
                id="cta-heading"
                className="mx-auto mt-7 max-w-3xl text-[2rem] leading-[1.1] tracking-[-0.035em] sm:text-[2.75rem] lg:text-[3.25rem]"
              >
                Tell us what you are trying to build.
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-bone-400">
                Send the rough version — a paragraph is plenty. We will come back with honest
                questions, a realistic range and what we would do first.
              </p>

              <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ButtonLink to="/contact" size="lg" trailing={<ArrowRight className="size-4" />}>
                  Start a Project
                </ButtonLink>
                <ButtonLink to="/projects" variant="secondary" size="lg">
                  View Projects
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
