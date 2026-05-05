<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/users'

const router = useRouter()
const userStore = useUserStore()

const isLoggedIn = () => userStore.isAuthenticated

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white via-white to-[#FA5BAF]/5">
    <section class="pt-20 md:pt-32 pb-24 px-6 text-center">
      <h1
        class="text-5xl md:text-7xl font-bold leading-tight text-transparent bg-clip-text bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] mb-6"
        style="font-family: 'Quicksand', sans-serif"
      >
        Manage your time effortlessly
      </h1>
      <p class="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
        Connect with friends, organize your schedule
      </p>

      <div v-if="!isLoggedIn()" class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <button
          @click="navigateTo('/login')"
          class="px-8 py-3 bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] text-white rounded-full font-bold text-lg hover:shadow-lg hover:shadow-pink-300/40 transition-all duration-300 transform hover:scale-105"
          style="font-family: 'Quicksand', sans-serif"
        >
          Get Started
        </button>
        <button
          @click="navigateTo('/about')"
          class="px-8 py-3 bg-white border-2 border-[#FA5BAF] text-[#FA5BAF] rounded-full font-bold text-lg hover:bg-[#FA5BAF]/5 transition-all duration-300 transform hover:scale-105"
          style="font-family: 'Quicksand', sans-serif"
        >
          Learn More
        </button>
      </div>
    </section>

    <section class="py-20 px-6 max-w-6xl mx-auto">
      <h2
        class="text-5xl font-bold text-center text-transparent bg-clip-text bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] mb-20"
        style="font-family: 'Quicksand', sans-serif"
      >
        Why Choose Time Organiser?
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:shadow-pink-300/50 transition-all duration-300 transform hover:-translate-y-3 border border-[#FA5BAF]/20 group"
        >
          <div
            class="w-20 h-20 bg-linear-to-br from-[#FA5BAF]/30 to-[#E83E8C]/30 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform"
          >
            <span class="text-5xl">👥</span>
          </div>
          <h3
            class="text-2xl font-bold text-gray-800 text-center mb-4"
            style="font-family: 'Quicksand', sans-serif"
          >
            Build connections
          </h3>
          <p class="text-gray-600 text-center leading-relaxed">
            Build your network and easily keep track of your closest friends and colleagues
          </p>
        </div>

        <div
          class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:shadow-pink-300/50 transition-all duration-300 transform hover:-translate-y-3 border border-[#FA5BAF]/20 group"
        >
          <div
            class="w-20 h-20 bg-linear-to-br from-[#FA5BAF]/30 to-[#E83E8C]/30 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform"
          >
            <span class="text-5xl">📅</span>
          </div>
          <h3
            class="text-2xl font-bold text-gray-800 text-center mb-4"
            style="font-family: 'Quicksand', sans-serif"
          >
            Smart Calendar Sync
          </h3>
          <p class="text-gray-600 text-center leading-relaxed">
            Share calendars with friends and find the perfect time to meet based on availability
          </p>
        </div>

        <div
          class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:shadow-pink-300/50 transition-all duration-300 transform hover:-translate-y-3 border border-[#FA5BAF]/20 group"
        >
          <div
            class="w-20 h-20 bg-linear-to-br from-[#FA5BAF]/30 to-[#E83E8C]/30 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform"
          >
            <span class="text-5xl">✅</span>
          </div>
          <h3
            class="text-2xl font-bold text-gray-800 text-center mb-4"
            style="font-family: 'Quicksand', sans-serif"
          >
            Organize Everything
          </h3>
          <p class="text-gray-600 text-center leading-relaxed">
            Manage assignments, tasks, hobbies, and personal projects all in one place
          </p>
        </div>
      </div>
    </section>

    <section class="py-24 px-6 max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div class="flex flex-col justify-center">
          <h2
            class="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] mb-8"
            style="font-family: 'Quicksand', sans-serif"
          >
            Stay Organized
          </h2>
          <ul class="space-y-4">
            <li class="flex items-start gap-4 group">
              <span
                class="w-8 h-8 bg-linear-to-br from-[#FA5BAF] to-[#E83E8C] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform"
                >✓</span
              >
              <span class="text-gray-700 pt-1 text-lg">Organize assignments and deadlines</span>
            </li>
            <li class="flex items-start gap-4 group">
              <span
                class="w-8 h-8 bg-linear-to-br from-[#FA5BAF] to-[#E83E8C] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform"
                >✓</span
              >
              <span class="text-gray-700 pt-1 text-lg">Track daily tasks with priorities</span>
            </li>
            <li class="flex items-start gap-4 group">
              <span
                class="w-8 h-8 bg-linear-to-br from-[#FA5BAF] to-[#E83E8C] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform"
                >✓</span
              >
              <span class="text-gray-700 pt-1 text-lg">Schedule hobbies and leisure time</span>
            </li>
          </ul>
        </div>

        <div class="flex flex-col justify-center">
          <h2
            class="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] mb-8"
            style="font-family: 'Quicksand', sans-serif"
          >
            Meet with Friends
          </h2>
          <ul class="space-y-5">
            <li class="flex items-start gap-4 group">
              <span
                class="w-8 h-8 bg-linear-to-br from-[#FA5BAF] to-[#E83E8C] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform"
                >✓</span
              >
              <span class="text-gray-700 pt-1 text-lg">View friends' availability</span>
            </li>
            <li class="flex items-start gap-4 group">
              <span
                class="w-8 h-8 bg-linear-to-br from-[#FA5BAF] to-[#E83E8C] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform"
                >✓</span
              >
              <span class="text-gray-700 pt-1 text-lg">Request meetings automatically</span>
            </li>
            <li class="flex items-start gap-4 group">
              <span
                class="w-8 h-8 bg-linear-to-br from-[#FA5BAF] to-[#E83E8C] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform"
                >✓</span
              >
              <span class="text-gray-700 pt-1 text-lg">Receive meeting proposals</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
    <footer
      class="py-16 px-6 border-t border-gray-200/50 bg-gradient-to-b from-transparent to-[#FA5BAF]/3"
    >
      <div class="max-w-6xl mx-auto text-center">
        <p class="text-gray-600 text-lg">&copy; 2026 Time Organiser. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap');
</style>
