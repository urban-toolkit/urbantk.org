<script setup lang="ts">
import { computed } from 'vue'
import { data as team } from '@data/team.data'

// The people of one project, in the order its page lists them.
const props = defineProps<{ ids: string[] }>()

const members = computed(() =>
  props.ids.map((id) => {
    const person = team.people.find((p) => p.id === id)
    if (!person) throw new Error(`team id "${id}" is not in site/data/team.yaml`)
    const institution = team.institutions.find((i) => i.id === person.institution)
    return { ...person, institutionName: institution?.name ?? '' }
  }),
)
</script>

<template>
  <ul class="utk-team-list">
    <li v-for="person in members" :key="person.id">
      <a v-if="person.url" :href="person.url" target="_blank" rel="noopener">{{ person.name }}</a>
      <span v-else class="utk-team-name">{{ person.name }}</span>
      <small>{{ person.institutionName }}</small>
    </li>
  </ul>
</template>

<style scoped>
.utk-team-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.utk-team-list li {
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--utk-radius-sm);
  background: var(--vp-c-bg-soft);
}

.utk-team-list a,
.utk-team-name {
  display: block;
  font-weight: 650;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.utk-team-list a:hover {
  color: var(--vp-c-brand-1);
}

.utk-team-list small {
  display: block;
  margin-top: 2px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}
</style>
