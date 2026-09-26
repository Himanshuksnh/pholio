import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { Reveal, RevealItem, RevealGroup } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { getAdjacentProjects, getProjectBySlug } from '@/data/projects'
import { cn } from '@/lib/cn'

/** Small label/value row used for Platforms, Purpose, Focus and Use. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5 border-t border-line py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
      <dt className="label-xs pt-1 text-bone-600">{label}</dt>
      <dd className="text-sm leading-relaxed text-bone-300">{value}</dd>
    </div>
  )
}

function AdjacentLink({
  to,
  name,
  direction,
}: {
  to: string
  name: string
  direction: 'previous' | 'next'
}) {
  const isNext = direction === 'next'
  const Icon = isNext ? ArrowRight : ArrowLeft

  return (
    <Link
      to={to}
      className={cn(
        'group flex flex-col gap-3 rounded-2xl border border-line bg-ink-900/40 p-6 transition-colors duration-500 hover:border-electric-500/30 hover:bg-ink-850/60',
        isNext && 'sm:items-end sm:text-right',
      )}
    >
      <span className="label-xs text-bone-600">{isNext ? 'Next project' : 'Previous project'}</span>
      <span className="flex items-center gap-2 text-base font-medium tracking-[-0.02em] text-bone-100">
        {isNext ? null : <Icon aria-hidden="true" className="size-4 shrink-0 text-bone-500 transition-transform duration-500 group-hover:-translate-x-0.5" />}
        <span className="break-words">{name}</span>
        {isNext ? <Icon aria-hidden="true" className="size-4 shrink-0 text-bone-500 transition-transform duration-500 group-hover:translate-x-0.5" /> : null}
      </span>
    </Link>
  )
}

export default function ProjectDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const project = getProjectBySlug(slug)

  useDocumentMeta({
    title: project ? project.name : 'Project not found',
    description: project
      ? project.shortDescription
      : 'This project could not be found in our portfolio.',
    noIndex: !project,
  })

  if (!project) {
    return (
      <Container className="pb-24 pt-40 sm:pb-28 sm:pt-48">
        <EmptyState
          title="We could not find that project"
          description="The address may be out of date. Every project we have published is listed on the projects page."
          action={
            <ButtonLink to="/projects" variant="secondary" size="sm">
              Back to all projects
            </ButtonLink>
          }
        />
      </Container>
    )
  }

  const { previous, next } = getAdjacentProjects(project)
  const stackLine = [project.categoryLabel, project.technologies.join(' + ')]
    .filter(Boolean)
    .join('  ·  ')

  return (
    <>
      <Container className="pt-32 pb-20 sm:pt-40 sm:pb-24">
        {/* Back to the index */}
        <Link
          to="/projects"
          className="group inline-flex items-center gap-2 text-sm text-bone-500 transition-colors duration-300 hover:text-bone-100"
        >
          <ArrowLeft
            aria-hidden="true"
            className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
          />
          All projects
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Title and description */}
          <div className="lg:col-span-7">
            <Eyebrow>{project.categoryLabel}</Eyebrow>

            <h1 className="mt-7 text-[clamp(2.25rem,5.5vw,3.75rem)] font-medium leading-[1.03] tracking-[-0.038em]">
              {project.name}
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-bone-300">
              {project.description}
            </p>
          </div>

          {/* Meta panel */}
          <div className="lg:col-span-5">
            <Reveal className="rounded-2xl border border-line bg-ink-900/40 p-6 sm:p-7">
              <p className="label-xs text-bone-600">Category</p>
              <p className="mt-3 text-sm text-bone-100">{project.categoryLabel}</p>

              <div className="mt-7 border-t border-line pt-6">
                <p className="label-xs text-bone-600">Technology</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map((technology) => (
                    <li
                      key={technology}
                      className="rounded-full border border-line-strong px-3 py-1.5 text-xs text-bone-200"
                    >
                      {technology}
                    </li>
                  ))}
                </ul>
              </div>

              {project.details.length > 0 ? (
                <dl className="mt-7 border-t border-line pt-6">
                  {project.details.map((row) => (
                    <DetailRow key={row.label} label={row.label} value={row.value} />
                  ))}
                </dl>
              ) : null}
            </Reveal>
          </div>
        </div>

        {/* Features */}
        {project.features.length > 0 ? (
          <div className="mt-20 border-t border-line pt-14 sm:mt-24">
            <Reveal>
              <h2 className="label-xs text-bone-600">What it does</h2>
            </Reveal>

            <RevealGroup
              as="ul"
              className="mt-8 grid list-none gap-x-10 gap-y-4 p-0 sm:grid-cols-2 lg:grid-cols-3"
            >
              {project.features.map((feature) => (
                <RevealItem key={feature} as="li">
                  <span className="flex items-start gap-3 border-b border-line/70 pb-4 text-sm leading-relaxed text-bone-300">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1 shrink-0 rounded-full bg-electric-500"
                    />
                    {feature}
                  </span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        ) : null}

        {/* Stack summary */}
        <div className="mt-16 flex flex-col gap-6 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-xs text-bone-600">{stackLine}</p>
          {/* The footer already carries the site-wide "Start a Project" button, so
              repeating it here read as a duplicate on mobile. */}
          <ButtonLink to="/projects" variant="secondary">
            All projects
          </ButtonLink>
        </div>

        {/* Previous / next */}
        {previous || next ? (
          <nav aria-label="Project navigation" className="mt-14 grid gap-4 sm:grid-cols-2">
            {previous ? (
              <AdjacentLink to={`/projects/${previous.slug}`} name={previous.name} direction="previous" />
            ) : (
              <span />
            )}
            {next ? (
              <AdjacentLink to={`/projects/${next.slug}`} name={next.name} direction="next" />
            ) : null}
          </nav>
        ) : null}
      </Container>

      {/* No `ContactCta` here on purpose: the footer already renders the
          site-wide "Start a Project" button, and stacking both made the two
          read as a duplicated control on mobile. */}
    </>
  )
}
