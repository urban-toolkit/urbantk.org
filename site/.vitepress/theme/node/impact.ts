import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { loadPapers, type Paper } from './bib'
import { DATA_DIR, IMPACT_METRICS } from './paths'
import { loadProjects } from './projects'
import { describe, impactSchema, type ImpactConfig } from './schema'
import { loadTeam } from './team'

// What scripts/impact/collect.mjs writes to .cache/impact/metrics.json.
interface Author {
  name: string
  email: string
  months: string[]
}

interface Downloads {
  through: string | null
  days: Record<string, number>
}

interface Metrics {
  collected: string
  repos: Record<string, { stars: string[]; authors: Author[] }>
  accounts: {
    logins: Record<string, string | null>
    profiles: Record<string, { name: string | null; company: string | null; bio: string | null }>
  }
  pypi: Record<string, Downloads>
  npm: Record<string, Downloads>
  curio: {
    examples: { number: number; title: string; useCase: string; file: string; added: string | null }[]
    datasets: { id: string; folder: string; name: string; tags: string[]; description: string; added: string | null }[]
    files: { file: string; name: string; examples: number[]; added: string | null }[]
  }
  papers: Record<string, { eprint: string; html: boolean; section: string | null; useCases: string[] }>
}

export interface ImpactYear {
  label: string
  period: string
  current: boolean
}

export interface ImpactItem {
  name: string
  detail: string | null
  url: string | null
}

export interface ImpactProjectRow {
  name: string
  url: string
  accent: string
  accentLight: string
  accentDark: string
  values: number[]
}

export interface ImpactRow {
  id: string
  label: string
  // One value per year; null reads "Not reported".
  values: (number | null)[]
  // The software rows, broken down by project.
  projects: ImpactProjectRow[]
  // What a counting row counted, per year.
  items: ImpactItem[][] | null
}

export interface ImpactGroup {
  label: string
  rows: ImpactRow[]
}

