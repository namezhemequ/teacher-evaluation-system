import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { requiresAuth: false } },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { roles: ['admin', 'teacher'] } },
      { path: 'plans', name: 'Plans', component: () => import('../views/Plans.vue'), meta: { roles: ['admin'] } },
      { path: 'evaluation/:planId', name: 'Evaluation', component: () => import('../views/Evaluation.vue'), meta: { roles: ['teacher'] } },
      { path: 'my-evaluations', name: 'MyEvaluations', component: () => import('../views/MyEvaluations.vue'), meta: { roles: ['teacher'] } },
      { path: 'records', name: 'Records', component: () => import('../views/Records.vue'), meta: { roles: ['admin'] } },
      { path: 'statistics', name: 'Statistics', component: () => import('../views/Statistics.vue'), meta: { roles: ['admin'] } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.meta.requiresAuth !== false && !userStore.isLoggedIn) {
    next('/login');
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/dashboard');
  } else if (to.meta.roles && !to.meta.roles.includes(userStore.userInfo?.role)) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;