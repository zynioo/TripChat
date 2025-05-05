<template>
  <div class="hidden lg:flex items-center justify-center bg-base-200 p-12">
    <div class="max-w-md text-center">
      <div class="grid grid-cols-3 gap-3 mb-8">
        <div
          v-for="i in 9"
          :key="i"
          :class="`aspect-square rounded-2xl bg-primary/10 ${i % 2 === 0 ? 'animate-pulse' : ''}`"
        />
      </div>
      <h2 class="text-2xl font-bold mb-4">{{ title }}</h2>
      <p class="text-base-content/60">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>
