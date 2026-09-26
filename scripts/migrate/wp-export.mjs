// One-time export of the WordPress site at urbantk.org through its public REST API.
//
// Writes:
//   migration/raw/                  REST JSON, rendered HTML and every original media file
//                                   (gitignored; copied to ../urbantk-wp-backup as the archive of the old site)
//   migration/pages/                a Markdown draft and a JSON summary per page, as source material
//   site/news/YYYY/MM/<slug>.md     the news posts, images under site/public/media/news/<slug>/
//   site/data/legacy-urls.txt       every public URL of the old site that must keep resolving
//
// Run from the repo root: node scripts/migrate/wp-export.mjs [--no-media]

import fs from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import TurndownService from 'turndown'
import turndownGfm from 'turndown-plugin-gfm'
import he from 'he'

const BASE = 'https://urbantk.org'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const RAW = path.join(ROOT, 'migration/raw')
const PAGES_OUT = path.join(ROOT, 'migration/pages')
const NEWS_OUT = path.join(ROOT, 'site/news')
const NEWS_MEDIA = path.join(ROOT, 'site/public/media/news')
const LEGACY = path.join(ROOT, 'site/data/legacy-urls.txt')
const withMedia = !process.argv.includes('--no-media')

const UPLOAD_RE = /https?:\/\/(?:www\.)?urbantk\.org\/wp-content\/uploads\/[^"'\s)<>?#]+/g

async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return { json: await res.json(), headers: res.headers }
}

async function getAll(type) {
  const out = []
  for (let page = 1; ; page++) {
    const { json, headers } = await getJson(`${BASE}/wp-json/wp/v2/${type}?per_page=100&page=${page}`)
    out.push(...json)
    if (page >= Number(headers.get('x-wp-totalpages') ?? 1)) return out
  }
}

async function exists(file) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

// Downloads url to dest unless dest already exists. Returns false on a 404.
async function download(url, dest) {
  if (await exists(dest)) return true
  const res = await fetch(url)
  if (res.status === 404) return false
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await pipeline(Readable.fromWeb(res.body), createWriteStream(`${dest}.part`))
  await fs.rename(`${dest}.part`, dest)
  return true
}

// WordPress serves resized copies as name-1024x768.ext; the original drops the suffix.
function originalOf(url) {
  return url.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1')
}

