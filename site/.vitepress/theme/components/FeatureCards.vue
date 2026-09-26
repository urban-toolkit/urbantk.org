<script setup lang="ts">
import { withBase } from 'vitepress'

interface Card {
  title: string
  text: string
  image?: string
  link?: string
}

// A compact grid for features that have no clip of their own.
defineProps<{ cards: Card[] }>()
</script>

<template>
  <div class="utk-feature-cards">
    <component :is="card.link ? 'a' : 'div'" v-for="card in cards" :key="card.title" class="utk-feature-card" :href="card.link">
      <img v-if="card.image" :src="withBase(card.image)" alt="" loading="lazy" />
      <h3>{{ card.title }}</h3>
      <p>{{ card.text }}</p>
    </component>
  </div>
</template>

<style scoped>
.utk-feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 40px;
}

.utk-feature-card {
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--utk-radius-sm);
  background: var(--vp-c-bg-soft);
  color: inherit;
  text-decoration: none;
}

a.utk-feature-card:hover {
  border-color: var(--vp-c-brand-1);
}

.utk-feature-card img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  margin-bottom: 12px;
  border-radius: 6px;
}

.utk-feature-card h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.utk-feature-card p {
  margin: 6px 0 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
</style>
