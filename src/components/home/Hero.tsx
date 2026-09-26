import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'

const disciplines = [
  'Web applications',
  'Mobile applications',
  'Custom software',
  'Backend & infrastructure',
]

export function Hero() {
  const prefersReducedMotion = useReducedMotion()

  const rise = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
        }

  return (
    <section className="relative flex min-h-svh items-center pt-28 pb-24 sm:pt-32 lg:pt-36">
      <Container>
        <div className="max-w-4xl">
          <motion.div {...rise(0)}>
            <Eyebrow>Software Development Studio</Eyebrow>
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="mt-8 text-[clamp(2.75rem,8.6vw,6.25rem)] font-medium leading-[0.97] tracking-[-0.042em] text-bone-50"
          >
            Software that holds up{' '}
            <span className="font-accent text-[1.06em] text-electric-gradient">
              in the real world.
            </span>
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mt-8 max-w-2xl text-base leading-relaxed text-bone-400 sm:text-lg sm:leading-[1.75]"
          >
            We are a software development studio. We design, build and ship web, mobile and
            custom software for teams that need it to work — then we help you keep it working.
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink to="/projects" size="lg" trailing={<ArrowRight className="size-4" />}>
              Explore Projects
            </ButtonLink>
            <ButtonLink to="/contact" variant="secondary" size="lg">
              Start a Project
            </ButtonLink>
          </motion.div>
        </div>

        <motion.ul
          {...rise(0.34)}
          className="mt-16 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-8 sm:mt-20"
          aria-label="Disciplines"
        >
          {disciplines.map((discipline, index) => (
            <li key={discipline} className="flex items-center gap-3">
              {index > 0 ? (
                <span aria-hidden="true" className="size-1 rounded-full bg-bone-600" />
              ) : null}
              <span className="label-xs text-bone-500">{discipline}</span>
            </li>
          ))}
        </motion.ul>
      </Container>
    </section>
  )
}
