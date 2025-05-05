<template>
  <div class="flex-1 flex flex-col overflow-auto">
    <ChatHeader />

    <template v-if="isMessagesLoading">
      <MessageSkeleton />
    </template>

    <div
      v-else
      class="flex-1 overflow-y-auto p-4 space-y-4"
      ref="messagesContainerRef"
      @scroll="handleScroll"
    >
      <div
        v-for="(message, index) in messages"
        :key="message._id"
        :class="`chat ${message.senderId === authUser?._id ? 'chat-end' : 'chat-start'}`"
        class="message-item"
      >
        <div class="chat-image avatar">
          <div class="size-10 rounded-full border border-base-300 shadow-md">
            <img
              :src="getProfilePicture(message.senderId)"
              alt="Zdjęcie profilowe"
              class="object-cover w-full h-full"
              @error="handleImageError"
            />
          </div>
        </div>

        <div class="chat-header mb-1">
          <time class="text-xs opacity-75 ml-1">
            {{ formatMessageTime(message.createdAt) }}
          </time>
        </div>

        <div class="chat-bubble flex flex-col drop-shadow-md relative group">
          <!-- Delete button - moved to left side with negative positioning -->
          <button
            v-if="message.senderId === authUser?._id"
            @click="confirmDeleteMessage(message._id)"
            class="absolute top-2 -left-28 size-5 bg-base-100/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-300 z-10"
            title="Usuń wiadomość"
          >
            <Trash2 class="size-3" />
          </button>

          <img
            v-if="message.image"
            :src="message.image"
            alt="Załącznik"
            class="sm:max-w-[200px] rounded-md mb-2"
            loading="lazy"
          />
          <p v-if="message.text">{{ message.text }}</p>
        </div>
      </div>

      <!-- New message notification when user scrolls up -->
      <div
        v-if="!shouldAutoScroll && newMessageAlert"
        class="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full shadow-lg cursor-pointer z-10"
        @click="scrollToLatest"
      >
        <div class="flex items-center gap-2">
          <ArrowDown size="16" />
          <span>Nowa wiadomość</span>
        </div>
      </div>

      <!-- Invisible element at the bottom for scrolling -->
      <div ref="bottomRef" class="h-1"></div>
    </div>

    <MessageInput />

    <!-- Confirmation dialog for message deletion -->
    <dialog ref="deleteDialogRef" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Usuń wiadomość</h3>
        <p class="py-4">Czy na pewno chcesz usunąć tę wiadomość?</p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-sm mr-2">Anuluj</button>
            <button
              @click="handleDeleteMessage"
              class="btn btn-sm btn-error"
              :disabled="isDeletingMessage"
            >
              <span v-if="isDeletingMessage" class="loading loading-spinner loading-xs mr-1"></span>
              Usuń
            </button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { formatMessageTime } from '@/lib/utils'
import { ArrowDown, Trash2 } from 'lucide-vue-next' // Removed Copy import
import { toast } from 'vue-sonner'

import ChatHeader from './ChatHeader.vue'
import MessageInput from './MessageInput.vue'
import MessageSkeleton from '@/components/skeletons/MessageSkeleton.vue'

// Refs for scroll handling
const messagesContainerRef = ref<HTMLElement | null>(null)
const bottomRef = ref<HTMLElement | null>(null)
const shouldAutoScroll = ref(true)
const newMessageAlert = ref(false)
const userHasScrolled = ref(false)

// Store for messages and user info
const chatStore = useChatStore()
const authStore = useAuthStore()

const { messages, isMessagesLoading, selectedUser } = storeToRefs(chatStore)
const { authUser } = storeToRefs(authStore)
const { getMessages, subscribeToMessages, unsubscribeFromMessages, deleteMessage } = chatStore // Added deleteMessage

// Improved scroll to bottom function
const scrollToBottom = (force = false) => {
  if (!messagesContainerRef.value) return

  // Always scroll on initial load or if forced
  if (force || shouldAutoScroll.value) {
    nextTick(() => {
      if (bottomRef.value) {
        bottomRef.value.scrollIntoView({ behavior: 'smooth' })
      } else if (messagesContainerRef.value) {
        messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
      }
    })
  } else if (!shouldAutoScroll.value) {
    // Show new message alert if user is scrolled up
    newMessageAlert.value = true
  }
}

// Go to latest message button handler
const scrollToLatest = () => {
  shouldAutoScroll.value = true
  scrollToBottom(true)
  newMessageAlert.value = false
}