export interface Impact {
  updated: string
  years: ImpactYear[]
  groups: ImpactGroup[]
  notes: { label: string; text: string }[]
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SHORT = MONTHS.map((m) => m.slice(0, 3))
const REPORTED = ['users', 'deployments', 'workshops', 'hackathons', 'tutorials', 'courses', 'internships'] as const

function addMonths(day: string, n: number): string {
  const [y, m] = day.split('-').map(Number)
  const t = y * 12 + m - 1 + n
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}-01`
}

function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function daysBetween(from: string, to: string): number {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000
}

// Months from `start` (the first of a month) to `end`, counting the elapsed part of the last month.
function monthsBetween(start: string, end: string): number {
  let whole = 0
  while (addMonths(start, whole + 1) <= end) whole++
  const from = addMonths(start, whole)
  return whole + daysBetween(from, end) / daysBetween(from, addMonths(from, 1))
}

function norm(text: string): string {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

// A year's days run from `start` up to, not including, `end`; the current year ends after the day of the update.
interface Window {
  start: string
  end: string
  current: boolean
}

function windowsOf(award: ImpactConfig['award'], today: string): Window[] {
  const windows: Window[] = []
  for (let k = 0; k < award.years; k++) {
    const start = addMonths(award.start, 12 * k)
    if (start > today) break
    const end = addMonths(start, 12)
    windows.push(today < end ? { start, end: addDays(today, 1), current: true } : { start, end, current: false })
  }
  return windows
}

function periodOf(w: Window): string {
  const [sy, sm, sd] = w.start.split('-').map(Number)
  const [ey, em, ed] = addDays(w.end, -1).split('-').map(Number)
  if (!w.current) return `${SHORT[sm - 1]} ${sy} to ${SHORT[em - 1]} ${ey}`
  return sy === ey ? `${SHORT[sm - 1]} ${sd} to ${SHORT[em - 1]} ${ed}, ${ey}` : `${SHORT[sm - 1]} ${sd}, ${sy} to ${SHORT[em - 1]} ${ed}, ${ey}`
}

function readConfig(): ImpactConfig {
  const file = path.join(DATA_DIR, 'impact.yaml')
  const parsed = impactSchema.safeParse(yaml.load(fs.readFileSync(file, 'utf8')))
  if (!parsed.success) throw new Error(`site/data/impact.yaml is invalid:\n${describe(parsed.error)}`)
  const unknown = Object.keys(parsed.data.none).filter((row) => !(REPORTED as readonly string[]).includes(row))
  if (unknown.length) throw new Error(`site/data/impact.yaml: "none" names unknown rows ${unknown.join(', ')}`)
  return parsed.data
}

function readMetrics(): Metrics {
  if (!fs.existsSync(IMPACT_METRICS)) {
    throw new Error('.cache/impact/metrics.json is missing: run GITHUB_TOKEN="$(gh auth token)" npm run impact (deploy runs it before the build)')
  }
  return JSON.parse(fs.readFileSync(IMPACT_METRICS, 'utf8')) as Metrics
}

// Every commit author becomes a person: identities that share an email, a name, a GitHub account or a
// `people` entry are one person. A person is internal when a commit email, team.yaml or their GitHub
// profile places them at one of the `internal` institutions, or a `people` entry says so.
function contributors(config: ImpactConfig, metrics: Metrics) {
  const parent = new Map<string, string>()
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x)
    let root = x
    while (parent.get(root) !== root) root = parent.get(root)!
    parent.set(x, root)
    return root
  }
  const union = (a: string, b: string) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }
  const keyOf = (id: string) => (id.includes('@') ? `e:${id.toLowerCase()}` : `n:${norm(id)}`)
  for (const group of config.people) for (const id of group.ids.slice(1)) union(keyOf(group.ids[0]), keyOf(id))

  const identities: (Author & { repo: string; login: string | null })[] = []
  for (const [repo, { authors }] of Object.entries(metrics.repos)) {
    for (const author of authors) {
      if (/\[bot\]/i.test(`${author.name} ${author.email}`)) continue
      const login = metrics.accounts.logins[author.email.toLowerCase()] ?? null
      identities.push({ ...author, repo, login })
      const email = `e:${author.email.toLowerCase()}`
      if (norm(author.name)) union(email, `n:${norm(author.name)}`)
      if (login) union(email, `n:${norm(login)}`)
    }
  }

  const overrides = new Map<string, string>()
  for (const group of config.people) if (group.institution) overrides.set(find(keyOf(group.ids[0])), group.institution)
  const team = new Map<string, string>()
  for (const person of loadTeam().people) {
    if (!person.institution) continue
    for (const name of [person.name, ...(person.aliases ?? [])]) team.set(norm(name), person.institution)
  }
  const internal = new Set(config.internal.map((i) => i.id))
  const patterns = config.internal.map((i) => ({ id: i.id, domains: i.domains, profile: i.profile.map((p) => new RegExp(p, 'i')) }))

  const evidence = new Map<string, { emails: Set<string>; names: Set<string>; logins: Set<string> }>()
  for (const id of identities) {
    const root = find(`e:${id.email.toLowerCase()}`)
    if (!evidence.has(root)) evidence.set(root, { emails: new Set(), names: new Set(), logins: new Set() })
    const e = evidence.get(root)!
    e.emails.add(id.email.toLowerCase())
    e.names.add(id.name)
    if (id.login) e.logins.add(id.login)
  }

  const institutionOf = (root: string): string | null => {
    if (overrides.has(root)) return overrides.get(root)!
    const { emails, names, logins } = evidence.get(root)!
    for (const p of patterns) {
      for (const email of emails) {
        const domain = email.split('@')[1] ?? ''
        if (p.domains.some((d) => domain === d || domain.endsWith(`.${d}`))) return p.id
      }
    }
    const profiles = [...logins].map((l) => metrics.accounts.profiles[l]).filter(Boolean)
    for (const name of [...names, ...profiles.map((p) => p.name ?? '')]) {
      const found = team.get(norm(name))
      if (found) return found
    }
    for (const p of patterns) {
      if (profiles.some((profile) => p.profile.some((re) => re.test(`${profile.company ?? ''} ${profile.bio ?? ''}`)))) return p.id
    }
    return null
  }

  const external = new Map<string, boolean>()
  for (const root of evidence.keys()) external.set(root, !internal.has(institutionOf(root) ?? ''))

  // External people with a commit in the window, in all repositories or in one.
  return (w: Window, repo?: string): number => {
    const first = w.start.slice(0, 7)
    const last = addDays(w.end, -1).slice(0, 7)
    const active = new Set<string>()
    for (const id of identities) {
      if (repo && id.repo !== repo) continue
      if (!id.months.some((m) => m >= first && m <= last)) continue
      const root = find(`e:${id.email.toLowerCase()}`)
      if (external.get(root)) active.add(root)
    }
    return active.size
  }
}

function paperDay(paper: Paper): string {
  return `${paper.year}-${String(paper.month ?? 1).padStart(2, '0')}-01`
}

function paperUrl(paper: Paper): string | null {
  if (paper.doi) return `https://doi.org/${paper.doi}`
  if (paper.arxiv) return `https://arxiv.org/abs/${paper.arxiv}`
  return paper.url
}

