// Collects the numbers behind /impact/ that live outside this repo and writes them to
// .cache/impact/metrics.json, which the build reads. Deploy runs it before every build.
//
//   GitHub stars, with the day of each star      GitHub GraphQL API; needs a personal token (STARS_TOKEN or GITHUB_TOKEN)
//   commit authors, with their commit months      git history of each repository, all branches
//   commit authors' GitHub accounts and profiles  GitHub REST API; needs GITHUB_TOKEN (a workflow's token will do)
//   PyPI downloads, per day                       ClickHouse's public PyPI dataset (sql-clickhouse.clickhouse.com)
//   npm downloads, per day                        npm's download counts API (api.npmjs.org)
//   Curio's example gallery and Data Catalog      Curio's repository (docs/README.md, datasets/, docs/examples/)
//   the use cases each paper presents             the paper's HTML version on arXiv
//   registered accounts on Curio's hosted apps    their public monitor API, added to the published history
//
//   GITHUB_TOKEN="$(gh auth token)" npm run impact
//
// What to collect comes from site/data/impact.yaml and site/data/papers.bib. Every request is tried three
// times; a source that still fails stops the script, so the site is never built from partial numbers.

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { parse } from '@retorquere/bibtex-parser'
import yaml from 'js-yaml'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const CACHE = path.join(ROOT, '.cache/impact')
const OUT = path.join(CACHE, 'metrics.json')
const CLICKHOUSE = 'https://sql-clickhouse.clickhouse.com/'
const TRIES = 3
const MAX_BUFFER = 256 * 1024 * 1024

// A paper's use cases are the parts of its section with one of these titles, minus parts like these.
const USE_CASE_SECTION = /use cases?|usage scenarios?|case stud(y|ies)|application scenarios?|usage examples?|example gallery/i
const NOT_A_USE_CASE =
  /^(experts?['\u2019]? )?(feedback|reflections?|discussion|limitations?|summary|lessons?|takeaways?|comparison with|performance|participants?|procedure|study design)\b/i

const run = promisify(execFile)

async function tried(what, fn) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === TRIES || error.permanent) throw new Error(`${what}: ${error.message}`)
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
    }
  }
}

async function get(url, headers = {}, { missingOk = false } = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': 'urbantk.org impact page', ...headers } })
  if (missingOk && res.status === 404) return null
  if (!res.ok) {
    const reply = (await res.text().catch(() => '')).slice(0, 200)
    const error = new Error(`HTTP ${res.status} for ${url}${reply ? `: ${reply}` : ''}`)
    // Rate limits and server errors can pass; any other client error will not.
    error.permanent = res.status < 500 && res.status !== 429 && res.status !== 403
    throw error
  }
  return res
}

