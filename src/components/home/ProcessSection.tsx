import { RevealItem, RevealGroup } from '@/components/motion/Reveal'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { processSteps } from '@/data/process'

/** Discover → Design → Develop → Launch, joined by a continuous hairline. */
export function ProcessSection() {
  return (
    <Section id="process" ariaLabel="Development process" spacing="lg">
      <SectionHeading
        eyebrow="How we work"
        title="Four phases, in this order, every time."
        description="No mystery middle. You always know which phase we are in, what is being decided, and what happens next."
      />

      <RevealGroup
        as="ol"
        className="relative mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6"
      >
        {/* Connecting hairline, desktop only. */}
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 top-[0.3125rem] hidden h-px bg-gradient-to-r from-transparent via-line-strong to-transparent lg:block"
        />

        {processSteps.map((step) => (
          <RevealItem key={step.id} as="li" className="relative" y={16}>
            <span
              aria-hidden="true"
              className="block size-2.5 rounded-full border border-electric-500/45 bg-ink-950 shadow-[0_0_0_4px_rgba(5,7,11,1)]"
            />

            <p className="label-xs mt-7 text-bone-600">{step.index}</p>
            <h3 className="mt-3 text-xl font-medium tracking-[-0.02em] text-bone-50">
              {step.title}
            </h3>
            <p className="mt-3.5 text-sm leading-relaxed text-bone-400">{step.description}</p>

            <ul className="mt-6 space-y-2 border-t border-line pt-5">
              {step.activities.map((activity) => (
                <li key={activity} className="flex items-start gap-2.5 text-xs text-bone-500">
                  <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-bone-600" />
                  {activity}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  )
}
