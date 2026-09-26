import { RevealItem, RevealGroup } from '@/components/motion/Reveal'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TextLink } from '@/components/ui/TextLink'
import { featuredProjects, projects } from '@/data/projects'

/**
 * Home page project preview. Uses the exact same text-only card as the
 * Projects page so the visual language never diverges between the two.
 */
export function SelectedProjects() {
  return (
    <Section id="selected-projects" ariaLabel="Selected projects">
      <SectionHeading
        eyebrow="Selected projects"
        title={
          <>
            A cross-section of
            <br className="hidden sm:block" /> recent work.
          </>
        }
        action={<TextLink to="/projects">All {projects.length} projects</TextLink>}
      />

      {featuredProjects.length > 0 ? (
        <RevealGroup
          as="ul"
          className="mt-14 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >
          {featuredProjects.map((project) => (
            <RevealItem
              key={`${project.category}-${project.name}`}
              as="li"
              className="h-full"
            >
              <ProjectCard project={project} className="h-full" />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : null}
    </Section>
  )
}
