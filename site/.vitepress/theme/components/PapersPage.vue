<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { data as papers } from '@data/papers.data'
import { data as projects } from '@data/projects.data'
import PaperEntry from './PaperEntry.vue'

// Every paper, newest first, grouped by year. The full list is prerendered; the project filter
// (also reachable as /papers/?project=<slug>) only applies once the page has loaded.
const active = ref<string | null>(null)

const filters = computed(() =>
  projects.filter((p) => p.listed && papers.some((paper) => paper.projects.includes(p.slug))),
)

const years = computed(() => {
  const shown = active.value ? papers.filter((p) => p.projects.includes(active.value!)) : papers
  const groups = new Map<number, typeof papers>()
  for (const paper of shown) groups.set(paper.year, [...(groups.get(paper.year) ?? []), paper])
  return [...groups]
})

function select(slug: string | null) {
  active.value = slug
  const url = new URL(window.location.href)
  if (slug) url.searchParams.set('project', slug)
  else url.searchParams.delete('project')
  history.replaceState(history.state, '', url)
}

onMounted(() => {
  const wanted = new URLSearchParams(window.location.search).get('project')
  if (wanted && filters.value.some((p) => p.slug === wanted)) active.value = wanted
})
</script>

<template>
  <div class="utk-papers vp-raw">
    <div class="utk-papers-filters" role="group" aria-label="Filter by project">
      <button type="button" :aria-pressed="active === null" @click="select(null)">All</button>
      <button
        v-for="project in filters"
        :key="project.slug"
        type="button"
        :aria-pressed="active === project.slug"
        @click="select(project.slug)"
      >
        <span class="utk-dot" :style="{ '--utk-dot': project.accent }" aria-hidden="true" />{{ project.name }}
      </button>
    </div>
    <section v-for="[year, entries] in years" :id="String(year)" :key="year" class="utk-papers-year">
      <h2>{{ year }}</h2>
      <PaperEntry v-for="paper in entries" :key="paper.key" :paper="paper" show-projects />
    </section>
  </div>
</template>

<style scoped>
.utk-papers-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 12px;
}

.utk-papers-filters button {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  transition: border-color 0.2s, color 0.2s, background-color 0.2s;
}

.utk-papers-filters button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.utk-papers-filters button[aria-pressed='true'] {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.utk-papers-year {
  scroll-margin-top: calc(var(--vp-nav-height) + 16px);
}

.utk-papers-year h2 {
  margin: 36px 0 4px;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}
</style>
