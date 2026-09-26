<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as team } from '@data/team.data'

// People grouped by institution, as on the old team page; alumni follow in their own list.
const groups = computed(() =>
  team.institutions
    .map((institution) => ({
      ...institution,
      people: team.people.filter((p) => p.institution === institution.id && p.listed !== false && !p.alumni),
    }))
    .filter((group) => group.people.length > 0),
)
const alumni = computed(() => team.people.filter((p) => p.alumni && p.listed !== false))
</script>

<template>
  <div class="utk-team vp-raw">
    <section v-for="group in groups" :key="group.id" class="utk-team-group">
      <h2>
        <a v-if="group.url" :href="group.url" target="_blank" rel="noopener">{{ group.name }}</a>
        <template v-else>{{ group.name }}</template>
      </h2>
      <ul>
        <li v-for="person in group.people" :key="person.id">
          <img v-if="person.photo" :src="withBase(person.photo)" alt="" loading="lazy" />
          <span v-else class="utk-team-initials" aria-hidden="true">{{ person.name.split(' ').map((w) => w[0]).slice(0, 2).join('') }}</span>
          <span>
            <a v-if="person.url" :href="person.url" target="_blank" rel="noopener">{{ person.name }}</a>
            <strong v-else>{{ person.name }}</strong>
            <small v-if="person.role">{{ person.role }}</small>
          </span>
        </li>
      </ul>
    </section>
    <section v-if="alumni.length" class="utk-team-group">
      <h2>Alumni</h2>
      <ul>
        <li v-for="person in alumni" :key="person.id">
          <span class="utk-team-initials" aria-hidden="true">{{ person.name.split(' ').map((w) => w[0]).slice(0, 2).join('') }}</span>
          <span>
            <a v-if="person.url" :href="person.url" target="_blank" rel="noopener">{{ person.name }}</a>
            <strong v-else>{{ person.name }}</strong>
            <small v-if="person.role">{{ person.role }}</small>
          </span>
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

.utk-team-group h2 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.utk-team-group h2 a:hover {
  color: var(--vp-c-brand-1);
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
</style>
