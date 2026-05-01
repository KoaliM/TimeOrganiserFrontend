<script setup lang="ts">
import { useUserStore } from '@/stores/users'
import { RouterLink } from 'vue-router'
const userStore = useUserStore()
</script>

<template>
  <span class="flex">
    <div class="flex justify-center w-full py-3">
      <div
        class="flex items-center justify-center gap-12 px-32 py-2 rounded-full bg-linear-to-br from-[#FA5BAF]/30 to-[#E83E8C]/50 backdrop-blur-xl shadow-2xl shadow-pink-300/40"
      >
        <RouterLink
          to="/"
          class="text-[22px] font-bold text-gray-800 hover:text-white transition-colors"
          style="font-family: 'Quicksand', sans-serif"
          >Befriend</RouterLink
        >
        <RouterLink
          to="/"
          class="text-[22px] font-bold text-gray-800 hover:text-white transition-colors"
          style="font-family: 'Quicksand', sans-serif"
          >Meet</RouterLink
        >
        <RouterLink
          to="/"
          class="text-[22px] font-bold text-gray-800 hover:text-white transition-colors"
          style="font-family: 'Quicksand', sans-serif"
          >My tasks</RouterLink
        >
      </div>
    </div>
    <div class="flex items-center justify-end px-10">
      <button
        class="rounded-4xl bg-black px-20 py-1 text-white font-semibold hover:bg-[#FA5BAF]/60 transition-colors"
      >
        <RouterLink
          to="/login"
          v-if="!userStore.isAuthenticated"
          class="text-[22px] whitespace-nowrap"
          style="font-family: 'Quicksand', sans-serif"
          >Login</RouterLink
        >
        <RouterLink to="/profile" v-else class="text-[16px]"></RouterLink>
      </button>
    </div>
  </span>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap');
</style>
