<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as papers } from '@data/papers.data'
import Icon from './Icon.vue'

interface Link {
  kind: string
  url?: string
  bib?: string
  label?: string
  primary?: boolean
}

const LABELS: Record<string, string> = {
  website: 'Website',
  demo: 'Try it',
  docs: 'Docs',
  install: 'Install',
  github: 'Code',
  paper: 'Paper',
  arxiv: 'arXiv',
  pdf: 'PDF',
  video: 'Video',
  data: 'Data',
  survey: 'Interactive survey',
  pypi: 'PyPI',
  npm: 'npm',
  discord: 'Discord',
  tutorials: 'Tutorials',
}

const props = defineProps<{ links: Link[] }>()

// A `paper` link with a bib key expands into the DOI and arXiv links of that entry.
const buttons = computed(() => {
  const out: { kind: string; url: string; label: string; primary: boolean }[] = []
  for (const link of props.links) {
    if (link.bib) {
      const paper = papers.find((p) => p.key === link.bib)
      if (!paper) throw new Error(`unknown bib key in links: ${link.bib}`)
      if (paper.doi) out.push({ kind: 'paper', url: `https://doi.org/${paper.doi}`, label: link.label ?? 'Paper', primary: !!link.primary })
      if (paper.arxiv) out.push({ kind: 'arxiv', url: `https://arxiv.org/abs/${paper.arxiv}`, label: 'arXiv', primary: false })
      if (!paper.doi && !paper.arxiv && paper.url) out.push({ kind: 'paper', url: paper.url, label: link.label ?? 'Paper', primary: !!link.primary })
    } else if (link.url) {
      out.push({ kind: link.kind, url: link.url, label: link.label ?? LABELS[link.kind] ?? link.kind, primary: !!link.primary })
    }
  }
  if (out.length && !out.some((b) => b.primary)) out[0].primary = true
  return out
})

function href(url: string): string {
  return url.startsWith('/') ? withBase(url) : url
}
</script>

<template>
  <nav v-if="buttons.length" class="utk-links" aria-label="Project links">
    <a
      v-for="button in buttons"
      :key="button.url"
      class="utk-button"
      :class="{ 'utk-button--primary': button.primary }"
      :href="href(button.url)"
      :target="button.url.startsWith('/') ? undefined : '_blank'"
      :rel="button.url.startsWith('/') ? undefined : 'noopener'"
    >
      <Icon :name="button.kind" />
      {{ button.label }}
    </a>
  </nav>
</template>

<style scoped>
.utk-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
