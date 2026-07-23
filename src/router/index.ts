import { createRouter, createWebHistory } from 'vue-router'
import DotLineGamePage from '@/pages/dot-line-game'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/game',
      component: DotLineGamePage,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/game',
    },
  ],
})

export default router
