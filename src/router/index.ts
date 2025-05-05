import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check if we need to wait for auth check to complete
  if (authStore.isCheckingAuth) {
    // Wait for the auth check to complete
    await new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (!authStore.isCheckingAuth) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
    })
  }

  const isAuthenticated = !!authStore.authUser

  // Redirect authenticated users away from login/register pages
  if (to.meta.guestOnly && isAuthenticated) {
    next('/')
    return
  }

  // Redirect unauthenticated users to login when trying to access protected routes
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Otherwise proceed as normal
  next()
})

export default router
