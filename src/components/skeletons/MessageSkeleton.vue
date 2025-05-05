<template>
  <div class="flex-1 overflow-y-auto p-4 space-y-4">
    <div v-for="idx in 6" :key="idx" :class="`chat ${idx % 2 === 0 ? 'chat-start' : 'chat-end'}`">
      <div class="chat-image avatar">
        <div class="size-10 rounded-full">
          <div class="skeleton w-full h-full rounded-full" />
        </div>
      </div>

      <div class="chat-header mb-1">
        <div class="skeleton h-4 w-16" />
      </div>

      <div class="chat-bubble bg-transparent p-0">
        <div class="skeleton h-16 w-[200px]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
