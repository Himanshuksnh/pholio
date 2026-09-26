/* =============================================================================
 * SERVICES — EDIT THIS FILE
 * -----------------------------------------------------------------------------
 * Drives the home page overview and the full services page. `icon` must be a
 * key of `serviceIcons` below; `includes` is the short list of deliverables
 * shown under each description.
 * ========================================================================== */

export type ServiceIcon =
  | 'globe'
  | 'mobile'
  | 'code'
  | 'design'
  | 'dashboard'
  | 'database'
  | 'payment'
  | 'performance'
  | 'cloud'

export interface Service {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly icon: ServiceIcon
  readonly includes: readonly string[]
}

export const services: readonly Service[] = [
  {
    id: 'website-development',
    title: 'Website Development',
    description:
      'Marketing sites, portfolios and content-driven web platforms built on modern tooling — fast, accessible and straightforward for your team to update.',
    icon: 'globe',
    includes: ['Responsive front-end build', 'CMS integration', 'Core Web Vitals', 'Analytics setup'],
  },
  {
    id: 'mobile-app-development',
    title: 'Mobile App Development',
    description:
      'Android and iOS applications from a single codebase, engineered for real networks — offline support, sensible sync and store-ready builds.',
    icon: 'mobile',
    includes: ['Cross-platform builds', 'Offline & sync', 'Push notifications', 'Store submission'],
  },
  {
    id: 'custom-software-development',
    title: 'Custom Software Development',
    description:
      'Bespoke platforms, portals and internal tools shaped around how your team actually works, delivered in reviewable increments.',
    icon: 'code',
    includes: ['Architecture & scoping', 'Iterative releases', 'Role-based access', 'Handover & docs'],
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    description:
      'Research-led interface design: flows, wireframes and prototypes that are validated before a line of production code is written.',
    icon: 'design',
    includes: ['Discovery workshops', 'Wireframes', 'Clickable prototypes', 'Design systems'],
  },
  {
    id: 'admin-panel-development',
    title: 'Admin Panel Development',
    description:
      'Control rooms for non-technical teams — data tables, moderation queues, approvals and reporting, with permissions that match your org chart.',
    icon: 'dashboard',
    includes: ['Roles & permissions', 'Data tables & filters', 'Approval workflows', 'Reporting views'],
  },
  {
    id: 'backend-database-integration',
    title: 'Backend and Database Integration',
    description:
      'APIs, authentication and data modelling that stay maintainable as usage grows, with migrations and observability included from day one.',
    icon: 'database',
    includes: ['API design', 'Auth & sessions', 'Schema design', 'Background jobs'],
  },
  {
    id: 'payment-gateway-integration',
    title: 'Payment Gateway Integration',
    description:
      'Checkout, subscriptions and webhooks wired to the providers you already use — including the failure states most integrations forget.',
    icon: 'payment',
    includes: ['Checkout & subscriptions', 'Webhook handling', 'Refunds & invoices', 'Test-mode verification'],
  },
  {
    id: 'seo-performance-optimization',
    title: 'SEO and Performance Optimization',
    description:
      'Technical SEO and a hard performance budget, verified with measurements and field data rather than guesswork.',
    icon: 'performance',
    includes: ['Technical SEO audit', 'Metadata & schema', 'Performance budget', 'Accessibility pass'],
  },
  {
    id: 'deployment-hosting-maintenance',
    title: 'Deployment, Hosting and Maintenance',
    description:
      'Automated pipelines, monitored hosting, backups and a clear support plan for after launch — not just a handover and silence.',
    icon: 'cloud',
    includes: ['CI/CD pipelines', 'Monitoring & backups', 'Dependency updates', 'Support retainer'],
  },
]

/** Baseline commitments shown beneath the services grid. */
export const engagementBasics: readonly { readonly title: string; readonly body: string }[] = [
  {
    title: 'Scope before schedule',
    body: 'You get a written scope and a realistic timeline before any work is booked.',
  },
  {
    title: 'Weekly visible progress',
    body: 'A working build you can click, not a status report about a status report.',
  },
  {
    title: 'You own the code',
    body: 'Source, infrastructure and documentation are handed over in full at the end.',
  },
  {
    title: 'Support after launch',
    body: 'A post-launch window covers fixes, questions and the first round of changes.',
  },
]
