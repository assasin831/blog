import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import DailyPostPager from './components/DailyPostPager.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('DailyPostPager', DailyPostPager)
  }
}
