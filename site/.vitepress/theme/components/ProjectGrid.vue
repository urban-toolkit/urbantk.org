<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as projects } from '@data/projects.data'
import HomeOthers from './HomeOthers.vue'
import ProjectRow from './ProjectRow.vue'

interface Category {
  id: string
  heading: string
  anchor: string
  fillLight: string
  fillDark: string
  inkLight: string
  inkDark: string
}

// The home page's projects: one column per category, in the old site's order, tinted like the category's
// arc in the hero diagram. The columns keep the old section anchors (/#grammars, /#ai-ml, ...).
const { theme } = useData()
const columns = computed(() => {
  const { categories, homeOrder } = theme.value.utk as { categories: Category[]; homeOrder: string[] }
  return homeOrder
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is Category => !!c)
    .map((c) => ({ ...c, projects: projects.filter((p) => p.listed && p.category === c.id) }))
    .filter((c) => c.projects.length > 0)
})
</script>

<template>
  <section id="projects" class="utk-section utk-home-projects vp-raw">
    <div class="utk-container">
      <header class="utk-section-header">
        <h2 class="utk-section-title">Projects</h2>
        <div class="utk-section-divider" aria-hidden="true" />
      </header>
      <div class="utk-columns">
        <section
          v-for="column in columns"
          :id="column.anchor"
          :key="column.id"
          class="utk-column"
          :style="{ '--f-l': column.fillLight, '--f-d': column.fillDark, '--i-l': column.inkLight, '--i-d': column.inkDark }"
        >
          <h3 class="utk-column-title">{{ column.heading }}</h3>
          <ul>
            <li v-for="project in column.projects" :key="project.slug">
              <ProjectRow :project="project" />
            </li>
          </ul>
          <HomeOthers v-if="column.id === 'knowledge'" />
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.utk-home-projects {
  padding-bottom: 24px;
  scroll-margin-top: var(--vp-nav-height);
}

.utk-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  align-items: start;
}

.utk-column {
  padding: 16px;
  border-radius: var(--utk-radius);
  background: var(--f-l);
  scroll-margin-top: calc(var(--vp-nav-height) + 16px);
}

.dark .utk-column {
  background: var(--f-d);
}

.utk-column-title {
  margin: 0 0 12px;
  font-size: 0.8rem;
  font-weight: 800;
  line-height: 1.4;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--i-l);
}

.dark .utk-column-title {
  color: var(--i-d);
}

.utk-column ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
