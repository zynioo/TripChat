<template>
  <aside
    class="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100/80 backdrop-blur-sm"
  >
    <div class="border-b border-base-300 w-full p-5 bg-base-200/50">
      <div class="flex items-center gap-2">
        <Users class="size-6 text-primary" />
        <span class="font-medium hidden lg:block">Kontakty</span>
      </div>
      <!-- Online filter toggle -->
      <div class="mt-3 hidden lg:flex items-center gap-2">
        <label class="cursor-pointer flex items-center gap-2 hover:text-primary transition-colors">
          <input
            type="checkbox"
            v-model="showOnlineOnly"
            class="checkbox checkbox-sm checkbox-primary"
          />
          <span class="text-sm">Pokaż tylko online</span>
        </label>
        <span class="text-xs text-base-content/50">({{ onlineUsersCount - 1 }} online)</span>
      </div>
    </div>

    <div v-if="isUsersLoading">
      <SidebarSkeleton />
    </div>

    <div v-else class="overflow-y-auto w-full py-3">
      <TransitionGroup name="contact-list">
        <button
          v-for="user in filteredUsers"
          :key="user._id"
          @click="setSelectedUser(user)"
          :class="`
            w-full p-3 flex items-center gap-3
            hover:bg-base-200/70 transition-all duration-200
            ${selectedUser?._id === user._id ? 'bg-base-300/80 ring-1 ring-primary/20' : ''}
          `"
          class="contact-item relative"
        >
          <!-- Unread badge -->
          <div
            v-if="user.hasUnread"
            class="absolute top-2 right-2 lg:right-6 size-3 bg-primary rounded-full animate-pulse"
          ></div>

          <div class="relative mx-auto lg:mx-0">
            <img
              :src="user.profilePicture || '/avatar.jpg'"
              :alt="user.name"
              class="size-12 object-cover rounded-full transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
              @error="$event.target.src = '/avatar.jpg'"
            />
            <span
              v-if="isUserOnline(user._id)"
              class="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100 online-indicator"
            />
          </div>

          <!-- User info - only visible on larger screens -->
          <div class="hidden lg:block text-left min-w-0 flex-1">
            <div
              class="font-medium truncate hover:text-primary transition-colors flex items-center gap-2"
            >
              {{ user.name }} {{ user.lastName }}
              <span v-if="user.hasUnread" class="badge badge-sm badge-primary badge-outline ml-1">
                {{ unreadCounts[user._id] || '!' }}
              </span>
            </div>
            <div class="text-sm text-base-content/60 flex items-center gap-1">
              <span v-if="isUserOnline(user._id)" class="inline-flex gap-1 items-center">
                <span class="size-2 bg-green-500 rounded-full inline-block"></span>
                Online
              </span>
              <span v-else>Offline</span>
            </div>
          </div>
        </button>
      </TransitionGroup>

      <div
        v-if="filteredUsers.length === 0"
        class="text-center text-base-content/50 py-6 animate-fadeIn"
      >
        <UserX class="mx-auto mb-2 opacity-40" size="32" />
        <p>Brak użytkowników online</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Users, UserX } from 'lucide-vue-next'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import SidebarSkeleton from '@/components/skeletons/SidebarSkeleton.vue'

const showOnlineOnly = ref(false)
const chatStore = useChatStore()
const authStore = useAuthStore()

const { sortedUsers, selectedUser, isUsersLoading, unreadCounts } = storeToRefs(chatStore)
const { onlineUsers } = storeToRefs(authStore)
const { getUsers, setSelectedUser } = chatStore

onMounted(() => {
  getUsers()

  // Refresh users list periodically
  setInterval(() => {
    if (!isUsersLoading.value) {
      getUsers()
    }
  }, 30000)
})

const filteredUsers = computed(() => {
  return showOnlineOnly.value
    ? sortedUsers.value.filter((user) => onlineUsers.value.includes(user._id))
    : sortedUsers.value
})

const isUserOnline = (userId: string) => {
  return onlineUsers.value.includes(userId)
}

const onlineUsersCount = computed(() => onlineUsers.value.length)
</script>

<style scoped>
.online-indicator {
  animation: pulse 2s infinite ease-in-out;
}

.contact-item {
  transition: all 0.3s ease;
  border-left: 0px solid transparent;
}

.contact-item:hover {
  border-left: 4px solid var(--primary);
}

/* Contact list transitions */
.contact-list-enter-active,
.contact-list-leave-active {
  transition: all 0.3s ease;
}

.contact-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.contact-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease forwards;
}
</style>
