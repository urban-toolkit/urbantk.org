import { defineLoader } from 'vitepress'
import { loadPapers, type Paper } from '../theme/node/bib'
import { loadProjects } from '../theme/node/projects'

declare const data: Paper[]
export { data }

export default defineLoader({
  watch: ['../../data/papers.bib', '../../projects/*.md'],
  // A paper is filed under its own `category` and under the category of every project it belongs to.
  load: () => {
    const categoryOf = new Map(loadProjects().map((p) => [p.slug, p.category]))
    return loadPapers().map((paper) => ({
      ...paper,
      categories: [...new Set([...paper.categories, ...paper.projects.map((slug) => categoryOf.get(slug)!)])],
    }))
  },
})