export function loadImpact(): Impact {
  const config = readConfig()
  const metrics = readMetrics()
  const today = metrics.collected.slice(0, 10)
  const windows = windowsOf(config.award, today)
  const papers = loadPapers()
  const projects = new Map(loadProjects().map((p) => [p.slug, p]))
  for (const p of config.projects) {
    if (!projects.has(p.project)) throw new Error(`site/data/impact.yaml: unknown project "${p.project}" (see site/projects/)`)
    if (!metrics.repos[p.repo]) throw new Error(`.cache/impact/metrics.json has no ${p.repo}: run npm run impact again`)
  }

  const since = config.award.start
  const [sinceYear, sinceMonth] = since.split('-').map(Number)
  const sinceShort = `${SHORT[sinceMonth - 1]} ${sinceYear}`
  const sinceLong = `${MONTHS[sinceMonth - 1]} ${sinceYear}`

  // Downloads of the current year run to the last day every download source has.
  const throughs = [...Object.values(metrics.pypi), ...Object.values(metrics.npm)].map((d) => d.through).filter(Boolean) as string[]
  const downloadsEnd = throughs.length ? addDays(throughs.sort()[0], 1) : today
  const endOf = (w: Window) => (w.current && downloadsEnd < w.end ? downloadsEnd : w.end)
  const downloads = (pkgs: string[], from: string, to: string) =>
    pkgs.reduce((sum, pkg) => {
      const days = (metrics.pypi[pkg] ?? metrics.npm[pkg])?.days ?? {}
      return sum + Object.entries(days).reduce((s, [day, n]) => (day >= from && day < to ? s + n : s), 0)
    }, 0)

  // A year that has just begun has no elapsed days of downloads yet.
  const perMonth = (n: number, from: string, to: string) => {
    const months = monthsBetween(from, to)
    return months > 0 ? Math.round(n / months) : 0
  }

  const withPackages = config.projects.filter((p) => p.pypi.length + p.npm.length > 0)
  const projectRow = (p: ImpactConfig['projects'][number], values: number[]): ImpactProjectRow => {
    const page = projects.get(p.project)!
    return { name: page.name, url: page.url, accent: page.accent, accentLight: page.accentLight, accentDark: page.accentDark, values }
  }
  const software = (id: string, label: string, list: ImpactConfig['projects'], value: (p: ImpactConfig['projects'][number], w: Window) => number, total?: (w: Window) => number): ImpactRow => {
    const perProject = list.map((p) => projectRow(p, windows.map((w) => value(p, w))))
    return {
      id,
      label,
      values: windows.map((w, i) => (total ? total(w) : perProject.reduce((sum, p) => sum + p.values[i], 0))),
      projects: perProject,
      items: null,
    }
  }

  const external = contributors(config, metrics)
  const contributorRow = software(
    'contributors',
    'External GitHub contributors',
    config.projects,
    (p, w) => external(w, p.repo),
    (w) => external(w),
  )
  const totalRow = software('downloads-total', `Package downloads (total since ${sinceShort})`, withPackages, (p, w) =>
    downloads([...p.pypi, ...p.npm], since, endOf(w)),
  )
  // Averages of the totals are taken from the raw sums, so they need not equal the sum of rounded project rows.
  const allPackages = withPackages.flatMap((p) => [...p.pypi, ...p.npm])
  const averageRow = software(
    'downloads-average',
    `Package downloads (monthly average since ${sinceShort})`,
    withPackages,
    (p, w) => perMonth(downloads([...p.pypi, ...p.npm], since, endOf(w)), since, endOf(w)),
    (w) => perMonth(downloads(allPackages, since, endOf(w)), since, endOf(w)),
  )
  const monthlyRow = software(
    'downloads-month',
    'Package downloads (per month)',
    withPackages,
    (p, w) => perMonth(downloads([...p.pypi, ...p.npm], w.start, endOf(w)), w.start, endOf(w)),
    (w) => perMonth(downloads(allPackages, w.start, endOf(w)), w.start, endOf(w)),
  )
  const starRow = software('stars', `GitHub stars (total since ${sinceShort})`, config.projects, (p, w) =>
    metrics.repos[p.repo].stars.filter((day) => day >= since && day < w.end).length,
  )

  // Rows that count items: every item falls in the year of its date or its award year.
  const yearOf = (item: { date?: string | null; year?: number }): number => {
    if (item.year) return item.year - 1
    return windows.findIndex((w) => item.date! >= w.start && item.date! < w.end)
  }
  const bucket = (items: (ImpactItem & { date?: string | null; year?: number })[]): ImpactItem[][] => {
    const lists: ImpactItem[][] = windows.map(() => [])
    for (const { date, year, ...item } of items) {
      const i = yearOf({ date, year })
      if (i >= 0 && i < windows.length) lists[i].push(item)
    }
    return lists
  }
  const counted = (id: string, label: string, lists: ImpactItem[][], complete: boolean): ImpactRow => ({
    id,
    label,
    values: lists.map((list, i) => (list.length || complete || config.none[id]?.includes(i + 1) ? list.length : null)),
    projects: [],
    items: lists,
  })
  const reportedItems = (list: ImpactConfig['workshops']) =>
    list.map((item) => ({ name: item.name, detail: item.detail ?? null, url: item.url ?? null, date: item.date, year: item.year }))
  const attendance = (id: 'workshops' | 'hackathons', label: string): ImpactRow => {
    const lists = windows.map(() => [] as ImpactConfig['workshops'])
    for (const item of config[id]) {
      const i = yearOf(item)
      if (i >= 0 && i < windows.length) lists[i].push(item)
    }
    return {
      id,
      label,
      values: lists.map((list, i) => {
        const known = list.filter((item) => item.attendance !== undefined)
        if (known.length) return Math.round(known.reduce((sum, item) => sum + item.attendance!, 0) / known.length)
        return config.none[id]?.includes(i + 1) ? 0 : null
      }),
      projects: [],
      items: bucket(reportedItems(config[id])).map((list, i) =>
        list.map((item, j) => {
          const attended = lists[i][j]?.attendance
          return attended === undefined ? item : { ...item, detail: [item.detail, `${attended} attendees`].filter(Boolean).join(', ') }
        }),
      ),
    }
  }

  const repoOf = (file: string) => `https://github.com/${config.curio.repo}/blob/main/${file}`
  const shortTitle = (paper: Paper) => paper.title.split(':')[0]
  const useCases = bucket([
    ...metrics.curio.examples
      .filter((e) => !config.curio.demos.includes(e.number))
      .map((e) => ({
        name: e.useCase,
        detail: `Curio example ${String(e.number).padStart(2, '0')}, ${e.title}`,
        url: repoOf(e.file),
        date: e.added,
      })),
    ...papers.flatMap((paper) =>
      (metrics.papers[paper.key]?.useCases ?? []).map((title) => ({
        name: title.replace(/^(scenario|example|case study|use case)\s*\d+\s*[:.]\s*/i, ''),
        detail: `${shortTitle(paper)} paper`,
        url: paperUrl(paper),
        date: paperDay(paper),
      })),
    ),
  ])
  const datasets = bucket([
    ...metrics.curio.datasets
      .filter((d) => !d.tags.some((t) => /^boundar/i.test(t)) && !/sample extract/i.test(d.description))
      .map((d) => ({
        name: d.name,
        detail: 'Curio Data Catalog',
        url: `https://github.com/${config.curio.repo}/tree/main/${d.folder}`,
        date: d.added,
      })),
    ...metrics.curio.files
      .filter((f) => !f.name.endsWith('.pbf'))
      .map((f) => ({
        name: f.name,
        detail: `Data of Curio example${f.examples.length > 1 ? 's' : ''} ${f.examples.map((n) => String(n).padStart(2, '0')).join(', ')}`,
        url: repoOf(f.file),
        date: f.added,
      })),
  ])
  const publications = bucket(
    papers
      .filter((paper) => paper.type !== 'misc' && paper.type !== 'unpublished')
      .map((paper) => ({ name: paper.title, detail: paper.presented ?? paper.venue, url: paperUrl(paper), date: paperDay(paper) })),
  )

  const users: ImpactRow = {
    id: 'users',
    label: 'Users at large',
    values: windows.map((_, i) => {
      const entry = config.users.find((u) => u.year === i + 1)
      return entry ? entry.count : config.none.users?.includes(i + 1) ? 0 : null
    }),
    projects: [],
    items: null,
  }

  const internalNames = config.internal.map((i) => i.name)
  const listOf = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0])
  const pypiNames = withPackages.flatMap((p) => p.pypi)
  const npmCount = withPackages.reduce((n, p) => n + p.npm.length, 0)
  const updated = new Date(metrics.collected)

  return {
    updated: `${updated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}, ${updated.toISOString().slice(11, 16)} UTC`,
    years: windows.map((w, i) => ({ label: `Y${i + 1}${w.current ? ' (so far)' : ''}`, period: periodOf(w), current: w.current })),
    groups: [
      { label: 'CI Software Ecosystem', rows: [contributorRow, totalRow, averageRow, monthlyRow, starRow] },
      {
        label: 'Cloud Environment',
        rows: [users, counted('deployments', 'External cloud deployments', bucket(reportedItems(config.deployments)), false)],
      },
      { label: 'Urban Data', rows: [counted('datasets', 'Curated datasets', datasets, true)] },
      {
        label: 'Community metrics',
        rows: [
          attendance('hackathons', 'Hackathon attendance (per hackathon)'),
          attendance('workshops', 'Workshop attendance (per workshop)'),
          counted('use-cases', 'Use cases', useCases, true),
          counted('internships', 'Internship projects', bucket(reportedItems(config.internships)), false),
          counted('tutorials', 'Tutorials', bucket(reportedItems(config.tutorials)), false),
          counted('courses', 'Courses', bucket(reportedItems(config.courses)), false),
        ],
      },
      { label: 'Scientific Impact', rows: [counted('publications', 'Publications', publications, true)] },
    ],
    notes: [
      {
        label: 'Years',
        text: `Each column counts its year on its own, except the rows marked "since ${sinceShort}", which add up from the start of the award in ${sinceLong}. The current year runs to the last update.`,
      },
      {
        label: 'External GitHub contributors',
        text: `People with at least one commit that year, on any branch, to the ${config.projects.length} repositories listed under the row. They are external when no commit email, team listing or GitHub profile places them at ${listOf(internalNames)}. Bots are not counted.`,
      },
      {
        label: 'Package downloads',
        text: `PyPI downloads of ${listOf(pypiNames)}, from ClickHouse's public PyPI dataset, and npm downloads of the ${npmCount} Autark packages. Monthly figures divide by the months of the period, counting the elapsed days of a partial month.`,
      },
      { label: 'GitHub stars', text: `Stars on the ${config.projects.length} repositories that GitHub dates on or after ${MONTHS[sinceMonth - 1]} 1, ${sinceYear}.` },
      {
        label: 'Curated datasets',
        text: "Datasets in Curio's Data Catalog, other than boundaries and test samples, and the data files Curio's examples read, other than OpenStreetMap extracts. Each counts in the year it was added to Curio.",
      },
      {
        label: 'Use cases',
        text: "The urban use cases in the usage-scenario or case-study sections of the papers below, in the year of the paper, and the examples in Curio's gallery that are not feature demos, in the year their walkthrough was added.",
      },
      { label: 'Publications', text: 'Papers on the Papers page, in the year of their issue. Preprints are not counted.' },
      {
        label: 'Reported by the team',
        text: 'Users, deployments, attendance, internship projects, tutorials and courses. Attendance is the mean per event.',
      },
    ],
  }
}
