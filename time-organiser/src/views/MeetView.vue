<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { DatePicker as VDatePicker } from 'v-calendar'
import { apiClient } from '@/services/api'
import type {
  AvailabilityPeriod,
  BefriendUser,
  CalendarBlock,
  GoogleCalendarStatus,
} from '@/utils/types'

type CalendarDate = Date | null

const filters = ref({
  query: '',
  availabilityDate: null as CalendarDate,
  startTime: '',
  endTime: '',
})

const friends = ref<BefriendUser[]>([])
const selectedFriend = ref<BefriendUser | null>(null)
const myCalendarBlocks = ref<CalendarBlock[]>([])
const friendAvailabilityBlocks = ref<AvailabilityPeriod[]>([])
const isFriendCalendarLoading = ref(false)
const isMyCalendarLoading = ref(false)
const isFriendsLoading = ref(false)
const friendsError = ref('')
const calendarError = ref('')
const googleCalendarError = ref('')
const googleCalendarStatus = ref<GoogleCalendarStatus | null>(null)
const isGoogleCalendarStatusLoading = ref(false)
const isSearchCalendarOpen = ref(false)

const hours = Array.from({ length: 14 }, (_, index) => index + 7)

const formatDateValue = (date: CalendarDate) => {
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const parseDate = (value: string | Date) => {
  if (value instanceof Date) return value

  return new Date(value)
}

const formatPeriodDate = (period: Pick<CalendarBlock, 'date' | 'start_time'>) => {
  if (period.date) return period.date

  const startDate = parseDate(period.start_time)

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
  const [hoursValue = '0', minutesValue = '0'] = time.split(':')

  return Number(hoursValue) * 60 + Number(minutesValue)
}

const addDays = (date: Date, amount: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + amount)

  return nextDate
}

const weekStart = computed(() => {
  const selectedDate = filters.value.availabilityDate ?? new Date()
  const start = new Date(selectedDate)
  const day = start.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day

  start.setDate(start.getDate() + mondayOffset)
  start.setHours(0, 0, 0, 0)

  return start
})

const weekEnd = computed(() => addDays(weekStart.value, 6))

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart.value, index)

    return {
      date,
      key: formatDateValue(date),
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNumber: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }
  }),
)

const weekRangeLabel = computed(
  () => `${formatDateValue(weekStart.value)} - ${formatDateValue(weekEnd.value)}`,
)

const selectedSearchDateLabel = computed(
  () => formatDateValue(filters.value.availabilityDate) || 'Choose date',
)

const getAvailabilityPeriods = (friend: BefriendUser) =>
  friend.availabilityPeriods ?? friend.availability_periods ?? []

const periodOverlapsSearch = (period: AvailabilityPeriod) => {
  const selectedDate = formatDateValue(filters.value.availabilityDate)
  const selectedStartTime = filters.value.startTime
  const selectedEndTime = filters.value.endTime

  if (!selectedDate && !selectedStartTime && !selectedEndTime) return true
  if (selectedDate && formatPeriodDate(period) !== selectedDate) return false
  if (!selectedStartTime && !selectedEndTime) return true

  const periodStart = toMinutes(formatPeriodTime(period.start_time))
  const periodEnd = toMinutes(formatPeriodTime(period.end_time))
  const selectedStart = selectedStartTime ? toMinutes(selectedStartTime) : periodStart
  const selectedEnd = selectedEndTime ? toMinutes(selectedEndTime) : periodEnd

  return periodStart < selectedEnd && selectedStart < periodEnd
}

const filteredFriends = computed(() => {
  const query = filters.value.query.trim().toLowerCase()
  const hasPeriodFilters =
    !!filters.value.availabilityDate || !!filters.value.startTime || !!filters.value.endTime

  return friends.value.filter((friend) => {
    const matchesQuery =
      !query || [friend.name, friend.username].some((value) => value.toLowerCase().includes(query))

    if (!matchesQuery) return false
    if (!hasPeriodFilters) return true

    return getAvailabilityPeriods(friend).some(periodOverlapsSearch)
  })
})

const hasSelectedFriend = computed(() => selectedFriend.value !== null)

