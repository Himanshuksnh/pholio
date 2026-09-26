import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { CategoryFilterBar, ProjectGridMotion } from '@/components/projects/CategoryFilter'
import type { CategoryFilter } from '@/components/projects/CategoryFilter'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { countByCategory, filterProjects, isProjectCategory } from '@/data/projects'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

const TITLE = 'Projects'
const DESCRIPTION =
  'A text-only index of our work: project name, a one-line description and the stack behind it. Open any project for the full detail.'

export default function ProjectsPage() {
  useDocumentMeta({ title: TITLE, description: DESCRIPTION })

  const [searchParams, setSearchParams] = useSearchParams()
  const rawCategory = searchParams.get('category') ?? 'all'
  const category: CategoryFilter = isProjectCategory(rawCategory) ? rawCategory : 'all'

  const counts = useMemo(() => countByCategory(), [])
  const visible = useMemo(() => filterProjects(category), [category])

  function handleCategoryChange(next: CategoryFilter) {
    setSearchParams(next === 'all' ? {} : { category: next }, { replace: true })
  }

  const resultLabel =
    category === 'all'
      ? `${visible.length} ${visible.length === 1 ? 'project' : 'projects'}`
      : `${visible.length} ${category === 'apps' ? 'app' : 'website'}${visible.length === 1 ? '' : 's'}`

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title={
          <>
            The work,{' '}
            <span className="font-accent text-electric-gradient">without the noise.</span>
          </>
        }
        description={DESCRIPTION}
      >
        <div className="flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <CategoryFilterBar
            value={category}
            counts={counts}
            onChange={handleCategoryChange}
            className="self-start"
          />
          <p aria-live="polite" className="label-xs shrink-0 text-bone-600 sm:text-right">
            Showing {resultLabel}
          </p>
        </div>
      </PageHeader>

      <Container className="pb-24 sm:pb-28 lg:pb-32">
        {visible.length > 0 ? (
          <ProjectGridMotion layoutKey={category}>
            <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {visible.map((project) => (
                <li key={project.slug} className="h-full">
                  <ProjectCard project={project} className="h-full" />
                </li>
              ))}
            </ul>
          </ProjectGridMotion>
        ) : (
          <EmptyState
            title="Nothing here yet"
            description="This category has no projects published so far. Try another filter, or get in touch and we will walk you through the relevant work."
          />
        )}
      </Container>
    </>
  )
}
