<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiClient } from '@/services/api'
import { useUserStore } from '@/stores/users'
import type { Assignments, Goals, Hobbies, Tasks } from '@/utils/types'

type PlannerSection = 'assignments' | 'tasks' | 'goals' | 'hobbies'
type PlannerItem = Assignments | Tasks | Goals | Hobbies

const userStore = useUserStore()

const activeSection = ref<PlannerSection>('assignments')
const assignments = ref<Assignments[]>([])
const tasks = ref<Tasks[]>([])
const goals = ref<Goals[]>([])
const hobbies = ref<Hobbies[]>([])
const completedHobbies = ref(new Set<string>())
const completedGoals = ref(new Set<string>())
const completedTasks = ref(new Set<string>())
const completedAssignments = ref(new Set<string>())
const isLoading = ref(false)
const errorMessage = ref('')
const isAddModalOpen = ref(false)

const assignmentForm = ref({
  title: '',
  priority: 'medium',
  status: 'todo',
  due_date: '',
})

const taskForm = ref({
  title: '',
  priority: 'medium',
  status: 'todo',
  due_date: '',
  assignment_id: '',
})

const goalForm = ref({
  title: '',
  priority: 'medium',
  status: 'todo',
})

const hobbyForm = ref({
  title: '',
  priority: 'medium',
  occurence_per_week: '',
})

const sections: { id: PlannerSection; label: string; description: string }[] = [
  { id: 'assignments', label: 'Assignments', description: '' },
  { id: 'tasks', label: 'Tasks', description: '' },
  { id: 'goals', label: 'Goals', description: '' },
  { id: 'hobbies', label: 'Hobbies', description: '' },
]

const userId = computed(() => userStore.profile?.id ?? '')

const sectionTitle = computed(
  () => sections.find((section) => section.id === activeSection.value)?.label ?? 'Planner',
)

const currentItems = computed<PlannerItem[]>(() => {
  if (activeSection.value === 'assignments') return assignments.value
  if (activeSection.value === 'tasks') return tasks.value
  if (activeSection.value === 'goals') return goals.value

  return hobbies.value
})

const itemKey = (item: PlannerItem) =>
  [
    'title' in item ? item.title : '',
    'priority' in item ? item.priority : '',
    'due_date' in item ? String(item.due_date) : '',
    'occurence_per_week' in item ? item.occurence_per_week : '',
  ].join('-')

const itemStatus = (item: PlannerItem) => ('status' in item ? item.status : '')

const formatDate = (date: Date | string) => {
  if (!date) return ''

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return String(date)

  return parsedDate.toLocaleDateString()
}

const getCompletedSet = (section: PlannerSection) => {
  if (section === 'assignments') return completedAssignments
  if (section === 'tasks') return completedTasks
  if (section === 'goals') return completedGoals

  return completedHobbies
}

const isItemDone = (section: PlannerSection, item: PlannerItem) => {
  const key = itemKey(item)
  const completedSet = getCompletedSet(section).value

  return completedSet.has(key) || itemStatus(item).toLowerCase() === 'done'
}

const toggleItemDone = async (section: PlannerSection, item: PlannerItem) => {
  const key = itemKey(item)
  const completedRef = getCompletedSet(section)
  const nextCompleted = new Set(completedRef.value)
  const nextStatus = isItemDone(section, item) ? 'todo' : 'done'

  if (nextStatus === 'done') {
    nextCompleted.add(key)
  } else {
    nextCompleted.delete(key)
  }

  completedRef.value = nextCompleted

  try {
    if ('status' in item) {
      item.status = nextStatus
      await apiClient.put(`/${section}/${encodeURIComponent(item.title)}/status`, {
        status: nextStatus,
      })
    }
  } catch (error) {
    console.error(`Could not update ${section} status:`, error)
  }
}

const loadPlannerData = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [assignmentResponse, taskResponse, goalResponse, hobbyResponse] = await Promise.all([
      apiClient.get<Assignments[]>('/assignments'),
      apiClient.get<Tasks[]>('/tasks'),
      apiClient.get<Goals[]>('/goals'),
      apiClient.get<Hobbies[]>('/hobbies'),
    ])

    assignments.value = assignmentResponse
    tasks.value = taskResponse
    goals.value = goalResponse
    hobbies.value = hobbyResponse
  } catch (error) {
    errorMessage.value = 'Planner items could not be loaded.'
    console.error('Could not load planner data:', error)
  } finally {
    isLoading.value = false
  }
}

const addAssignment = async () => {
  const assignment: Assignments = {
    title: assignmentForm.value.title,
    user_id: userId.value,
    status: assignmentForm.value.status,
    priority: assignmentForm.value.priority,
    due_date: new Date(assignmentForm.value.due_date),
  }

  const createdAssignment = await apiClient.post<Assignments, Assignments>(
    '/assignments',
    assignment,
  )
  assignments.value = [...assignments.value, createdAssignment]
  assignmentForm.value = { title: '', priority: 'medium', status: 'todo', due_date: '' }
}

