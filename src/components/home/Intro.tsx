import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'

export function Intro() {
  return (
    <section aria-labelledby="intro-heading" className="py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-3">
            <Reveal>
              <Eyebrow index="01">The studio</Eyebrow>
            </Reveal>
          </div>

          <div className="lg:col-span-9">
            <Reveal>
              <h2
                id="intro-heading"
                className="max-w-3xl text-2xl leading-[1.35] tracking-[-0.028em] text-bone-100 sm:text-[2rem] sm:leading-[1.3]"
              >
                Most projects do not fail because the idea is wrong. They fail because nobody
                wrote down what{' '}
                <span className="font-accent text-bone-50">actually</span> needed to be true.
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-10 grid max-w-3xl gap-8 sm:grid-cols-2 sm:gap-10">
                <p className="text-[0.9375rem] leading-relaxed text-bone-400">
                  So we start by putting the problem, the constraints and the trade-offs in the
                  open. Scope gets smaller, timelines get honest, and the definition of done
                  gets written down before it can be argued about.
                </p>
                <p className="text-[0.9375rem] leading-relaxed text-bone-400">
                  The result is software that behaves predictably under real traffic, real data
                  and real users — and a codebase your own team can pick up without a
                  cliff-face handover.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}
