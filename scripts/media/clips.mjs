// Cuts the Curio feature clips listed in scripts/media/clips.json out of a tour recording.
//
// node scripts/media/clips.mjs <recording-dir>
//
// <recording-dir> holds curio-feature-tour.webm and curio-feature-tour.marks.json (curio's
// test_feature_tour_video.py with CURIO_TOUR_CAPTIONS=0). Each clip's window is given in seconds after
// its scene's start mark, so a new recording of the same scenes can reuse the file. Writes
// site/public/media/projects/curio/clips/<id>.mp4 (H.264, no audio, faststart, 0.25 s fades) and a WebP
// poster <id>.webp, and prints their sizes for the page frontmatter.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpeg from 'ffmpeg-static'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const OUT = path.join(ROOT, 'site/public/media/projects/curio/clips')
const FADE = 0.25

const dir = process.argv[2]
if (!dir) throw new Error('usage: clips.mjs <recording-dir>')
const video = path.join(dir, 'curio-feature-tour.webm')
const { marks } = JSON.parse(await fs.readFile(path.join(dir, 'curio-feature-tour.marks.json'), 'utf8'))
const { clips } = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/media/clips.json'), 'utf8'))
await fs.mkdir(OUT, { recursive: true })

for (const clip of clips) {
  const start = marks.find((m) => m.name === clip.scene && m.event === 'start')
  if (!start) throw new Error(`${clip.id}: scene ${clip.scene} is not in the recording`)
  const from = start.seconds + clip.from
  const duration = clip.to - clip.from
  const mp4 = path.join(OUT, `${clip.id}.mp4`)
  execFileSync(ffmpeg, [
    '-v', 'error', '-y',
    '-ss', from.toFixed(2), '-t', duration.toFixed(2), '-i', video,
    '-an',
    '-vf', `fps=30,scale=1280:-2,fade=t=in:st=0:d=${FADE},fade=t=out:st=${(duration - FADE).toFixed(2)}:d=${FADE}`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(clip.crf ?? 27), '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    mp4,
  ])
  const frame = execFileSync(ffmpeg, ['-v', 'error', '-ss', (start.seconds + (clip.poster ?? clip.from + 1)).toFixed(2), '-i', video, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], { maxBuffer: 64 * 1024 * 1024 })
  const poster = await sharp(frame).resize({ width: 1280 }).webp({ quality: 80 }).toFile(path.join(OUT, `${clip.id}.webp`))
  const size = (await fs.stat(mp4)).size
  console.log(`${clip.id.padEnd(18)} ${duration.toFixed(1)} s  ${(size / 1024 / 1024).toFixed(2)} MB  poster ${poster.width}x${poster.height} ${Math.round(poster.size / 1024)} KB`)
}
