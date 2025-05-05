script<template>
  <div class="p-4 w-full bg-base-100/80 backdrop-blur-sm border-t border-base-300">
    <div v-if="imagePreview" class="mb-3 flex items-center gap-2 animate-slideDown">
      <div class="relative group">
        <img
          :src="imagePreview"
          alt="Podgląd"
          class="w-20 h-20 object-cover rounded-lg border border-base-300 shadow-md group-hover:shadow-lg transition-all duration-300"
        />
        <button
          @click="removeImage"
          class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300 flex items-center justify-center hover:bg-red-500 hover:text-white transform hover:rotate-90 transition-all duration-300"
          type="button"
        >
          <X class="size-3" />
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
      <div class="flex-1 flex gap-2">
        <div class="relative w-full">
          <input
            type="text"
            class="w-full input input-bordered rounded-full input-sm sm:input-md pr-10 focus:ring-2 ring-primary/20"
            placeholder="Napisz wiadomość..."
            v-model="text"
          />
          <div
            class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-base-content/50"
            v-if="isTyping"
          >
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          class="hidden"
          ref="fileInputRef"
          @change="handleImageChange"
        />

        <button
          type="button"
          class="hidden sm:flex btn btn-circle btn-ghost hover:bg-base-200 transition-colors"
          :class="imagePreview ? 'text-primary' : 'text-base-content/50'"
          @click="fileInputRef?.click()"
        >
          <ImageIcon size="20" />
        </button>
      </div>

      <button
        type="submit"
        class="btn btn-circle btn-primary hover:scale-105"
        :disabled="!text.trim() && !imagePreview"
        :class="{ 'animate-pulse-subtle': text.trim() || imagePreview }"
      >
        <Send size="22" />
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Image as ImageIcon, Send, X } from 'lucide-vue-next'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'vue-sonner'

const text = ref('')
const imagePreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isTyping = ref(false)
const typingTimeout = ref<number | null>(null)
const typingEmitTimeout = ref<number | null>(null)
let lastTypingEmit = 0

const chatStore = useChatStore()
const authStore = useAuthStore()
const { sendMessage } = chatStore

const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Proszę wybrać plik graficzny')
    return
  }

  // Add file size validation - limit to 5MB
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Rozmiar obrazu powinien być mniejszy niż 5MB')
    return
  }

  const reader = new FileReader()
  reader.onloadend = () => {
    imagePreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  imagePreview.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const handleSendMessage = async () => {
  if (!text.value.trim() && !imagePreview.value) return

  try {
    await sendMessage({
      text: text.value.trim(),
      image: imagePreview.value || undefined,
    })

    // Clear form
    text.value = ''
    imagePreview.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
  } catch (error) {
    console.error('Nie udało się wysłać wiadomości:', error)
  }
}

// Enhanced typing indicator logic
watch(text, (newText, oldText) => {
  const currentTime = Date.now()
  const socket = authStore.socket
  
  // Only proceed if we have socket and selected user
  if (!socket || !chatStore.selectedUser) return
  
  // If text is not empty and has changed
  if (newText.trim() && newText !== oldText) {
    isTyping.value = true
    
    // Only emit typing event if we haven't done so in the last 2 seconds
    if (currentTime - lastTypingEmit > 2000) {
      socket.emit('typing', {
        receiverId: chatStore.selectedUser._id
      })
      lastTypingEmit = currentTime
    }
    
    // Clear any existing typing timeout
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
    }
    
    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeout.value = setTimeout(() => {
      isTyping.value = false
      socket.emit('stopTyping', {
        receiverId: chatStore.selectedUser._id
      })
    }, 2000) as unknown as number
  } else if (!newText.trim() && oldText.trim()) {
    // If text was cleared - stop typing immediately
    isTyping.value = false
    socket.emit('stopTyping', {
      receiverId: chatStore.selectedUser._id
    })
    
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
    }
  }
})

// Clear typing indicators when component is destroyed
onBeforeUnmount(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  
  if (typingEmitTimeout.value) {
    clearTimeout(typingEmitTimeout.value)
  }
  
  // Make sure to send stopTyping when leaving chat
  if (isTyping.value && authStore.socket && chatStore.selectedUser) {
    authStore.socket.emit('stopTyping', {
      receiverId: chatStore.selectedUser._id
    })
  }
})

// Also handle selected user changes
watch(() => chatStore.selectedUser, () => {
  // Clear typing state when changing chats
  isTyping.value = false
  
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  
  // If we were typing with previous user, send stopTyping
  if (lastTypingEmit > 0 && authStore.socket && chatStore.selectedUser) {
    authStore.socket.emit('stopTyping', {
      receiverId: chatStore.selectedUser._id
    })
    lastTypingEmit = 0
  }
})
</script>

<style scoped>
.animate-slideDown {
  animation: slideDown 0.3s ease-out forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-pulse-subtle {
  animation: pulseSub 2s infinite ease-in-out;
}

@keyframes pulseSub {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 2px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: currentColor;
  animation: typingDot 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typingDot {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
