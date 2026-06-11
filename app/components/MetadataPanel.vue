<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FileMetadata } from '../types/types'

const props = defineProps<{
  metadata: FileMetadata
}>()

const isOpen = ref(true)

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

// Automatically reopen when metadata changes
watch(() => props.metadata, () => {
  isOpen.value = true
})

const getStatusBadgeClass = (code: number) => {
  if (code >= 200 && code < 300) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  } else if (code >= 300 && code < 400) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  } else {
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  }
}
</script>

<template>
  <div class="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
    <!-- Header -->
    <button
      id="metadata-panel-toggle"
      type="button"
      class="w-full flex items-center justify-between px-5 py-4 text-left border-b border-zinc-900 hover:bg-zinc-900/20 transition-colors"
      @click="toggleOpen"
    >
      <div class="flex items-center gap-3">
        <div class="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400">
          <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-semibold text-zinc-200 tracking-tight">File Metadata</h2>
          <p class="text-xs text-zinc-500">Core file identity and server response state</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <!-- HTTP Status Badge -->
        <span
          id="metadata-status-badge"
          class="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-md border"
          :class="getStatusBadgeClass(metadata.statusCode)"
        >
          HTTP {{ metadata.statusCode }} {{ metadata.statusText }}
        </span>
        <svg
          class="h-5 w-5 text-zinc-500 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </button>

    <!-- Content Panel -->
    <div
      v-show="isOpen"
      id="metadata-panel-content"
      class="p-5"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- File Name -->
        <div class="space-y-1.5">
          <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">File Name</span>
          <div class="text-sm font-semibold text-zinc-200 break-all select-all leading-tight">
            {{ metadata.name }}
          </div>
        </div>

        <!-- File Size -->
        <div class="space-y-1.5">
          <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Content Length</span>
          <div class="text-sm font-mono font-medium text-zinc-300">
            {{ metadata.sizeFormatted }}
          </div>
        </div>

        <!-- MIME Type -->
        <div class="space-y-1.5">
          <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">MIME Type</span>
          <div class="text-sm font-mono font-medium text-zinc-300 break-all">
            {{ metadata.mimeType }}
          </div>
        </div>

        <!-- Last Modified -->
        <div class="space-y-1.5">
          <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Last Modified</span>
          <div class="text-sm font-medium text-zinc-300">
            {{ metadata.lastModifiedFormatted }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
