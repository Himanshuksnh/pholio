/* =============================================================================
 * PROJECT DATA — EDIT THIS FILE
 * -----------------------------------------------------------------------------
 * Every project card and project page on the site is generated from the array
 * below. To add, remove or update a project, edit this file only; no component
 * changes are needed.
 *
 *   name              Exact product name as it should appear.
 *   shortDescription  ONE condensed line. This is the only description shown on
 *                     a card — keep it to a single sentence.
 *   description       The complete description, shown on the project page.
 *   category          'apps' or 'websites' — drives the filter.
 *   categoryLabel     Display label for the card, e.g. 'App' or 'App / Bot'.
 *   technologies      Confirmed stack. The first entry is what appears on the
 *                     card (`APP · FLUTTER`); the full list appears on the
 *                     project page.
 *   features          Optional feature list for the project page.
 *   details           Optional labelled rows (Platforms, Purpose, Focus, Use).
 *   featured          true shows the project in the home page grid.
 *
 * URLs are generated from the name via `slugify()` below, so there are no slugs
 * to maintain by hand. If two entries ever produce the same slug, the later one
 * is suffixed with a singular category label (e.g. `hazirihub-website`) so URLs
 * stay unique.
 * ========================================================================== */

export const PROJECT_CATEGORIES = ['apps', 'websites'] as const

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]

export interface ProjectDetailRow {
  readonly label: string
  readonly value: string
}

export interface Project {
  /** URL segment for `/projects/:slug`. Generated automatically. */
  readonly slug: string
  readonly name: string
  readonly shortDescription: string
  readonly description: string
  readonly category: ProjectCategory
  readonly categoryLabel: string
  readonly technologies: readonly string[]
  readonly features: readonly string[]
  readonly details: readonly ProjectDetailRow[]
  readonly featured: boolean
}

/** Fallbacks used only if an entry is left incomplete. */
export const DESCRIPTION_PLACEHOLDER = 'Description to be added'
export const TECH_PLACEHOLDER = 'Tech stack to be added'

/* -------------------------------------------------------------------------- */
/* Source data                                                                 */
/* -------------------------------------------------------------------------- */

type ProjectSeed = Omit<Project, 'slug'>

