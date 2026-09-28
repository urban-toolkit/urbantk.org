<script setup lang="ts">
import FundingLine from './FundingLine.vue'
</script>

<template>
  <p class="utk-hero-funding"><FundingLine /></p>
</template>

<style scoped>
.utk-hero-funding {
  max-width: 576px;
  margin: 28px 0 0;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

/* Below 960px the hero centers its text; center the paragraph with it. */
@media (max-width: 959px) {
  .utk-hero-funding {
    margin-right: auto;
    margin-left: auto;
  }
}
</style>
