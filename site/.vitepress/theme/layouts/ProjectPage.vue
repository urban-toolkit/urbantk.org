<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as papers } from '@data/papers.data'
import { data as projects } from '@data/projects.data'
import { accentStyle } from '../composables/accent'
import CiteBox from '../components/CiteBox.vue'
import FeatureCards from '../components/FeatureCards.vue'
import FeatureGrid from '../components/FeatureGrid.vue'
import LiteYouTube from '../components/LiteYouTube.vue'
import LoopVideo from '../components/LoopVideo.vue'
import PaperEntry from '../components/PaperEntry.vue'
import ProjectCard from '../components/ProjectCard.vue'
import ProjectLinks from '../components/ProjectLinks.vue'
import ProjectLogo from '../components/ProjectLogo.vue'
import TeamList from '../components/TeamList.vue'

// The one template every project page uses (layout: ProjectPage). What differs between projects is
// their accent color, logo and lead image; the structure is shared.
const { frontmatter: fm, page, theme } = useData()

const slug = computed(() => page.value.filePath.replace(/^projects\//, '').replace(/\.md$/, ''))
const project = computed(() => {
  const found = projects.find((p) => p.slug === slug.value)
  if (!found) throw new Error(`no project summary for ${page.value.filePath}`)
  return found
})
const category = computed(() => theme.value.utk.categories.find((c: { id: string }) => c.id === project.value.category))
const primary = computed(() => (fm.value.paper ? papers.find((p) => p.key === fm.value.paper) : undefined))
const venue = computed(() => fm.value.venue ?? primary.value?.presented ?? null)
const projectPapers = computed(() => papers.filter((p) => p.projects.includes(slug.value)))
const related = computed(() =>
  projects.filter((p) => p.listed && p.category === project.value.category && p.slug !== slug.value),
)
const hero = computed(() => fm.value.hero ?? {})
</script>

<template>
  <div class="utk-project utk-accent" :style="accentStyle(project)">
    <header class="utk-project-hero">
      <div class="utk-container">
        <p v-if="category" class="utk-project-category">
          <a :href="withBase(`/#${category.anchor}`)">{{ category.label }}</a>
        </p>
        <div class="utk-project-heading">
          <ProjectLogo :project="project" size="lg" />
          <div>
            <p class="utk-project-name">{{ fm.name }}</p>
            <h1 class="utk-project-title">{{ fm.title }}</h1>
          </div>
        </div>
        <p class="utk-project-tagline">{{ fm.tagline }}</p>
        <p v-if="venue" class="utk-project-venue"><span class="utk-badge">{{ venue }}</span></p>
        <ProjectLinks :links="fm.links ?? []" />
      </div>
    </header>

    <div v-if="hero.clip || hero.image" class="utk-container utk-project-teaser">
      <LoopVideo v-if="hero.clip" :src="hero.clip" :poster="hero.poster ?? hero.image" :label="hero.alt ?? fm.name" :w="hero.w" :h="hero.h" />
      <figure v-else>
        <!-- Paper figures are dense; the full-size file is one click away, and zoomable on a phone. -->
        <a :href="withBase(hero.image)" target="_blank" rel="noopener" :aria-label="`Open the full-size image: ${hero.alt ?? fm.name}`">
          <img :src="withBase(hero.image)" :alt="hero.alt ?? fm.name" :width="hero.w" :height="hero.h" />
        </a>
        <figcaption>{{ hero.caption }}</figcaption>
      </figure>
    </div>

    <div class="utk-container">
      <div class="utk-project-body vp-doc">
        <Content />
      </div>

      <section v-if="hero.youtube || hero.video" class="utk-section">
        <header class="utk-section-header">
          <h2 class="utk-section-title">Video</h2>
          <div class="utk-section-divider" aria-hidden="true" />
        </header>
        <LiteYouTube v-if="hero.youtube" :id="hero.youtube" :title="fm.name" />
        <video v-else class="utk-project-video" :src="hero.video" controls preload="none" :poster="hero.poster ? withBase(hero.poster) : undefined" />
      </section>

      <section v-if="fm.features?.length || fm.more?.length" id="features" class="utk-section">
        <header class="utk-section-header">
          <h2 class="utk-section-title">Features</h2>
          <div class="utk-section-divider" aria-hidden="true" />
        </header>
        <FeatureGrid v-if="fm.features?.length" :features="fm.features" />
        <FeatureCards v-if="fm.more?.length" :cards="fm.more" />
      </section>

      <section v-if="projectPapers.length" id="publications" class="utk-section">
        <header class="utk-section-header">
          <h2 class="utk-section-title">Publications</h2>
          <div class="utk-section-divider" aria-hidden="true" />
        </header>
        <PaperEntry v-for="paper in projectPapers" :key="paper.key" :paper="paper" :current="project.url" />
      </section>

      <section v-if="fm.team?.length" id="team" class="utk-section">
        <header class="utk-section-header">
          <h2 class="utk-section-title">Team</h2>
          <div class="utk-section-divider" aria-hidden="true" />
        </header>
        <TeamList :ids="fm.team" />
      </section>

      <section v-if="primary" id="cite" class="utk-section">
        <header class="utk-section-header">
          <h2 class="utk-section-title">How to cite</h2>
          <div class="utk-section-divider" aria-hidden="true" />
        </header>
        <CiteBox :paper="primary" />
      </section>

      <section v-if="project.listed && related.length" class="utk-section utk-project-related">
        <header class="utk-section-header">
          <h2 class="utk-section-title">More {{ category?.label.toLowerCase() }}</h2>
          <div class="utk-section-divider" aria-hidden="true" />
        </header>
        <div class="utk-grid">
          <ProjectCard v-for="other in related" :key="other.slug" :project="other" compact />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.utk-project {
  padding-bottom: 64px;
}

.utk-project-hero {
  padding: 56px 0 32px;
  background:
    radial-gradient(1200px 400px at 10% -10%, color-mix(in srgb, var(--p-raw) 16%, transparent), transparent 70%),
    linear-gradient(180deg, color-mix(in srgb, var(--p-raw) 6%, transparent), transparent);
}

.utk-project-category {
  margin: 0 0 18px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.utk-project-category a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.utk-project-heading {
  display: flex;
  align-items: center;
  gap: 20px;
}

.utk-project-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

.utk-project-title {
  margin: 4px 0 0;
  max-width: 900px;
  font-size: clamp(1.6rem, 3.4vw, 2.5rem);
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
}

.utk-project-tagline {
  margin: 18px 0 0;
  max-width: var(--utk-text-max);
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.utk-project-venue {
  margin: 14px 0 0;
}

.utk-project-hero :deep(.utk-links) {
  margin-top: 24px;
}

.utk-project-teaser {
  margin-top: 8px;
}

.utk-project-teaser figure {
  margin: 0;
}

.utk-project-teaser img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--utk-radius);
  background: #fff;
  box-shadow: var(--utk-shadow);
}

.utk-project-teaser a {
  display: block;
  cursor: zoom-in;
}

.utk-project-teaser figcaption {
  margin-top: 10px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.utk-project-body {
  max-width: var(--utk-text-max);
  padding-top: 40px;
}

.utk-project-body:empty {
  display: none;
}

.utk-project-video {
  width: 100%;
  border-radius: var(--utk-radius);
  background: #000;
}

@media (max-width: 640px) {
  .utk-project-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
}
</style>
