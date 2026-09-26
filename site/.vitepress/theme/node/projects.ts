import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import yaml from 'js-yaml'
import { loadPapers } from './bib'
import { contrast, DARK_BG, deriveAccent } from './color'
import { loadTeam } from './team'
import { DATA_DIR, PROJECTS_DIR } from './paths'
import { categorySchema, describe, projectSchema, type ProjectFrontmatter } from './schema'

export interface Category {
  id: string
  label: string
  heading: string
  anchor: string
  color: string
}

// What the menu, the home page cards and the related-project lists need to know about a project.
export interface ProjectSummary {
  slug: string
  url: string
  name: string
  title: string
  tagline: string
  category: string
  order: number
  listed: boolean
  venue: string | null
  logo: string | null
  logoOnDark: string | null
  monogram: string
  image: string | null
  imageAlt: string
  accent: string
  accentLight: string
  accentDark: string
  team: string[]
  paper: string | null
  arxiv: string | null
  features: string[]
  bubble: { image: string | null; fill: boolean; label: boolean }
}

export function loadCategories(): Category[] {
  const file = path.join(DATA_DIR, 'categories.yaml')
  const parsed = categorySchema.safeParse(yaml.load(fs.readFileSync(file, 'utf8')))
  if (!parsed.success) throw new Error(`site/data/categories.yaml is invalid:\n${describe(parsed.error)}`)
  return parsed.data
}

export function readProject(file: string): ProjectFrontmatter {
  const { data } = matter(fs.readFileSync(file, 'utf8'))
  const parsed = projectSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`${path.relative(process.cwd(), file)} has invalid frontmatter:\n${describe(parsed.error)}`)
  }
  return parsed.data
}

function bubbleOf(p: ProjectFrontmatter): ProjectSummary['bubble'] {
  const image = p.bubble?.image ?? p.logo ?? p.card?.image ?? p.hero.image ?? null
  return { image, fill: p.bubble?.fill ?? image !== p.logo, label: p.bubble?.label ?? true }
}

function monogramOf(name: string): string {
  const words = name.split(/[\s-]+/).filter(Boolean)
  return (words.length > 1 ? words.slice(0, 2).map((w) => w[0]) : [name[0]]).join('').toUpperCase()
}

// Every paper key and team id a project names must exist; a typo fails the build here
// instead of breaking the page in the browser.
function checkReferences(file: string, p: ProjectFrontmatter, papers: Set<string>, people: Set<string>): void {
  const problems: string[] = []
  for (const key of [p.paper, ...p.links.map((l) => l.bib)]) {
    if (key && !papers.has(key)) problems.push(`unknown papers.bib key "${key}"`)
  }
  for (const id of p.team) if (!people.has(id)) problems.push(`unknown team.yaml id "${id}"`)
  if (problems.length) throw new Error(`site/projects/${file}: ${problems.join('; ')}`)
}

export function loadProjects(): ProjectSummary[] {
  const categories = new Set(loadCategories().map((c) => c.id))
  const papers = new Map(loadPapers().map((paper) => [paper.key, paper]))
  const people = new Set(loadTeam().people.map((person) => person.id))
  const projects = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((file): ProjectSummary => {
      const slug = file.slice(0, -'.md'.length)
      const p = readProject(path.join(PROJECTS_DIR, file))
      checkReferences(file, p, new Set(papers.keys()), people)
      // Derived accents meet 4.5:1 by construction; a hand-picked dark variant has to as well.
      if (p.accentDark && contrast(p.accentDark, DARK_BG) < 4.5) {
        throw new Error(`site/projects/${file}: accentDark ${p.accentDark} is below 4.5:1 on ${DARK_BG}`)
      }
      if (!categories.has(p.category)) {
        throw new Error(`site/projects/${file}: unknown category "${p.category}" (see site/data/categories.yaml)`)
      }
      return {
        slug,
        url: `/${slug}/`,
        name: p.name,
        title: p.title,
        tagline: p.tagline,
        category: p.category,
        order: p.order,
        listed: p.listed,
        venue: p.venue ?? (p.paper ? papers.get(p.paper)?.presented : null) ?? null,
        logo: p.logo ?? null,
        logoOnDark: p.logoOnDark ?? null,
        monogram: p.monogram ?? monogramOf(p.name),
        image: p.card?.image ?? p.hero.image ?? p.hero.poster ?? null,
        imageAlt: p.card?.alt ?? p.hero.alt ?? p.name,
        ...deriveAccent(p.accent, p.accentDark),
        team: p.team,
        paper: p.paper ?? null,
        arxiv: p.arxiv ?? null,
        features: p.features.map((f) => f.title),
        bubble: bubbleOf(p),
      }
    })
  const slugs = new Set(projects.map((p) => p.slug))
  for (const paper of papers.values()) {
    for (const slug of paper.projects) {
      if (!slugs.has(slug)) throw new Error(`papers.bib: ${paper.key} names unknown project "${slug}"`)
    }
    for (const id of paper.categories) {
      if (!categories.has(id)) throw new Error(`papers.bib: ${paper.key} has unknown category "${id}" (see site/data/categories.yaml)`)
    }
  }
  return projects.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
}
