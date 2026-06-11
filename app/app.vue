<script setup lang="ts">
import { useFileInspector } from './composables/useFileInspector'

const { url, loading, error, result, inspectUrl, metadata } = useFileInspector()

const handleInspect = (url: string) => {
  inspectUrl(url)
}
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-200 antialiased flex flex-col relative overflow-x-hidden">
    <!-- Subtle background radial glow to feel premium -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-b from-zinc-800/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

    <!-- Header -->
    <header class="w-full border-b border-zinc-900/80 backdrop-blur-md bg-zinc-950/60 sticky top-0 z-50 py-4 px-6">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 flex items-center justify-center">
            <!-- Sleek minimalist inspector icon -->
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 8h.01M12 16h.01M8 12h.01M8 8h.01m-3 4H3"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-sm font-semibold text-zinc-100 tracking-tight">EdgeProbe</h1>
            <p class="text-[10px] text-zinc-500 font-medium uppercase tracking-wider"></p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow max-w-7xl w-full mx-auto px-6 py-10 space-y-8 relative z-10">
      
      <!-- Title & Intro (Minimalist) -->
      <div class="space-y-2 max-w-2xl">
        <h2 class="text-2xl font-semibold tracking-tight text-zinc-100">Inspect Assets Instantly</h2>
        <p class="text-sm text-zinc-400 leading-relaxed">
          Paste any asset URL to inspect headers, metadata, CDN cache status, security postures, and view inline previews.
        </p>
      </div>

      <!-- Input Bar -->
      <section class="w-full">
        <UrlInput :loading="loading" @inspect="handleInspect" />
      </section>

      <!-- Inspection Results -->
      <section class="w-full">
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-4"
        >
          <!-- Loading State Skeleton -->
          <div v-if="loading" class="space-y-6">
            <div class="h-28 bg-zinc-900/30 border border-zinc-900 rounded-xl animate-pulse"></div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div class="lg:col-span-4 space-y-6">
                <div class="h-36 bg-zinc-900/30 border border-zinc-900 rounded-xl animate-pulse"></div>
                <div class="h-64 bg-zinc-900/30 border border-zinc-900 rounded-xl animate-pulse"></div>
              </div>
              <div class="lg:col-span-8 space-y-6">
                <div class="h-80 bg-zinc-900/30 border border-zinc-900 rounded-xl animate-pulse"></div>
                <div class="h-64 bg-zinc-900/30 border border-zinc-900 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-else-if="error" id="error-alert" class="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl flex gap-3 text-sm text-rose-400">
            <svg class="h-5 w-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="space-y-1">
              <span class="font-semibold">Inspection Failed</span>
              <p class="text-xs text-rose-400/90 leading-relaxed font-mono select-all">{{ error }}</p>
            </div>
          </div>

          <!-- Successful Inspection Result Grid -->
          <div v-else-if="result && metadata" id="inspection-results" class="space-y-6">
            <!-- 1. Metadata Panel (Full Width for clarity) -->
            <MetadataPanel :metadata="metadata" />

            <!-- 2. Detailed Split Panel Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <!-- Left Column: Copy Tools -->
              <div class="lg:col-span-5 space-y-6">
                <CopyTools :url="url" :content-type="result.contentType" />
              </div>

              <!-- Right Column: Media Preview & Full Headers -->
              <div class="lg:col-span-7 space-y-6">
                <PreviewPanel
                  :url="url"
                  :content-type="result.contentType"
                  :preview-text="result.preview"
                />

                <HeadersPanel :headers="result.headers" />
              </div>
            </div>
          </div>
        </transition>
      </section>
    </main>

    <!-- Footer -->
    <footer class="w-full py-6 px-6 border-t border-zinc-900/40 mt-auto text-center text-xs text-zinc-500 font-mono">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          &copy; {{ new Date().getFullYear() }} EdgeProbe. All rights reserved.
        </div>
        <div>
          Built with ❤️ by <a href="https://github.com/rajtilak-2020" target="_blank">K Rajtilak</a>
        </div>
      </div>
    </footer>
  </div>
</template>
