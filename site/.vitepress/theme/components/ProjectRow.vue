<script setup lang="ts">
import { withBase } from 'vitepress'
import type { ProjectSummary } from '../node/projects'
import { accentStyle } from '../composables/accent'
import ProjectLogo from './ProjectLogo.vue'

// One project as a compact row: logo, name and tagline. Used by the home page columns and by the
// related projects at the bottom of each project page.
defineProps<{ project: ProjectSummary }>()
</script>

<template>
  <a class="utk-row" :href="withBase(project.url)" :style="accentStyle(project)">
    <ProjectLogo :project="project" size="sm" />
    <span class="utk-row-text">
      <strong>{{ project.name }}</strong>
      <small>{{ project.tagline }}</small>
    </span>
  </a>
</template>

<style scoped>
.utk-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--utk-radius-sm);
  background: var(--vp-c-bg);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.utk-row:hover,
.utk-row:focus-visible {
  border-color: var(--p-light);
  box-shadow: var(--utk-shadow);
  transform: translateY(-1px);
}

.dark .utk-row:hover,
.dark .utk-row:focus-visible {
  border-color: var(--p-dark);
}

.utk-row-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.utk-row-text strong {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

.utk-row-text small {
  font-size: 0.82rem;
  line-height: 1.4;
  color: var(--vp-c-text-2);
}

@media (prefers-reduced-motion: reduce) {
  .utk-row {
    transition: none;
  }
}
</style>
