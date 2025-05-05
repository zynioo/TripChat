<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <!-- left side -->
    <div class="flex flex-col justify-center items-center p-6 sm:p-12">
      <div class="w-full max-w-md space-y-8">
        <!-- LOGO -->
        <div class="text-center mb-8">
          <div class="flex flex-col items-center gap-2 group">
            <div
              class="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
            >
              <MessageSquare class="size-6 text-primary" />
            </div>
            <h1 class="text-2xl font-bold mt-2">Załóż konto w TripChat</h1>
            <p class="text-base-content/60">Rozpocznij swoją przygodę z nami</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- First Name -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">First Name</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="size-5 text-base-content/40" />
              </div>
              <input
                type="text"
                class="input input-bordered w-full pl-10"
                placeholder="John"
                v-model="formData.name"
                required
              />
            </div>
          </div>

          <!-- Last Name -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Last Name</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="size-5 text-base-content/40" />
              </div>
              <input
                type="text"
                class="input input-bordered w-full pl-10"
                placeholder="Doe"
                v-model="formData.lastName"
                required
              />
            </div>
          </div>

          <!-- Username -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Username</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign class="size-5 text-base-content/40" />
              </div>
              <input
                type="text"
                class="input input-bordered w-full pl-10"
                placeholder="johndoe"
                v-model="formData.username"
                required
              />
            </div>
          </div>

          <!-- Date of Birth -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Date of Birth</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar class="size-5 text-base-content/40" />
              </div>
              <input
                type="date"
                class="input input-bordered w-full pl-10"
                v-model="formData.dateOfBirth"
                required
              />
            </div>
          </div>

          <!-- Email -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Email</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="size-5 text-base-content/40" />
              </div>
              <input
                type="email"
                class="input input-bordered w-full pl-10"
                placeholder="you@example.com"
                v-model="formData.email"
                required
              />
            </div>
          </div>

          <!-- Password -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Password</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="size-5 text-base-content/40" />
              </div>
              <input
                :type="showPassword ? 'text' : 'password'"
                class="input input-bordered w-full pl-10"
                placeholder="••••••••"
                v-model="formData.password"
                required
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="size-5 text-base-content/40" />
                <Eye v-else class="size-5 text-base-content/40" />
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="isSigningUp">
            <template v-if="isSigningUp">
              <Loader2 class="size-5 animate-spin" />
              Loading...
            </template>
            <template v-else> Create Account </template>
          </button>
        </form>

        <div class="text-center">
          <p class="text-base-content/60">
            Already have an account?
            <RouterLink to="/login" class="link link-primary"> Sign in </RouterLink>
          </p>
        </div>
      </div>
    </div>

    <!-- right side -->
    <AuthImagePattern
      title="Join our community"
      subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
  AtSign,
  Calendar,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import AuthImagePattern from '@/components/auth/AuthImagePattern.vue'

const showPassword = ref(false)
const formData = reactive({
  name: '',
  lastName: '',
  username: '',
  dateOfBirth: '',
  email: '',
  password: '',
})

const authStore = useAuthStore()
const { isSigningUp } = storeToRefs(authStore)
const { signup } = authStore

const validateForm = () => {
  if (!formData.name.trim()) return toast.error('First name is required')
  if (!formData.lastName.trim()) return toast.error('Last name is required')
  if (!formData.username.trim()) return toast.error('Username is required')
  if (formData.username.length < 3) return toast.error('Username must be at least 3 characters')
  if (!formData.dateOfBirth) return toast.error('Date of birth is required')
  if (!formData.email.trim()) return toast.error('Email is required')
  if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error('Invalid email format')
  if (!formData.password) return toast.error('Password is required')
  if (formData.password.length < 6) return toast.error('Password must be at least 6 characters')

  return true
}

const handleSubmit = () => {
  const success = validateForm()
  if (success === true) signup(formData)
}
</script>

<style scoped></style>
