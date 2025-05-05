<template>
  <div :data-theme="theme">
    <div v-if="isCheckingAuth" class="h-screen flex items-center justify-center">
      <Loader2 class="size-10 animate-spin" />
    </div>

    <template v-else>
      <HeaderComponent />
      <RouterView />
      <Toaster />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Loader2 } from 'lucide-vue-next'
import { Toaster } from 'vue-sonner'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import HeaderComponent from './components/HeaderComponent.vue'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const { authUser, isCheckingAuth } = storeToRefs(authStore)
const { theme } = storeToRefs(themeStore)
const { checkAuth } = authStore

onMounted(async () => {
  await checkAuth()
})

// Watch auth changes and redirect if needed
watch(authUser, (newValue) => {
  const currentRoute = router.currentRoute.value

  if (newValue && (currentRoute.path === '/login' || currentRoute.path === '/register')) {
    // If user becomes logged in while on login/register page, redirect to home
    router.push('/')
  }
})
</script>

<style scoped>
.h-screen {
  height: 100vh;
}
</style>
