<script setup lang="ts">
import { withBase } from 'vitepress'
import LoopVideo from './LoopVideo.vue'

interface Feature {
  id: string
  title: string
  text: string
  clip?: string
  poster?: string
  image?: string
  w?: number
  h?: number
  link?: string
}

// Alternating rows of media and text.
defineProps<{ features: Feature[] }>()
</script>

<template>
  <div class="utk-features">
    <article v-for="(feature, i) in features" :id="feature.id" :key="feature.id" class="utk-feature" :class="{ 'utk-feature--flip': i % 2 === 1 }">
      <div class="utk-feature-media">
        <LoopVideo v-if="feature.clip" :src="feature.clip" :poster="feature.poster" :label="feature.title" :w="feature.w" :h="feature.h" />
        <img v-else-if="feature.image" :src="withBase(feature.image)" :width="feature.w" :height="feature.h" :alt="feature.title" loading="lazy" />
      </div>
      <div class="utk-feature-text">
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.text }}</p>
        <a v-if="feature.link" class="utk-link-more" :href="feature.link">Learn more &rarr;</a>
      </div>
    </article>
  </div>
</template>

<style scoped>
.utk-features {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.utk-feature {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 36px;
  align-items: center;
  scroll-margin-top: calc(var(--vp-nav-height) + 16px);
}

.utk-feature--flip .utk-feature-media {
  order: 2;
}

.utk-feature-media img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--utk-radius-sm);
}

.utk-feature-text h3 {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.3;
  font-weight: 750;
  color: var(--vp-c-text-1);
}

.utk-feature-text p {
  margin: 10px 0 0;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.utk-feature-text .utk-link-more {
  margin-top: 12px;
}

@media (max-width: 860px) {
  .utk-feature {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .utk-feature--flip .utk-feature-media {
    order: 0;
  }
}
</style>
