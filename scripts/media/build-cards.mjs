// Crops each project's home page card (site/public/media/projects/<slug>/card.webp, 960x540) from the image
// its page leads with (`hero.image` in site/projects/<slug>.md), around the most salient region.
// Run from the repo root after the lead images exist: node scripts/media/build-cards.mjs [slug ...]

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const PROJECTS = path.join(ROOT, 'site/projects')
const wanted = process.argv.slice(2)

for (const file of (await fs.readdir(PROJECTS)).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
  const slug = file.slice(0, -3)
  if (wanted.length && !wanted.includes(slug)) continue
  const frontmatter = (await fs.readFile(path.join(PROJECTS, file), 'utf8')).split('\n---', 1)[0]
  const hero = frontmatter.match(/^hero:\n(?:\s+.*\n)*?\s+image:\s*"?([^"\n]+)"?/m)?.[1]
  if (!hero) {
    console.log(`${slug.padEnd(13)} no hero image, no card`)
    continue
  }
  const info = await sharp(path.join(ROOT, 'site/public', hero))
    .resize(960, 540, { fit: 'cover', position: sharp.strategy.attention })
    .webp({ quality: 82 })
    .toFile(path.join(ROOT, 'site/public/media/projects', slug, 'card.webp'))
  console.log(`${slug.padEnd(13)} card.webp from ${path.basename(hero)} ${Math.round(info.size / 1024)} KB`)
}
