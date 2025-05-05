<template>
  <aside
    class="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200"
  >
    <!-- Header -->
    <div class="border-b border-base-300 w-full p-5">
      <div class="flex items-center gap-2">
        <Users class="w-6 h-6" />
        <span class="font-medium hidden lg:block">Contacts</span>
      </div>
    </div>

    <!-- Skeleton Contacts -->
    <div class="overflow-y-auto w-full py-3">
      <div v-for="idx in 8" :key="idx" class="w-full p-3 flex items-center gap-3">
        <!-- Avatar skeleton -->
        <div class="relative mx-auto lg:mx-0">
          <div class="skeleton size-12 rounded-full" />
        </div>

        <!-- User info skeleton - only visible on larger screens -->
        <div class="hidden lg:block text-left min-w-0 flex-1">
          <div class="skeleton h-4 w-32 mb-2" />
          <div class="skeleton h-3 w-16" />
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Users } from 'lucide-vue-next'
</script>
