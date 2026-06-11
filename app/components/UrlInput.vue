<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'inspect', url: string): void
}>()

const inputUrl = ref('')

const handleInspect = () => {
  if (props.loading) return
  emit('inspect', inputUrl.value.trim())
}

const clearInput = () => {
  inputUrl.value = ''
}
</script>

<template>
  <div class="w-full">
    <!-- URL Input Container -->
    <div class="relative flex flex-col md:flex-row gap-3">
      <div class="relative flex-grow">
        <!-- Search/URL Icon -->
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <!-- Input Box -->
        <input
          id="url-input-field"
          v-model="inputUrl"
          type="text"
          placeholder="Paste public URL here..."
          class="w-full pl-12 pr-12 py-3.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-550 focus:ring-1 focus:ring-zinc-700 focus:outline-none transition-all duration-200 text-sm shadow-inner"
          :disabled="loading"
          @keydown.enter="handleInspect"
        />

        <!-- Clear Button -->
        <button
          v-if="inputUrl && !loading"
          id="url-clear-btn"
          type="button"
          class="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Clear input"
          @click="clearInput"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Inspect Button -->
      <button
        id="url-inspect-btn"
        type="button"
        class="relative inline-flex items-center justify-center px-6 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed group"
        :disabled="loading || !inputUrl.trim()"
        @click="handleInspect"
      >
        <span v-if="loading" class="absolute left-4 flex items-center">
          <svg class="animate-spin h-4 w-4 text-zinc-950" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        <span :class="{ 'pl-6': loading }">
          {{ loading ? 'Inspecting...' : 'Inspect URL' }}
        </span>
      </button>
    </div>
  </div>
</template>
