// One-time: builds site/data/papers.bib from the papers of the old site. Each entry is fetched as BibTeX
// from doi.org (or arXiv when there is no DOI), re-keyed, reformatted one field per line, and given the
// site-only fields (projects, presented, page, code) that the pages read.
//
// Run from the repo root: node scripts/migrate/seed-bib.mjs

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const OUT = path.join(ROOT, 'site/data/papers.bib')

// Newest first within each year, as on the old /papers/ page. `label` becomes the last part of the key.
const PAPERS = [
  { label: 'conformal', doi: '10.1109/TVCG.2026.3679888', arxiv: '2602.03743', presented: 'IEEE VR 2026' },
  { label: 'neural', doi: '10.1109/TVCG.2025.3635528', arxiv: '2511.14742', projects: ['neural-3d'], page: '/neural-3d/', code: 'https://github.com/urban-toolkit/neural-3d' },
  { label: 'urbanite', doi: '10.1109/TVCG.2025.3634644', arxiv: '2508.07390', presented: 'IEEE VIS 2025', projects: ['urbanite'], page: '/urbanite/', code: 'https://github.com/urban-toolkit/urbanite' },
  { label: 'vablueprint', doi: '10.1109/TVCG.2025.3634809', arxiv: '2508.07497', presented: 'IEEE VIS 2025', projects: ['va-blueprint'], page: '/va-blueprint/', code: 'https://github.com/urban-toolkit/va-blueprint' },
  { label: 'streetweave', doi: '10.1109/TVCG.2025.3634647', arxiv: '2508.07496', presented: 'IEEE VIS 2025', projects: ['streetweave'], page: '/streetweave/', code: 'https://github.com/urban-toolkit/streetweave' },
  { label: 'autark', arxiv: '2604.20759', projects: ['autark'], page: '/autark/', code: 'https://github.com/urban-toolkit/autark' },
  { label: 'curio', doi: '10.1109/TVCG.2024.3456353', arxiv: '2408.06139', presented: 'IEEE VIS 2024', projects: ['curio'], page: '/curio/', code: 'https://github.com/urban-toolkit/curio' },
  { label: 'landscape', doi: '10.1016/j.cag.2024.104013' },
  { label: 'star', doi: '10.1111/cgf.15112', arxiv: '2404.15976', presented: 'EuroVis 2024', projects: ['survey-3d'], page: '/survey-3d/' },
  { label: 'deepumbra', doi: '10.1109/TBDATA.2024.3382964', arxiv: '2402.17169', projects: ['shadows'], page: '/shadows/', code: 'https://github.com/uic-evl/deep-umbra' },
  { label: 'prowis', doi: '10.1109/TVCG.2023.3326514', presented: 'IEEE VIS 2023' },
  { label: 'utk', doi: '10.1109/TVCG.2023.3326598', arxiv: '2308.07769', presented: 'IEEE VIS 2023', projects: ['utk'], page: '/utk/', code: 'https://github.com/urban-toolkit/utk' },
  { label: 'tile2net', doi: '10.1016/j.compenvurbsys.2023.101950', projects: ['tile2net'], page: '/tile2net/', code: 'https://github.com/VIDA-NYU/tile2net' },
  // Crossref still serves the early-access record for this DOI; the issue details are from Semantic Scholar and DBLP.
  { label: 'comparison', doi: '10.1109/TVCG.2022.3209474', arxiv: '2208.05370', presented: 'IEEE VIS 2022', override: { year: '{2023}', volume: '{29}', number: '{1}', pages: '{1277--1287}', month: 'jan' } },
  { label: 'citysurfaces', doi: '10.1016/j.scs.2021.103630', arxiv: '2201.02260', projects: ['citysurfaces'], page: '/citysurfaces/', code: 'https://github.com/VIDA-NYU/city-surfaces' },
]

const DROP = new Set(['url', 'issn', 'isbn', 'abstract', 'primaryclass', 'eprint', 'archiveprefix', 'note'])

