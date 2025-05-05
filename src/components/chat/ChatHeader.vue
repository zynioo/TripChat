<template>
  <div class="p-3 border-b border-base-300 backdrop-blur-sm bg-base-100/80 sticky top-0 z-10">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Avatar with animation -->
        <div class="avatar">
          <div
            class="size-12 rounded-full relative ring ring-primary/10 hover:ring-primary/30 transition-all duration-300"
          >
            <img
              :src="selectedUser.profilePicture || '/avatar.jpg'"
              :alt="selectedUser.name"
              class="object-cover hover:scale-105 transition-all duration-300"
              @error="$event.target.src = '/avatar.jpg'"
            />
            <div
              v-if="isUserOnline"
              class="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100 online-indicator"
            ></div>
          </div>
        </div>

        <!-- User info with animation -->
        <div class="animate-fadeIn">
          <h3 class="font-medium text-lg">{{ selectedUser.name }} {{ selectedUser.lastName }}</h3>
          <p class="text-sm text-base-content/70 flex items-center gap-1">
            <span
              v-if="isUserOnline"
              class="size-2 bg-green-500 rounded-full inline-block mr-1"
            ></span>
            {{ isUserOnline ? 'Online' : 'Offline' }}

            <!-- Fixed typing indicator - only show when user is typing AND online -->
            <span v-if="isUserTyping && isUserOnline" class="typing-indicator ml-2 text-primary">
              pisze...
            </span>
          </p>
        </div>
      </div>

      <!-- Close button with animation -->
      <button
        @click="setSelectedUser(null)"
        class="btn btn-circle btn-sm btn-ghost hover:bg-base-200 hover:rotate-90 transition-all duration-300"
      >
        <X />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { selectedUser } = storeToRefs(chatStore)
const { onlineUsers } = storeToRefs(authStore)
const { setSelectedUser } = chatStore

const isUserOnline = computed(() => {
  if (!selectedUser.value) return false
  return onlineUsers.value.includes(selectedUser.value._id)
})

// Track typing state
const isUserTyping = ref(false)
const typingTimeout = ref<number | null>(null)

// Listen for typing events
onMounted(() => {
  const socket = authStore.socket

  if (!socket) return

  const handleUserTyping = (data: any) => {
    // Only update typing status if it's from the selected user
    if (selectedUser.value && data.userId === selectedUser.value._id) {
      isUserTyping.value = true

      // Clear existing timeout if any
      if (typingTimeout.value) {
        clearTimeout(typingTimeout.value)
      }

      // Auto-clear typing indicator after 3 seconds of no updates
      typingTimeout.value = setTimeout(() => {
        isUserTyping.value = false
      }, 3000) as unknown as number
    }
  }

  const handleUserStoppedTyping = (data: any) => {
    // Only update if it's from the selected user
    if (selectedUser.value && data.userId === selectedUser.value._id) {
      isUserTyping.value = false

      // Clear timeout if exists
      if (typingTimeout.value) {
        clearTimeout(typingTimeout.value)
        typingTimeout.value = null
      }
    }
  }

  socket.on('userTyping', handleUserTyping)
  socket.on('userStoppedTyping', handleUserStoppedTyping)

  // Also clear typing when user goes offline
  const unwatch = watch(isUserOnline, (newValue) => {
    if (!newValue) {
      isUserTyping.value = false
    }
  })

  // Cleanup
  onUnmounted(() => {
    socket.off('userTyping', handleUserTyping)
    socket.off('userStoppedTyping', handleUserStoppedTyping)
    unwatch()

    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
    }
  })
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.5s ease-in;
}

.online-indicator {
  animation: pulse 2s infinite ease-in-out;
}

.typing-indicator {
  position: relative;
  animation: typing-pulse 1s infinite alternate;
}

@keyframes typing-pulse {
  0% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
