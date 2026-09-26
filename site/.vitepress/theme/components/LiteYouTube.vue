<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import Icon from './Icon.vue'

// A YouTube video that loads nothing from YouTube until it is clicked, then plays from youtube-nocookie.com.
const props = defineProps<{ id: string; title: string; poster?: string }>()
const active = ref(false)
const poster = computed(() => (props.poster ? withBase(props.poster) : `https://i.ytimg.com/vi/${props.id}/hqdefault.jpg`))
</script>

<template>
  <div class="utk-yt">
    <iframe
      v-if="active"
      :src="`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`"
      :title="title"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
    <button v-else type="button" class="utk-yt-poster" :aria-label="`Play video: ${title}`" @click="active = true">
      <img :src="poster" alt="" loading="lazy" />
      <span class="utk-yt-play"><Icon name="play" /></span>
    </button>
  </div>
</template>

<style scoped>
.utk-yt {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--utk-radius);
  overflow: hidden;
  background: #000;
}

.utk-yt iframe,
.utk-yt-poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.utk-yt-poster {
  padding: 0;
  cursor: pointer;
}

.utk-yt-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.utk-yt-play {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  padding: 18px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  color: #fff;
  transform: translate(-50%, -50%);
  transition: background-color 0.2s;
}

.utk-yt-poster:hover .utk-yt-play {
  background: var(--vp-c-brand-3);
}

.utk-yt-play svg {
  width: 26px;
  height: 26px;
}
</style>