function github(route, { accept = 'application/vnd.github+json', missingOk = false } = {}) {
  const headers = { Accept: accept, Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  return tried(`GitHub ${route}`, () => get(`https://api.github.com/${route}`, headers, { missingOk }))
}

function isoDay(date) {
  return date.toISOString().slice(0, 10)
}

function addDays(day, n) {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return isoDay(d)
}

function git(dir, args) {
  return run('git', ['-C', dir, ...args], { maxBuffer: MAX_BUFFER }).then((r) => r.stdout)
}

// Why GitHub refused the stargazer list, for the deploy log.
let starsRefusal = null

// The same list from the REST API, which some tokens GraphQL refuses may read. `expected` is the count
// GraphQL reported, if any: an empty REST list then means the list is hidden, not that there are no stars.
async function starsRest(repo, token, expected = 0) {
  const headers = { 'User-Agent': 'urbantk.org impact page', Accept: 'application/vnd.github.star+json', Authorization: `Bearer ${token}` }
  const days = []
  let url = `https://api.github.com/repos/${repo}/stargazers?per_page=100`
  while (url) {
    const res = await tried(`stars of ${repo}`, async () => {
      const r = await fetch(url, { headers })
      if (r.status >= 500 || r.status === 429) throw new Error(`HTTP ${r.status} for ${url}`)
      return r
    })
    if (!res.ok) {
      if (!starsRefusal?.includes('REST')) {
        // What the endpoint wants, and whether the token can read the repository at all.
        const wants = res.headers.get('x-accepted-github-permissions') ?? 'not said'
        const repoRead = await fetch(`https://api.github.com/repos/${repo}`, { headers }).then((r) => r.status).catch(() => 'failed')
        const message = ((await res.json().catch(() => ({}))).message ?? '').slice(0, 120)
        starsRefusal = `${starsRefusal}; REST: HTTP ${res.status} ${message}; the endpoint wants ${wants}; reading ${repo} gives HTTP ${repoRead}`
      }
      return null
    }
    for (const star of await res.json()) days.push(star.starred_at.slice(0, 10))
    url = /<([^>]+)>;\s*rel="next"/.exec(res.headers.get('link') ?? '')?.[1] ?? null
  }
  if (expected > 0 && days.length === 0) {
    if (!starsRefusal?.includes('REST')) starsRefusal = `${starsRefusal}; REST lists none either`
    return null
  }
  return days
}

// The day of each star, through GitHub's GraphQL API. GitHub shows stargazers only to personal tokens: deploy
// passes the IMPACT_GITHUB_TOKEN secret as STARS_TOKEN. Without one, stars are null and the page reads
// "Not reported".
async function stars(repo) {
  const token = process.env.STARS_TOKEN || process.env.GITHUB_TOKEN
  const [owner, name] = repo.split('/')
  const query = `query($owner: String!, $name: String!, $after: String) {
    repository(owner: $owner, name: $name) {
      stargazerCount
      stargazers(first: 100, after: $after, orderBy: { field: STARRED_AT, direction: ASC }) {
        pageInfo { hasNextPage endCursor }
        edges { starredAt }
      }
    }
  }`
  const days = []
  let after = null
  do {
    const body = await tried(`stars of ${repo}`, async () => {
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { 'User-Agent': 'urbantk.org impact page', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query, variables: { owner, name, after } }),
      })
      const json = await res.json().catch(() => ({}))
      const refused = json.errors?.find((e) => e.type === 'FORBIDDEN')
      if (refused) {
        starsRefusal ??= refused.message
        return null
      }
      if (!res.ok || json.errors) {
        const error = new Error(`HTTP ${res.status}: ${JSON.stringify(json.errors ?? json).slice(0, 300)}`)
        error.permanent = res.status < 500 && res.status !== 429
        throw error
      }
      return json
    })
    if (!body) return starsRest(repo, token)
    const { stargazerCount, stargazers: page } = body.data.repository
    // Some tokens see the count but an empty list; the REST list is the second chance.
    if (!after && stargazerCount > 0 && page.edges.length === 0) {
      starsRefusal ??= `GraphQL shows ${stargazerCount} stars on ${repo} but lists none`
      return starsRest(repo, token, stargazerCount)
    }
    days.push(...page.edges.map((edge) => edge.starredAt.slice(0, 10)))
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null
  } while (after)
  return days
}

// A blob-less bare clone is enough for the history and stays small; later runs only fetch new commits.
async function clone(repo) {
  const dir = path.join(CACHE, 'repos', `${repo.replace('/', '__')}.git`)
  if (fs.existsSync(dir)) {
    await tried(`git fetch ${repo}`, () => git(dir, ['fetch', '-q', '--prune', 'origin', '+refs/heads/*:refs/heads/*']))
  } else {
    fs.mkdirSync(path.dirname(dir), { recursive: true })
    await tried(`git clone ${repo}`, async () => {
      fs.rmSync(dir, { recursive: true, force: true })
      await run('git', ['clone', '-q', '--bare', '--filter=blob:none', `https://github.com/${repo}.git`, dir])
    })
  }
  return dir
}

