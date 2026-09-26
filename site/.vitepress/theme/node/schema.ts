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
    accent: hex,
    accentDark: hex.optional(),
    logo: sitePath.optional(),
    logoOnDark: sitePath.optional(),
    monogram: z.string().max(3).optional(),
    venue: z.string().optional(),
    card: z.object({ image: sitePath.optional(), alt: z.string().optional() }).strict().optional(),
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
  z.object({ id: z.string(), label: z.string(), heading: z.string(), anchor: z.string() }).strict(),
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

export function describe(error: z.ZodError): string {
  return z.prettifyError(error)
}
