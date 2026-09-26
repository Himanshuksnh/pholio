import { memo } from 'react'

import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { TECH_PLACEHOLDER } from '@/data/projects'
import type { Project } from '@/data/projects'
import { cn } from '@/lib/cn'

export interface ProjectCardProps {
  project: Project
  className?: string
}

/**
 * Text-only project card.
 *
 * Deliberately contains nothing beyond the project name, a one-line
 * description, the `CATEGORY · TECHNOLOGY` line and a "View Project" link.
 * No icons for individual projects, no images, no logos, no screenshots and no
 * thumbnails — the typography and the grid are the design.
 *
 * The whole card is one link whose accessible name is the project name, so
 * assistive technology announces "SayHi-Chat-App, link" rather than reading the
 * whole card out.
 */
function ProjectCardBase({ project, className }: ProjectCardProps) {
  const headingId = `project-${project.slug}`
  const description = project.shortDescription.trim()
  const primaryTechnology = project.technologies[0]?.trim() ?? ''
  const stackLine =
    project.categoryLabel && primaryTechnology
      ? `${project.categoryLabel} · ${primaryTechnology}`
      : (project.categoryLabel || primaryTechnology || TECH_PLACEHOLDER)

  return (
    <article
      className={cn(
        'group edge-highlight relative flex h-full flex-col rounded-2xl border border-line',
        'bg-ink-900/40 transition-[border-color,background-color,transform] duration-500',
        'ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5',
        'hover:border-electric-500/35 hover:bg-ink-850/60',
        className,
      )}
    >
      <Link
        to={`/projects/${project.slug}`}
        aria-labelledby={headingId}
        className="flex h-full flex-col rounded-2xl p-6 focus-visible:outline-offset-[-3px] sm:p-7"
      >
        <h3
          id={headingId}
          className="break-words text-[1.3125rem] font-medium leading-snug tracking-[-0.02em] text-bone-50"
        >
          {project.name}
        </h3>

        <p className="mt-3.5 text-sm leading-relaxed text-bone-400">{description}</p>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-line/80 pt-6">
          <p className="label-xs text-bone-500 uppercase transition-colors duration-500 group-hover:text-electric-300">
            {stackLine}
          </p>

          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-bone-500 transition-colors duration-500 group-hover:text-bone-100">
            View Project
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </Link>
    </article>
  )
}

export const ProjectCard = memo(ProjectCardBase)
