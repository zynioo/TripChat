<template>
  <div class="h-screen container mx-auto px-4 pt-20 max-w-5xl">
    <div class="space-y-6">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-semibold">Theme</h2>
        <p class="text-sm text-base-content/70">Choose a theme for your chat interface</p>
      </div>

      <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        <button
          v-for="t in THEMES"
          :key="t"
          :class="`
            group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
            ${theme === t ? 'bg-base-200' : 'hover:bg-base-200/50'}
          `"
          @click="setTheme(t)"
        >
          <div class="relative h-8 w-full rounded-md overflow-hidden" :data-theme="t">
            <div class="absolute inset-0 grid grid-cols-4 gap-px p-1">
              <div class="rounded bg-primary"></div>
              <div class="rounded bg-secondary"></div>
              <div class="rounded bg-accent"></div>
              <div class="rounded bg-neutral"></div>
            </div>
          </div>
          <span class="text-[11px] font-medium truncate w-full text-center">
            {{ t.charAt(0).toUpperCase() + t.slice(1) }}
          </span>
        </button>
      </div>

      <!-- Preview Section -->
      <h3 class="text-lg font-semibold mb-3">Preview</h3>
      <div class="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
        <div class="p-4 bg-base-200">
          <div class="max-w-lg mx-auto">
            <!-- Mock Chat UI -->
            <div class="bg-base-100 rounded-xl shadow-sm overflow-hidden">
              <!-- Chat Header -->
              <div class="px-4 py-3 border-b border-base-300 bg-base-100">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium"
                  >
                    J
                  </div>
                  <div>
                    <h3 class="font-medium text-sm">John Doe</h3>
                    <p class="text-xs text-base-content/70">Online</p>
                  </div>
                </div>
              </div>

              <!-- Chat Messages -->
              <div class="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                <div
                  v-for="message in PREVIEW_MESSAGES"
                  :key="message.id"
                  :class="`flex ${message.isSent ? 'justify-end' : 'justify-start'}`"
                >
                  <div
                    :class="`
                      max-w-[80%] rounded-xl p-3 shadow-sm
                      ${message.isSent ? 'bg-primary text-primary-content' : 'bg-base-200'}
                    `"
                  >
                    <p class="text-sm">{{ message.content }}</p>
                    <p
                      :class="`
                        text-[10px] mt-1.5
                        ${message.isSent ? 'text-primary-content/70' : 'text-base-content/70'}
                      `"
                    >
                      12:00 PM
                    </p>
                  </div>
                </div>
              </div>

              <!-- Chat Input -->
              <div class="p-4 border-t border-base-300 bg-base-100">
                <div class="flex gap-2">
                  <input
                    type="text"
                    class="input input-bordered flex-1 text-sm h-10"
                    placeholder="Type a message..."
                    value="This is a preview"
                    readonly
                  />
                  <button class="btn btn-primary h-10 min-h-0">
                    <Send size="18" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Send } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/themeStore'
import { THEMES } from '@/constants'

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
const { setTheme } = themeStore

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
]
</script>

<style scoped></style>
