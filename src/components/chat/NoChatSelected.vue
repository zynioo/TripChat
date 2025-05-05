<template>
  <div class="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
    <div class="max-w-md text-center space-y-6 animate-fadeIn">
      <!-- Icon Display with enhanced animation -->
      <div class="flex justify-center gap-4 mb-4">
        <div class="relative">
          <div
            class="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-float shadow-lg"
          >
            <MessageSquare class="w-10 h-10 text-primary animate-pulse-slow" />
          </div>
          <div
            class="w-12 h-12 rounded-xl bg-secondary/10 absolute -bottom-4 -right-4 flex items-center justify-center animate-float-delayed shadow-md"
          >
            <UserPlus class="w-6 h-6 text-secondary" />
          </div>
        </div>
      </div>

      <!-- Welcome Text -->
      <h2 class="text-2xl font-bold gradient-text">Witaj w TripChat!</h2>
      <p class="text-base-content/70">
        Wybierz rozmowę z listy kontaktów, aby rozpocząć czatowanie
      </p>

      <!-- Helpful tips -->
      <div class="mt-8 pt-8 border-t border-base-300">
        <h3 class="text-lg font-medium mb-4">Wskazówki:</h3>
        <div class="flex flex-col gap-3">
          <div class="flex items-start gap-3 text-left">
            <Users class="w-5 h-5 text-primary mt-1" />
            <span>Znajdź znajomych na liście po lewej stronie</span>
          </div>
          <div class="flex items-start gap-3 text-left">
            <Image class="w-5 h-5 text-primary mt-1" />
            <span>Możesz wysyłać zdjęcia, klikając ikonę obrazu</span>
          </div>
          <div class="flex items-start gap-3 text-left">
            <Settings class="w-5 h-5 text-primary mt-1" />
            <span>Dostosuj wygląd aplikacji w ustawieniach</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MessageSquare, UserPlus, Users, Image, Settings } from 'lucide-vue-next'
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 1s ease-in-out;
}

.animate-float {
  animation: float 6s infinite ease-in-out;
}

.animate-float-delayed {
  animation: float 4s infinite ease-in-out 1s;
}

.animate-pulse-slow {
  animation: pulseSlow 3s infinite ease-in-out;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulseSlow {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.95);
  }
}

.gradient-text {
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