function uploadPath(url) {
  return decodeURIComponent(new URL(url).pathname.replace(/^\/wp-content\/uploads\//, ''))
}

// Fetches the original of an upload (falling back to the resized copy) into migration/raw/uploads.
async function fetchUpload(url) {
  for (const candidate of [originalOf(url), url]) {
    const dest = path.join(RAW, 'uploads', uploadPath(candidate))
    if (await download(candidate, dest)) return { url: candidate, file: dest }
  }
  console.warn(`missing upload: ${url}`)
  return null
}

function rootRelative(href) {
  return href.replace(/^https?:\/\/(?:www\.)?urbantk\.org(?=\/|$)/, '') || '/'
}

function plain(html) {
  return he.decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function turndown() {
  const service = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' })
  service.use(turndownGfm.gfm)
  service.keep(['video', 'iframe'])
  return service
}

function frontmatter(fields) {
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}: ${typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(value) ? JSON.stringify(value) : value}`)
  return `---\n${lines.join('\n')}\n---\n`
}

async function exportPosts(posts, mediaById) {
  const md = turndown()
  for (const post of posts) {
    const pathname = new URL(post.link).pathname // /YYYY/MM/slug/
    const [, year, month, slug] = pathname.match(/^\/(\d{4})\/(\d{2})\/([^/]+)\/$/)
    const mediaDir = path.join(NEWS_MEDIA, slug)
    let html = post.content.rendered

    const localized = new Map()
    for (const url of new Set(html.match(UPLOAD_RE) ?? [])) {
      const got = withMedia ? await fetchUpload(url) : null
      if (!got) continue
      const name = path.basename(got.file)
      await fs.mkdir(mediaDir, { recursive: true })
      await fs.copyFile(got.file, path.join(mediaDir, name))
      localized.set(url, `/media/news/${slug}/${name}`)
    }
    for (const [from, to] of localized) html = html.split(from).join(to)
    html = html.replace(/href="(https?:\/\/(?:www\.)?urbantk\.org[^"]*)"/g, (_, href) => `href="${rootRelative(href)}"`)
    html = html.replace(/\s(?:srcset|sizes)="[^"]*"/g, '')

    let image
    const featured = mediaById.get(post.featured_media)
    if (featured && withMedia) {
      const got = await fetchUpload(featured.source_url)
      if (got) {
        const name = path.basename(got.file)
        await fs.mkdir(mediaDir, { recursive: true })
        await fs.copyFile(got.file, path.join(mediaDir, name))
        image = `/media/news/${slug}/${name}`
      }
    }

    const body = md.turndown(html).trim()
    const excerpt = plain(post.excerpt.rendered).replace(/\s*(\[\u2026\]|\[&hellip;\]|Read more.*)$/i, '').trim()
    const out = path.join(NEWS_OUT, year, month, `${slug}.md`)
    await fs.mkdir(path.dirname(out), { recursive: true })
    await fs.writeFile(out, `${frontmatter({ title: he.decode(post.title.rendered), date: post.date.slice(0, 10), image, excerpt })}\n${body}\n`)
    console.log(`post  ${pathname} -> ${path.relative(ROOT, out)}`)
  }
}

async function exportPages(pages) {
  const md = turndown()
  await fs.mkdir(PAGES_OUT, { recursive: true })
  for (const page of pages) {
    const pathname = new URL(page.link).pathname
    const name = pathname === '/' ? 'home' : pathname.replace(/^\/|\/$/g, '').replace(/\//g, '__')
    const html = page.content.rendered
    const anchors = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, text]) => ({ href: rootRelative(he.decode(href)), text: plain(text) }))
    const summary = {
      link: pathname,
      title: he.decode(page.title.rendered),
      modified: page.modified,
      template: page.template || null,
      headings: [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map(([, level, text]) => `h${level} ${plain(text)}`),
      buttons: [...html.matchAll(/<a\b[^>]*class="[^"]*wp-block-button__link[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>|<a\b[^>]*href="([^"]+)"[^>]*class="[^"]*wp-block-button__link[^"]*"[^>]*>([\s\S]*?)<\/a>/g)]
        .map((m) => ({ href: rootRelative(he.decode(m[1] ?? m[3])), text: plain(m[2] ?? m[4]) })),
      links: anchors,
      images: [...new Set(html.match(/<img\b[^>]*src="([^"]+)"/g)?.map((tag) => tag.match(/src="([^"]+)"/)[1]) ?? [])],
      videos: [...new Set([...html.matchAll(/<(?:video|source)\b[^>]*src="([^"]+)"/g)].map((m) => m[1]))],
      iframes: [...html.matchAll(/<iframe\b[^>]*src="([^"]+)"/g)].map((m) => m[1]),
    }
    await fs.writeFile(path.join(PAGES_OUT, `${name}.json`), `${JSON.stringify(summary, null, 2)}\n`)
    await fs.writeFile(path.join(PAGES_OUT, `${name}.md`), `<!-- draft converted from ${BASE}${pathname}; source material only -->\n\n${md.turndown(html).trim()}\n`)
    console.log(`page  ${pathname} -> migration/pages/${name}.md`)
  }
}

async function exportHtml(paths) {
  for (const pathname of paths) {
    const name = pathname === '/' ? 'home' : pathname.replace(/^\/|\/$/g, '').replace(/\//g, '__')
    const res = await fetch(`${BASE}${pathname}`)
    await fs.mkdir(path.join(RAW, 'html'), { recursive: true })
    await fs.writeFile(path.join(RAW, 'html', `${name}.html`), await res.text())
  }
}

async function main() {
  await fs.mkdir(RAW, { recursive: true })
  const [pages, posts, media, categories] = await Promise.all([getAll('pages'), getAll('posts'), getAll('media'), getAll('categories')])
  const { json: site } = await getJson(`${BASE}/wp-json`)
  for (const [name, data] of Object.entries({ pages, posts, media, categories, site })) {
    await fs.writeFile(path.join(RAW, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`)
  }
  console.log(`REST: ${pages.length} pages, ${posts.length} posts, ${media.length} media`)

  const mediaById = new Map(media.map((item) => [item.id, item]))
  for (const post of posts) {
    if (post.featured_media && !mediaById.has(post.featured_media)) {
      try {
        const { json } = await getJson(`${BASE}/wp-json/wp/v2/media/${post.featured_media}`)
        mediaById.set(json.id, json)
      } catch (err) {
        console.warn(`featured media ${post.featured_media} of ${post.slug}: ${err.message}`)
      }
    }
  }

  const pagePaths = pages.map((page) => new URL(page.link).pathname)
  const postPaths = posts.map((post) => new URL(post.link).pathname)
  await exportHtml([...pagePaths, ...postPaths])
  await exportPages(pages)
  await exportPosts(posts, mediaById)

  if (withMedia) {
    const referenced = new Set(media.map((item) => item.source_url))
    for (const item of [...pages, ...posts]) for (const url of item.content.rendered.match(UPLOAD_RE) ?? []) referenced.add(url)
    let count = 0
    for (const url of referenced) if (await fetchUpload(url)) count++
    console.log(`media: ${count} of ${referenced.size} uploads saved under migration/raw/uploads`)
  }

  const archives = new Set()
  for (const pathname of postPaths) {
    const [, year, month] = pathname.match(/^\/(\d{4})\/(\d{2})\//)
    archives.add(`/${year}/`)
    archives.add(`/${year}/${month}/`)
  }
  const legacy = [...pagePaths, ...postPaths, ...archives, '/curio/tutorials/', '/feed/', '/news/feed/', '/wp-sitemap.xml', '/sitemap.xml']
  const header = '# Every public URL of the WordPress site (exported by scripts/migrate/wp-export.mjs).\n# scripts/check/dist.mjs fails the build if one of them does not resolve to a page, a redirect stub or a file.\n'
  await fs.mkdir(path.dirname(LEGACY), { recursive: true })
  await fs.writeFile(LEGACY, `${header}${[...new Set(legacy)].sort().join('\n')}\n`)
  console.log(`legacy URLs: ${new Set(legacy).size} -> ${path.relative(ROOT, LEGACY)}`)
}

await main()
