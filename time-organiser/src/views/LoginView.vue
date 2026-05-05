<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/services/api'
import { useUserStore } from '@/stores/users'
import type { User } from '@/utils/types'

interface LoginRequest {
  userName: string
  password: string
}

interface LoginResponse {
  profile?: User
  accessToken?: string
  refreshToken?: string
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const form = ref({
  userName: '',
  password: '',
})
const isLoggingIn = ref(false)
const errorMessage = ref('')

const registerLink = computed(() => ({
  path: '/register',
  query: route.query.redirect ? { redirect: String(route.query.redirect) } : {},
}))

const login = async () => {
  isLoggingIn.value = true
  errorMessage.value = ''

  try {
    const response = await apiClient.post<LoginResponse, LoginRequest>('/auth/login', form.value)

    if (response.accessToken) {
      userStore.setAccessToken(response.accessToken)
    }

    if (response.refreshToken) {
      userStore.setRefreshToken(response.refreshToken)
    }

    if (response.profile) {
      userStore.setProfile(response.profile)
    }

    router.push(String(route.query.redirect ?? '/schedule'))
  } catch (error) {
    errorMessage.value = 'Login failed. Please check your username and password.'
    console.error('Login failed:', error)
  } finally {
    isLoggingIn.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-white via-[#FA5BAF]/3 to-white">
    <section class="max-w-2xl mx-auto px-6 py-12 md:py-16">
      <div class="mb-10 text-center">
        <h1
          class="text-3xl md:text-5xl font-bold leading-tight pb-1 text-transparent bg-clip-text bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] mb-4"
          style="font-family: 'Quicksand', sans-serif"
        >
          Login
        </h1>
      </div>

      <form
        class="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-[#FA5BAF]/10 p-6"
        @submit.prevent="login"
      >
        <div class="grid gap-5">
          <label class="block">
            <span class="text-sm font-semibold text-gray-700">Username</span>
            <input
              v-model="form.userName"
              type="text"
              required
              class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
            />
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-gray-700">Password</span>
            <input
              v-model="form.password"
              type="password"
              required
              class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
            />
          </label>
        </div>

        <p v-if="errorMessage" class="mt-5 text-sm font-semibold text-red-600">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="isLoggingIn"
          class="mt-6 w-full rounded-full bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] px-8 py-3 font-bold text-white transition hover:shadow-lg hover:shadow-pink-300/40 disabled:opacity-60"
          style="font-family: 'Quicksand', sans-serif"
        >
          {{ isLoggingIn ? 'Logging in...' : 'Login' }}
        </button>

        <p class="mt-6 text-center text-sm text-gray-600">
          Don't have an account?
          <RouterLink :to="registerLink" class="font-bold text-[#E83E8C] hover:text-[#FA5BAF]">
            Register
          </RouterLink>
        </p>
      </form>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap');
</style>
