<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as team } from '@data/team.data'
import { data as projects } from '@data/projects.data'
import type { Paper } from '../node/bib'
import BibtexButton from './BibtexButton.vue'
import Icon from './Icon.vue'

// `current` is the URL of the page showing the entry, so a paper does not link to the page it is on.
const props = defineProps<{ paper: Paper; showProjects?: boolean; current?: string }>()

// Author names that match a team member (or one of their aliases) link to that person.
const people = new Map<string, string | undefined>()
for (const person of team.people) {
  for (const name of [person.name, ...(person.aliases ?? [])]) people.set(name, person.url)
}

const links = computed(() => {
  const p = props.paper
  const out: { kind: string; label: string; url: string }[] = []
  if (p.page && p.page !== props.current) out.push({ kind: 'website', label: 'Project page', url: withBase(p.page) })
  if (p.doi) out.push({ kind: 'paper', label: 'Paper', url: `https://doi.org/${p.doi}` })
  if (p.arxiv) out.push({ kind: 'arxiv', label: 'arXiv', url: `https://arxiv.org/abs/${p.arxiv}` })
  if (!p.doi && !p.arxiv && p.url) out.push({ kind: 'paper', label: 'Paper', url: p.url })
  if (p.pdf) out.push({ kind: 'pdf', label: 'PDF', url: p.pdf.startsWith('/') ? withBase(p.pdf) : p.pdf })
  if (p.code) out.push({ kind: 'github', label: 'Code', url: p.code })
  if (p.video) out.push({ kind: 'video', label: 'Video', url: p.video })
  return out
})

const titleUrl = computed(() => links.value[0]?.url)
const tags = computed(() =>
  props.showProjects ? projects.filter((project) => project.listed && props.paper.projects.includes(project.slug)) : [],
)
</script>

<template>
  <article class="utk-paper">
    <h3 class="utk-paper-title">
      <a v-if="titleUrl" :href="titleUrl">{{ paper.title }}</a>
      <template v-else>{{ paper.title }}</template>
    </h3>
    <p class="utk-paper-authors">
      <template v-for="(author, i) in paper.authors" :key="author + i">
        <a v-if="people.get(author)" :href="people.get(author)" target="_blank" rel="noopener">{{ author }}</a>
        <span v-else>{{ author }}</span>
        <template v-if="i < paper.authors.length - 1">, </template>
      </template>
    </p>
    <p class="utk-paper-venue">
      {{ paper.venue }}<template v-if="paper.presented"> ({{ paper.presented }})</template>, {{ paper.year }}
      <span v-if="paper.award" class="utk-badge utk-paper-award"><Icon name="award" />{{ paper.award }}</span>
    </p>
    <div class="utk-paper-actions">
      <a v-for="link in links" :key="link.url" class="utk-paper-link" :href="link.url">
        <Icon :name="link.kind" />{{ link.label }}
      </a>
      <BibtexButton :bibtex="paper.bibtex" />
      <a v-for="project in tags" :key="project.slug" class="utk-paper-project" :href="withBase(project.url)">
        <span class="utk-dot" :style="{ '--utk-dot': project.accent }" aria-hidden="true" />{{ project.name }}
      </a>
    </div>
  </article>
</template>

<style scoped>
.utk-paper {
  padding: 18px 0;
  border-top: 1px solid var(--vp-c-divider);
}

.utk-paper-title {
  margin: 0;
  font-size: 1.02rem;
  line-height: 1.45;
  font-weight: 650;
}

.utk-paper-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.utk-paper-title a:hover {
  color: var(--vp-c-brand-1);
}

.utk-paper-authors,
.utk-paper-venue {
  margin: 4px 0 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.utk-paper-authors a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--vp-c-divider);
  text-underline-offset: 3px;
}

.utk-paper-authors a:hover {
  color: var(--vp-c-brand-1);
}

.utk-paper-venue {
  font-style: italic;
}

.utk-paper-award {
  margin-left: 8px;
  font-style: normal;
}

.utk-paper-award svg {
  width: 13px;
  height: 13px;
}

.utk-paper-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.utk-paper-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 22px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}

.utk-paper-link:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.utk-paper-link svg {
  width: 13px;
  height: 13px;
}

.utk-paper-project {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.utk-paper-project:hover {
  color: var(--vp-c-text-1);
}
</style>
