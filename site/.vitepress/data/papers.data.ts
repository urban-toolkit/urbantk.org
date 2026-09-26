import { defineLoader } from 'vitepress'
import { loadPapers, type Paper } from '../theme/node/bib'

declare const data: Paper[]
export { data }

export default defineLoader({
  watch: ['../../data/papers.bib'],
  load: () => loadPapers(),
})
