<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as news } from '@data/news.data'
import { formatDate } from '../composables/accent'

const { theme } = useData()
const latest = computed(() => news.slice(0, theme.value.utk.newsOnHome))
</script>

<template>
  <section class="utk-section utk-home-news vp-raw">
    <div class="utk-container">
      <header class="utk-section-header">
        <h2 class="utk-section-title">News &amp; Updates</h2>
        <div class="utk-section-divider" aria-hidden="true" />
      </header>
      <div class="utk-news-grid">
        <a v-for="post in latest" :key="post.url" class="utk-news-card" :href="withBase(post.url)">
          <div class="utk-news-media">
            <img v-if="post.image" :src="withBase(post.image)" alt="" loading="lazy" :class="`utk-fit-${post.imageFit}`" />
          </div>
          <div class="utk-news-body">
            <time :datetime="post.date">{{ formatDate(post.date) }}</time>
            <h3>{{ post.title }}</h3>
          </div>
        </a>
      </div>
      <a class="utk-link-more" :href="withBase('/news/')">All news &rarr;</a>
    </div>
  </section>
</template>

<style scoped>
.utk-news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.utk-news-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--utk-radius);
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.25s, transform 0.25s;
}

.utk-news-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

.utk-news-media {
  aspect-ratio: 2 / 1;
  background: var(--vp-c-bg-alt);
  overflow: hidden;
}

.utk-news-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.utk-news-media img.utk-fit-contain {
  object-fit: contain;
  padding: 12px 20px;
  background: #fff;
}

.utk-news-body {
  padding: 14px 18px 18px;
}

.utk-news-body time {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.utk-news-body h3 {
  margin: 6px 0 0;
  font-size: 1rem;
  line-height: 1.45;
  font-weight: 650;
  color: var(--vp-c-text-1);
}
</style>