const normalizedFriendBlocks = computed<CalendarBlock[]>(() =>
  friendAvailabilityBlocks.value.map((period, index) => ({
    id: `friend-free-${index}`,
    title: 'Free time',
    date: period.date,
    start_time: period.start_time,
    end_time: period.end_time,
    type: 'free',
  })),
)

const blocksForSlot = (blocks: CalendarBlock[], dayKey: string, hour: number) =>
  blocks.filter((block) => {
    const blockDate = formatPeriodDate(block)

    if (blockDate !== dayKey) return false

    const slotStart = hour * 60
    const slotEnd = slotStart + 60
    const blockStart = toMinutes(formatPeriodTime(block.start_time))
    const blockEnd = toMinutes(formatPeriodTime(block.end_time))

    return blockStart < slotEnd && slotStart < blockEnd
  })

const loadFriends = async () => {
  isFriendsLoading.value = true
  friendsError.value = ''

  try {
    friends.value = await apiClient.get<BefriendUser[]>('/friends/users')
  } catch (error) {
    friendsError.value = 'Friends could not be loaded. Please try again.'
    console.error('Could not load friends:', error)
  } finally {
    isFriendsLoading.value = false
  }
}

const loadMyCalendar = async () => {
  isMyCalendarLoading.value = true
  calendarError.value = ''

  try {
    myCalendarBlocks.value = await apiClient.get<CalendarBlock[]>(
      `/calendar/me/week?start=${formatDateValue(weekStart.value)}&end=${formatDateValue(weekEnd.value)}`,
    )
  } catch (error) {
    calendarError.value = 'Your calendar could not be loaded.'
    console.error('Could not load personal calendar:', error)
  } finally {
    isMyCalendarLoading.value = false
  }
}

const loadGoogleCalendarStatus = async () => {
  isGoogleCalendarStatusLoading.value = true
  googleCalendarError.value = ''

  try {
    googleCalendarStatus.value =
      await apiClient.get<GoogleCalendarStatus>('/calendar/google/status')
  } catch (error) {
    googleCalendarError.value = 'Google Calendar status could not be loaded.'
    console.error('Could not load Google Calendar status:', error)
  } finally {
    isGoogleCalendarStatusLoading.value = false
  }
}

const loadFriendAvailability = async (friendId: string) => {
  isFriendCalendarLoading.value = true
  calendarError.value = ''

  try {
    friendAvailabilityBlocks.value = await apiClient.get<AvailabilityPeriod[]>(
      `/friends/${friendId}/availability?start=${formatDateValue(weekStart.value)}&end=${formatDateValue(weekEnd.value)}`,
    )
  } catch (error) {
    calendarError.value = 'Friend availability could not be loaded.'
    console.error('Could not load friend availability:', error)
  } finally {
    isFriendCalendarLoading.value = false
  }
}

const selectFriend = (friend: BefriendUser) => {
  selectedFriend.value = friend
  friendAvailabilityBlocks.value = getAvailabilityPeriods(friend)
  loadFriendAvailability(friend.id)
}

const resetSearch = () => {
  filters.value = {
    query: '',
    availabilityDate: null,
    startTime: '',
    endTime: '',
  }
  isSearchCalendarOpen.value = false
}

watch(weekStart, () => {
  loadMyCalendar()

  if (selectedFriend.value) {
    loadFriendAvailability(selectedFriend.value.id)
  }
})