async function authors(dir) {
  const months = new Map()
  for (const line of (await git(dir, ['log', '--all', '--format=%at%x09%aN%x09%aE'])).split('\n')) {
    const [at, name, email] = line.split('\t')
    if (!email) continue
    const key = `${name}\t${email}`
    if (!months.has(key)) months.set(key, new Set())
    months.get(key).add(new Date(Number(at) * 1000).toISOString().slice(0, 7))
  }
  return [...months].map(([key, set]) => {
    const [name, email] = key.split('\t')
    return { name, email, months: [...set].sort() }
  })
}

// The GitHub account behind each commit email, and the public profile of each account.
async function accounts(repos) {
  const logins = {}
  for (const [repo, { authors: list }] of Object.entries(repos)) {
    for (const { email, name } of list) {
      const key = email.toLowerCase()
      if (key in logins || /\[bot\]/i.test(`${name} ${email}`)) continue
      const noreply = /^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/i.exec(email)
      if (noreply) {
        logins[key] = noreply[1]
        continue
      }
      const commits = await (await github(`repos/${repo}/commits?author=${encodeURIComponent(email)}&per_page=1`)).json()
      logins[key] = commits[0]?.author?.login ?? null
    }
  }
  const profiles = {}
  for (const login of new Set(Object.values(logins).filter(Boolean))) {
    const res = await github(`users/${encodeURIComponent(login)}`, { missingOk: true })
    const user = res ? await res.json() : {}
    profiles[login] = { name: user.name ?? null, company: user.company ?? null, bio: user.bio ?? null }
  }
  return { logins, profiles }
}

async function pypi(pkg, start) {
  const query =
    'SELECT toString(date) AS day, sum(count) AS n FROM pypi.pypi_downloads_per_day ' +
    'WHERE project = {p:String} AND date >= {s:Date} GROUP BY date ORDER BY date FORMAT JSONCompact'
  const url = `${CLICKHOUSE}?${new URLSearchParams({ user: 'demo', query, param_p: pkg, param_s: start })}`
  const res = await tried(`PyPI downloads of ${pkg}`, () => get(url))
  const days = {}
  for (const [day, n] of (await res.json()).data) if (Number(n)) days[day] = Number(n)
  const all = Object.keys(days)
  return { through: all.length ? all[all.length - 1] : null, days }
}

// npm answers at most 18 months per request; a year at a time stays well inside that.
async function npm(pkg, start, through) {
  const days = {}
  for (let from = start; from <= through; from = addDays(from, 365)) {
    const to = addDays(from, 364) < through ? addDays(from, 364) : through
    const url = `https://api.npmjs.org/downloads/range/${from}:${to}/${pkg}`
    const res = await tried(`npm downloads of ${pkg}`, () => get(url))
    for (const { day, downloads } of (await res.json()).downloads ?? []) if (downloads) days[day] = downloads
  }
  return { through, days }
}

// Curio's example gallery (the table in docs/README.md), its Data Catalog, and the data files its numbered
// examples read by path. Each carries the day its file was added to main.
async function curio(dir) {
  const show = (file) => git(dir, ['show', `main:${file}`])
  const added = async (file) => {
    const days = (await git(dir, ['log', 'main', '--diff-filter=A', '--format=%ad', '--date=short', '--', file])).trim().split('\n')
    return days[days.length - 1] || null
  }
  const list = async (folder) => (await git(dir, ['ls-tree', '--name-only', 'main', `${folder}/`])).trim().split('\n').filter(Boolean)

  const examples = []
  const row = /^\|\s*(\d{2})\s*\|\s*\[([^\]]+)\]\((examples\/[^)]+\.md)\)\s*\|[^|\n]*\|\s*([^|\n]+?)\s*\|/gm
  for (const m of (await show('docs/README.md')).matchAll(row)) {
    const file = `docs/${m[3]}`
    examples.push({ number: Number(m[1]), title: m[2], useCase: m[4], file, added: await added(file) })
  }

  const datasets = []
  for (const folder of await list('datasets')) {
    if (!/@\d+$/.test(folder)) continue
    const manifest = JSON.parse(await show(`${folder}/manifest.json`))
    datasets.push({
      id: manifest.id,
      folder,
      name: manifest.name,
      tags: manifest.tags ?? [],
      description: manifest.description ?? '',
      added: await added(`${folder}/manifest.json`),
    })
  }

  const dataflows = (await list('docs/examples')).filter((file) => /\/\d{2}-[^/]+\.json$/.test(file))
  const texts = []
  for (const file of dataflows) texts.push(await show(file))
  const files = []
  for (const file of await list('docs/examples/data')) {
    const name = path.posix.basename(file)
    const readers = dataflows.filter((_, i) => texts[i].includes(name)).map((f) => Number(/\/(\d{2})-/.exec(f)[1]))
    if (readers.length) files.push({ file, name, examples: readers, added: await added(file) })
  }
  return { examples, datasets, files }
}

