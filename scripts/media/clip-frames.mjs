// A frame sheet per scene of a Curio tour recording, to choose where each clip starts and ends.
//
// node scripts/media/clip-frames.mjs <recording-dir> [scene ...]
//
// <recording-dir> holds curio-feature-tour.webm and curio-feature-tour.marks.json, as written by curio's
// test_feature_tour_video.py. Sheets go to <recording-dir>/frames/<scene>.png, one frame every STEP
// seconds, each labeled with its time since the scene started.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import ffmpeg from 'ffmpeg-static'
import sharp from 'sharp'

const STEP = 1.5
const W = 400
const H = 250

const [dir, ...wanted] = process.argv.slice(2)
if (!dir) throw new Error('usage: clip-frames.mjs <recording-dir> [scene ...]')
const video = path.join(dir, 'curio-feature-tour.webm')
const { marks } = JSON.parse(await fs.readFile(path.join(dir, 'curio-feature-tour.marks.json'), 'utf8'))
const out = path.join(dir, 'frames')
await fs.mkdir(out, { recursive: true })

const scenes = marks
  .filter((m) => m.event === 'start')
  .map((start) => ({
    name: start.name,
    start: start.seconds,
    end: marks.find((m) => m.name === start.name && m.event !== 'start')?.seconds ?? start.seconds + 30,
  }))

for (const scene of scenes) {
  if (wanted.length && !wanted.includes(scene.name)) continue
  const tiles = []
  const times = []
  for (let t = 0; t <= scene.end - scene.start; t += STEP) times.push(t)
  for (const [i, t] of times.entries()) {
    const png = execFileSync(ffmpeg, ['-v', 'error', '-ss', String(scene.start + t), '-i', video, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], { maxBuffer: 64 * 1024 * 1024 })
    const left = (i % 5) * W
    const top = Math.floor(i / 5) * (H + 22)
    tiles.push({ input: await sharp(png).resize(W, H, { fit: 'contain', background: '#000' }).png().toBuffer(), left, top })
    tiles.push({ input: Buffer.from(`<svg width="${W}" height="22"><rect width="100%" height="100%" fill="#111"/><text x="6" y="16" font-family="Helvetica" font-size="14" fill="#fff">${scene.name} +${t.toFixed(1)}s</text></svg>`), left, top: top + H })
  }
  const rows = Math.ceil(times.length / 5)
  await sharp({ create: { width: 5 * W, height: rows * (H + 22), channels: 3, background: '#333' } })
    .composite(tiles)
    .png()
    .toFile(path.join(out, `${scene.name}.png`))
  console.log(`${scene.name}: ${(scene.end - scene.start).toFixed(1)} s, ${times.length} frames -> ${path.join(out, `${scene.name}.png`)}`)
}
