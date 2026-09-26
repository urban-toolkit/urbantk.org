// Contact sheet of the candidate figures of each project (media-src/figures/<slug>/sheet.png), to pick from.
// Run from the repo root after extract_figures.py: node scripts/media/contact-sheet.mjs [slug ...]

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const FIGURES = path.join(ROOT, 'media-src/figures')
const CELL_W = 480
const CELL_H = 300
const LABEL_H = 28
const COLUMNS = 3

function escapeXml(text) {
  return text.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c])
}

const wanted = process.argv.slice(2)
for (const slug of (await fs.readdir(FIGURES)).sort()) {
  if (wanted.length && !wanted.includes(slug)) continue
  const { candidates } = JSON.parse(await fs.readFile(path.join(FIGURES, slug, 'candidates.json'), 'utf8'))
  const usable = candidates.filter((c) => c.file)
  if (!usable.length) continue
  const rows = Math.ceil(usable.length / COLUMNS)
  const tiles = []
  for (const [i, candidate] of usable.entries()) {
    const left = (i % COLUMNS) * CELL_W
    const top = Math.floor(i / COLUMNS) * (CELL_H + LABEL_H)
    const image = sharp(path.join(FIGURES, slug, candidate.file)).resize(CELL_W - 16, CELL_H - 16, { fit: 'contain', background: '#ffffff' })
    const meta = await sharp(path.join(FIGURES, slug, candidate.file)).metadata()
    tiles.push({ input: await image.png().toBuffer(), left: left + 8, top: top + 8 })
    const label = `${candidate.id} ${candidate.kind}${candidate.parts > 1 ? ` (${candidate.parts} parts)` : ''} ${meta.width}x${meta.height}`
    tiles.push({
      input: Buffer.from(`<svg width="${CELL_W}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#1e293b"/><text x="8" y="19" font-family="Helvetica, Arial" font-size="15" fill="#fff">${escapeXml(label)}</text></svg>`),
      left,
      top: top + CELL_H,
    })
  }
  const sheet = sharp({ create: { width: CELL_W * COLUMNS, height: rows * (CELL_H + LABEL_H), channels: 3, background: '#cbd5e1' } })
  await sheet.composite(tiles).png().toFile(path.join(FIGURES, slug, 'sheet.png'))
  console.log(`${slug}: ${usable.length} candidates -> media-src/figures/${slug}/sheet.png`)
}
