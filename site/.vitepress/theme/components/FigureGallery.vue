<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'
import { data as papers } from '@data/papers.data'
import Icon from './Icon.vue'

interface Figure {
  src: string
  w: number
  h: number
  caption: string
  alt?: string
  credit?: string
}

defineProps<{ figures: Figure[] }>()

const dialog = ref<HTMLDialogElement>()
const current = ref<Figure | null>(null)

function credit(key?: string): string {
  if (!key) return ''
  const paper = papers.find((p) => p.key === key)
  if (!paper) throw new Error(`figure credit: unknown bib key ${key}`)
  const first = paper.authors[0]?.split(' ').pop()
  return `${first}${paper.authors.length > 1 ? ' et al.' : ''} (${paper.year})`
}

function open(figure: Figure) {
  current.value = figure
  dialog.value?.showModal()
}
</script>

<template>
  <div class="utk-figures">
    <figure v-for="figure in figures" :key="figure.src" class="utk-figure" :class="{ 'utk-figure--wide': figure.w / figure.h > 2.2 }">
      <button type="button" class="utk-figure-zoom" :aria-label="`Enlarge: ${figure.alt ?? figure.caption}`" @click="open(figure)">
        <img :src="withBase(figure.src)" :width="figure.w" :height="figure.h" :alt="figure.alt ?? figure.caption" loading="lazy" />
        <span class="utk-figure-zoom-icon"><Icon name="zoom" /></span>
      </button>
      <figcaption>
        {{ figure.caption }}
        <span v-if="figure.credit" class="utk-figure-credit">Figure from {{ credit(figure.credit) }}.</span>
      </figcaption>
    </figure>
    <dialog ref="dialog" class="utk-figure-dialog" @click.self="dialog?.close()">
      <template v-if="current">
        <button type="button" class="utk-figure-close" aria-label="Close" @click="dialog?.close()"><Icon name="close" /></button>
        <img :src="withBase(current.src)" :alt="current.alt ?? current.caption" />
        <p>{{ current.caption }}</p>
      </template>
    </dialog>
  </div>
</template>

<style scoped>
.utk-figures {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr));
  gap: 28px 24px;
}

.utk-figure {
  margin: 0;
}

/* Wide strips (typical of paper figures) get the full row, or their text would be unreadable. */
.utk-figure--wide {
  grid-column: 1 / -1;
}

.utk-figure-zoom {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--utk-radius-sm);
  background: #fff;
  overflow: hidden;
  cursor: zoom-in;
}

.utk-figure-zoom img {
  display: block;
  width: 100%;
  height: auto;
}

.utk-figure-zoom-icon {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  padding: 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.7);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}

.utk-figure-zoom:hover .utk-figure-zoom-icon,
.utk-figure-zoom:focus-visible .utk-figure-zoom-icon {
  opacity: 1;
}

.utk-figure-zoom-icon svg {
  width: 16px;
  height: 16px;
}

.utk-figure figcaption {
  margin-top: 10px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.utk-figure-credit {
  display: block;
  margin-top: 2px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.utk-figure-dialog {
  max-width: min(96vw, 1600px);
  max-height: 94vh;
  padding: 16px;
  border: 0;
  border-radius: var(--utk-radius);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.utk-figure-dialog::backdrop {
  background: rgba(0, 0, 0, 0.75);
}

.utk-figure-dialog img {
  display: block;
  max-width: 100%;
  max-height: calc(94vh - 110px);
  margin: 0 auto;
  background: #fff;
  border-radius: var(--utk-radius-sm);
}

.utk-figure-dialog p {
  margin: 12px 0 0;
  max-width: 900px;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.utk-figure-close {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  padding: 6px;
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
}

.utk-figure-close svg {
  width: 18px;
  height: 18px;
}
</style>