// Enhanced scroll detection with 150px threshold from bottom
const handleScroll = () => {
  if (!messagesContainerRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.value
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight

  userHasScrolled.value = true
  shouldAutoScroll.value = distanceFromBottom < 150

  if (shouldAutoScroll.value) {
    newMessageAlert.value = false
  }
}

onMounted(async () => {
  if (selectedUser.value) {
    // Get messages with improved loading
    await getMessages(selectedUser.value._id)

    // Force scroll to bottom when first loading a conversation
    scrollToBottom(true)

    // Subscribe to new messages with optimized handling
    subscribeToMessages()

    console.log('Chat mounted for user:', selectedUser.value._id)
  }
})

onBeforeUnmount(() => {
  unsubscribeFromMessages()
})

watch(
  () => selectedUser.value,
  async (newUser) => {
    if (newUser) {
      // Reset scroll state when changing conversations
      shouldAutoScroll.value = true
      userHasScrolled.value = false
      newMessageAlert.value = false

      await getMessages(newUser._id)

      // Force scroll to bottom when changing conversations
      scrollToBottom(true)

      subscribeToMessages()

      console.log('Selected user changed to:', newUser._id)
    }
  },
)

// Watch messages array for changes with improved behavior
watch(
  () => messages.value,
  (newMessages, oldMessages) => {
    // If this is new content (not initial load)
    if (oldMessages && oldMessages.length > 0) {
      // Check if the new message is from the current user
      const lastMessage = newMessages[newMessages.length - 1]
      const isOwnMessage = lastMessage && lastMessage.senderId === authUser.value?._id

      // Always scroll for own messages, respect scroll position for others
      scrollToBottom(isOwnMessage)
    } else {
      // Initial load - force scroll
      scrollToBottom(true)
    }

    console.log('Messages updated:', newMessages.length)
  },
  { deep: true },
)

// Function to get profile picture with fallback
const getProfilePicture = (userId: string) => {
  if (userId === authUser.value?._id) {
    return authUser.value?.profilePicture || '/avatar.jpg'
  } else if (selectedUser.value) {
    return selectedUser.value.profilePicture || '/avatar.jpg'
  }
  return '/avatar.jpg'
}

// Handle image load errors
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/avatar.jpg'
}

// Add refs for message deletion functionality
const deleteDialogRef = ref<HTMLDialogElement | null>(null)
const messageToDelete = ref<string | null>(null)
const isDeletingMessage = ref(false)

// Function to open delete confirmation dialog
const confirmDeleteMessage = (id: string) => {
  messageToDelete.value = id
  deleteDialogRef.value?.showModal()
}

// Function to handle message deletion when confirmed
const handleDeleteMessage = async () => {
  if (!messageToDelete.value) return

  isDeletingMessage.value = true
  try {
    await deleteMessage(messageToDelete.value)
    deleteDialogRef.value?.close()
  } catch (error) {
    console.error('Failed to delete message:', error)
  } finally {
    isDeletingMessage.value = false
    messageToDelete.value = null
  }
}
</script>

<style scoped>
/* Enhanced scrolling behavior */
.flex-1.overflow-y-auto {
  scroll-behavior: smooth;
  scroll-padding-bottom: 20px;
}

/* Remove all animations for immediate display */
.message-item {
  opacity: 1 !important;
  animation: none !important;
}

.chat-bubble {
  animation: none !important;
  transition: none !important;
}

/* Remove hover animations that might slow rendering */
.chat-image img {
  transition: none !important;
}

/* Fix alert button animation */
.fixed.bottom-20 {
  animation: none;
}

/* Remove all transitions that might delay content */
.chat-start .chat-bubble,
.chat-end .chat-bubble,
img,
div {
  animation: none !important;
  transform: none !important;
  transition: none !important;
}

/* Add styles for delete button and modal */
.message-item {
  position: relative;
}

.modal {
  backdrop-filter: blur(4px);
}

/* Override any hover transitions specifically for delete button */
.message-item .chat-bubble button {
  transition: opacity 0.2s ease !important;
}

.group:hover .opacity-0 {
  opacity: 1 !important;
}

/* Better position for delete button */
.chat-end .chat-bubble button {
  left: -6px; /* Left side for messages sent by the user */
}

.chat-start .chat-bubble button {
  left: -6px; /* Left side for messages received */
}

/* Improve hover area so button is easier to click */
.message-item .chat-bubble {
  padding-left: 6px; /* Add some padding to avoid text overlap */
}
</style>
