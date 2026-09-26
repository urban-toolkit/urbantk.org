import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import './styles/vars.css'
import './styles/base.css'
import ProjectPage from './layouts/ProjectPage.vue'
import HomeHeroLogo from './components/HomeHeroLogo.vue'
import HomeNews from './components/HomeNews.vue'
import HomeProjectStrip from './components/HomeProjectStrip.vue'
import LiteYouTube from './components/LiteYouTube.vue'
import LoopVideo from './components/LoopVideo.vue'
import NewsIndex from './components/NewsIndex.vue'
import PapersPage from './components/PapersPage.vue'
import PostHeader from './components/PostHeader.vue'
import ProjectGrid from './components/ProjectGrid.vue'
import SiteFooter from './components/SiteFooter.vue'
import TeamPage from './components/TeamPage.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-info-before': () => h(HomeHeroLogo),
      'home-hero-actions-after': () => h(HomeProjectStrip),
      'doc-before': () => h(PostHeader),
      'layout-bottom': () => h(SiteFooter),
    })
  },
  enhanceApp({ app }) {
    // Layout component for `layout: ProjectPage`.
    app.component('ProjectPage', ProjectPage)
    // Components used from Markdown pages.
    app.component('HomeNews', HomeNews)
    app.component('ProjectGrid', ProjectGrid)
    app.component('NewsIndex', NewsIndex)
    app.component('PapersPage', PapersPage)
    app.component('TeamPage', TeamPage)
    app.component('LiteYouTube', LiteYouTube)
    app.component('LoopVideo', LoopVideo)
  },
} satisfies Theme
