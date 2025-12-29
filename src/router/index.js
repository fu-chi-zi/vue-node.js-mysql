import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'DataAnalysis' }
      },
      {
        path: 'books',
        name: 'Books',
        component: () => import('../views/Books.vue'),
        meta: { title: '图书管理', icon: 'Reading' }
      },
      {
        path: 'readers',
        name: 'Readers',
        component: () => import('../views/Readers.vue'),
        meta: { title: '读者管理', icon: 'User' }
      },
      {
        path: 'borrows',
        name: 'Borrows',
        component: () => import('../views/Borrows.vue'),
        meta: { title: '借阅管理', icon: 'Document' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('../views/Statistics.vue'),
        meta: { title: '数据统计', icon: 'TrendCharts' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
