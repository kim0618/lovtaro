<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  {
    label: '홈',
    to: '/',
    match: (path) => path === '/',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
  },
  {
    label: '오늘카드',
    to: '/today/',
    match: (path) => path === '/today' || path === '/today/',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>`,
  },
  {
    label: '카드사전',
    to: '/cards/',
    match: (path) => path === '/cards' || path === '/cards/' || path.startsWith('/cards/'),
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="10" height="14" rx="1.5"/><rect x="7" y="6" width="10" height="14" rx="1.5"/><line x1="9" y1="9" x2="14" y2="9"/><line x1="9" y1="12" x2="14" y2="12"/></svg>`,
  },
  {
    label: '기록',
    to: '/history/',
    match: (path) => path === '/history' || path === '/history/',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 12"/></svg>`,
  },
  {
    label: '가이드',
    to: '/guide/',
    match: (path) => path === '/guide' || path === '/guide/' || path.startsWith('/guide/'),
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/></svg>`,
  },
]

const activeIndex = computed(() => tabs.findIndex(t => t.match(route.path)))
</script>

<template>
  <nav class="bottom-tab-nav" aria-label="메인 네비게이션">
    <router-link
      v-for="(tab, i) in tabs"
      :key="tab.to"
      :to="tab.to"
      class="bottom-tab-nav__item"
      :class="{ 'bottom-tab-nav__item--active': activeIndex === i }"
      :aria-label="tab.label"
    >
      <span class="bottom-tab-nav__icon" v-html="tab.icon" />
      <span class="bottom-tab-nav__label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.bottom-tab-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  z-index: 200;
  display: flex;
  background: rgba(5, 7, 13, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(200, 169, 110, 0.1);
  border-left: 1px solid rgba(199, 215, 248, 0.04);
  border-right: 1px solid rgba(199, 215, 248, 0.04);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.bottom-tab-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 0 8px;
  color: var(--lt-text-muted);
  opacity: 0.45;
  transition: opacity var(--lt-transition), color var(--lt-transition);
  text-decoration: none;
}

.bottom-tab-nav__item--active {
  color: rgba(200, 169, 110, 0.9);
  opacity: 1;
}

.bottom-tab-nav__item:not(.bottom-tab-nav__item--active):hover {
  opacity: 0.65;
}

.bottom-tab-nav__icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-tab-nav__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.bottom-tab-nav__label {
  font-size: 0.6rem;
  letter-spacing: 0.04em;
}
</style>
