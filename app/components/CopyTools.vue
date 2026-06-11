<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  url: string
  contentType: string
}>()

const activeCopyId = ref<string | null>(null)

const isImage = computed(() => props.contentType.startsWith('image/'))

// Construct formatted strings
const markdownLink = computed(() => {
  const filename = props.url.split('/').pop() || 'image'
  return `![${filename}](${props.url})`
})

const htmlTag = computed(() => {
  const filename = props.url.split('/').pop() || 'image'
  return `<img src="${props.url}" alt="${filename}" />`
})

const curlCommand = computed(() => {
  return `curl -I "${props.url}"`
})

// Copy helper function
const copyToClipboard = async (text: string, id: string) => {
  try {
    await navigator.clipboard.writeText(text)
    activeCopyId.value = id
    setTimeout(() => {
      if (activeCopyId.value === id) {
        activeCopyId.value = null
      }
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}
</script>

<template>
  <div class="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-zinc-900">
      <div class="flex items-center gap-3">
        <div class="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400">
          <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h5m-5 4h5m-2 5h2"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-semibold text-zinc-200 tracking-tight">Copy Utilities</h2>
          <p class="text-xs text-zinc-500">Copy URL or generate standard markdown, HTML, and cURL commands</p>
        </div>
      </div>
    </div>

    <!-- Content Panel -->
    <div class="p-5 space-y-4">
      <!-- Direct Link -->
      <div class="space-y-1.5">
        <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Direct URL</span>
        <div class="flex gap-2">
          <input
            id="copy-direct-url-input"
            type="text"
            :value="url"
            readonly
            class="flex-grow px-3.5 py-2.5 bg-zinc-900 border border-zinc-900 rounded-lg text-zinc-300 font-mono text-xs focus:outline-none select-all"
          />
          <button
            id="copy-direct-url-btn"
            type="button"
            class="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 font-medium rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 min-w-[90px] justify-center"
            @click="copyToClipboard(url, 'url')"
          >
            <span v-if="activeCopyId === 'url'" class="text-emerald-400 flex items-center gap-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Copied
            </span>
            <span v-else>Copy URL</span>
          </button>
        </div>
      </div>

      <!-- cURL command -->
      <div class="space-y-1.5">
        <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">cURL Command</span>
        <div class="flex gap-2">
          <input
            id="copy-curl-input"
            type="text"
            :value="curlCommand"
            readonly
            class="flex-grow px-3.5 py-2.5 bg-zinc-900 border border-zinc-900 rounded-lg text-zinc-300 font-mono text-xs focus:outline-none select-all"
          />
          <button
            id="copy-curl-btn"
            type="button"
            class="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 font-medium rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 min-w-[90px] justify-center"
            @click="copyToClipboard(curlCommand, 'curl')"
          >
            <span v-if="activeCopyId === 'curl'" class="text-emerald-400 flex items-center gap-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Copied
            </span>
            <span v-else>Copy cURL</span>
          </button>
        </div>
      </div>

      <!-- Markdown & HTML (Only shown for images) -->
      <template v-if="isImage">
        <!-- Markdown -->
        <div class="space-y-1.5">
          <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Markdown Link</span>
          <div class="flex gap-2">
            <input
              id="copy-markdown-input"
              type="text"
              :value="markdownLink"
              readonly
              class="flex-grow px-3.5 py-2.5 bg-zinc-900 border border-zinc-900 rounded-lg text-zinc-300 font-mono text-xs focus:outline-none select-all"
            />
            <button
              id="copy-markdown-btn"
              type="button"
              class="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 font-medium rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 min-w-[90px] justify-center"
              @click="copyToClipboard(markdownLink, 'md')"
            >
              <span v-if="activeCopyId === 'md'" class="text-emerald-400 flex items-center gap-1">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Copied
              </span>
              <span v-else>Copy MD</span>
            </button>
          </div>
        </div>

        <!-- HTML tag -->
        <div class="space-y-1.5">
          <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">HTML Image Tag</span>
          <div class="flex gap-2">
            <input
              id="copy-html-input"
              type="text"
              :value="htmlTag"
              readonly
              class="flex-grow px-3.5 py-2.5 bg-zinc-900 border border-zinc-900 rounded-lg text-zinc-300 font-mono text-xs focus:outline-none select-all"
            />
            <button
              id="copy-html-btn"
              type="button"
              class="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 font-medium rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 min-w-[90px] justify-center"
              @click="copyToClipboard(htmlTag, 'html')"
            >
              <span v-if="activeCopyId === 'html'" class="text-emerald-400 flex items-center gap-1">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Copied
              </span>
              <span v-else>Copy HTML</span>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
