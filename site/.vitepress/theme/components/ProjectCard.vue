<script setup lang="ts">
import { withBase } from 'vitepress'
import type { ProjectSummary } from '../node/projects'
import { accentStyle } from '../composables/accent'
import ProjectLogo from './ProjectLogo.vue'

defineProps<{ project: ProjectSummary; compact?: boolean }>()
</script>

<template>
  <a class="utk-card utk-accent" :class="{ 'utk-card--compact': compact }" :href="withBase(project.url)" :style="accentStyle(project)">
    <div v-if="!compact" class="utk-card-media">
      <img v-if="project.image" :src="withBase(project.image)" :alt="project.imageAlt" loading="lazy" />
      <div v-else class="utk-card-placeholder" aria-hidden="true">{{ project.name }}</div>
      <ProjectLogo class="utk-card-logo" :project="project" size="sm" />
    </div>
    <div class="utk-card-body">
      <div class="utk-card-heading">
        <ProjectLogo v-if="compact" :project="project" size="sm" />
        <h3 class="utk-card-title">{{ project.name }}</h3>
      </div>
      <p class="utk-card-text">{{ project.tagline }}</p>
      <p v-if="project.venue && !compact" class="utk-card-meta"><span class="utk-badge">{{ project.venue }}</span></p>
    </div>
  </a>
</template>

<style scoped>
.utk-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--utk-radius);
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
}

.utk-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: var(--p-raw);
  z-index: 2;
}

.utk-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: var(--utk-shadow);
  transform: translateY(-2px);
}

.utk-card-media {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
}

.utk-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.utk-card:hover .utk-card-media img {
  transform: scale(1.03);
}

.utk-card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, var(--vp-c-brand-soft), transparent);
  color: var(--vp-c-brand-1);
  font-size: 1.5rem;
  font-weight: 800;
}

.utk-card-logo {
  position: absolute;
  left: 14px;
  bottom: 14px;
}

.utk-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 16px 20px 20px;
}

.utk-card-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.utk-card-title {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.35;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.utk-card-text {
  margin: 6px 0 0;
  font-size: 0.94rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.utk-card-meta {
  margin: auto 0 0;
  padding-top: 14px;
}

.utk-card--compact .utk-card-body {
  padding: 18px 20px;
}
</style>