onMounted(() => {
  loadFriends()
  loadGoogleCalendarStatus()
  loadMyCalendar()
})
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-white via-[#FA5BAF]/3 to-white">
    <section class="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div
        class="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-[#FA5BAF]/10 p-6 mb-10"
      >
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2
              class="text-2xl font-bold text-gray-800"
              style="font-family: 'Quicksand', sans-serif"
            >
              Search friends
            </h2>
            <p
              v-if="googleCalendarStatus?.connected"
              class="mt-2 text-sm font-semibold text-emerald-600"
            >
              Google Calendar linked{{
                googleCalendarStatus.email ? `: ${googleCalendarStatus.email}` : ''
              }}
            </p>
            <p
              v-else-if="!isGoogleCalendarStatusLoading"
              class="mt-2 text-sm font-semibold text-[#E83E8C]"
            >
              Google Calendar is not yet linked
            </p>
          </div>
        </div>

        <p
          v-if="googleCalendarError"
          class="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600"
        >
          {{ googleCalendarError }}
        </p>

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr_auto] gap-4 items-end">
          <label class="block">
            <span class="text-sm font-semibold text-gray-700">Username</span>
            <input
              v-model="filters.query"
              type="search"
              placeholder="Search your friends"
              class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
            />
          </label>

          <div>
            <span class="text-sm font-semibold text-gray-700">Available time period</span>
            <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="relative">
                <button
                  type="button"
                  @click="isSearchCalendarOpen = !isSearchCalendarOpen"
                  class="flex w-full items-center justify-between rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-left font-semibold text-gray-800 outline-none transition hover:border-[#FA5BAF] focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
                >
                  <span>{{ selectedSearchDateLabel }}</span>
                  <span class="text-[#E83E8C]">v</span>
                </button>

                <div
                  v-if="isSearchCalendarOpen"
                  class="absolute left-0 top-full z-30 mt-3 w-full min-w-72 rounded-2xl border border-[#FA5BAF]/10 bg-white p-3 shadow-2xl shadow-pink-200/40"
                >
                  <VDatePicker
                    v-model="filters.availabilityDate"
                    expanded
                    borderless
                    color="pink"
                    @update:model-value="isSearchCalendarOpen = false"
                  />
                </div>
              </div>

              <input
                v-model="filters.startTime"
                type="time"
                class="rounded-full border border-[#FA5BAF]/20 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              />
              <input
                v-model="filters.endTime"
                type="time"
                class="rounded-full border border-[#FA5BAF]/20 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              />
            </div>
          </div>

          <button
            type="button"
            @click="resetSearch"
            class="rounded-full border-2 border-[#FA5BAF] bg-white px-5 py-3 font-bold text-[#FA5BAF] transition hover:bg-[#FA5BAF]/5"
            style="font-family: 'Quicksand', sans-serif"
          >
            Reset
          </button>
        </div>

        <div class="mt-6">
          <p v-if="friendsError" class="text-sm font-semibold text-red-600">{{ friendsError }}</p>
          <p v-else-if="isFriendsLoading" class="text-sm text-gray-500">Loading friends...</p>
          <div
            v-else-if="filteredFriends.length"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
          >
            <button
              v-for="friend in filteredFriends"
              :key="friend.id"
              type="button"
              @click="selectFriend(friend)"
              class="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
              :class="
                selectedFriend?.id === friend.id
                  ? 'border-[#FA5BAF] bg-[#FA5BAF]/8'
                  : 'border-[#FA5BAF]/10 bg-white'
              "
            >
              <span class="block font-bold text-gray-800">{{ friend.name }}</span>
              <span class="block text-sm text-gray-500">{{ friend.username }}</span>
              <span class="mt-2 block text-xs font-semibold text-[#E83E8C]">
                {{ getAvailabilityPeriods(friend).length }} free periods
              </span>
            </button>
          </div>
          <p v-else class="text-sm text-gray-500">No friends match this search period.</p>
        </div>
      </div>

      <p
        v-if="calendarError"
        class="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600"
      >
        {{ calendarError }}
      </p>

      <div
        v-if="hasSelectedFriend"
        class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/85 border border-[#FA5BAF]/10 p-4"
      >
        <div>
          <p class="text-sm font-semibold text-gray-500">Week</p>
          <p class="text-lg font-bold text-gray-800">{{ weekRangeLabel }}</p>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            @click="filters.availabilityDate = addDays(weekStart, -7)"
            class="rounded-full border border-[#FA5BAF]/20 px-4 py-2 font-bold text-[#E83E8C] transition hover:bg-[#FA5BAF]/5"
          >
            Previous
          </button>
          <button
            type="button"
            @click="filters.availabilityDate = addDays(weekStart, 7)"
            class="rounded-full border border-[#FA5BAF]/20 px-4 py-2 font-bold text-[#E83E8C] transition hover:bg-[#FA5BAF]/5"
          >
            Next
          </button>
        </div>
      </div>

      <div v-if="hasSelectedFriend" class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section class="rounded-2xl bg-white/85 border border-[#FA5BAF]/10 p-5 shadow-lg">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2
              class="text-2xl font-bold text-gray-800"
              style="font-family: 'Quicksand', sans-serif"
            >
              Your week
            </h2>
            <span v-if="isMyCalendarLoading" class="text-sm text-gray-500">Loading...</span>
          </div>

          <div class="overflow-x-auto">
            <div
              class="min-w-[760px] grid grid-cols-[72px_repeat(7,1fr)] border border-[#FA5BAF]/10 rounded-2xl overflow-hidden"
            >
              <div class="bg-pink-50/60 p-3 text-xs font-bold text-gray-500">Time</div>
              <div v-for="day in weekDays" :key="day.key" class="bg-pink-50/60 p-3 text-center">
                <p class="text-sm font-bold text-gray-800">{{ day.label }}</p>
                <p class="text-xs text-gray-500">{{ day.dayNumber }}</p>
              </div>

              <template v-for="hour in hours" :key="hour">
                <div class="border-t border-[#FA5BAF]/10 p-2 text-xs font-semibold text-gray-500">
                  {{ String(hour).padStart(2, '0') }}:00
                </div>
                <div
                  v-for="day in weekDays"
                  :key="`${day.key}-${hour}`"
                  class="min-h-20 border-l border-t border-[#FA5BAF]/10 p-1"
                >
                  <div
                    v-for="block in blocksForSlot(myCalendarBlocks, day.key, hour)"
                    :key="block.id ?? `${block.title}-${formatPeriodTime(block.start_time)}`"
                    class="rounded-xl bg-[#FA5BAF]/15 px-2 py-1 text-xs text-gray-700"
                  >
                    <span class="block font-bold">{{ block.title ?? 'Busy' }}</span>
                    {{ formatPeriodTime(block.start_time) }} -
                    {{ formatPeriodTime(block.end_time) }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </section>

        <section class="rounded-2xl bg-white/85 border border-[#FA5BAF]/10 p-5 shadow-lg">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2
                class="text-2xl font-bold text-gray-800"
                style="font-family: 'Quicksand', sans-serif"
              >
                {{ selectedFriend?.name }}'s availability
              </h2>
              <p class="text-sm text-gray-500">Only free time is shown.</p>
            </div>
            <span v-if="isFriendCalendarLoading" class="text-sm text-gray-500">Loading...</span>
          </div>

          <div class="overflow-x-auto">
            <div
              class="min-w-[760px] grid grid-cols-[72px_repeat(7,1fr)] border border-[#FA5BAF]/10 rounded-2xl overflow-hidden"
            >
              <div class="bg-pink-50/60 p-3 text-xs font-bold text-gray-500">Time</div>
              <div v-for="day in weekDays" :key="day.key" class="bg-pink-50/60 p-3 text-center">
                <p class="text-sm font-bold text-gray-800">{{ day.label }}</p>
                <p class="text-xs text-gray-500">{{ day.dayNumber }}</p>
              </div>

              <template v-for="hour in hours" :key="hour">
                <div class="border-t border-[#FA5BAF]/10 p-2 text-xs font-semibold text-gray-500">
                  {{ String(hour).padStart(2, '0') }}:00
                </div>
                <div
                  v-for="day in weekDays"
                  :key="`${day.key}-${hour}`"
                  class="min-h-20 border-l border-t border-[#FA5BAF]/10 p-1"
                >
                  <div
                    v-for="block in blocksForSlot(normalizedFriendBlocks, day.key, hour)"
                    :key="block.id ?? `${block.title}-${formatPeriodTime(block.start_time)}`"
                    class="rounded-xl bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                  >
                    <span class="block font-bold">{{ block.title }}</span>
                    {{ formatPeriodTime(block.start_time) }} -
                    {{ formatPeriodTime(block.end_time) }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </section>
      </div>

      <div
        v-else
        class="rounded-2xl border border-dashed border-[#FA5BAF]/30 bg-white/70 p-8 text-center text-gray-500"
      >
        Search and select a friend to compare weekly calendars.
      </div>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap');
</style>
