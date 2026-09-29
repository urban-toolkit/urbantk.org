import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { SITE } from '../../site'
import { loadPapers, type Paper } from './bib'
import { DATA_DIR, IMPACT_METRICS, PROJECTS_DIR } from './paths'
import { loadProjects, readProject } from './projects'
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
  // `stars` is null when GitHub refused the stargazer list (no personal token).
  repos: Record<string, { stars: string[] | null; authors: Author[] }>
  accounts: {
    logins: Record<string, string | null>
    profiles: Record<string, { name: string | null; company: string | null; bio: string | null }>
  }
  pypi: Record<string, Downloads>
  npm: Record<string, Downloads>
  curio: {
    examples: { number: number; title: string; useCase: string; file: string; added: string | null }[]
    datasets: {
      id: string
      folder: string
      name: string
      tags: string[]
      description: string
      // The numbered examples that read it.
      examples: number[]
      added: string | null
    }[]
    files: { file: string; name: string; examples: number[]; added: string | null }[]
  }
  papers: Record<string, { eprint: string; html: boolean; section: string | null; useCases: string[] }>
  // Registered accounts per hosted Curio, one entry per day a deploy ran.
  history: { day: string; users: Record<string, number> }[]
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

export interface ImpactLink {
  label: string
  url: string
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
  // One value per year; null reads "Not available" (stars without a personal token).
  values: (number | null)[]
  // The software rows, broken down by project.
  projects: ImpactProjectRow[]
  // What a counting row counted, per year.
  items: ImpactItem[][] | null
  // Shown under a value: the events an attendance figure comes from.
  captions?: (string | null)[]
  // How the row is computed and where its numbers come from.
  how?: string
  sources?: ImpactLink[]
}

export interface ImpactGroup {
  label: string
  rows: ImpactRow[]
}

export interface Impact {
  updated: string
  // The code that collects and computes every number.
  method: ImpactLink[]
  years: ImpactYear[]
  groups: ImpactGroup[]
  notes: { label: string; text: string; links: ImpactLink[] }[]
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SHORT = MONTHS.map((m) => m.slice(0, 3))

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
  return parsed.data
}

