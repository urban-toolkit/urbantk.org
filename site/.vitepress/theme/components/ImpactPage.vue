<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'
import { data as impact } from '@data/impact.data'
import Icon from './Icon.vue'

// The metrics table, and under "What is counted" one numbered entry per row: how the row is computed, its
// sources and the items it counted. Each row links to its entry, like a footnote. The software rows open
// onto one row per project; stars start open.
const format = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const open = ref<string[]>(['stars'])

function toggle(id: string) {
  open.value = open.value.includes(id) ? open.value.filter((x) => x !== id) : [...open.value, id]
}

const rows = impact.groups.flatMap((g) => g.rows)
const number = new Map(rows.map((row, i) => [row.id, i + 1]))
const external = (url: string) => /^https?:/.test(url)
</script>

<template>
  <div class="utk-impact vp-raw">
    <div class="utk-impact-bar">
      <p class="utk-impact-updated">Last updated {{ impact.updated }}.</p>
      <a class="utk-button" :href="withBase('/impact/urbantk-impact.xlsx')" download>
        <Icon name="install" />
        Download spreadsheet
      </a>
    </div>

    <table class="utk-impact-table">
      <thead>
        <tr>
          <th scope="col">Metric</th>
          <th v-for="year in impact.years" :key="year.label" scope="col" class="utk-impact-num">
            {{ year.label }}
            <small>{{ year.period }}</small>
          </th>
        </tr>
      </thead>
      <tbody v-for="group in impact.groups" :key="group.label">
        <tr class="utk-impact-group">
          <th :colspan="impact.years.length + 1" scope="colgroup">{{ group.label }}</th>
        </tr>
        <template v-for="row in group.rows" :key="row.id">
          <tr>
            <th scope="row">
              <button
                v-if="row.projects.length"
                type="button"
                class="utk-impact-toggle"
                :aria-expanded="open.includes(row.id)"
                :aria-controls="row.projects.map((_, j) => `impact-${row.id}-${j}`).join(' ')"
                @click="toggle(row.id)"
              >
                {{ row.label }}
              </button>
              <template v-else>{{ row.label }}</template>
              <a class="utk-impact-ref" :href="`#counted-${row.id}`" :aria-label="`How ${row.label} is counted`">[{{ number.get(row.id) }}]</a>
            </th>
            <td v-for="(value, i) in row.values" :key="i" class="utk-impact-num">
              <span v-if="value === null" class="utk-impact-missing">Not available</span>
              <template v-else>{{ format.format(value) }}</template>
              <small v-if="row.captions?.[i]" class="utk-impact-caption">{{ row.captions[i] }}</small>
            </td>
          </tr>
          <tr
            v-for="(project, j) in row.projects"
            v-show="open.includes(row.id)"
            :id="`impact-${row.id}-${j}`"
            :key="project.url"
            class="utk-impact-project"
          >
            <th scope="row">
              <a :href="withBase(project.url)">
                <span class="utk-dot" :style="{ '--utk-dot': project.accent }" aria-hidden="true"></span>{{ project.name }}
              </a>
            </th>
            <td v-for="(value, i) in project.values" :key="i" class="utk-impact-num">{{ format.format(value) }}</td>
          </tr>
        </template>
      </tbody>
    </table>

    <h2>What is counted</h2>
    <section v-for="row in rows" :id="`counted-${row.id}`" :key="row.id" class="utk-impact-items">
      <h3><span class="utk-impact-number">[{{ number.get(row.id) }}]</span> {{ row.label }}</h3>
      <p class="utk-impact-how">{{ row.how }}</p>
      <p v-if="row.sources?.length" class="utk-impact-sources">
        Sources:
        <template v-for="(source, k) in row.sources" :key="source.url"
          ><a :href="source.url" target="_blank" rel="noopener">{{ source.label }}</a
          ><template v-if="k < row.sources.length - 1">, </template></template
        >
      </p>
      <template v-for="(list, i) in row.items ?? []" :key="i">
        <template v-if="list.length">
          <h4>{{ impact.years[i].label }}</h4>
          <ul>
            <li v-for="(item, k) in list" :key="k">
              <a v-if="item.url && external(item.url)" :href="item.url" target="_blank" rel="noopener">{{ item.name }}</a>
              <a v-else-if="item.url" :href="withBase(item.url)">{{ item.name }}</a>
              <template v-else>{{ item.name }}</template>
              <span v-if="item.detail" class="utk-impact-detail">{{ item.detail }}</span>
            </li>
          </ul>
        </template>
      </template>
    </section>

    <h2>Notes</h2>
    <ul class="utk-impact-notes">
      <li v-for="note in impact.notes" :key="note.label">
        <strong>{{ note.label }}.</strong> {{ note.text }}
        <template v-for="(link, k) in note.links" :key="link.url"
          ><a :href="link.url" target="_blank" rel="noopener">{{ link.label }}</a
          ><template v-if="k < note.links.length - 1">, </template></template
        >
      </li>
    </ul>
  </div>
</template>

<style scoped>
.utk-impact-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 0 20px;
}

.utk-impact-updated {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.utk-impact-table {
  width: 100%;
  font-variant-numeric: tabular-nums;
}

.utk-impact-table th,
.utk-impact-table td {
  vertical-align: top;
}

.utk-impact-table thead th {
  font-weight: 700;
}

.utk-impact-table thead small {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.utk-impact-num {
  text-align: right;
  white-space: nowrap;
}

.utk-impact-group th {
  padding-top: 18px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

tbody th[scope='row'] {
  font-weight: 500;
  text-align: left;
}

.utk-impact-toggle {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 0;
  font: inherit;
  text-align: left;
  color: var(--vp-c-text-1);
}

.utk-impact-toggle::before {
  content: '';
  flex: none;
  width: 6px;
  height: 6px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: translateY(-2px) rotate(-45deg);
  transition: transform 0.2s;
}

.utk-impact-toggle[aria-expanded='true']::before {
  transform: translateY(-3px) rotate(45deg);
}

.utk-impact-toggle:hover {
  color: var(--vp-c-brand-1);
}

.utk-impact-project th,
.utk-impact-project td {
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.utk-impact-project th {
  padding-left: 28px;
}

.utk-impact-project a {
  color: inherit;
  text-decoration: none;
}

.utk-impact-project a:hover {
  color: var(--vp-c-brand-1);
}

.utk-impact-caption {
  display: block;
  max-width: 12em;
  margin-left: auto;
  font-size: 0.75rem;
  line-height: 1.3;
  color: var(--vp-c-text-2);
  white-space: normal;
}

.utk-impact-missing {
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}

.utk-impact-items h3 {
  margin: 28px 0 6px;
  font-size: 1.05rem;
}

.utk-impact-items h4 {
  margin: 12px 0 4px;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.utk-impact-items ul {
  margin: 0;
}

.utk-impact-detail {
  display: block;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.utk-impact-notes li {
  margin: 10px 0;
}

.utk-impact-ref {
  margin-left: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  white-space: nowrap;
}

.utk-impact-ref:hover {
  text-decoration: underline;
}

.utk-impact-items {
  scroll-margin-top: calc(var(--vp-nav-height) + 16px);
}

.utk-impact-number {
  color: var(--vp-c-brand-1);
}

.utk-impact-how {
  margin: 4px 0;
}

.utk-impact-sources {
  margin: 4px 0 8px;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}
</style>