function clean(html) {
  return html
    .replace(/<span class="ltx_tag[^"]*">[\s\S]*?<\/span>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/\s*\[\s*\d[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.:]$/, '')
}

// The use cases a paper presents: the parts of its first section titled like "Usage scenarios", "Case
// studies" or "Use cases", read from arXiv's HTML version. Parts are the section's child headings or, when
// it has none, its paragraphs that open with a bold or italic run-in title.
async function paperUseCases(eprint) {
  const res = await tried(`arXiv ${eprint}`, () => get(`https://arxiv.org/html/${eprint}`, {}, { missingOk: true }))
  if (!res) return { eprint, html: false, section: null, useCases: [] }
  const page = await res.text()
  const level = { section: 1, subsection: 2, subsubsection: 3, paragraph: 4 }
  const headings = [...page.matchAll(/<h\d[^>]*class="ltx_title ltx_title_(section|subsection|subsubsection|paragraph)"[^>]*>([\s\S]*?)<\/h\d>/g)]
    .map((m) => ({ level: level[m[1]], title: clean(m[2]), at: m.index }))
  const i = headings.findIndex((h) => USE_CASE_SECTION.test(h.title))
  if (i < 0) return { eprint, html: true, section: null, useCases: [] }
  const section = headings[i]
  const end = headings.slice(i + 1).find((h) => h.level <= section.level)
  const inside = headings.slice(i + 1, end ? headings.indexOf(end) : undefined)
  const top = Math.min(...inside.map((h) => h.level))
  let useCases = inside.filter((h) => h.level === top && !NOT_A_USE_CASE.test(h.title)).map((h) => h.title)
  if (!useCases.length) {
    const body = page.slice(section.at, end ? end.at : undefined)
    const runIn = /<div[^>]*class="ltx_para ltx_noindent"[^>]*>\s*<p[^>]*class="ltx_p"[^>]*>\s*<span[^>]*class="ltx_text ltx_font_(?:bold|italic)"[^>]*>([\s\S]*?)<\/span>/g
    useCases = [...body.matchAll(runIn)].map((m) => clean(m[1])).filter((t) => t && !NOT_A_USE_CASE.test(t))
  }
  return { eprint, html: true, section: section.title, useCases }
}

// Registered accounts on a hosted Curio, from its public monitor API. The API path depends on how the host
// proxies /api, so both layouts are tried. An instance without the API (an older release) counts as null.
async function registered(base) {
  for (const route of ['/api/api/monitor', '/api/monitor']) {
    const res = await fetch(`${base}${route}`, { headers: { 'User-Agent': 'urbantk.org impact page' } }).catch(() => null)
    if (!res?.ok) continue
    const json = await res.json().catch(() => null)
    if (Number.isInteger(json?.accounts?.registered)) return json.accounts.registered
  }
  return null
}

// The counts every earlier deploy recorded, from the published site; none yet before the first deploy.
async function history(url) {
  const res = await tried('impact history', () => get(url, {}, { missingOk: true }))
  return res ? await res.json() : []
}