const addTask = async () => {
  const task: Tasks = {
    title: taskForm.value.title,
    user_id: userId.value,
    priority: taskForm.value.priority,
    status: taskForm.value.status,
    due_date: new Date(taskForm.value.due_date),
    assignment_id: taskForm.value.assignment_id,
  }

  const createdTask = await apiClient.post<Tasks, Tasks>('/tasks', task)
  tasks.value = [...tasks.value, createdTask]
  taskForm.value = {
    title: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    assignment_id: '',
  }
}

const addGoal = async () => {
  const goal: Goals = {
    title: goalForm.value.title,
    user_id: userId.value,
    status: goalForm.value.status,
    priority: goalForm.value.priority,
  }

  const createdGoal = await apiClient.post<Goals, Goals>('/goals', goal)
  goals.value = [...goals.value, createdGoal]
  goalForm.value = { title: '', priority: 'medium', status: 'todo' }
}

const addHobby = async () => {
  const hobby: Hobbies = {
    title: hobbyForm.value.title,
    priority: hobbyForm.value.priority,
    occurence_per_week: hobbyForm.value.occurence_per_week,
  }

  const createdHobby = await apiClient.post<Hobbies, Hobbies>('/hobbies', hobby)
  hobbies.value = [...hobbies.value, createdHobby]
  hobbyForm.value = { title: '', priority: 'medium', occurence_per_week: '' }
}

const submitActiveForm = async () => {
  errorMessage.value = ''

  try {
    if (activeSection.value === 'assignments') await addAssignment()
    if (activeSection.value === 'tasks') await addTask()
    if (activeSection.value === 'goals') await addGoal()
    if (activeSection.value === 'hobbies') await addHobby()
    isAddModalOpen.value = false
  } catch (error) {
    errorMessage.value = `${sectionTitle.value} item could not be added.`
    console.error('Could not add planner item:', error)
  }
}

const openAddModal = () => {
  errorMessage.value = ''
  isAddModalOpen.value = true
}

const closeAddModal = () => {
  isAddModalOpen.value = false
}