const apps: ProjectSeed[] = [
  {
    name: 'SayHi-Chat-App',
    shortDescription: 'Private chat, groups and stories for everyday conversations.',
    description:
      'Personal chat and social communication app for private conversations and groups. Users can chat, view stories and share photos.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Java'],
    features: [],
    details: [],
    featured: true,
  },
  {
    name: 'FlutterTube',
    shortDescription: 'A YouTube-style platform for accounts, uploads and video sharing.',
    description:
      'YouTube-style video sharing application where users can create accounts, upload videos with titles, descriptions and thumbnails, and allow other users to watch the uploaded videos.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'Firebase Storage'],
    features: [],
    details: [],
    featured: false,
  },
  {
    name: 'Fleet-Pro',
    shortDescription: 'Role-based fleet management for authorities, staff and drivers.',
    description:
      'Company fleet management application for businesses operating multiple cars and vehicles. Different authorities, staff and drivers can have separate logins and role-based features.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'Firebase', 'Supabase'],
    features: [
      'Vehicle management',
      'Staff management',
      'Driver management',
      'Profiles',
      'Role-based access',
      'Notifications',
      'Fleet operations',
    ],
    details: [],
    featured: true,
  },
  {
    name: 'CineVerse',
    shortDescription: 'Anime and video streaming with uploads, hosted through Google Drive.',
    description:
      'Flutter-based anime and video streaming application where users can watch and upload content. Videos can be hosted through Google Drive links, reducing the need for dedicated storage.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'Google Drive'],
    features: [],
    details: [],
    featured: true,
  },
  {
    name: 'Devriti',
    shortDescription: 'Health assistance with an AI chatbot and support resources.',
    description:
      'Health assistance application with an AI chatbot that helps users with health-related guidance and connects them with relevant support.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'AI'],
    features: [
      'AI chatbot',
      'Doctor recommendations',
      'Emergency and ambulance contact',
      'Mental-health support resources',
    ],
    details: [],
    featured: false,
  },
  {
    name: 'TrackIt',
    shortDescription: 'Real-time location tracking for buses, deliveries and fleets.',
    description:
      'Real-time tracking application designed for school buses, delivery services, fleets and other location-based services.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter'],
    features: [
      'Live location tracking',
      'School bus tracking',
      'Parent tracking',
      'Management-side vehicle tracking',
    ],
    details: [],
    featured: false,
  },
  {
    name: 'DevAi-User',
    shortDescription: 'Generates detailed, ready-to-use project prompts from a rough idea.',
    description:
      'AI-powered application that generates detailed project prompts. Users enter a project name, select the technology and provide a basic idea, then receive a detailed ready-to-use prompt.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'AI'],
    features: [
      'Daily tokens',
      'Technology selection',
      'Three-step prompt generation',
      'Public prompt sharing',
    ],
    details: [],
    featured: false,
  },
  {
    name: 'DevStudio2025',
    shortDescription: 'A community app connecting students and developers.',
    description:
      'Student and developer community application available for mobile and desktop. It helps students and developers connect, communicate and discover learning resources.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter'],
    features: [
      'Community messaging',
      'Networking',
      'Playlists',
      'Development resources',
      'Design resources',
      'Word and Excel resources',
      'AI-based tool recommendations',
    ],
    details: [{ label: 'Platforms', value: 'Mobile and desktop' }],
    featured: false,
  },
  {
    name: 'PaperCraft',
    shortDescription: 'Generates customised exam papers by subject, class and difficulty.',
    description:
      'Exam paper generation application for teachers and students. Users select subject, class, difficulty level and question-paper pattern to generate customized papers.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'AI'],
    features: [],
    details: [{ label: 'Used by', value: 'Schools, teachers and students preparing for exams' }],
    featured: false,
  },
  {
    name: 'IRD',
    shortDescription: 'An Instagram video downloading utility built on API integration.',
    description: 'Instagram video downloading utility application using API integration.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'Instagram API'],
    features: [],
    details: [],
    featured: false,
  },
  {
    name: 'DevGPT',
    shortDescription: 'An AI study assistant that explains properly instead of briefly.',
    description:
      'AI study assistant designed specifically for students who want detailed explanations, notes and code explanations instead of short generic responses.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'AI'],
    features: [],
    details: [],
    featured: false,
  },
  {
    name: 'CallHub',
    shortDescription: 'Internet calling and messaging, focused on voice.',
    description:
      'Internet calling and messaging application focused primarily on voice calling over the internet.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Kotlin'],
    features: ['Internet calling', 'Chat'],
    details: [],
    featured: false,
  },
  {
    name: 'D-Course',
    shortDescription: 'A learning platform of course videos across subjects and skills.',
    description:
      'Learning platform containing courses and educational video resources across different subjects and skills.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter'],
    features: [
      'Course videos',
      'Technology learning',
      'Skill-based learning',
      'Video viewing',
      'Downloading and offline access',
    ],
    details: [],
    featured: false,
  },
  {
    name: 'AniClip',
    shortDescription: 'Turns long videos into short clips for social creators.',
    description:
      'Automatic video clipping application that converts long videos into smaller clips for social media creators.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter'],
    features: [
      'Automatic clipping',
      'Video segmentation',
      'Short-video creation for Instagram, Facebook and YouTube',
    ],
    details: [],
    featured: false,
  },
  {
    name: 'AniPlix',
    shortDescription: 'A multi-media platform spanning music, movies, anime and shorts.',
    description:
      'Large multi-media entertainment platform combining music, movies, anime, series, wallpapers and shorts.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'Multiple APIs'],
    features: [],
    details: [{ label: 'Platforms', value: 'Mobile and desktop' }],
    featured: true,
  },
  {
    name: 'BloomeeTunes',
    shortDescription: 'One music app that unifies several streaming platforms.',
    description: 'Unified music streaming application integrating multiple music platforms.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'Multiple Music APIs'],
    features: [
      'Spotify integration',
      'JioSaavn integration',
      'YouTube integration',
      'Playlist importing',
      'Music playback',
      'Saving and downloading',
    ],
    details: [],
    featured: false,
  },
  {
    name: 'instagram_studio',
    shortDescription: 'Scheduled publishing and automated engagement for Instagram.',
    description:
      'Instagram automation application for scheduled content publishing and automated engagement workflows.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'Instagram API'],
    features: [
      'Scheduled video uploads',
      'Automatic posting',
      'Automated direct messages',
      'Comment-triggered messages',
      'Story and tag-triggered messages',
    ],
    details: [],
    featured: false,
  },
  {
    name: 'telegram-stream-bot',
    shortDescription: 'A Telegram bot that streams video using Telegram as storage.',
    description:
      'Telegram-based video streaming bot that uses Telegram as a storage layer.',
    category: 'apps',
    categoryLabel: 'App / Bot',
    technologies: ['Telegram Bot API'],
    features: ['Upload videos to Telegram', 'Direct playback', 'Streaming', 'Downloading'],
    details: [],
    featured: false,
  },
  {
    name: 'CineWalls',
    shortDescription: 'Categorised wallpapers for mobile and desktop.',
    description: 'Wallpaper application for mobile and desktop devices with categorized wallpapers.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter'],
    features: ['Browse', 'Categories', 'Download', 'Apply wallpapers'],
    details: [],
    featured: false,
  },
  {
    name: 'CalcsHub',
    shortDescription: 'Many calculation types handled in a single place.',
    description:
      'Advanced calculator application capable of handling many different types of calculations in one place.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter'],
    features: [],
    details: [],
    featured: false,
  },
  {
    name: 'Plant Detector',
    shortDescription: 'Identifies a plant from a photo and explains it in detail.',
    description:
      'Plant identification application that uses a plant photo to identify the plant and provide detailed information.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'AI'],
    features: ['Plant name', 'Scientific name', 'Detailed plant information'],
    details: [],
    featured: false,
  },
  {
    name: 'HaziriHub',
    shortDescription: 'Subject-wise attendance tracking with the 75% requirement built in.',
    description:
      'Student attendance management application for tracking subject-wise attendance.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'Firebase'],
    features: [
      'Attendance tracking',
      'Subject-wise attendance',
      'Attendance percentage',
      'Low-attendance detection',
      'Classes required to reach 75% attendance',
    ],
    details: [],
    featured: false,
  },
  {
    name: 'Snap to PDF',
    shortDescription: 'A multi-tool PDF utility for creating, converting and editing.',
    description:
      'Advanced PDF utility application providing multiple PDF operations and additional document tools.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'PDF processing'],
    features: [
      'PDF creation',
      'PDF conversion',
      'PDF inversion',
      'Screenshot to PDF',
      'App screen to PDF',
      'PDF editing',
    ],
    details: [],
    featured: false,
  },
  {
    name: 'Labour Hisab',
    shortDescription: 'Sites, workers and complete payment records in one place.',
    description:
      'Construction and labour management application for managing sites, workers and complete payment records. Users can view daily records and calculate the complete payment for any selected period.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter'],
    features: [
      'Site management',
      'Labour management',
      'Daily attendance',
      'Salary calculation',
      'Advance payments',
      'Deductions',
      'Worker-wise हिसाब',
    ],
    details: [],
    featured: false,
  },
  {
    name: 'Joya Holidays',
    shortDescription: 'Complete holiday planning and booking, end to end.',
    description: 'Complete holiday trip planning and booking application.',
    category: 'apps',
    categoryLabel: 'App',
    technologies: ['Flutter', 'Travel APIs'],
    features: [
      'Trip duration',
      'Hotels',
      'Breakfast and dinner',
      'Vehicles',
      'Flights',
      'Trains and buses',
    ],
    details: [],
    featured: false,
  },
]

