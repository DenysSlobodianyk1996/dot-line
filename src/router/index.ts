import { createRouter, createWebHistory } from 'vue-router'
import DotsAndBoxesGamePage from '@/pages/dots-and-boxes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/game',
      component: DotsAndBoxesGamePage,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/game',
    },
  ],
})

export default router
