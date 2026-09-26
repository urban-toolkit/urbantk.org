<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as projects } from '@data/projects.data'
import type { ProjectSummary } from '../node/projects'
import { accentStyle } from '../composables/accent'

// The home page hero's diagram, after the 2026 NSF CSSI poster: the logo in the middle, and every listed
// project as a circle on a ring, grouped into one tinted arc per category. It is computed from the project
// pages, so a new project appears in its category's arc with nothing else to edit.
//
// The arcs, lines and labels are SVG; the project circles are HTML links laid over it. VitePress's link
// prefetch reads `pathname` from every link on the page, which SVG <a> elements do not have (1.6.4).

interface Category {
  id: string
  label: string
  anchor: string
  fillLight: string
  fillDark: string
  inkLight: string
  inkDark: string
}

const SIZE = 640
const C = SIZE / 2
const CENTER_R = 128
const RING_R = 232
const SECTOR_IN = CENTER_R + 10
const SECTOR_OUT = C - 6

const { theme } = useData()

function point(r: number, angle: number): [number, number] {
  return [C + r * Math.cos(angle), C + r * Math.sin(angle)]
}

function xy(r: number, angle: number): string {
  return point(r, angle).map((v) => v.toFixed(2)).join(' ')
}

// An annular sector between two angles (clockwise on screen).
function sector(a0: number, a1: number): string {
  const large = a1 - a0 > Math.PI ? 1 : 0
  return `M${xy(SECTOR_OUT, a0)} A${SECTOR_OUT} ${SECTOR_OUT} 0 ${large} 1 ${xy(SECTOR_OUT, a1)} L${xy(SECTOR_IN, a1)} A${SECTOR_IN} ${SECTOR_IN} 0 ${large} 0 ${xy(SECTOR_IN, a0)} Z`
}

// Up to two lines, broken at the space nearest the middle.
function wrap(text: string, max: number): string[] {
  if (text.length <= max || !text.includes(' ')) return [text]
  const middle = text.length / 2
  let best = -1
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ' && (best < 0 || Math.abs(i - middle) < Math.abs(best - middle))) best = i
  }
  return [text.slice(0, best), text.slice(best + 1)]
}

const diagram = computed(() => {
  const { categories, ecosystem } = theme.value.utk as { categories: Category[]; ecosystem: { order: string[]; center: string } }
  const groups = ecosystem.order
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is Category => !!c)
    .map((category) => ({ category, members: projects.filter((p) => p.listed && p.category === category.id) }))
    .filter((g) => g.members.length > 0)

  // One slot per project plus one per category label, evenly around the ring, starting at the left.
  const slots = groups.reduce((n, g) => n + 1 + g.members.length, 0)
  const step = (2 * Math.PI) / Math.max(slots, 1)
  const bubbleR = Math.min(44, RING_R * step * 0.43)

  const ring: { angle: number; half: number }[] = []
  const labels: { key: string; x: number; y: number; lines: string[]; style: Record<string, string> }[] = []
  const bubbles: {
    project: ProjectSummary
    cx: number
    cy: number
    r: number
    lines: string[]
    fontSize: number
  }[] = []
  const sectors: { key: string; d: string; style: Record<string, string> }[] = []

  let slot = 0
  for (const { category, members } of groups) {
    const first = slot
    const angle = Math.PI + slot * step
    const [x, y] = point(RING_R, angle)
    labels.push({
      key: category.id,
      x,
      y,
      lines: wrap(category.label.toUpperCase(), 11),
      style: { '--i-l': category.inkLight, '--i-d': category.inkDark },
    })
    ring.push({ angle, half: step * 0.46 })
    slot++
    for (const project of members) {
      const a = Math.PI + slot * step
      const [cx, cy] = point(RING_R, a)
      const lines = wrap(project.name, 9)
      const longest = Math.max(...lines.map((l) => l.length))
      bubbles.push({ project, cx, cy, r: bubbleR, lines, fontSize: Math.min(12.5, (bubbleR * 1.7) / (longest * 0.6)) })
      ring.push({ angle: a, half: Math.asin(Math.min(1, (bubbleR + 5) / RING_R)) })
      slot++
    }
    sectors.push({
      key: category.id,
      d: sector(Math.PI + (first - 0.5) * step, Math.PI + (slot - 0.5) * step),
      style: { '--f-l': category.fillLight, '--f-d': category.fillDark },
    })
  }

  // The thin arcs joining each item on the ring to the next, stopping short of both.
  const links: string[] = []
  for (let i = 0; i < ring.length && ring.length > 1; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    const start = a.angle + a.half
    const end = (i + 1 === ring.length ? b.angle + 2 * Math.PI : b.angle) - b.half
    if (end > start) links.push(`M${xy(RING_R, start)} A${RING_R} ${RING_R} 0 0 1 ${xy(RING_R, end)}`)
  }

  return { center: ecosystem.center, sectors, labels, bubbles, links }
})

