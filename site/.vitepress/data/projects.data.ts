import { defineLoader } from 'vitepress'
import { loadProjects, type ProjectSummary } from '../theme/node/projects'

declare const data: ProjectSummary[]
export { data }

export default defineLoader({
  watch: ['../../projects/*.md', '../../data/categories.yaml', '../../data/papers.bib', '../../data/team.yaml'],
  load: () => loadProjects(),
})
