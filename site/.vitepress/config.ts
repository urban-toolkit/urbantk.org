import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { SITE } from './site'
import { DARK_BG, ensureContrast, mix } from './theme/node/color'
import { writeFeed } from './theme/node/feed'
import { socialHead } from './theme/node/head'
import { loadImpact } from './theme/node/impact'
import { writeImpactSheet } from './theme/node/impact-sheet'
import { buildNav } from './theme/node/nav'
import { loadNews } from './theme/node/news'
import { loadCategories, loadProjects } from './theme/node/projects'
import { loadRedirects, writeRedirects } from './theme/node/redirects'

const projects = loadProjects()
const categories = loadCategories()
const unlisted = new Set(projects.filter((p) => !p.listed).map((p) => p.url))

// Each category's arc in the home page diagram: a pale fill of its color in each theme, and a label
// color that stays readable on that fill.
const tintedCategories = categories.map((c) => {
  const fillLight = mix(c.color, '#ffffff', 0.2)
  const fillDark = mix(c.color, DARK_BG, 0.26)
  return {
    ...c,
    fillLight,
    fillDark,
    inkLight: ensureContrast(c.color, fillLight, 4.5),
    inkDark: ensureContrast(c.color, fillDark, 4.5),
  }
})

// VitePress writes sitemap.xml through a stream it does not await, so it can still be open in buildEnd.
async function completeFile(file: string, ending: string, timeoutMs = 10_000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').trimEnd().endsWith(ending)) return
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error(`${file} was not written in time`)
}

export default defineConfig({
  lang: 'en-US',
  title: SITE.title,
  description: SITE.description,
  srcExclude: ['README.md', 'data/**', 'projects/_template.md'],

  // Every URL of the old WordPress site keeps working: projects at /<slug>/, news at /YYYY/MM/<slug>/.
  rewrites: {
    'news/:year/:month/:slug.md': ':year/:month/:slug/index.md',
    'projects/:slug.md': ':slug/index.md',
    'projects/:slug/:sub.md': ':slug/:sub/index.md',
  },

  head: [
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/favicon-192.png' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'Urban Toolkit news', href: '/feed.xml' }],
  ],

  sitemap: {
    hostname: SITE.hostname,
    transformItems: (items) => items.filter((item) => !unlisted.has(`/${item.url}`)),
  },

  themeConfig: {
    logo: { src: '/media/brand/utk-logo.png', alt: '' },
    siteTitle: SITE.title,
    nav: buildNav(projects, categories),
    socialLinks: [{ icon: 'github', link: SITE.github, ariaLabel: 'The Urban Toolkit on GitHub' }],
    outline: false,
    // Site content read by the theme's components (the theme itself holds none).
    utk: {
      categories: tintedCategories,
      ecosystem: SITE.ecosystem,
      homeOrder: SITE.homeOrder,
      newsOnHome: SITE.newsOnHome,
      others: SITE.others,
      funding: SITE.funding,
      institutions: SITE.institutions,
    },
  },

  transformPageData(pageData) {
    // Project pages carry the full paper title in frontmatter; the browser tab shows the project name.
    if (pageData.frontmatter.layout === 'ProjectPage') pageData.title = pageData.frontmatter.name
    pageData.frontmatter.aside ??= false
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(...socialHead(pageData, SITE))
  },

  async buildEnd(siteConfig) {
    const news = loadNews()
    writeRedirects(siteConfig.outDir, loadRedirects(news), SITE.hostname)
    writeFeed(siteConfig.outDir, news, SITE)
    await writeImpactSheet(siteConfig.outDir, loadImpact())
    // WordPress published its sitemap at /wp-sitemap.xml; keep that URL alive for crawlers that cached it.
    const sitemap = path.join(siteConfig.outDir, 'sitemap.xml')
    await completeFile(sitemap, '</urlset>')
    fs.copyFileSync(sitemap, path.join(siteConfig.outDir, 'wp-sitemap.xml'))
  },

  vite: {
    resolve: {
      alias: { '@data': fileURLToPath(new URL('./data', import.meta.url)) },
    },
  },
})
