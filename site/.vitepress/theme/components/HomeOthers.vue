<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as papers } from '@data/papers.data'
import Icon from './Icon.vue'

// Survey papers listed under Knowledge bases, as the old home page did.
const { theme } = useData()
const others = computed(() =>
  theme.value.utk.others.map((item: { bib: string; label: string }) => {
    const paper = papers.find((p) => p.key === item.bib)
    if (!paper) throw new Error(`site.ts others: unknown bib key ${item.bib}`)
    const url = paper.doi ? `https://doi.org/${paper.doi}` : paper.arxiv ? `https://arxiv.org/abs/${paper.arxiv}` : paper.url
    return { ...item, url, venue: `${paper.venue}, ${paper.year}` }
  }),
)
</script>

<template>
  <div class="utk-others">
    <h3 class="utk-others-title">Others</h3>
    <ul>
      <li v-for="item in others" :key="item.bib">
        <a :href="item.url" target="_blank" rel="noopener">
          <Icon name="paper" />
          <span>
            <strong>{{ item.label }}</strong>
            <small>{{ item.venue }}</small>
          </span>
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.utk-others {
  margin-top: 28px;
}

.utk-others-title {
  margin: 0 0 12px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}

.utk-others ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.utk-others a {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--utk-radius-sm);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.2s;
}

.utk-others a:hover {
  border-color: var(--vp-c-brand-1);
}

.utk-others svg {
  width: 20px;
  height: 20px;
  flex: none;
  margin-top: 2px;
  color: var(--vp-c-brand-1);
}

.utk-others strong {
  display: block;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
}

.utk-others small {
  display: block;
  margin-top: 2px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}
</style>