// Positions in percent of the diagram, so the HTML circles follow the SVG as it scales.
function pct(v: number): string {
  return `${((v / SIZE) * 100).toFixed(3)}%`
}

function bubbleStyle(b: { project: ProjectSummary; cx: number; cy: number; r: number; fontSize: number }) {
  return {
    left: pct(b.cx - b.r),
    top: pct(b.cy - b.r),
    width: pct(2 * b.r),
    fontSize: `${((b.fontSize / SIZE) * 100).toFixed(3)}cqw`,
    ...accentStyle(b.project),
  }
}
</script>

<template>
  <div class="utk-eco">
    <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" aria-hidden="true">
      <path v-for="s in diagram.sectors" :key="s.key" class="utk-eco-sector" :d="s.d" :style="s.style" />
      <path v-for="(d, i) in diagram.links" :key="i" class="utk-eco-link" :d="d" />
      <text v-for="l in diagram.labels" :key="l.key" class="utk-eco-label" :style="l.style" text-anchor="middle">
        <tspan
          v-for="(line, i) in l.lines"
          :key="i"
          :x="l.x"
          :y="l.y + (i - (l.lines.length - 1) / 2) * 15 + 4.5"
        >{{ line }}</tspan>
      </text>
      <circle class="utk-eco-center" :cx="C" :cy="C" :r="CENTER_R" />
      <image :href="withBase(diagram.center)" :x="C - CENTER_R" :y="C - CENTER_R" :width="2 * CENTER_R" :height="2 * CENTER_R" />
    </svg>
    <nav aria-label="Projects">
      <a
        v-for="b in diagram.bubbles"
        :key="b.project.slug"
        class="utk-eco-bubble"
        :class="{ 'utk-eco-bubble--fill': b.project.bubble.fill, 'utk-eco-bubble--label': b.project.bubble.label }"
        :href="withBase(b.project.url)"
        :title="`${b.project.name}: ${b.project.tagline}`"
        :style="bubbleStyle(b)"
      >
        <img v-if="b.project.bubble.image" :src="withBase(b.project.bubble.image)" alt="" />
        <span v-if="b.project.bubble.label" class="utk-eco-name">
          <span v-for="(line, i) in b.lines" :key="i">{{ line }}</span>
        </span>
        <span v-else class="utk-visually-hidden">{{ b.project.name }}</span>
      </a>
    </nav>
  </div>
</template>

<style scoped>
.utk-eco {
  position: relative;
  /* Size containment gives the element no width of its own, so it takes the column's. */
  width: 100%;
  container-type: inline-size;
}

.utk-eco svg {
  display: block;
  width: 100%;
  height: auto;
}

.utk-eco-sector {
  fill: var(--f-l);
}

.dark .utk-eco-sector {
  fill: var(--f-d);
}

.utk-eco-link {
  fill: none;
  stroke: var(--vp-c-text-3);
  stroke-width: 1.4;
}

.utk-eco-label {
  fill: var(--i-l);
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.dark .utk-eco-label {
  fill: var(--i-d);
}

.utk-eco-center {
  fill: #fff;
  stroke: var(--vp-c-divider);
  stroke-width: 1.5;
}

.utk-eco-bubble {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.12);
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.utk-eco-bubble:hover,
.utk-eco-bubble:focus-visible {
  z-index: 1;
  transform: scale(1.08);
  box-shadow: 0 0 0 3px var(--p-light), 0 6px 18px rgba(15, 23, 42, 0.18);
  outline: none;
}

.dark .utk-eco-bubble:hover,
.dark .utk-eco-bubble:focus-visible {
  box-shadow: 0 0 0 3px var(--p-dark), 0 6px 18px rgba(0, 0, 0, 0.4);
}

/* A logo sits inside the circle, with the name under it when the logo does not show it. */
.utk-eco-bubble img {
  width: 74%;
  height: 74%;
  object-fit: contain;
}

.utk-eco-bubble--label:not(.utk-eco-bubble--fill) img {
  width: 58%;
  height: 58%;
}

.utk-eco-bubble--label:not(.utk-eco-bubble--fill) .utk-eco-name {
  margin-top: 4%;
  color: #334155;
}

/* An image fills the circle, darkened a little so the name reads over it. */
.utk-eco-bubble--fill img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.utk-eco-bubble--fill.utk-eco-bubble--label::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.3);
}

.utk-eco-name {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
}

.utk-eco-bubble--fill .utk-eco-name {
  text-shadow: 0 1px 3px rgba(15, 23, 42, 0.8);
}

@media (prefers-reduced-motion: reduce) {
  .utk-eco-bubble {
    transition: none;
  }
}
</style>
