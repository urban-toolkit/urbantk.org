<script setup lang="ts">
import { withBase } from 'vitepress'
import type { ProjectSummary } from '../node/projects'

// A project's logo, or a monogram in its accent color when it has none.
withDefaults(
  defineProps<{ project: Pick<ProjectSummary, 'name' | 'logo' | 'logoOnDark' | 'monogram'>; size?: 'sm' | 'md' | 'lg' }>(),
  { size: 'md' },
)
</script>

<template>
  <span class="utk-logo" :class="`utk-logo--${size}`">
    <template v-if="project.logo">
      <img :src="withBase(project.logo)" alt="" :class="{ 'utk-logo-light': project.logoOnDark }" />
      <img v-if="project.logoOnDark" :src="withBase(project.logoOnDark)" alt="" class="utk-logo-dark" />
    </template>
    <span v-else class="utk-monogram" aria-hidden="true">{{ project.monogram }}</span>
  </span>
</template>

<style scoped>
.utk-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 0 0 1px var(--vp-c-divider);
  overflow: hidden;
}

.utk-logo--sm {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.utk-logo--md {
  width: 48px;
  height: 48px;
}

.utk-logo--lg {
  width: 72px;
  height: 72px;
  border-radius: 18px;
}

.utk-logo img {
  width: 82%;
  height: 82%;
  object-fit: contain;
}

.utk-monogram {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--p-light, var(--vp-c-brand-3));
  color: #fff;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-size: 15px;
}

.utk-logo--lg .utk-monogram {
  font-size: 24px;
}

.utk-logo--sm .utk-monogram {
  font-size: 12px;
}

.utk-logo-dark,
.dark .utk-logo-light {
  display: none;
}

.dark .utk-logo-dark {
  display: block;
}
</style>