async function fetchBibtex(paper) {
  const url = paper.doi ? `https://doi.org/${paper.doi}` : `https://arxiv.org/bibtex/${paper.arxiv}`
  const res = await fetch(url, { headers: { Accept: 'application/x-bibtex; charset=utf-8', 'User-Agent': 'urbantk-migration' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return (await res.text()).trim()
}

// Top-level `name = value` pairs of one entry, values kept verbatim.
function fields(entry) {
  const body = entry.slice(entry.indexOf(',') + 1, entry.lastIndexOf('}'))
  const out = []
  let depth = 0
  let quoted = false
  let start = 0
  for (let i = 0; i <= body.length; i++) {
    const ch = body[i]
    if (ch === '{') depth++
    else if (ch === '}') depth--
    else if (ch === '"' && depth === 0) quoted = !quoted
    else if ((ch === ',' || i === body.length) && depth === 0 && !quoted) {
      const part = body.slice(start, i).trim()
      if (part) {
        const eq = part.indexOf('=')
        out.push([part.slice(0, eq).trim().toLowerCase(), part.slice(eq + 1).trim()])
      }
      start = i + 1
    }
  }
  return out
}

function unbrace(value) {
  return value.replace(/^\{|\}$/g, '').replace(/^"|"$/g, '')
}

function ascii(text) {
  return text.normalize('NFD').replace(/[^A-Za-z]/g, '').toLowerCase()
}

function firstAuthorLastName(authorValue) {
  const first = unbrace(authorValue).split(/\s+and\s+/)[0].trim()
  return first.includes(',') ? first.split(',')[0] : first.split(/\s+/).pop()
}

const lines = [
  '% Papers of the Urban Toolkit, newest year first; within a year the site keeps this order.',
  '% Standard fields come from the publisher. Site-only fields (removed from the BibTeX visitors copy):',
  '%   projects  = project slugs whose pages list the paper',
  '%   presented = conference where a journal paper was presented',
  '%   page      = project page on this site',
  '%   code, pdf, video, thumbnail, award',
  '',
]

for (const paper of PAPERS) {
  const raw = await fetchBibtex(paper)
  const type = raw.match(/^@(\w+)\s*\{/)[1].toLowerCase()
  const kept = fields(raw).filter(([name]) => !DROP.has(name))
  for (const [name, value] of Object.entries(paper.override ?? {})) {
    const index = kept.findIndex(([n]) => n === name)
    if (index >= 0) kept[index] = [name, value]
    else kept.push([name, value])
  }
  const get = (name) => kept.find(([n]) => n === name)?.[1]
  const year = unbrace(get('year') ?? '')
  const key = `${ascii(firstAuthorLastName(get('author') ?? '{Unknown}'))}${year}${paper.label}`
  const out = kept.map(([name, value]) => {
    // Crossref writes pages with a Unicode dash, months as capitalized words and & as an HTML entity.
    if (name === 'pages') value = value.replace(/\u2013|\u2014/g, '--')
    if (name === 'month') value = unbrace(value).slice(0, 3).toLowerCase()
    return [name, value.replace(/&amp;/g, '\\&')]
  })
  if (paper.arxiv) out.push(['eprint', `{${paper.arxiv}}`], ['archiveprefix', '{arXiv}'])
  if (paper.projects?.length) out.push(['projects', `{${paper.projects.join(', ')}}`])
  if (paper.presented) out.push(['presented', `{${paper.presented}}`])
  if (paper.page) out.push(['page', `{${paper.page}}`])
  if (paper.code) out.push(['code', `{${paper.code}}`])
  const width = Math.max(...out.map(([name]) => name.length))
  lines.push(`@${type}{${key},`)
  lines.push(out.map(([name, value]) => `  ${name.padEnd(width)} = ${value}`).join(',\n'))
  lines.push('}', '')
  console.log(`${key}  <- ${paper.doi ?? `arXiv:${paper.arxiv}`}`)
}

await fs.mkdir(path.dirname(OUT), { recursive: true })
await fs.writeFile(OUT, `${lines.join('\n')}`)
console.log(`wrote ${path.relative(ROOT, OUT)}`)
