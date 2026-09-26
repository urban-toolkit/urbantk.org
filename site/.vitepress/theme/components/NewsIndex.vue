<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as news } from '@data/news.data'
import { formatDate } from '../composables/accent'

// All posts by year. The old year and month archives (/2024/, /2024/08/) redirect to these anchors.
const years = computed(() => {
  const groups = new Map<string, typeof news>()
  for (const post of news) groups.set(post.year, [...(groups.get(post.year) ?? []), post])
  return [...groups]
})
</script>

<template>
  <div class="utk-news-index vp-raw">
    <section v-for="[year, posts] in years" :id="year" :key="year" class="utk-news-year">
      <h2>{{ year }}</h2>
      <a v-for="post in posts" :key="post.url" class="utk-news-row" :href="withBase(post.url)">
        <img v-if="post.image" :src="withBase(post.image)" alt="" loading="lazy" :class="`utk-fit-${post.imageFit}`" />
        <span v-else class="utk-news-row-blank" aria-hidden="true" />
        <span class="utk-news-row-text">
          <time :datetime="post.date">{{ formatDate(post.date) }}</time>
          <strong>{{ post.title }}</strong>
          <span v-if="post.excerpt">{{ post.excerpt }}</span>
        </span>
      </a>
    </section>
  </div>
</template>

<style scoped>
.utk-news-year {
  scroll-margin-top: calc(var(--vp-nav-height) + 16px);
}

.utk-news-year h2 {
  margin: 40px 0 12px;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

.utk-news-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 20px;
  align-items: start;
  padding: 16px 0;
  border-top: 1px solid var(--vp-c-divider);
  color: inherit;
  text-decoration: none;
}

.utk-news-row img,
.utk-news-row-blank {
  width: 160px;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: var(--utk-radius-sm);
  background: var(--vp-c-bg-soft);
}

.utk-news-row img.utk-fit-contain {
  object-fit: contain;
  padding: 8px;
  background: #fff;
}

.utk-news-row-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.utk-news-row time {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.utk-news-row strong {
  font-size: 1.05rem;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.utk-news-row:hover strong {
  color: var(--vp-c-brand-1);
}

.utk-news-row-text > span {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

@media (max-width: 560px) {
  .utk-news-row {
    grid-template-columns: 1fr;
  }

  .utk-news-row img,
  .utk-news-row-blank {
    width: 100%;
  }
}
</style>
