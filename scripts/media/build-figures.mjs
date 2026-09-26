// Writes the figure picked for each project in scripts/media/figures.json as
// site/public/media/projects/<slug>/teaser.webp (at most 1600 px wide) and prints its size for the page.
// Run from the repo root after extract_figures.py: node scripts/media/build-figures.mjs [slug ...]

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const picks = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/media/figures.json'), 'utf8'))
const wanted = process.argv.slice(2)

for (const [slug, id] of Object.entries(picks)) {
  if (slug.startsWith('_') || (wanted.length && !wanted.includes(slug))) continue
  const dir = path.join(ROOT, 'media-src/figures', slug)
  const { candidates } = JSON.parse(await fs.readFile(path.join(dir, 'candidates.json'), 'utf8'))
  const candidate = candidates.find((c) => c.id === id)
  if (!candidate?.file) throw new Error(`${slug}: no rendered candidate ${id}`)
  const info = await sharp(path.join(dir, candidate.file))
    .flatten({ background: '#ffffff' })
    .trim({ background: '#ffffff', threshold: 10 })
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(ROOT, 'site/public/media/projects', slug, 'teaser.webp'))
  console.log(`${slug.padEnd(13)} teaser.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB`)
}
