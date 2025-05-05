<template>
  <div class="h-screen grid lg:grid-cols-2">
    <!-- Left Side - Form -->
    <div class="flex flex-col justify-center items-center p-6 sm:p-12 bg-base-100">
      <div class="w-full max-w-md space-y-8 animate-fadeIn">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="flex flex-col items-center gap-2 group">
            <div
              class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:rotate-6 group-hover:scale-110 duration-300"
            >
              <MessageSquare class="w-6 h-6 text-primary" />
            </div>
            <h1 class="text-2xl font-bold mt-2 gradient-text">Witaj w TripChat!</h1>
            <p class="text-base-content/60">Zaloguj się do swojego konta</p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Email</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-base-content/40" />
              </div>
              <input
                type="email"
                class="input input-bordered w-full pl-10 focus:border-primary transition-all duration-300"
                placeholder="ty@przykład.pl"
                v-model="formData.email"
              />
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Hasło</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-base-content/40" />
              </div>
              <input
                :type="showPassword ? 'text' : 'password'"
                class="input input-bordered w-full pl-10 focus:border-primary transition-all duration-300"
                placeholder="••••••••"
                v-model="formData.password"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center transition-all hover:text-primary"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-5 w-5 text-base-content/40" />
                <Eye v-else class="h-5 w-5 text-base-content/40" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full hover:scale-[1.02] transition-transform"
            :disabled="isLoggingIn"
          >
            <template v-if="isLoggingIn">
              <Loader2 class="h-5 w-5 animate-spin" />
              Logowanie...
            </template>
            <template v-else> Zaloguj się </template>
          </button>
        </form>

        <div class="text-center">
          <p class="text-base-content/60">
            Nie masz konta?
            <RouterLink to="/register" class="link link-primary hover:underline">
              Utwórz konto
            </RouterLink>
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side - Image/Pattern -->
    <AuthImagePattern
      title="Witaj ponownie!"
      subtitle="Zaloguj się, aby kontynuować rozmowy i być na bieżąco z wiadomościami."
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import AuthImagePattern from '@/components/auth/AuthImagePattern.vue'

const showPassword = ref(false)
const formData = reactive({
  email: '',
  password: '',
})

const authStore = useAuthStore()
const { isLoggingIn } = storeToRefs(authStore)
const { login } = authStore

const handleSubmit = async () => {
  login(formData)
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.8s ease-in-out;
}

.gradient-text {
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
