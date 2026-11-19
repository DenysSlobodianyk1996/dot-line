import { createRouter, createWebHistory } from 'vue-router'
import DotsAndBoxesGamePage from '@/pages/dots-and-boxes'
import PrivacyPage from '@/pages/privacy'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/game',
      component: DotsAndBoxesGamePage,
    },
    // the in-app privacy screen (PV-2). Not /privacy: that folder is the static store page
    // (privacy/index.html), which the service worker serves itself (NOT_THE_APP_PAGES)
    {
      path: '/privacy-policy',
      name: 'privacy',
      component: PrivacyPage,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/game',
    },
  ],
})

export default router
