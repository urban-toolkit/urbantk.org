<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { theme } = useData()
const funding = computed(() => theme.value.utk.funding)
const institutions = computed(() => theme.value.utk.institutions)
const year = new Date().getFullYear()
</script>

<template>
  <footer class="utk-footer">
    <div class="utk-container utk-footer-inner">
      <p class="utk-footer-funding">
        {{ funding.lead }}
        <template v-for="(sponsor, i) in funding.sponsors" :key="sponsor.name">
          <strong>{{ sponsor.name }}</strong
          ><template v-if="sponsor.awards">
            (Awards
            <template v-for="(award, j) in sponsor.awards" :key="award.id">
              <a :href="award.url" target="_blank" rel="noopener">#{{ award.id }}</a
              ><template v-if="j < sponsor.awards.length - 2">, </template
              ><template v-else-if="j === sponsor.awards.length - 2">, and </template>
            </template>)</template
          ><template v-if="i < funding.sponsors.length - 2">, </template
          ><template v-else-if="i === funding.sponsors.length - 2">, and </template>
        </template>.
      </p>
      <div class="utk-footer-logos">
        <a v-for="inst in institutions" :key="inst.name" :href="inst.url" target="_blank" rel="noopener" :aria-label="inst.name">
          <img :src="withBase(inst.logo)" :alt="inst.name" />
        </a>
      </div>
      <p class="utk-footer-meta">
        &copy; {{ year }} The Urban Toolkit &middot;
        <a href="https://github.com/urban-toolkit" target="_blank" rel="noopener">GitHub</a> &middot;
        <a :href="withBase('/feed.xml')">RSS</a>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.utk-footer {
  margin-top: 32px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.utk-footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding-top: 32px;
  padding-bottom: 32px;
  text-align: center;
}

.utk-footer-funding {
  max-width: 760px;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.utk-footer-funding strong {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.utk-footer a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.utk-footer a:hover {
  text-decoration-thickness: 2px;
}

.utk-footer-logos a {
  text-decoration: none;
}

.utk-footer-logos {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.utk-footer-logos a {
  display: inline-flex;
  align-items: center;
  height: 48px;
}

.utk-footer-logos img {
  max-height: 44px;
  max-width: 180px;
  object-fit: contain;
}

.dark .utk-footer-logos img {
  filter: invert(1);
}

.utk-footer-meta {
  margin: 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}
</style>
