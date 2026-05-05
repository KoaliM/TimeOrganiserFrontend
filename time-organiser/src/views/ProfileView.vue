<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiClient } from '@/services/api'
import { useUserStore } from '@/stores/users'
import type { GoogleCalendarStatus } from '@/utils/types'

interface GoogleCalendarConnection {
  authorizationUrl: string
}

const userStore = useUserStore()
const googleCalendarStatus = ref<GoogleCalendarStatus | null>(null)
const isGoogleCalendarStatusLoading = ref(false)
const googleCalendarError = ref('')

const loadGoogleCalendarStatus = async () => {
  isGoogleCalendarStatusLoading.value = true
  googleCalendarError.value = ''

  try {
    googleCalendarStatus.value = await apiClient.get<GoogleCalendarStatus>('/calendar/google/status')
  } catch (error) {
    googleCalendarError.value = 'Google Calendar status could not be loaded.'
    console.error('Could not load Google Calendar status:', error)
  } finally {
    isGoogleCalendarStatusLoading.value = false
  }
}

const connectGoogleCalendar = async () => {
  googleCalendarError.value = ''

  try {
    const connection = await apiClient.get<GoogleCalendarConnection>('/calendar/google/connect')
    window.location.href = connection.authorizationUrl
  } catch (error) {
    googleCalendarError.value = 'Google Calendar connection could not be started.'
    console.error('Could not start Google Calendar connection:', error)
  }
}

onMounted(() => {
  loadGoogleCalendarStatus()
})
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-white via-[#FA5BAF]/3 to-white">
    <section class="max-w-4xl mx-auto px-6 py-12 md:py-16">
      <div class="mb-10">
        <h1
          class="text-4xl md:text-5xl font-bold leading-tight pb-1 text-transparent bg-clip-text bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] mb-4"
          style="font-family: 'Quicksand', sans-serif"
        >
          Profile
        </h1>
        <p class="text-lg text-gray-600">Manage your account and calendar connection.</p>
      </div>

      <div class="grid gap-6">
        <section
          class="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-[#FA5BAF]/10 p-6"
        >
          <h2
            class="text-2xl font-bold text-gray-800 mb-4"
            style="font-family: 'Quicksand', sans-serif"
          >
            Account
          </h2>
          <div class="grid gap-3 text-gray-600">
            <p>
              <span class="font-bold text-gray-800">Username:</span>
              {{ userStore.profile?.userName ?? 'Not loaded' }}
            </p>
            <p>
              <span class="font-bold text-gray-800">Role:</span>
              {{ userStore.profile?.role ?? 'User' }}
            </p>
          </div>
        </section>

        <section
          class="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-[#FA5BAF]/10 p-6"
        >
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                class="text-2xl font-bold text-gray-800"
                style="font-family: 'Quicksand', sans-serif"
              >
                Google Calendar
              </h2>
              <p v-if="isGoogleCalendarStatusLoading" class="mt-2 text-sm text-gray-500">
                Checking connection...
              </p>
              <p
                v-else-if="googleCalendarStatus?.connected"
                class="mt-2 text-sm font-semibold text-emerald-600"
              >
                Linked{{ googleCalendarStatus.email ? `: ${googleCalendarStatus.email}` : '' }}
              </p>
              <p v-else class="mt-2 text-sm text-gray-500">
                Link Google Calendar so Meet can display your weekly calendar.
              </p>
            </div>

            <button
              type="button"
              @click="connectGoogleCalendar"
              class="rounded-full px-5 py-3 font-bold transition hover:shadow-lg hover:shadow-pink-300/40"
              :class="
                googleCalendarStatus?.connected
                  ? 'border-2 border-[#FA5BAF] bg-white text-[#FA5BAF]'
                  : 'bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] text-white'
              "
              style="font-family: 'Quicksand', sans-serif"
            >
              {{ googleCalendarStatus?.connected ? 'Reconnect Google Calendar' : 'Connect Google Calendar' }}
            </button>
          </div>

          <p v-if="googleCalendarError" class="mt-5 text-sm font-semibold text-red-600">
            {{ googleCalendarError }}
          </p>
        </section>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap');
</style>
