// Converts the figures picked in scripts/media/figures.json into site/public/media/projects/<slug>/:
// heroes and gallery figures as WebP of at most 1600 px wide, cards as a 960x540 crop around the most
// salient region. Prints each output's size for the page frontmatter.
// Run from the repo root after extract_figures.py: node scripts/media/build-figures.mjs [slug ...]

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const picks = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/media/figures.json'), 'utf8'))
const wanted = process.argv.slice(2)

for (const [slug, entries] of Object.entries(picks)) {
  if (slug.startsWith('_') || (wanted.length && !wanted.includes(slug))) continue
  const dir = path.join(ROOT, 'media-src/figures', slug)
  const { candidates } = JSON.parse(await fs.readFile(path.join(dir, 'candidates.json'), 'utf8'))
  const outDir = path.join(ROOT, 'site/public/media/projects', slug)
  await fs.mkdir(outDir, { recursive: true })
  for (const entry of entries) {
    const candidate = candidates.find((c) => c.id === entry.from)
    if (!candidate?.file) throw new Error(`${slug}: no rendered candidate ${entry.from}`)
    const input = sharp(path.join(dir, candidate.file)).flatten({ background: '#ffffff' }).trim({ background: '#ffffff', threshold: 10 })
    const image =
      entry.role === 'card'
        ? input.resize(960, 540, { fit: 'cover', position: sharp.strategy.attention })
        : input.resize({ width: 1600, withoutEnlargement: true })
    const info = await image.webp({ quality: 82 }).toFile(path.join(outDir, `${entry.to}.webp`))
    console.log(`${slug.padEnd(13)} ${entry.to.padEnd(26)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(4)} ${Math.round(info.size / 1024)} KB`)
  }
}
