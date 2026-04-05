import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import './assets/styles/global.css'
import { initGA, trackPageView } from './utils/gtag.js'

initGA()

router.afterEach((to) => {
  trackPageView(to.fullPath, document.title)
})

createApp(App).use(router).mount('#app')
