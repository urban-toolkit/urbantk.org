// One-time: builds the site's images from the WordPress export (migration/raw/uploads) and sibling repos.
// Logos become small PNGs, photos and figures become WebP of at most 1600 px, and news images are
// converted to WebP with their Markdown references updated.
//
// Run from the repo root after scripts/migrate/wp-export.mjs: node scripts/media/prepare-assets.mjs

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import ffmpeg from 'ffmpeg-static'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const RAW = path.join(ROOT, 'migration/raw/uploads')
const PUBLIC = path.join(ROOT, 'site/public')
const MEDIA = path.join(PUBLIC, 'media')
const WORKSPACE = path.resolve(ROOT, '..')

const src = (p) => path.join(RAW, p)

// Square logos and icons: fit inside size x size on a transparent background.
const LOGOS = [
  { from: src('2023/06/logo-utk-circle-1.png'), to: 'brand/utk-logo.png', size: 192 },
  { from: src('2023/06/logo-utk-circle-1.png'), to: '../favicon-192.png', size: 192 },
  { from: src('2023/06/logo-utk-circle-1.png'), to: '../favicon-32.png', size: 32 },
  { from: src('2024/06/logo.png'), to: 'projects/curio/logo.webp', size: 160 },
  { from: src('2025/04/logo-white.png'), to: 'projects/urbanite/logo.webp', size: 160 },
  { from: src('2023/06/logo-utk-circle-1.png'), to: 'projects/utk/logo.webp', size: 160 },
  { from: src('2025/08/streetweave.png'), to: 'projects/streetweave/logo.webp', size: 160 },
  { from: src('2025/04/logo_gray_background_grid.png'), to: 'projects/va-blueprint/logo.webp', size: 160 },
  { from: src('2026/04/atmos_logo-1.png'), to: 'projects/atmos/logo.webp', size: 160 },
  { from: src('2026/04/logo.png'), to: 'projects/vitral/logo.webp', size: 160 },
  { from: src('2026/04/icon.png'), to: 'projects/scout/logo.webp', size: 160 },
]

// Logos shown on a wide strip (footer): fixed height.
const STRIPS = [
  { from: src('2025/08/new_logo_FullText.png'), to: 'institutions/evl.png', height: 96 },
  { from: src('2025/08/CAMP.CIRC_.SM_.BLK_.RGB_.png'), to: 'institutions/uic.png', height: 96 },
]

// Images from the old pages and sibling repos that no paper figure (build-figures.mjs) replaces.
const IMAGES = [
  { from: src('2023/12/overview-1.jpg'), to: 'projects/tile2net/overview.webp' },
  { from: path.join(WORKSPACE, 'curio-main/docs/images/banner.jpg'), to: 'projects/curio/banner.webp' },
  // The 2023 UTK post's featured image is private in WordPress; the wide UTK logo stands in.
  { from: src('2023/06/logo-utk-wide-1-scaled-1.jpg'), to: 'news/utk-accepted-to-ieee-vis-2023/utk-wide.webp' },
]

// Wide frames from the project videos (in the WordPress export) for projects with no paper source to
// take a figure from. `crop` is [x, y, w, h] in the video's own pixels.
const STILLS = [
  { from: src('2026/04/SCOUT-video-updated.mp4'), at: 345, crop: [0, 456, 3624, 1368], to: 'projects/scout/teaser.webp' },
  { from: src('2026/04/vis-atmos-video.mp4'), at: 278, crop: [0, 62, 1920, 956], to: 'projects/atmos/teaser.webp' },
  { from: src('2026/04/Stewards-VIS-2026-video.mp4'), at: 100.5, crop: [185, 163, 1478, 816], to: 'projects/sidewalk/teaser.webp' },
  { from: src('2026/04/vitral_video_v5.mp4'), at: 282.8, crop: [0, 0, 1920, 924], to: 'projects/vitral/teaser.webp' },
]

// Home page diagram: circle images from the 2026 NSF CSSI poster (scripts/media/poster-bubbles.py extracts
// them into media-src/poster/, which is not committed; these are skipped when it is missing).
const POSTER = path.join(ROOT, 'media-src/poster')
const BUBBLES = [
  { from: 'shadows.png', to: 'projects/shadows/bubble.webp' },
  { from: 'neural-3d.png', to: 'projects/neural-3d/bubble.webp' },
  { from: 'sidewalk.png', to: 'projects/sidewalk/bubble.webp' },
]

