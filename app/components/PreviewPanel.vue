<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  url: string
  contentType: string
  previewText: string | null
}>()

const isOpen = ref(true)
const imgWidth = ref<number | null>(null)
const imgHeight = ref<number | null>(null)
const imgError = ref(false)

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

// Automatically reset states and reopen when URL changes
watch(() => props.url, () => {
  isOpen.value = true
  imgWidth.value = null
  imgHeight.value = null
  imgError.value = false
})

const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  imgWidth.value = img.naturalWidth
  imgHeight.value = img.naturalHeight
}

const handleImageError = () => {
  imgError.value = true
}

// Check type categories
const isImage = computed(() => props.contentType.startsWith('image/'))
const isVideo = computed(() => props.contentType.startsWith('video/'))
const isJson = computed(() => props.contentType.includes('json'))
const isText = computed(() => {
  return (
    props.contentType.startsWith('text/') ||
    props.contentType.includes('javascript') ||
    props.contentType.includes('xml') ||
    props.contentType.includes('svg')
  ) && !isJson.value
})

const isUnknown = computed(() => {
  return !isImage.value && !isVideo.value && !isJson.value && !isText.value
})

// Highlight JSON syntax
const highlightedJson = computed(() => {
  if (!props.previewText) return ''
  try {
    const parsed = JSON.parse(props.previewText)
    const pretty = JSON.stringify(parsed, null, 2)
    const escaped = pretty
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-zinc-300'
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-indigo-400 font-semibold' // key
          } else {
            cls = 'text-emerald-400' // string value
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-amber-500 font-medium' // boolean
        } else if (/null/.test(match)) {
          cls = 'text-rose-500 font-medium' // null
        } else {
          cls = 'text-sky-400' // number
        }
        return `<span class="${cls}">${match}</span>`
      }
    )
  } catch {
    // If it's not a complete/valid JSON yet
    return props.previewText
  }
})

// Slice first 100 lines of plain text
const textLines = computed(() => {
  if (!props.previewText) return []
  return props.previewText.split('\n').slice(0, 100)
})
</script>

<template>
  <div class="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
    <!-- Header -->
    <button
      id="preview-panel-toggle"
      type="button"
      class="w-full flex items-center justify-between px-5 py-4 text-left border-b border-zinc-900 hover:bg-zinc-900/20 transition-colors"
      @click="toggleOpen"
    >
      <div class="flex items-center gap-3">
        <div class="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400">
          <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-semibold text-zinc-200 tracking-tight">File Preview</h2>
          <p class="text-xs text-zinc-500">Visual render and content preview panel</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span
          v-if="isImage && imgWidth && imgHeight"
          class="text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono"
        >
          {{ imgWidth }} × {{ imgHeight }} px
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
      id="preview-panel-content"
      class="p-5 bg-zinc-950/20"
    >
      <!-- Image Preview -->
      <div v-if="isImage" class="flex flex-col items-center justify-center py-2 space-y-4">
        <div class="relative max-w-full rounded-lg overflow-hidden border border-zinc-900 bg-zinc-900/10 group p-1">
          <img
            id="preview-image"
            :src="url"
            alt="CDN Image preview"
            class="max-h-[350px] object-contain rounded-md select-none mx-auto"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          <div v-if="imgError" class="p-6 text-center text-xs text-zinc-500 font-mono">
            Could not render image. Verify CORS settings on the target server.
          </div>
        </div>
      </div>

      <!-- Video Preview -->
      <div v-else-if="isVideo" class="flex justify-center py-2">
        <div class="w-full max-w-2xl rounded-lg overflow-hidden border border-zinc-900 shadow-lg bg-black">
          <video
            id="preview-video"
            :src="url"
            controls
            class="w-full h-auto max-h-[380px] outline-none"
          ></video>
        </div>
      </div>

      <!-- JSON Preview -->
      <div v-else-if="isJson" class="relative">
        <div class="absolute right-4 top-3 z-10 px-2 py-0.5 text-[10px] font-mono font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 rounded select-none">
          JSON
        </div>
        <pre class="w-full p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl overflow-x-auto text-xs font-mono max-h-[350px] leading-relaxed"><code v-html="highlightedJson"></code></pre>
      </div>

      <!-- Text / Code Preview -->
      <div v-else-if="isText" class="relative">
        <div class="absolute right-4 top-3 z-10 px-2 py-0.5 text-[10px] font-mono font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 rounded select-none">
          TEXT (First 100 lines)
        </div>
        <div class="w-full bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 overflow-x-auto max-h-[350px] flex font-mono text-xs leading-relaxed">
          <!-- Line Numbers -->
          <div class="text-zinc-600 text-right pr-4 border-r border-zinc-900 select-none space-y-0.5">
            <div v-for="index in textLines.length" :key="index">{{ index }}</div>
          </div>
          <!-- Line Content -->
          <div class="pl-4 text-zinc-300 whitespace-pre space-y-0.5 select-text overflow-x-auto w-full">
            <div v-for="(line, index) in textLines" :key="index" class="min-h-[1.2rem]">{{ line }}</div>
          </div>
        </div>
      </div>

      <!-- PDF / Binary / Unknown fallback -->
      <div v-else-if="isUnknown" class="flex flex-col items-center justify-center py-8 text-center space-y-3">
        <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 shadow-inner">
          <!-- File Icon -->
          <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div class="space-y-1">
          <h3 class="text-sm font-semibold text-zinc-200">No Preview Available</h3>
          <p class="text-xs text-zinc-500 max-w-sm leading-relaxed">
            This file type (<span class="font-mono text-zinc-400">{{ contentType || 'unknown/binary' }}</span>) cannot be previewed in the browser. You can copy the direct URL below to access it.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