// Papers from the award start on, by issue month; a preprint without a month is dated by its arXiv id.
function recentEprints(start) {
  const library = parse(fs.readFileSync(path.join(ROOT, 'site/data/papers.bib'), 'utf8'), {
    sentenceCase: false,
    caseProtection: false,
    verbatimFields: ['url', 'doi', 'eprint', 'pdf', 'code', 'video', 'thumbnail', 'page', /^file$/],
  })
  const first = Number(start.slice(0, 4)) * 12 + Number(start.slice(5, 7))
  const wanted = []
  for (const { key, fields } of library.entries) {
    const eprint = typeof fields.eprint === 'string' ? fields.eprint.trim() : null
    if (!eprint || String(fields.archiveprefix ?? fields.eprinttype ?? '').toLowerCase() !== 'arxiv') continue
    const year = Number.parseInt(fields.year, 10)
    const fromId = /^(\d{2})(\d{2})\./.exec(eprint)
    const month = Number.parseInt(fields.month, 10) || (fromId && 2000 + Number(fromId[1]) === year ? Number(fromId[2]) : 1)
    if (year * 12 + month >= first) wanted.push({ key, eprint })
  }
  return wanted
}

async function main() {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GitHub answers these requests only with a token: set GITHUB_TOKEN, e.g. GITHUB_TOKEN="$(gh auth token)" npm run impact')
  }
  const config = yaml.load(fs.readFileSync(path.join(ROOT, 'site/data/impact.yaml'), 'utf8'))
  const start = isoDay(new Date(config.award.start))
  const collected = new Date()
  const yesterday = addDays(isoDay(collected), -1)
  const out = { collected: collected.toISOString(), repos: {}, accounts: null, pypi: {}, npm: {}, curio: null, papers: {}, history: [] }

  const dirs = {}
  for (const project of config.projects) {
    console.log(`github  ${project.repo}`)
    dirs[project.repo] = await clone(project.repo)
    out.repos[project.repo] = { stars: await stars(project.repo), authors: await authors(dirs[project.repo]) }
    const starred = out.repos[project.repo].stars
    if (starred) console.log(`        ${starred.filter((day) => day >= start).length} stars since ${start}`)
    for (const pkg of project.pypi ?? []) {
      console.log(`pypi    ${pkg}`)
      out.pypi[pkg] = await pypi(pkg, start)
    }
    for (const pkg of project.npm ?? []) {
      console.log(`npm     ${pkg}`)
      out.npm[pkg] = await npm(pkg, start, yesterday)
    }
  }
  if (Object.values(out.repos).some((repo) => !repo.stars)) {
    console.log(
      `::warning::GitHub refused the stargazer list to this token (${starsRefusal}), so stars read "Not available". The IMPACT_GITHUB_TOKEN secret needs a fine-grained urban-toolkit token with Contents read and write on every repository in impact.yaml.`,
    )
  }
  console.log('github  accounts of commit authors')
  out.accounts = await accounts(out.repos)
  console.log(`curio   ${config.curio.repo}`)
  out.curio = await curio(dirs[config.curio.repo] ?? (await clone(config.curio.repo)))
  for (const { key, eprint } of recentEprints(start)) {
    console.log(`arxiv   ${eprint} (${key})`)
    out.papers[key] = await paperUseCases(eprint)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const users = {}
  for (const base of config.instances ?? []) {
    const count = await registered(base)
    console.log(`curio   ${base}: ${count ?? 'no monitor API'}`)
    if (count !== null) users[base] = count
  }
  const today = isoDay(collected)
  out.history = [...(await history(config.history)).filter((entry) => entry.day !== today), { day: today, users }]
  out.history.sort((a, b) => (a.day < b.day ? -1 : 1))

  fs.mkdirSync(CACHE, { recursive: true })
  fs.writeFileSync(OUT, `${JSON.stringify(out)}\n`)
  console.log(`\nWrote ${path.relative(ROOT, OUT)}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
