<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as team } from '@data/team.data'

// The groups of team.yaml in order, as cards; then the alumni; then the compact groups (the collaborators)
// as a plain list of names and institutions.
const shown = team.people.filter((p) => p.listed !== false)
const sectionsOf = (compact: boolean) =>
  team.groups
    .filter((g) => !!g.compact === compact)
    .map((g) => ({ id: g.id, label: g.label, people: shown.filter((p) => p.group === g.id && !p.alumni) }))
const sections = computed(() =>
  [...sectionsOf(false), { id: 'alumni', label: 'Alumni', people: shown.filter((p) => p.alumni) }].filter((s) => s.people.length > 0),
)
const compact = computed(() => sectionsOf(true).filter((s) => s.people.length > 0))
const institutionName = new Map(team.institutions.map((i) => [i.id, i.name]))

// First and last capitalized words: "Daniel de Oliveira" is DO, "Tuan Duc (Henry) Nguyen" is TN.
function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => /^\p{Lu}/u.test(w))
  return words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0]?.[0] ?? '')
}
</script>

<template>
  <div class="utk-team vp-raw">
    <section v-for="section in sections" :key="section.id" class="utk-team-group">
      <h2>{{ section.label }}</h2>
      <ul>
        <li v-for="person in section.people" :key="person.id">
          <img v-if="person.photo" :src="withBase(person.photo)" alt="" loading="lazy" width="44" height="44" />
          <span v-else class="utk-team-initials" aria-hidden="true">{{ initials(person.name) }}</span>
          <span>
            <a v-if="person.url" :href="person.url" target="_blank" rel="noopener">{{ person.name }}</a>
            <strong v-else>{{ person.name }}</strong>
            <small v-if="person.role">{{ person.role }}</small>
          </span>
        </li>
      </ul>
    </section>
    <section v-for="section in compact" :key="section.id" class="utk-team-compact">
      <h2>{{ section.label }}</h2>
      <ul>
        <li v-for="person in section.people" :key="person.id">
          <a v-if="person.url" :href="person.url" target="_blank" rel="noopener">{{ person.name }}</a>
          <strong v-else>{{ person.name }}</strong>
          <small>{{ institutionName.get(person.institution ?? '') }}</small>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.utk-team-group h2 {
  margin: 36px 0 14px;
  font-size: 1.25rem;
  font-weight: 800;
}

.utk-team-group ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.utk-team-group li {
  /* Not the doc's li + li margin, which would push every card but a row's first one down. */
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--utk-radius-sm);
  background: var(--vp-c-bg-soft);
}

.utk-team-group img,
.utk-team-initials {
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 50%;
  object-fit: cover;
}

.utk-team-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 14px;
  font-weight: 800;
}

.utk-team-group a,
.utk-team-group strong {
  display: block;
  font-weight: 650;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.utk-team-group a:hover {
  color: var(--vp-c-brand-1);
}

.utk-team-group small {
  display: block;
  margin-top: 2px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

/* Collaborators: names and institutions only, quieter than the cards above. */
.utk-team-compact h2 {
  margin: 44px 0 12px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.utk-team-compact li {
  margin: 0;
}

.utk-team-compact ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.utk-team-compact a,
.utk-team-compact strong {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.utk-team-compact a:hover {
  color: var(--vp-c-brand-1);
}

.utk-team-compact small {
  display: block;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}
</style>
