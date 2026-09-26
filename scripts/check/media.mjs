// Size budgets for site/public and the built site. GitHub rejects files over 100 MB and caps a Pages site
// at 1 GB, and every byte committed stays in the repository's history, so media is kept small.
//
// node scripts/check/media.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const PUBLIC = path.join(ROOT, 'site/public')
const DIST = path.join(ROOT, 'site/.vitepress/dist')
const KB = 1024
const MB = 1024 * KB

const LIMITS = {
  image: { ext: ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.avif'], max: 500 * KB },
  clip: { ext: ['.mp4', '.webm'], max: 3 * MB },
}
const FORBIDDEN = ['.gif', '.tif', '.tiff', '.mov', '.avi', '.psd']
const MAX_FILE = 50 * MB
const MAX_DIST = 300 * MB

function files(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? files(full) : [full]
  })
}

const problems = []
for (const file of files(PUBLIC)) {
  const ext = path.extname(file).toLowerCase()
  const size = fs.statSync(file).size
  const rel = path.relative(ROOT, file)
  if (FORBIDDEN.includes(ext)) problems.push(`${rel}: ${ext} files are not allowed (use WebP for images, MP4 for clips)`)
  for (const [kind, { ext: exts, max }] of Object.entries(LIMITS)) {
    if (exts.includes(ext) && size > max) problems.push(`${rel}: ${Math.round(size / KB)} KB is over the ${kind} budget of ${Math.round(max / KB)} KB`)
  }
  if (size > MAX_FILE) problems.push(`${rel}: ${Math.round(size / MB)} MB is over the ${MAX_FILE / MB} MB file limit`)
}

const distSize = files(DIST).reduce((sum, file) => sum + fs.statSync(file).size, 0)
if (distSize > MAX_DIST) problems.push(`the built site is ${Math.round(distSize / MB)} MB, over the ${MAX_DIST / MB} MB budget`)
console.log(`media: ${files(PUBLIC).length} files in site/public, built site ${Math.round(distSize / MB)} MB`)

for (const problem of problems) console.error(`  ${problem}`)
if (problems.length) {
  console.error(`${problems.length} problem(s)`)
  process.exit(1)
}