async function input(from) {
  if (!from.startsWith('http')) return from
  const res = await fetch(from)
  if (!res.ok) throw new Error(`${res.status} ${from}`)
  return Buffer.from(await res.arrayBuffer())
}

async function write(image, to) {
  const out = path.join(MEDIA, to)
  await fs.mkdir(path.dirname(out), { recursive: true })
  const info = await image.toFile(out)
  console.log(`${path.relative(ROOT, out)}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`)
  return info
}

// Project logos show at most 72 px wide, so 160 px WebP covers 2x screens; the brand logo and
// favicons stay PNG for the browser tab and the navbar.
for (const { from, to, size } of LOGOS) {
  const image = sharp(await input(from))
    .trim({ threshold: 5 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  await write(to.endsWith('.webp') ? image.webp({ quality: 90 }) : image.png({ compressionLevel: 9, palette: size <= 64 }), to)
}

for (const { from, to, height } of STRIPS) {
  await write(sharp(await input(from)).trim({ threshold: 5 }).resize({ height }).png({ compressionLevel: 9 }), to)
}

for (const { from, to } of IMAGES) {
  await write(sharp(await input(from)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }), to)
}

for (const { from, at, crop, to } of STILLS) {
  const png = execFileSync(ffmpeg, ['-v', 'error', '-ss', String(at), '-i', from, '-frames:v', '1', '-vf', `crop=${crop[2]}:${crop[3]}:${crop[0]}:${crop[1]}`, '-f', 'image2pipe', '-vcodec', 'png', '-'], { maxBuffer: 1 << 28 })
  await write(sharp(png).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }), to)
}

// The diagram's center: the UrbanTK logo, larger than the navbar copy.
await write(sharp(src('2023/06/logo-utk-circle-1.png')).resize(512, 512).webp({ quality: 90 }), 'brand/utk-circle.webp')

for (const { from, to } of BUBBLES) {
  const file = path.join(POSTER, from)
  if (!(await fs.stat(file).catch(() => null))) continue
  const { width, height } = await sharp(file).metadata()
  const side = Math.min(width, height)
  await write(
    sharp(file)
      .extract({ left: Math.floor((width - side) / 2), top: Math.floor((height - side) / 2), width: side, height: side })
      .resize(320, 320)
      .flatten({ background: '#ffffff' })
      .webp({ quality: 84 }),
    to,
  )
}
if (await fs.stat(path.join(POSTER, 'autark-wordmark.png')).catch(() => null)) {
  await write(sharp(path.join(POSTER, 'autark-wordmark.png')).trim().resize({ width: 480 }).webp({ quality: 90 }), 'projects/autark/wordmark.webp')
}

// Open Graph image: the wide UTK logo on white, 1200x630.
{
  const logo = await sharp(src('2023/06/logo-utk-wide-1-scaled-1.jpg')).resize({ width: 980 }).toBuffer()
  const meta = await sharp(logo).metadata()
  const card = sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } }).composite([
    { input: logo, left: Math.round((1200 - meta.width) / 2), top: Math.round((630 - meta.height) / 2) },
    { input: Buffer.from('<svg width="1200" height="12"><rect width="1200" height="12" fill="#046bd2"/></svg>'), left: 0, top: 618 },
  ])
  await write(card.png({ compressionLevel: 9 }), 'brand/utk-social.png')
}

// News images: WebP next to the originals, then point the posts at them.
const newsMedia = path.join(MEDIA, 'news')
const renamed = new Map()
for (const slug of await fs.readdir(newsMedia)) {
  for (const file of await fs.readdir(path.join(newsMedia, slug))) {
    if (file.endsWith('.webp') && !file.startsWith('_')) continue
    const from = path.join(newsMedia, slug, file)
    const name = `${file.replace(/\.[a-z0-9]+$/i, '')}.webp`
    await write(sharp(from).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }), path.join('news', slug, name))
    if (name !== file) {
      await fs.rm(from)
      renamed.set(`/media/news/${slug}/${file}`, `/media/news/${slug}/${name}`)
    }
  }
}
async function* markdown(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* markdown(full)
    else if (entry.name.endsWith('.md')) yield full
  }
}
for await (const file of markdown(path.join(ROOT, 'site/news'))) {
  let text = await fs.readFile(file, 'utf8')
  for (const [from, to] of renamed) text = text.split(from).join(to)
  await fs.writeFile(file, text)
}
console.log(`news: ${renamed.size} images converted to WebP`)
