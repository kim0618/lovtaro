import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import './assets/styles/global.css'
import { initGA, trackPageView } from './utils/gtag.js'

initGA()

if (window.Kakao && !window.Kakao.isInitialized()) {
  window.Kakao.init('0f7d0304f0cf449ce5c4ccdb3fb7b667')
}

router.afterEach((to) => {
  trackPageView(to.fullPath, document.title)
})

createApp(App).use(router).mount('#app')