const websites: ProjectSeed[] = [
  {
    name: 'Caption-Studio-web',
    shortDescription: 'Generates captions for videos automatically.',
    description: 'Web application that automatically generates captions for videos.',
    category: 'websites',
    categoryLabel: 'Website',
    technologies: ['React', 'AI'],
    features: [],
    details: [],
    featured: true,
  },
  {
    name: 'MentorHub',
    shortDescription: 'Connects students and mentors around reports and projects.',
    description:
      'Student and mentor management platform that organizes communication, meetings, reports and project relationships.',
    category: 'websites',
    categoryLabel: 'Website',
    technologies: ['React', 'Backend'],
    features: [
      'Student reports',
      'Mentor reports',
      'Higher-authority access',
      'Communication',
      'Meetings',
      'Report submission',
      'Project discussion',
    ],
    details: [],
    featured: true,
  },
  {
    name: 'My Life Book',
    shortDescription: 'A private digital journal for daily thoughts and stories.',
    description:
      'Private digital journal website where users can write their daily thoughts, personal stories and life experiences.',
    category: 'websites',
    categoryLabel: 'Website',
    technologies: ['Modern Web Application'],
    features: [],
    details: [{ label: 'Focus', value: 'Private personal journaling' }],
    featured: false,
  },
  {
    name: 'HaziriHub',
    shortDescription: 'The web front for the HaziriHub attendance platform.',
    description: 'Website for the HaziriHub attendance platform.',
    category: 'websites',
    categoryLabel: 'Website',
    technologies: ['React', 'Firebase Hosting'],
    features: [],
    details: [
      {
        label: 'Purpose',
        value:
          'Present and support the HaziriHub attendance management product and its student-focused features.',
      },
    ],
    featured: false,
  },
]

