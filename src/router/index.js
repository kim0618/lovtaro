import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/HomePage.vue'),
  },
  {
    path: '/today',
    name: 'today',
    component: () => import('../pages/TodayPage.vue'),
  },
  {
    path: '/reading/mind',
    name: 'reading-mind',
    component: () => import('../pages/ReadingMindPage.vue'),
  },
  {
    path: '/reading/reunion',
    name: 'reading-reunion',
    component: () => import('../pages/ReadingReunionPage.vue'),
  },
  {
    path: '/reading/contact',
    name: 'reading-contact',
    component: () => import('../pages/ReadingContactPage.vue'),
  },
  {
    path: '/reading/3cards',
    name: 'reading-3cards',
    component: () => import('../pages/ThreeCardsPage.vue'),
  },
  {
    path: '/reading/love',
    name: 'reading-love',
    component: () => import('../pages/ReadingLovePage.vue'),
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../pages/HistoryPage.vue'),
  },
  {
    path: '/cards',
    name: 'cards',
    component: () => import('../pages/CardsPage.vue'),
  },
  {
    path: '/cards/:id',
    name: 'card-detail',
    component: () => import('../pages/CardDetailPage.vue'),
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('../pages/PrivacyPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFoundPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
