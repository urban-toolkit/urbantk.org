<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as projects } from '@data/projects.data'
import { accentStyle } from '../composables/accent'
import ProjectLogo from './ProjectLogo.vue'

// Every listed project as a logo under the hero buttons, in menu order.
const { theme } = useData()
const listed = computed(() => {
  const order = theme.value.utk.categories.map((c: { id: string }) => c.id)
  return projects
    .filter((p) => p.listed)
    .sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.order - b.order)
})
</script>

<template>
  <nav class="utk-strip" aria-label="Projects">
    <a v-for="project in listed" :key="project.slug" :href="withBase(project.url)" :title="project.name" :style="accentStyle(project)">
      <ProjectLogo :project="project" size="md" />
      <span>{{ project.name }}</span>
    </a>
  </nav>
</template>

<style scoped>
.utk-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px 18px;
  margin: 36px auto 0;
  max-width: 1040px;
}

.utk-strip a {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 72px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  transition: color 0.2s, transform 0.2s;
}

.utk-strip a:hover {
  color: var(--vp-c-text-1);
  transform: translateY(-2px);
}

.utk-strip a:hover :deep(.utk-logo) {
  box-shadow: 0 0 0 2px var(--p-light);
}

.dark .utk-strip a:hover :deep(.utk-logo) {
  box-shadow: 0 0 0 2px var(--p-dark);
}
</style>
