<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DatePicker as VDatePicker } from 'v-calendar'
import { apiClient } from '@/services/api'
import { useUserStore } from '@/stores/users'
import type { AvailabilityPeriod, BefriendUser, Friends, Requests } from '@/utils/types'

type CalendarDate = Date | null

const filters = ref({
  query: '',
  city: '',
  timezone: '',
  availabilityDate: null as CalendarDate,
  startTime: '',
  endTime: '',
  minAge: null as number | null,
  maxAge: null as number | null,
})

const selectedUser = ref<BefriendUser | null>(null)
const users = ref<BefriendUser[]>([])
const isLoadingUsers = ref(false)
const usersError = ref('')
const pendingRequestIds = ref(new Set<string>())
const togglingRequestIds = ref(new Set<string>())
const friendshipError = ref('')
const userStore = useUserStore()
const isCalendarOpen = ref(false)

const formatDateValue = (date: CalendarDate) => {
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatPeriodDate = (period: AvailabilityPeriod) => {
  if (period.date) return period.date

  const startDate = new Date(period.start_time)

  if (Number.isNaN(startDate.getTime())) return ''

  return formatDateValue(startDate)
}

const formatPeriodTime = (value: string | Date) => {
  if (value instanceof Date) {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
  }

  if (value.includes('T')) {
    const date = new Date(value)

    if (!Number.isNaN(date.getTime())) {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }
  }

  return value.slice(0, 5)
}

const toMinutes = (time: string) => {
  const [hours = '0', minutes = '0'] = time.split(':')

  return Number(hours) * 60 + Number(minutes)
}

const getAvailabilityPeriods = (user: BefriendUser) =>
  user.availabilityPeriods ?? user.availability_periods ?? []

const hasAvailabilityInSelectedPeriod = (user: BefriendUser) => {
  const selectedDate = formatDateValue(filters.value.availabilityDate)
  const selectedStartTime = filters.value.startTime
  const selectedEndTime = filters.value.endTime

  if (!selectedDate && !selectedStartTime && !selectedEndTime) return true

  return getAvailabilityPeriods(user).some((period) => {
    const periodDate = formatPeriodDate(period)

    if (selectedDate && periodDate !== selectedDate) return false
    if (!selectedStartTime && !selectedEndTime) return true

    const periodStart = toMinutes(formatPeriodTime(period.start_time))
    const periodEnd = toMinutes(formatPeriodTime(period.end_time))
    const selectedStart = selectedStartTime ? toMinutes(selectedStartTime) : periodStart
    const selectedEnd = selectedEndTime ? toMinutes(selectedEndTime) : periodEnd

    return periodStart < selectedEnd && selectedStart < periodEnd
  })
}

const cities = computed(() => Array.from(new Set(users.value.map((user) => user.city))).sort())
const timezones = computed(() =>
  Array.from(new Set(users.value.map((user) => user.timezone))).sort(),
)

const selectedAvailabilityDateLabel = computed(
  () => formatDateValue(filters.value.availabilityDate) || 'Choose date',
)

const availabilityAttributes = computed(() =>
  users.value.flatMap((user) =>
    getAvailabilityPeriods(user)
      .map((period) => {
        const date = formatPeriodDate(period)

        if (!date) return null

        return {
          key: `${user.id}-${date}-${formatPeriodTime(period.start_time)}`,
          dates: new Date(`${date}T00:00:00`),
          dot: { color: user.status === 'friend' ? 'green' : 'pink' },
          popover: {
            label: `${user.name}: ${formatPeriodTime(period.start_time)} - ${formatPeriodTime(period.end_time)}`,
          },
        }
      })
      .filter(Boolean),
  ),
)

const selectedDatePeriods = computed(() => {
  const selectedDate = formatDateValue(filters.value.availabilityDate)

  if (!selectedDate) return []

  return users.value.flatMap((user) =>
    getAvailabilityPeriods(user)
      .filter((period) => formatPeriodDate(period) === selectedDate)
      .map((period) => ({
        user,
        period,
      })),
  )
})

const filteredUsers = computed(() => {
  const query = filters.value.query.trim().toLowerCase()

  return users.value.filter((user) => {
    const searchableText = [
      user.name,
      user.username,
      user.city,
      user.timezone,
      user.availability,
      user.bio,
      ...user.hobbies,
    ]
      .join(' ')
      .toLowerCase()

    const matchesQuery = !query || searchableText.includes(query)
    const matchesCity = !filters.value.city || user.city === filters.value.city
    const matchesTimezone = !filters.value.timezone || user.timezone === filters.value.timezone
    const matchesMinAge = !filters.value.minAge || user.age >= filters.value.minAge
    const matchesMaxAge = !filters.value.maxAge || user.age <= filters.value.maxAge

    return (
      matchesQuery &&
      matchesCity &&
      matchesTimezone &&
      matchesMinAge &&
      matchesMaxAge &&
      hasAvailabilityInSelectedPeriod(user)
    )
  })
})

const friendResults = computed(() => filteredUsers.value.filter((user) => user.status === 'friend'))
const notBefriendedResults = computed(() =>
  filteredUsers.value.filter((user) => user.status === 'not-befriended'),
)

const setPendingRequest = (userId: string, isPending: boolean) => {
  const nextPendingRequestIds = new Set(pendingRequestIds.value)

  if (isPending) {
    nextPendingRequestIds.add(userId)
  } else {
    nextPendingRequestIds.delete(userId)
  }

  pendingRequestIds.value = nextPendingRequestIds
}

const setRequestLoading = (userId: string, isLoading: boolean) => {
  const nextTogglingRequestIds = new Set(togglingRequestIds.value)

  if (isLoading) {
    nextTogglingRequestIds.add(userId)
  } else {
    nextTogglingRequestIds.delete(userId)
  }

  togglingRequestIds.value = nextTogglingRequestIds
}

const isPending = (userId: string) => pendingRequestIds.value.has(userId)
const isRequestLoading = (userId: string) => togglingRequestIds.value.has(userId)

const loadUsers = async () => {
  isLoadingUsers.value = true
  usersError.value = ''

  try {
    users.value = await apiClient.get<BefriendUser[]>('/users')
  } catch (error) {
    usersError.value = 'Users could not be loaded. Please try again.'
    console.error('Could not load users:', error)
  } finally {
    isLoadingUsers.value = false
  }
}

const loadPendingRequests = async () => {
  try {
    const friends = await apiClient.get<Friends[]>('/friends')
    const pendingIds = friends
      .filter((friendship) => friendship.status === 'pending')
      .map((friendship) => friendship.friend_id)

    pendingRequestIds.value = new Set(pendingIds)
  } catch (error) {
    console.error('Could not load pending friendship requests:', error)
  }
}

const toggleFriendRequest = async (userId: string) => {
  if (isRequestLoading(userId)) return

  friendshipError.value = ''
  setRequestLoading(userId, true)

  try {
    if (isPending(userId)) {
      await apiClient.delete<void>(`/friends/requests/${userId}`)
      setPendingRequest(userId, false)
    } else {
      const requestBody: Requests = {
        user_id: userStore.profile?.id ?? '',
        partner_id: userId,
      }

      await apiClient.post<Friends, Requests>('/friends/requests', requestBody)
      setPendingRequest(userId, true)
    }
  } catch (error) {
    friendshipError.value = 'Friendship request could not be updated. Please try again.'
    console.error('Friendship request action failed:', error)
  } finally {
    setRequestLoading(userId, false)
  }
}

const openProfile = (user: BefriendUser) => {
  selectedUser.value = user
}

const closeProfile = () => {
  selectedUser.value = null
}

const resetFilters = () => {
  filters.value = {
    query: '',
    city: '',
    timezone: '',
    availabilityDate: null,
    startTime: '',
    endTime: '',
    minAge: null,
    maxAge: null,
  }
  isCalendarOpen.value = false
}

onMounted(() => {
  loadUsers()
  loadPendingRequests()
})
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-white via-[#FA5BAF]/3 to-white">
    <section class="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div class="mb-10">
        <h1
          class="text-4xl md:text-5xl font-bold leading-tight pb-1 text-transparent bg-clip-text bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] mb-4"
          style="font-family: 'Quicksand', sans-serif"
        >
          Befriend
        </h1>
        <p class="text-lg text-gray-600 max-w-3xl">
          Search for users and request friendships with people who match your schedule.
        </p>
      </div>

      <div
        class="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-[#FA5BAF]/10 p-6 mb-10"
      >
        <div class="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-8">
          <div>
            <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
              <label class="block">
                <span class="text-sm font-semibold text-gray-700">Name</span>
                <input
                  v-model="filters.query"
                  type="search"
                  placeholder="Search by username"
                  class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
                />
              </label>

              <div class="grid grid-cols-2 gap-3">
                <label class="block">
                  <span class="text-sm font-semibold text-gray-700">Min age</span>
                  <input
                    v-model.number="filters.minAge"
                    type="number"
                    min="13"
                    max="99"
                    placeholder="Min"
                    class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
                  />
                </label>
                <label class="block">
                  <span class="text-sm font-semibold text-gray-700">Max age</span>
                  <input
                    v-model.number="filters.maxAge"
                    type="number"
                    min="13"
                    max="99"
                    placeholder="Max"
                    class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
                  />
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <label class="block">
                <span class="text-sm font-semibold text-gray-700">City</span>
                <select
                  v-model="filters.city"
                  class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
                >
                  <option value="">All cities</option>
                  <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                </select>
              </label>
            </div>
          </div>

          <div>
            <h2
              class="text-xl font-bold text-gray-800 mb-4"
              style="font-family: 'Quicksand', sans-serif"
            >
              Availability
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="relative">
                <span class="text-sm font-semibold text-gray-700">Date</span>
                <button
                  type="button"
                  @click="isCalendarOpen = !isCalendarOpen"
                  class="mt-2 flex w-full items-center justify-between rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-left font-semibold text-gray-800 outline-none transition hover:border-[#FA5BAF] focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
                >
                  <span>{{ selectedAvailabilityDateLabel }}</span>
                  <span class="text-[#E83E8C]">v</span>
                </button>

                <div
                  v-if="isCalendarOpen"
                  class="absolute left-0 top-full z-30 mt-3 w-full min-w-72 rounded-2xl border border-[#FA5BAF]/10 bg-white p-3 shadow-2xl shadow-pink-200/40"
                >
                  <VDatePicker
                    v-model="filters.availabilityDate"
                    :attributes="availabilityAttributes"
                    expanded
                    borderless
                    color="pink"
                    @update:model-value="isCalendarOpen = false"
                  />
                  <button
                    type="button"
                    @click="((filters.availabilityDate = null), (isCalendarOpen = false))"
                    class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 px-4 py-2 text-sm font-bold text-[#E83E8C] transition hover:bg-[#FA5BAF]/5"
                  >
                    Clear date
                  </button>
                </div>
              </div>

              <label class="block">
                <span class="text-sm font-semibold text-gray-700">Start time</span>
                <input
                  v-model="filters.startTime"
                  type="time"
                  class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
                />
              </label>

              <label class="block">
                <span class="text-sm font-semibold text-gray-700">End time</span>
                <input
                  v-model="filters.endTime"
                  type="time"
                  class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
                />
              </label>
            </div>

            <div class="mt-4 rounded-2xl bg-[#FA5BAF]/8 p-4">
              <p class="text-sm font-bold text-[#E83E8C]">Selected day periods</p>
              <div v-if="selectedDatePeriods.length" class="mt-3 space-y-2">
                <button
                  v-for="{ user, period } in selectedDatePeriods"
                  :key="`${user.id}-${formatPeriodDate(period)}-${formatPeriodTime(period.start_time)}`"
                  type="button"
                  @click="openProfile(user)"
                  class="w-full rounded-xl bg-white px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-pink-50"
                >
                  <span class="font-bold text-gray-800">{{ user.name }}</span>
                  <span class="block text-gray-500">
                    {{ formatPeriodTime(period.start_time) }} -
                    {{ formatPeriodTime(period.end_time) }}
                  </span>
                </button>
              </div>
              <p v-else class="mt-3 text-sm text-gray-500">
                Pick a highlighted date to see matching time periods.
              </p>
            </div>

            <div class="mt-5 flex justify-end">
              <button
                type="button"
                @click="resetFilters"
                class="w-full rounded-full border-2 border-[#FA5BAF] bg-white px-5 py-3 font-bold text-[#FA5BAF] transition hover:bg-[#FA5BAF]/5 sm:w-auto"
                style="font-family: 'Quicksand', sans-serif"
              >
                Reset filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <p
        v-if="usersError"
        class="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600"
      >
        {{ usersError }}
      </p>
      <p
        v-if="friendshipError"
        class="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600"
      >
        {{ friendshipError }}
      </p>
      <p v-if="isLoadingUsers" class="mb-6 text-center text-gray-500">Loading users...</p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2
              class="text-2xl font-bold text-gray-800"
              style="font-family: 'Quicksand', sans-serif"
            >
              Friends
            </h2>
            <span class="rounded-full bg-[#FA5BAF]/10 px-4 py-1 text-sm font-bold text-[#E83E8C]">
              {{ friendResults.length }}
            </span>
          </div>

          <div v-if="friendResults.length" class="space-y-4">
            <article
              v-for="user in friendResults"
              :key="user.id"
              role="button"
              tabindex="0"
              @click="openProfile(user)"
              @keydown.enter="openProfile(user)"
              class="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-[#FA5BAF]/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-200/50 cursor-pointer"
            >
              <div class="flex gap-4">
                <div
                  class="w-14 h-14 shrink-0 rounded-full bg-linear-to-br from-[#FA5BAF] to-[#E83E8C] text-white flex items-center justify-center font-bold"
                  style="font-family: 'Quicksand', sans-serif"
                >
                  {{ user.initials }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3
                        class="text-xl font-bold text-gray-800"
                        style="font-family: 'Quicksand', sans-serif"
                      >
                        {{ user.name }}
                      </h3>
                      <p class="text-sm text-gray-500">{{ user.username }}</p>
                    </div>
                    <span
                      class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600"
                    >
                      Friend
                    </span>
                  </div>
                  <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <span>{{ user.city }} · {{ user.age }}</span>
                    <span>{{ user.timezone }}</span>
                    <span class="sm:col-span-2">{{ user.availability }}</span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <p
            v-else
            class="rounded-2xl border border-dashed border-[#FA5BAF]/30 bg-white/70 p-6 text-center text-gray-500"
          >
            No friends match this search.
          </p>
        </section>

        <section>
          <div class="flex items-center justify-between mb-4">
            <h2
              class="text-2xl font-bold text-gray-800"
              style="font-family: 'Quicksand', sans-serif"
            >
              Not befriended
            </h2>
            <span class="rounded-full bg-[#FA5BAF]/10 px-4 py-1 text-sm font-bold text-[#E83E8C]">
              {{ notBefriendedResults.length }}
            </span>
          </div>

          <div v-if="notBefriendedResults.length" class="space-y-4">
            <article
              v-for="user in notBefriendedResults"
              :key="user.id"
              role="button"
              tabindex="0"
              @click="openProfile(user)"
              @keydown.enter="openProfile(user)"
              class="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-[#FA5BAF]/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-200/50 cursor-pointer"
            >
              <div class="flex gap-4">
                <div
                  class="w-14 h-14 shrink-0 rounded-full bg-linear-to-br from-[#FA5BAF]/80 to-[#E83E8C]/80 text-white flex items-center justify-center font-bold"
                  style="font-family: 'Quicksand', sans-serif"
                >
                  {{ user.initials }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3
                        class="text-xl font-bold text-gray-800"
                        style="font-family: 'Quicksand', sans-serif"
                      >
                        {{ user.name }}
                      </h3>
                      <p class="text-sm text-gray-500">{{ user.username }}</p>
                    </div>
                    <button
                      type="button"
                      @click.stop="toggleFriendRequest(user.id)"
                      :disabled="isRequestLoading(user.id)"
                      class="rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-60"
                      :class="
                        isPending(user.id)
                          ? 'bg-pink-50 text-[#E83E8C]'
                          : 'bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] text-white hover:shadow-lg hover:shadow-pink-300/40'
                      "
                    >
                      {{
                        isRequestLoading(user.id)
                          ? 'Updating...'
                          : isPending(user.id)
                            ? 'Requested'
                            : 'Request friendship'
                      }}
                    </button>
                  </div>
                  <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <span>{{ user.city }} · {{ user.age }}</span>
                    <span>{{ user.timezone }}</span>
                    <span class="sm:col-span-2">{{ user.availability }}</span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <p
            v-else
            class="rounded-2xl border border-dashed border-[#FA5BAF]/30 bg-white/70 p-6 text-center text-gray-500"
          >
            No new people match this search.
          </p>
        </section>
      </div>
    </section>

    <div
      v-if="selectedUser"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/45 px-4 py-8"
      @click.self="closeProfile"
    >
      <section class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-full bg-linear-to-br from-[#FA5BAF] to-[#E83E8C] text-white flex items-center justify-center text-xl font-bold"
              style="font-family: 'Quicksand', sans-serif"
            >
              {{ selectedUser.initials }}
            </div>
            <div>
              <h2
                class="text-3xl font-bold text-gray-800"
                style="font-family: 'Quicksand', sans-serif"
              >
                {{ selectedUser.name }}
              </h2>
              <p class="text-gray-500">{{ selectedUser.username }}</p>
            </div>
          </div>
          <button
            type="button"
            @click="closeProfile"
            class="rounded-full border border-[#FA5BAF]/20 px-4 py-2 font-bold text-[#FA5BAF] transition hover:bg-[#FA5BAF]/5"
            aria-label="Close profile"
          >
            Close
          </button>
        </div>

        <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="rounded-2xl bg-[#FA5BAF]/8 p-4">
            <p class="text-xs font-bold uppercase text-gray-500">City</p>
            <p class="font-semibold text-gray-800">{{ selectedUser.city }}</p>
          </div>
          <div class="rounded-2xl bg-[#FA5BAF]/8 p-4">
            <p class="text-xs font-bold uppercase text-gray-500">Age</p>
            <p class="font-semibold text-gray-800">{{ selectedUser.age }}</p>
          </div>
          <div class="rounded-2xl bg-[#FA5BAF]/8 p-4 md:col-span-2">
            <p class="text-xs font-bold uppercase text-gray-500">Timezone</p>
            <p class="font-semibold text-gray-800">{{ selectedUser.timezone }}</p>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="text-sm font-bold uppercase text-[#E83E8C]">Bio</h3>
          <p class="mt-2 text-gray-600">{{ selectedUser.bio }}</p>
        </div>

        <div class="mt-6">
          <h3 class="text-sm font-bold uppercase text-[#E83E8C]">Hobbies</h3>
          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="hobby in selectedUser.hobbies"
              :key="hobby"
              class="rounded-full bg-[#FA5BAF]/10 px-4 py-2 text-sm font-semibold text-[#E83E8C]"
            >
              {{ hobby }}
            </span>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="text-sm font-bold uppercase text-[#E83E8C]">Availability periods</h3>
          <div v-if="getAvailabilityPeriods(selectedUser).length" class="mt-3 grid gap-2">
            <p
              v-for="period in getAvailabilityPeriods(selectedUser)"
              :key="`${formatPeriodDate(period)}-${formatPeriodTime(period.start_time)}`"
              class="rounded-xl bg-[#FA5BAF]/8 px-4 py-2 text-sm text-gray-600"
            >
              <span class="font-bold text-gray-800">{{ formatPeriodDate(period) }}</span>
              {{ formatPeriodTime(period.start_time) }} - {{ formatPeriodTime(period.end_time) }}
            </p>
          </div>
          <p v-else class="mt-2 text-sm text-gray-500">No availability periods shared yet.</p>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-gray-500">{{ selectedUser.availability }}</p>
          <button
            v-if="selectedUser.status === 'not-befriended'"
            type="button"
            @click="toggleFriendRequest(selectedUser.id)"
            :disabled="isRequestLoading(selectedUser.id)"
            class="rounded-full px-6 py-3 font-bold transition disabled:opacity-60"
            :class="
              isPending(selectedUser.id)
                ? 'bg-pink-50 text-[#E83E8C]'
                : 'bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] text-white hover:shadow-lg hover:shadow-pink-300/40'
            "
          >
            {{
              isRequestLoading(selectedUser.id)
                ? 'Updating...'
                : isPending(selectedUser.id)
                  ? 'Friendship requested'
                  : 'Request friendship'
            }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap');
</style>
