import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Initialize from localStorage or default to 'light'
  const theme = ref(localStorage.getItem('theme') || 'black')

  const setTheme = (newTheme: string) => {
    localStorage.setItem('theme', newTheme)
    theme.value = newTheme
  }

  return {
    theme,
    setTheme,
  }
})
