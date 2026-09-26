<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as projects } from '@data/projects.data'
import ProjectCard from './ProjectCard.vue'
import HomeOthers from './HomeOthers.vue'

// The home page sections: one per category, in the order of the old site.
const { theme } = useData()
const sections = computed(() => {
  const { categories, homeOrder } = theme.value.utk
  return homeOrder
    .map((id: string) => categories.find((c: { id: string }) => c.id === id))
    .map((category: { id: string; heading: string; anchor: string }) => ({
      ...category,
      projects: projects.filter((p) => p.listed && p.category === category.id),
    }))
    .filter((section: { projects: unknown[] }) => section.projects.length > 0)
})
</script>

<template>
  <div id="projects" class="utk-home-projects vp-raw">
    <section v-for="section in sections" :id="section.anchor" :key="section.id" class="utk-section">
      <div class="utk-container">
        <header class="utk-section-header">
          <h2 class="utk-section-title">{{ section.heading }}</h2>
          <div class="utk-section-divider" aria-hidden="true" />
        </header>
        <div class="utk-grid">
          <ProjectCard v-for="project in section.projects" :key="project.slug" :project="project" />
        </div>
        <HomeOthers v-if="section.id === 'knowledge'" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.utk-home-projects {
  padding-bottom: 64px;
}

.utk-section {
  scroll-margin-top: calc(var(--vp-nav-height) + 16px);
}
</style>
