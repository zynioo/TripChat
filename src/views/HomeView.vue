<template>
  <div class="h-screen bg-base-200">
    <div class="flex items-center justify-center pt-20 px-4">
      <div class="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
        <div class="flex h-full rounded-lg overflow-hidden">
          <Sidebar />
          <NoChatSelected v-if="!selectedUser" />
          <ChatContainer v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chatStore'
import Sidebar from '@/components/chat/Sidebar.vue'
import NoChatSelected from '@/components/chat/NoChatSelected.vue'
import ChatContainer from '@/components/chat/ChatContainer.vue'

const chatStore = useChatStore()
const { selectedUser } = storeToRefs(chatStore)
</script>

<style scoped></style>
