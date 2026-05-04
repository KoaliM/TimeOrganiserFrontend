<script setup lang="ts">
import { useUserStore } from '@/stores/users'
import { RouterLink } from 'vue-router'
import LogoComponent from './LogoComponent.vue'

const userStore = useUserStore()
</script>

<template>
  <nav class="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-[#FA5BAF]/10">
    <div class="flex items-center justify-between px-6 md:px-12 py-4">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center hover:opacity-80 transition-opacity">
        <div class="w-12 h-12 md:w-14 md:h-14">
          <LogoComponent />
        </div>
      </RouterLink>

      <!-- Center Navigation Links -->
      <div class="hidden md:flex items-center gap-8">
        <RouterLink
          to="/"
          class="text-base font-semibold text-gray-700 hover:text-[#FA5BAF] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-linear-to-r after:from-[#FA5BAF] after:to-[#E83E8C] hover:after:w-full after:transition-all"
          style="font-family: 'Quicksand', sans-serif"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/friends"
          class="text-base font-semibold text-gray-700 hover:text-[#FA5BAF] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-[#FA5BAF] after:to-[#E83E8C] hover:after:w-full after:transition-all"
          style="font-family: 'Quicksand', sans-serif"
        >
          Befriend
        </RouterLink>
        <RouterLink
          to="/schedule"
          class="text-base font-semibold text-gray-700 hover:text-[#FA5BAF] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-[#FA5BAF] after:to-[#E83E8C] hover:after:w-full after:transition-all"
          style="font-family: 'Quicksand', sans-serif"
        >
          Meet
        </RouterLink>
        <RouterLink
          to="/tasks"
          class="text-base font-semibold text-gray-700 hover:text-[#FA5BAF] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-[#FA5BAF] after:to-[#E83E8C] hover:after:w-full after:transition-all"
          style="font-family: 'Quicksand', sans-serif"
        >
          My tasks
        </RouterLink>
      </div>

      <!-- Auth Button -->
      <RouterLink
        v-if="!userStore.isAuthenticated"
        to="/login"
        class="px-6 md:px-8 py-2 bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-300/40 transition-all duration-300 text-sm md:text-base"
        style="font-family: 'Quicksand', sans-serif"
      >
        Login
      </RouterLink>
      <RouterLink
        v-else
        to="/profile"
        class="px-6 md:px-8 py-2 bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-300/40 transition-all duration-300 text-sm md:text-base"
        style="font-family: 'Quicksand', sans-serif"
      >
        Profile
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap');
</style>