onMounted(() => {
  loadPlannerData()
})
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-white via-[#FA5BAF]/3 to-white">
    <section class="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <aside
          class="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-[#FA5BAF]/10 p-4"
        >
          <nav class="grid gap-3">
            <button
              v-for="section in sections"
              :key="section.id"
              type="button"
              @click="activeSection = section.id"
              class="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
              :class="
                activeSection === section.id
                  ? 'border-[#FA5BAF] bg-[#FA5BAF]/8'
                  : 'border-[#FA5BAF]/10 bg-white'
              "
            >
              <span class="block font-bold text-gray-800">{{ section.label }}</span>
              <span class="block text-sm text-gray-500">{{ section.description }}</span>
            </button>
          </nav>
        </aside>

        <main>
          <section
            class="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-[#FA5BAF]/10 p-6"
          >
            <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2
                  class="text-2xl font-bold text-gray-800"
                  style="font-family: 'Quicksand', sans-serif"
                >
                  {{ sectionTitle }}
                </h2>
                <p class="text-sm text-gray-500">
                  {{ currentItems.length }} {{ sectionTitle.toLowerCase() }}
                </p>
              </div>
              <button
                type="button"
                @click="openAddModal"
                class="rounded-full bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] px-6 py-3 font-bold text-white transition hover:shadow-lg hover:shadow-pink-300/40"
                style="font-family: 'Quicksand', sans-serif"
              >
                Add
              </button>
            </div>

            <p v-if="isLoading" class="text-gray-500">Loading planner items...</p>
            <div v-else-if="currentItems.length" class="grid gap-3">
              <article
                v-for="item in currentItems"
                :key="itemKey(item)"
                class="flex items-start gap-4 rounded-2xl border border-[#FA5BAF]/10 bg-white p-4"
              >
                <button
                  type="button"
                  @click="toggleItemDone(activeSection, item)"
                  class="mt-1 h-7 w-7 shrink-0 rounded-lg border-2 transition"
                  :class="
                    isItemDone(activeSection, item)
                      ? 'border-[#FA5BAF] bg-[#FA5BAF]'
                      : 'border-[#FA5BAF]/30 bg-white hover:border-[#FA5BAF]'
                  "
                  :aria-label="`Toggle ${'title' in item ? item.title : 'item'} done`"
                >
                  <span v-if="isItemDone(activeSection, item)" class="text-sm font-bold text-white">
                    ✓
                  </span>
                </button>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3
                      class="text-lg font-bold text-gray-800"
                      :class="{ 'line-through opacity-60': isItemDone(activeSection, item) }"
                      style="font-family: 'Quicksand', sans-serif"
                    >
                      {{ item.title }}
                    </h3>
                    <span
                      class="rounded-full bg-[#FA5BAF]/10 px-3 py-1 text-xs font-bold text-[#E83E8C]"
                    >
                      {{ item.priority }}
                    </span>
                    <span
                      v-if="'status' in item"
                      class="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600"
                    >
                      {{ item.status }}
                    </span>
                  </div>

                  <p v-if="'due_date' in item" class="mt-2 text-sm text-gray-500">
                    Due {{ formatDate(item.due_date) }}
                  </p>
                  <p
                    v-if="'assignment_id' in item && item.assignment_id"
                    class="mt-1 text-sm text-gray-500"
                  >
                    Assignment {{ item.assignment_id }}
                  </p>
                  <p v-if="'occurence_per_week' in item" class="mt-2 text-sm text-gray-500">
                    {{ item.occurence_per_week }} times per week
                  </p>
                </div>
              </article>
            </div>
            <p
              v-else
              class="rounded-2xl border border-dashed border-[#FA5BAF]/30 p-6 text-center text-gray-500"
            >
              No {{ sectionTitle.toLowerCase() }} yet.
            </p>
          </section>
        </main>
      </div>
    </section>

    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/45 px-4 py-8"
      @click.self="closeAddModal"
    >
      <section class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              class="text-2xl font-bold text-gray-800"
              style="font-family: 'Quicksand', sans-serif"
            >
              Add {{ sectionTitle.toLowerCase() }}
            </h2>
            <p class="text-sm text-gray-500">Fill in the details and add it to your planner.</p>
          </div>
          <button
            type="button"
            @click="closeAddModal"
            class="rounded-full border border-[#FA5BAF]/20 px-4 py-2 font-bold text-[#FA5BAF] transition hover:bg-[#FA5BAF]/5"
          >
            Close
          </button>
        </div>

        <form class="grid gap-4" @submit.prevent="submitActiveForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="block">
              <span class="text-sm font-semibold text-gray-700">Name</span>
              <input
                v-if="activeSection === 'assignments'"
                v-model="assignmentForm.title"
                required
                type="text"
                class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              />
              <input
                v-else-if="activeSection === 'tasks'"
                v-model="taskForm.title"
                required
                type="text"
                class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              />
              <input
                v-else-if="activeSection === 'goals'"
                v-model="goalForm.title"
                required
                type="text"
                class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              />
              <input
                v-else
                v-model="hobbyForm.title"
                required
                type="text"
                class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              />
            </label>

            <label class="block">
              <span class="text-sm font-semibold text-gray-700">Priority</span>
              <select
                v-if="activeSection === 'assignments'"
                v-model="assignmentForm.priority"
                class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                v-else-if="activeSection === 'tasks'"
                v-model="taskForm.priority"
                class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                v-else-if="activeSection === 'goals'"
                v-model="goalForm.priority"
                class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                v-else
                v-model="hobbyForm.priority"
                class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label v-if="activeSection === 'assignments'" class="block">
              <span class="text-sm font-semibold text-gray-700">Due date</span>
              <input
                v-model="assignmentForm.due_date"
                required
                type="date"
                class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              />
            </label>

            <template v-if="activeSection === 'tasks'">
              <label class="block">
                <span class="text-sm font-semibold text-gray-700">Due date</span>
                <input
                  v-model="taskForm.due_date"
                  required
                  type="date"
                  class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
                />
              </label>
              <label class="block">
                <span class="text-sm font-semibold text-gray-700">Assignment name</span>
                <input
                  v-model="taskForm.assignment_id"
                  type="text"
                  class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
                />
              </label>
            </template>

            <label v-if="activeSection === 'hobbies'" class="block">
              <span class="text-sm font-semibold text-gray-700">Times per week</span>
              <input
                v-model="hobbyForm.occurence_per_week"
                required
                type="number"
                min="1"
                class="mt-2 w-full rounded-full border border-[#FA5BAF]/20 bg-white px-5 py-3 text-gray-800 outline-none transition focus:border-[#FA5BAF] focus:ring-4 focus:ring-[#FA5BAF]/10"
              />
            </label>
          </div>

          <p v-if="errorMessage" class="text-sm font-semibold text-red-600">
            {{ errorMessage }}
          </p>

          <div class="flex justify-end">
            <button
              type="submit"
              class="rounded-full bg-linear-to-r from-[#FA5BAF] to-[#E83E8C] px-6 py-3 font-bold text-white transition hover:shadow-lg hover:shadow-pink-300/40"
              style="font-family: 'Quicksand', sans-serif"
            >
              Add {{ sectionTitle.toLowerCase() }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap');
</style>
