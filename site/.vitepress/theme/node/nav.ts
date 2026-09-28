import type { DefaultTheme } from 'vitepress'
import type { Category, ProjectSummary } from './projects'

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
}

// The menu is generated from the project pages, so it cannot drift from them. VitePress renders nav
// text as HTML, which is what lets each entry carry a dot in its project's accent color.
export function buildNav(projects: ProjectSummary[], categories: Category[]): DefaultTheme.NavItem[] {
  const entry = (p: ProjectSummary): DefaultTheme.NavItemWithLink => ({
    text: `<span class="utk-dot" style="--utk-dot:${p.accent}" aria-hidden="true"></span>${escapeHtml(p.name)}`,
    link: p.url,
    activeMatch: `^/${p.slug}/`,
  })
  const groups = categories
    .map((c) => ({ text: c.label, items: projects.filter((p) => p.listed && p.category === c.id).map(entry) }))
    .filter((group) => group.items.length > 0)
  return [
    { text: 'News', link: '/news/', activeMatch: '^/(news|\\d{4})/' },
    ...groups,
    { text: 'All papers', link: '/papers/' },
    { text: 'Team', link: '/team/' },
    { text: 'Impact', link: '/impact/' },
  ]
}
