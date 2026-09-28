import { z } from 'zod'

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'expected a #rrggbb color')
const sitePath = z.string().regex(/^\//, 'expected a path starting with /')

export const LINK_KINDS = [
  'website', 'demo', 'docs', 'install', 'github', 'paper', 'arxiv', 'pdf',
  'video', 'data', 'survey', 'pypi', 'npm', 'discord', 'tutorials',
] as const

const link = z
  .object({
    kind: z.enum(LINK_KINDS),
    url: z.string().optional(),
    bib: z.string().optional(),
    label: z.string().optional(),
    primary: z.boolean().optional(),
  })
  .strict()
  .refine((l) => l.url || l.bib, 'a link needs a url or a bib key')

const feature = z
  .object({
    id: z.string(),
    title: z.string(),
    text: z.string(),
    clip: sitePath.optional(),
    poster: sitePath.optional(),
    image: sitePath.optional(),
    w: z.number().int().positive().optional(),
    h: z.number().int().positive().optional(),
    link: z.string().optional(),
  })
  .strict()

const card = z
  .object({ title: z.string(), text: z.string(), image: sitePath.optional(), link: z.string().optional() })
  .strict()

// Frontmatter of site/projects/<slug>.md. Unknown keys fail the build, so a typo cannot silently drop a field.
export const projectSchema = z
  .object({
    layout: z.literal('ProjectPage'),
    name: z.string(),
    title: z.string(),
    tagline: z.string(),
    category: z.string(),
    order: z.number().int().default(100),
    listed: z.boolean().default(true),
    logo: sitePath.optional(),
    logoOnDark: sitePath.optional(),
    monogram: z.string().max(3).optional(),
    venue: z.string().optional(),
    card: z.object({ image: sitePath.optional(), alt: z.string().optional() }).strict().optional(),
    // The project's circle in the home page diagram. image: defaults to the logo, else the card image.
    // fill: the image covers the circle (default when it is not the logo). label: draw the name
    // (default true; false when the image already shows it).
    bubble: z
      .object({ image: sitePath.optional(), fill: z.boolean().optional(), label: z.boolean().optional() })
      .strict()
      .optional(),
    hero: z
      .object({
        image: sitePath.optional(),
        alt: z.string().optional(),
        caption: z.string().optional(),
        w: z.number().int().positive().optional(),
        h: z.number().int().positive().optional(),
        clip: sitePath.optional(),
        poster: sitePath.optional(),
        youtube: z.string().optional(),
        video: z.string().optional(),
      })
      .strict()
      .refine((h) => !h.image || h.caption, { message: 'a hero image needs a caption', path: ['caption'] })
      .default({}),
    links: z.array(link).default([]),
    features: z.array(feature).default([]),
    more: z.array(card).default([]),
    team: z.array(z.string()).default([]),
    paper: z.string().optional(),
    arxiv: z.string().optional(),
    // Keys VitePress itself understands.
    description: z.string().optional(),
    head: z.array(z.any()).optional(),
  })
  .strict()

export type ProjectFrontmatter = z.infer<typeof projectSchema>

export const categorySchema = z.array(
  z
    .object({ id: z.string(), label: z.string(), heading: z.string(), anchor: z.string(), color: hex.default('#94a3b8') })
    .strict(),
)

export const teamSchema = z
  .object({
    institutions: z.array(z.object({ id: z.string(), name: z.string(), url: z.string().optional() }).strict()),
    people: z.array(
      z
        .object({
          id: z.string(),
          name: z.string(),
          url: z.string().optional(),
          institution: z.string().optional(),
          role: z.string().optional(),
          // false: a collaborator shown on project pages and linked from papers, but not on /team/.
          listed: z.boolean().optional(),
          alumni: z.boolean().optional(),
          photo: sitePath.optional(),
          aliases: z.array(z.string()).optional(),
        })
        .strict(),
    ),
  })
  .strict()

export const newsSchema = z
  .object({
    title: z.string(),
    date: z.coerce.date(),
    image: sitePath.optional(),
    // `contain` for images that are logos or wide banners, which a cover crop would cut.
    imageFit: z.enum(['cover', 'contain']).optional(),
    excerpt: z.string().optional(),
  })
  .strict()

const day = z.coerce.date().transform((d) => d.toISOString().slice(0, 10))

const reported = z
  .object({
    name: z.string(),
    detail: z.string().optional(),
    url: z.string().optional(),
    date: day.optional(),
    year: z.number().int().positive().optional(),
    attendance: z.number().int().nonnegative().optional(),
  })
  .strict()
  .refine((item) => item.date || item.year, 'an item needs a date or an award year')

// site/data/impact.yaml: what /impact/ counts, and the rows only the team can report.
export const impactSchema = z
  .object({
    award: z
      .object({
        start: day.refine((d) => d.endsWith('-01'), 'the award must start on the first of a month'),
        years: z.number().int().positive(),
      })
      .strict(),
    projects: z.array(
      z
        .object({
          project: z.string(),
          repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'expected owner/name'),
          pypi: z.array(z.string()).default([]),
          npm: z.array(z.string()).default([]),
        })
        .strict(),
    ),
    internal: z.array(
      z.object({ id: z.string(), name: z.string(), domains: z.array(z.string()), profile: z.array(z.string()) }).strict(),
    ),
    people: z.array(z.object({ ids: z.array(z.string()).min(1), institution: z.string().optional() }).strict()).default([]),
    curio: z.object({ repo: z.string(), demos: z.array(z.number().int()) }).strict(),
    instances: z.array(z.string().url()).default([]),
    history: z.string().url(),
    deployments: z.array(reported).default([]),
    workshops: z.array(reported).default([]),
    hackathons: z.array(reported).default([]),
    tutorials: z.array(reported).default([]),
    courses: z.array(reported).default([]),
    internships: z.array(reported).default([]),
  })
  .strict()

export type ImpactConfig = z.infer<typeof impactSchema>

export function describe(error: z.ZodError): string {
  return z.prettifyError(error)
}
