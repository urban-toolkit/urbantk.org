<script setup lang="ts">
import type { Paper } from '../node/bib'
import BibtexButton from './BibtexButton.vue'

defineProps<{ paper: Paper }>()
</script>

<template>
  <div class="utk-cite">
    <div class="utk-cite-bar">
      <span>BibTeX</span>
      <BibtexButton :bibtex="paper.bibtex" label="Copy" />
    </div>
    <pre><code>{{ paper.bibtex }}</code></pre>
  </div>
</template>

<style scoped>
.utk-cite {
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--utk-radius-sm);
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.utk-cite-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 8px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}

.utk-cite pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}
</style>