// The history the build publishes at /impact/history.json, for the next deploy to extend.
export function impactHistory(): Metrics['history'] {
  return readMetrics().history
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
  // A year's downloads over its months. The total comes from the raw sum, so it need not equal the sum of the
  // rounded project rows.
  const allPackages = withPackages.flatMap((p) => [...p.pypi, ...p.npm])
  const monthlyRow = software(
    'downloads-month',
    'Package downloads (average per month)',
    withPackages,
    (p, w) => perMonth(downloads([...p.pypi, ...p.npm], w.start, endOf(w)), w.start, endOf(w)),
    (w) => perMonth(downloads(allPackages, w.start, endOf(w)), w.start, endOf(w)),
  )
  const starLabel = 'GitHub stars (total)'
  const starRow: ImpactRow = config.projects.every((p) => metrics.repos[p.repo].stars)
    ? software('stars', starLabel, config.projects, (p, w) =>
        metrics.repos[p.repo].stars!.filter((day) => day < w.end).length,
      )
    : { id: 'stars', label: starLabel, values: windows.map(() => null), projects: [], items: null }

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
  const counted = (id: string, label: string, lists: ImpactItem[][]): ImpactRow => ({
    id,
    label,
    values: lists.map((list) => list.length),
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
      values: lists.map((list) => {
        const known = list.filter((item) => item.attendance !== undefined)
        return known.length ? Math.round(known.reduce((sum, item) => sum + item.attendance!, 0) / known.length) : 0
      }),
      captions: lists.map((list) => {
        const names = list.filter((item) => item.attendance !== undefined).map((item) => item.name)
        return names.length ? names.join('; ') : null
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
      .filter((e) => !config.curio.demos.includes(e.number) && !config.curio.inPapers.includes(e.number))
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
  // Data the team created or curated for its papers: the data releases linked from the project pages, dated by
  // the project's paper, and the Data Catalog datasets and data files that Curio's examples of a paper's use case
  // read.
  const releases = fs
    .readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
    .flatMap((file) => {
      const page = readProject(path.join(PROJECTS_DIR, file))
      const paper = page.paper ? papers.find((p) => p.key === page.paper) : undefined
      return page.links
        .filter((link) => link.kind === 'data' && link.url)
        .map((link) => ({
          name: link.label ?? `${page.name} data`,
          detail: paper ? `${page.name}, ${shortTitle(paper)} paper` : page.name,
          url: link.url!,
          date: paper ? paperDay(paper) : null,
        }))
    })
  const forPaper = (examples: number[]) => examples.some((n) => config.curio.inPapers.includes(n))
  const exampleList = (examples: number[]) =>
    `example${examples.length > 1 ? 's' : ''} ${examples.map((n) => String(n).padStart(2, '0')).join(', ')}`
  const datasets = bucket([
    ...releases,
    ...metrics.curio.datasets
      .filter(
        (d) => forPaper(d.examples) && !d.tags.some((t) => /^boundar/i.test(t)) && !/sample extract/i.test(d.description),
      )
      .map((d) => ({
        name: d.name,
        detail: `Curio Data Catalog, read by ${exampleList(d.examples)}`,
        url: `https://github.com/${config.curio.repo}/tree/main/${d.folder}`,
        date: d.added,
      })),
    ...metrics.curio.files
      .filter((f) => forPaper(f.examples) && !f.name.endsWith('.pbf'))
      .map((f) => ({
        name: f.name,
        detail: `Curio example data, read by ${exampleList(f.examples)}`,
        url: repoOf(f.file),
        date: f.added,
      })),
  ])
  const publications = bucket(
    papers
      .filter((paper) => paper.type !== 'misc' && paper.type !== 'unpublished')
      .map((paper) => ({ name: paper.title, detail: paper.presented ?? paper.venue, url: paperUrl(paper), date: paperDay(paper) })),
  )

  // A year's users are the last count recorded in it, summed over the hosted instances.
  const lastCount = (w: Window) => [...metrics.history].reverse().find((entry) => entry.day >= w.start && entry.day < w.end)
  const users: ImpactRow = {
    id: 'users',
    label: 'Users at large',
    values: windows.map((w) => Object.values(lastCount(w)?.users ?? {}).reduce((sum, n) => sum + n, 0)),
    projects: [],
    items: windows.map((w) => {
      const entry = lastCount(w)
      return Object.entries(entry?.users ?? {}).map(([base, n]) => ({
        name: new URL(base).host,
        detail: `${n} registered accounts on ${entry!.day}`,
        url: base,
      }))
    }),
  }

  const internalNames = config.internal.map((i) => i.name)
  const listOf = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0])
  const pypiNames = withPackages.flatMap((p) => p.pypi)
  const npmCount = withPackages.reduce((n, p) => n + p.npm.length, 0)
  const updated = new Date(metrics.collected)

  // Where each number comes from, listed under "How the numbers are collected" and in the spreadsheet.
  const siteRepo = `${SITE.github}/urbantk.org/blob/main`
  const curioRepo = `https://github.com/${config.curio.repo}`
  const links: Record<string, ImpactLink[]> = {
    contributors: [
      { label: 'Git history of the repositories', url: SITE.github },
      { label: 'GitHub REST API: commits', url: 'https://docs.github.com/en/rest/commits/commits' },
      { label: 'GitHub REST API: users', url: 'https://docs.github.com/en/rest/users/users' },
      { label: 'Team page', url: `${SITE.hostname}/team/` },
    ],
    downloads: [
      { label: "ClickHouse's public PyPI dataset", url: 'https://clickpy.clickhouse.com/' },
      { label: 'npm download counts API', url: 'https://github.com/npm/registry/blob/main/docs/download-counts.md' },
    ],
    stars: [{ label: 'GitHub GraphQL API: stargazers', url: 'https://docs.github.com/en/graphql/reference/objects#stargazerconnection' }],
    users: config.instances.map((base) => ({ label: `Curio monitor, ${new URL(base).host}`, url: `${base}/monitor` })),
    datasets: [
      { label: 'Data releases on the project pages', url: `${SITE.hostname}/#projects` },
      { label: "Curio's Data Catalog", url: `${curioRepo}/tree/main/datasets` },
      { label: "Curio's example data", url: `${curioRepo}/tree/main/docs/examples/data` },
      { label: "Curio's example gallery", url: `${curioRepo}/blob/main/docs/README.md#examples` },
    ],
    'use-cases': [
      { label: "Curio's example gallery", url: `${curioRepo}/blob/main/docs/README.md#examples` },
      { label: 'Papers, read from their HTML versions on arXiv', url: `${SITE.hostname}/papers/` },
    ],
    publications: [{ label: 'Papers', url: `${SITE.hostname}/papers/` }],
    reported: [{ label: "The team's figures, in impact.yaml", url: `${siteRepo}/site/data/impact.yaml` }],
  }
  const method: ImpactLink[] = [
    { label: 'Collector: scripts/impact/collect.mjs', url: `${siteRepo}/scripts/impact/collect.mjs` },
    { label: 'Computation: site/.vitepress/theme/node/impact.ts', url: `${siteRepo}/site/.vitepress/theme/node/impact.ts` },
  ]
  const sourceOf: Record<string, string> = {
    contributors: 'contributors',
    'downloads-month': 'downloads',
    stars: 'stars',
    users: 'users',
    datasets: 'datasets',
    'use-cases': 'use-cases',
    publications: 'publications',
  }

  const groups: ImpactGroup[] = [
    { label: 'CI Software Ecosystem', rows: [contributorRow, monthlyRow, starRow] },
    {
      label: 'Cloud Environment',
      rows: [users, counted('deployments', 'External cloud deployments', bucket(reportedItems(config.deployments)))],
    },
    { label: 'Urban Data', rows: [counted('datasets', 'Curated datasets', datasets)] },
    {
      label: 'Community metrics',
      rows: [
        attendance('hackathons', 'Hackathon attendance (per hackathon)'),
        attendance('workshops', 'Workshop attendance (per workshop)'),
        counted('use-cases', 'Use cases', useCases),
        counted('internships', 'Internship projects', bucket(reportedItems(config.internships))),
        counted('tutorials', 'Tutorials', bucket(reportedItems(config.tutorials))),
        counted('courses', 'Courses', bucket(reportedItems(config.courses))),
      ],
    },
    { label: 'Scientific Impact', rows: [counted('publications', 'Publications', publications)] },
  ]
  // How each row is computed, shown with its sources in the row's entry under "What is counted".
  const how: Record<string, string> = {
    contributors: `People with at least one commit that year, on any branch, to the ${config.projects.length} repositories listed under the row. They are external when no commit email, team listing or GitHub profile places them at ${listOf(internalNames)}. Bots are not counted.`,
    'downloads-month': `PyPI downloads of ${listOf(pypiNames)}, from ClickHouse's public PyPI dataset, and npm downloads of the ${npmCount} Autark packages. The average per month divides a year's downloads by its months, counting the elapsed days of a partial month.`,
    stars: `All the stars the ${config.projects.length} repositories had at the end of the year, by the dates GitHub gives them.`,
    users: `Accounts registered on Curio's hosted instances (${listOf(config.instances.map((base) => new URL(base).host))}), without the shared guest account, as each instance's public monitor reports them. A year shows the last count taken in it.`,
    datasets:
      "Data the team created or curated for its papers, not data downloaded as is: the data releases linked from the project pages, in the year of their paper, and the Data Catalog datasets and data files read by the Curio examples that reproduce a paper's use case, in the year they were added to Curio. Boundaries, samples and OpenStreetMap extracts are not counted.",
    'use-cases':
      "The urban use cases in the usage-scenario or case-study sections of the papers, in the year of the paper, and the examples in Curio's gallery that are neither feature demos nor one of those use cases, in the year their walkthrough was added.",
    publications: 'Papers on the Papers page, in the year of their issue. Preprints are not counted.',
    hackathons: 'Reported by the team. Attendance is the mean per hackathon.',
    workshops: 'Reported by the team. Attendance is the mean per workshop.',
  }
  for (const group of groups) {
    for (const row of group.rows) {
      row.sources = links[sourceOf[row.id] ?? 'reported']
      row.how = how[row.id] ?? 'Reported by the team.'
    }
  }

  return {
    updated: `${updated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}, ${updated.toISOString().slice(11, 16)} UTC`,
    method,
    years: windows.map((w, i) => ({ label: `Y${i + 1}${w.current ? ' (so far)' : ''}`, period: periodOf(w), current: w.current })),
    groups,
    notes: [
      {
        label: 'Years',
        text: 'Each column counts its year on its own, except GitHub stars and users at large, which are the totals at the end of the year. The current year runs to the last update.',
        links: [],
      },
      {
        label: 'Code',
        text: 'Every deploy of the site collects and computes all of these numbers again with these two files.',
        links: method,
      },
    ],
  }
}
