/* =============================================================================
 * PROCESS — EDIT THIS FILE
 * -----------------------------------------------------------------------------
 * The four delivery phases shown on the home page.
 * ========================================================================== */

export interface ProcessStep {
  readonly id: string
  readonly index: string
  readonly title: string
  readonly description: string
  readonly activities: readonly string[]
}

export const processSteps: readonly ProcessStep[] = [
  {
    id: 'discover',
    index: '01',
    title: 'Discover',
    description:
      'We start with the problem rather than a feature list — who uses it, what it must do, and what already exists.',
    activities: ['Stakeholder interviews', 'Scope & requirements', 'Technical constraints'],
  },
  {
    id: 'design',
    index: '02',
    title: 'Design',
    description:
      'Structure, flows and interface are settled while changes are still cheap, then validated with real people.',
    activities: ['Information architecture', 'Wireframes', 'Design system'],
  },
  {
    id: 'develop',
    index: '03',
    title: 'Develop',
    description:
      'Short, reviewable increments against a staging build, with the same code you receive at the end.',
    activities: ['Iterative sprints', 'Peer code review', 'Staging builds'],
  },
  {
    id: 'launch',
    index: '04',
    title: 'Launch',
    description:
      'Deployment, monitoring and post-launch measurement, followed by an agreed support window.',
    activities: ['Deployment & CI/CD', 'Performance & SEO', 'Support & iteration'],
  },
]