/* -------------------------------------------------------------------------- */
/* Derived helpers — no need to edit below this line.                          */
/* -------------------------------------------------------------------------- */

/** Lowercase, hyphenated, ASCII-only URL segment. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Assigns each project a slug, suffixing a singular category label on collision. */
function withSlugs(seeds: ProjectSeed[]): Project[] {
  const seen = new Map<string, number>()
  const categorySuffix: Record<ProjectCategory, string> = {
    apps: 'app',
    websites: 'website',
  }

  return seeds.map((seed) => {
    const base = slugify(seed.name)
    const occurrences = seen.get(base) ?? 0
    seen.set(base, occurrences + 1)

    return {
      ...seed,
      slug: occurrences === 0 ? base : `${base}-${categorySuffix[seed.category]}`,
    }
  })
}

export const projects: readonly Project[] = withSlugs([...apps, ...websites])

export const projectCategories: readonly {
  id: ProjectCategory | 'all'
  label: string
}[] = [
  { id: 'all', label: 'All' },
  { id: 'apps', label: 'Apps' },
  { id: 'websites', label: 'Websites' },
]

export function isProjectCategory(value: string): value is ProjectCategory {
  return (PROJECT_CATEGORIES as readonly string[]).includes(value)
}

export function filterProjects(
  category: ProjectCategory | 'all',
  list: readonly Project[] = projects,
): Project[] {
  if (category === 'all') return [...list]
  return list.filter((project) => project.category === category)
}

export function countByCategory(
  list: readonly Project[] = projects,
): Record<ProjectCategory | 'all', number> {
  return {
    all: list.length,
    apps: list.filter((project) => project.category === 'apps').length,
    websites: list.filter((project) => project.category === 'websites').length,
  }
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

/** The previous and next projects within the same category, for page footers. */
export function getAdjacentProjects(project: Project): {
  previous: Project | undefined
  next: Project | undefined
} {
  const siblings = projects.filter((candidate) => candidate.category === project.category)
  const index = siblings.findIndex((candidate) => candidate.slug === project.slug)

  return {
    previous: index > 0 ? siblings[index - 1] : undefined,
    next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined,
  }
}

/** Projects surfaced in the home page "Selected Projects" grid. */
export const featuredProjects: readonly Project[] = projects.filter(
  (project) => project.featured,
)
