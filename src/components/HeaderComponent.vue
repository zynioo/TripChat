<template>
  <header class="bg-base-100/60 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg">
    <div class="container mx-auto px-4 h-16">
      <div class="flex items-center justify-between h-full">
        <div class="flex items-center gap-8">
          <RouterLink
            to="/"
            class="flex items-center gap-2.5 hover:opacity-80 transition-all group"
          >
            <div
              class="size-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-6"
            >
              <MessageSquare class="w-5 h-5 text-primary" />
            </div>
            <h1
              class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
            >
              TripChat
            </h1>
          </RouterLink>
        </div>

        <div class="flex items-center gap-3">
          <!-- Theme Toggle Button -->
          <div class="theme-toggle">
            <label class="swap swap-rotate">
              <!-- this hidden checkbox controls the state -->
              <input
                type="checkbox"
                :checked="theme === 'dark'"
                @change="toggleTheme"
                class="theme-controller"
              />

              <!-- sun icon -->
              <Sun class="swap-on size-5 text-yellow-400" />

              <!-- moon icon -->
              <Moon class="swap-off size-5 text-slate-600" />
            </label>
          </div>

          <template v-if="authUser">
            <RouterLink
              to="/profile"
              class="btn btn-sm gap-2 btn-ghost hover:bg-base-200 transition-all duration-300"
            >
              <div class="relative">
                <User class="size-5" />
                <span class="absolute -top-1 -right-1 size-2 bg-green-500 rounded-full"></span>
              </div>
              <span class="hidden sm:inline">Profil</span>
            </RouterLink>

            <!-- If you have a user avatar in the header -->
            <img
              v-if="authUser?.profilePicture"
              :src="authUser.profilePicture"
              alt="User Avatar"
              class="size-8 rounded-full object-cover"
              @error="$event.target.src = '/avatar.jpg'"
            />

            <button
              class="btn btn-sm gap-2 btn-ghost hover:bg-red-100 hover:text-red-500 transition-all duration-300"
              @click="logout"
            >
              <LogOut class="size-5" />
              <span class="hidden sm:inline">Wyloguj</span>
            </button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { LogOut, MessageSquare, Settings, User, Sun, Moon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const { authUser } = storeToRefs(authStore)
const { theme } = storeToRefs(themeStore)
const { logout } = authStore
const { setTheme } = themeStore

const toggleTheme = () => {
  const newTheme = theme.value === 'dark' ? 'light' : 'dark'
  setTheme(newTheme)
}
</script>

<style scoped>
header {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.theme-toggle {
  position: relative;
  display: inline-block;
}

.swap {
  position: relative;
  display: inline-grid;
  user-select: none;
  place-content: center;
  cursor: pointer;
}

.swap > * {
  grid-column-start: 1;
  grid-row-start: 1;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.swap input {
  appearance: none;
  -webkit-appearance: none;
  position: absolute;
  opacity: 0;
}

.swap .swap-on,
.swap .swap-off {
  transition: transform 0.5s cubic-bezier(0.65, 0.05, 0.36, 1);
}

.swap input:not(:checked) ~ .swap-on {
  opacity: 0;
  transform: scale(0) rotate(-180deg);
}

.swap input:checked ~ .swap-off {
  opacity: 0;
  transform: scale(0) rotate(180deg);
}

.swap input:checked ~ .swap-on {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.swap input:not(:checked) ~ .swap-off {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}
</style>
