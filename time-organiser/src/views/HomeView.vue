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
  <div class="min-h-screen bg-linear-to-br from-white via-[#FA5BAF]/3 to-white">
    <!-- Hero Section -->
    <section class="pt-16 md:pt-24 pb-20 px-6 text-center">
      <h1
        class="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] mb-4"
        style="font-family: 'Quicksand', sans-serif"
      >
        Organize Your Time, Together
      </h1>
      <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Connect with friends, organize your schedule, and manage your time effortlessly
      </p>

      <!-- CTA Buttons -->
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
          class="px-8 py-3 bg-white border-2 border-[#FA5BAF] text-[#FA5BAF] rounded-full font-bold text-lg hover:bg-[#FA5BAF]/5 transition-all duration-300 transform hover:scale-105\"
          style="font-family: 'Quicksand', sans-serif"
        >
          Learn More
        </button>
      </div>

      <div v-else class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <button
          @click="navigateTo('/dashboard')"
          class="px-8 py-3 bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] text-white rounded-full font-bold text-lg hover:shadow-lg hover:shadow-pink-300/40 transition-all duration-300 transform hover:scale-105"
          style="font-family: 'Quicksand', sans-serif"
        >
          Go to Dashboard
        </button>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-6 max-w-6xl mx-auto">
      <h2
        class="text-4xl font-bold text-center text-transparent bg-clip-text bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] mb-16"
        style="font-family: 'Quicksand', sans-serif"
      >
        Why Choose Time Organiser?
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div
          class="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:shadow-pink-200/50 transition-all duration-300 transform hover:-translate-y-2 border border-[#FA5BAF]/10"
        >
          <div
            class="w-16 h-16 bg-linear-to-br from-[#FA5BAF]/20 to-[#E83E8C]/20 rounded-full flex items-center justify-center mb-4 mx-auto"
          >
            <span class="text-3xl">👥</span>
          </div>
          <h3
            class="text-2xl font-bold text-gray-800 text-center mb-3"
            style="font-family: 'Quicksand', sans-serif"
          >
            Connect with Friends
          </h3>
          <p class="text-gray-600 text-center">
            Build your network and easily keep track of your closest friends and colleagues
          </p>
        </div>

        <!-- Feature 2 -->
        <div
          class="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:shadow-pink-200/50 transition-all duration-300 transform hover:-translate-y-2 border border-[#FA5BAF]/10"
        >
          <div
            class="w-16 h-16 bg-linear-to-br from-[#FA5BAF]/20 to-[#E83E8C]/20 rounded-full flex items-center justify-center mb-4 mx-auto"
          >
            <span class="text-3xl">📅</span>
          </div>
          <h3
            class="text-2xl font-bold text-gray-800 text-center mb-3"
            style="font-family: 'Quicksand', sans-serif"
          >
            Smart Calendar Sync
          </h3>
          <p class="text-gray-600 text-center">
            Share calendars with friends and find the perfect time to meet based on availability
          </p>
        </div>

        <!-- Feature 3 -->
        <div
          class="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:shadow-pink-200/50 transition-all duration-300 transform hover:-translate-y-2 border border-[#FA5BAF]/10"
        >
          <div
            class="w-16 h-16 bg-linear-to-br from-[#FA5BAF]/20 to-[#E83E8C]/20 rounded-full flex items-center justify-center mb-4 mx-auto"
          >
            <span class="text-3xl">✅</span>
          </div>
          <h3
            class="text-2xl font-bold text-gray-800 text-center mb-3"
            style="font-family: 'Quicksand', sans-serif"
          >
            Organize Everything
          </h3>
          <p class="text-gray-600 text-center">
            Manage assignments, tasks, hobbies, and personal projects all in one place
          </p>
        </div>
      </div>
    </section>

    <!-- Features Highlights -->
    <section class="py-20 px-6 max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Left Side -->
        <div class="flex flex-col justify-center">
          <h2
            class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FA5BAF] to-[#E83E8C] mb-6"
            style="font-family: 'Quicksand', sans-serif"
          >
            Stay Organized
          </h2>
          <ul class="space-y-4">
            <li class="flex items-center gap-3">
              <span
                class="w-6 h-6 bg-[#FA5BAF] rounded-full flex items-center justify-center text-white text-sm"
                >✓</span
              >
              <span class="text-gray-700">Organize assignments and deadlines</span>
            </li>
            <li class="flex items-center gap-3">
              <span
                class="w-6 h-6 bg-[#FA5BAF] rounded-full flex items-center justify-center text-white text-sm"
                >✓</span
              >
              <span class="text-gray-700">Track daily tasks with priorities</span>
            </li>
            <li class="flex items-center gap-3">
              <span
                class="w-6 h-6 bg-[#FA5BAF] rounded-full flex items-center justify-center text-white text-sm"
                >✓</span
              >
              <span class="text-gray-700">Schedule hobbies and leisure time</span>
            </li>
            <li class="flex items-center gap-3">
              <span
                class="w-6 h-6 bg-[#FA5BAF] rounded-full flex items-center justify-center text-white text-sm"
                >✓</span
              >
              <span class="text-gray-700">Get reminders for important events</span>
            </li>
          </ul>
        </div>

        <!-- Right Side -->
        <div class="flex flex-col justify-center">
          <h2
            class="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] mb-6"
            style="font-family: 'Quicksand', sans-serif"
          >
            Meet with Friends
          </h2>
          <ul class="space-y-4">
            <li class="flex items-center gap-3">
              <span
                class="w-6 h-6 bg-[#FA5BAF] rounded-full flex items-center justify-center text-white text-sm"
                >✓</span
              >
              <span class="text-gray-700">View friends' availability</span>
            </li>
            <li class="flex items-center gap-3">
              <span
                class="w-6 h-6 bg-[#FA5BAF] rounded-full flex items-center justify-center text-white text-sm"
                >✓</span
              >
              <span class="text-gray-700">Request meetings automatically</span>
            </li>
            <li class="flex items-center gap-3">
              <span
                class="w-6 h-6 bg-[#FA5BAF] rounded-full flex items-center justify-center text-white text-sm"
                >✓</span
              >
              <span class="text-gray-700">Receive meeting proposals</span>
            </li>
            <li class="flex items-center gap-3">
              <span
                class="w-6 h-6 bg-[#FA5BAF] rounded-full flex items-center justify-center text-white text-sm"
                >✓</span
              >
              <span class="text-gray-700">Real-time notifications</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-6">
      <div
        class="max-w-4xl mx-auto bg-linear-to-r from-[#FA5BAF]/20 to-[#E83E8C]/20 rounded-3xl p-12 text-center"
      >
        <h2
          class="text-4xl font-bold text-gray-800 mb-4"
          style="font-family: 'Quicksand', sans-serif"
        >
          Ready to Get Started?
        </h2>
        <p class="text-xl text-gray-600 mb-8">
          Join thousands of users organizing their time and connecting with friends
        </p>
        <button
          v-if="!isLoggedIn()"
          @click="navigateTo('/login')"
          class="px-10 py-4 bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] text-white rounded-full font-bold text-lg hover:shadow-lg transition-all"
        >
          Create Your Free Account
        </button>
        <button
          v-else
          @click="navigateTo('/dashboard')"
          class="px-10 py-4 bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] text-white rounded-full font-bold text-lg hover:shadow-lg transition-all"
        >
          Open Dashboard
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-6 border-t border-gray-200">
      <div class="max-w-6xl mx-auto text-center text-gray-600">
        <p>&copy; 2025 Time Organiser. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap');
</style>
