<script setup lang="ts">
import { useData, withBase } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img class="utk-hero-logo" :src="withBase(theme.logo.src)" alt="" width="96" height="96" />
</template>

<style scoped>
.utk-hero-logo {
  display: block;
  width: 96px;
  height: 96px;
  margin: 0 auto 20px;
}
</style>
