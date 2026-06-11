<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SecurityHeaderAssessment } from '../types/types'

const props = defineProps<{
  headers: Record<string, string>
}>()

const isOpen = ref(true)
const activeTab = ref<'security' | 'all'>('security')

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

// Automatically reopen when headers change
watch(() => props.headers, () => {
  isOpen.value = true
})

// Definition of security headers to audit
const securityHeadersConfig = [
  {
    name: 'cache-control',
    description: 'Controls cache behavior in browser and intermediate CDN proxies.',
    missingStatus: 'warning' as const,
    missingDesc: 'Browser will use default caching, potentially caching sensitive files or requesting too often.'
  },
  {
    name: 'etag',
    description: 'Entity tag for cache validation; helps avoid transferring unchanged data.',
    missingStatus: 'warning' as const,
    missingDesc: 'Client cannot validate cache state, causing redundant full-file downloads.'
  },
  {
    name: 'cf-cache-status',
    description: 'Cloudflare CDN cache status (HIT, MISS, EXPIRED, BYPASS, etc.).',
    missingStatus: 'missing' as const,
    missingDesc: 'Not cached by Cloudflare CDN, or not served through Cloudflare.'
  },
  {
    name: 'x-content-type-options',
    description: 'Prevents browsers from MIME-sniffing away from the declared content-type.',
    missingStatus: 'secure' as const, // We'll show as missing but lower threat if text-only, actually it is warning.
    missingDesc: 'Exposes clients to drive-by download attacks if MIME types are misconfigured.'
  },
  {
    name: 'access-control-allow-origin',
    description: 'Configures Cross-Origin Resource Sharing (CORS) access control permissions.',
    missingStatus: 'warning' as const,
    missingDesc: 'Other websites cannot fetch this resource directly via Javascript/fetch.'
  },
  {
    name: 'content-security-policy',
    description: 'Restricts resources (such as JavaScript, CSS, Images) that the browser is allowed to load.',
    missingStatus: 'warning' as const,
    missingDesc: 'Exposes application to cross-site scripting (XSS) and data injection vulnerabilities.'
  }
]

// Computed assessment of security headers
const securityAssessments = computed<SecurityHeaderAssessment[]>(() => {
  return securityHeadersConfig.map(cfg => {
    // Find header (case-insensitive lookup)
    const exactKey = Object.keys(props.headers).find(
      key => key.toLowerCase() === cfg.name.toLowerCase()
    )
    const value = exactKey ? (props.headers[exactKey] ?? null) : null
    const isSet = !!value

    let status: 'secure' | 'warning' | 'missing' = 'missing'
    if (isSet) {
      status = 'secure'
    } else {
      // If missing, use our configured fallback severity
      status = cfg.missingStatus === 'secure' ? 'missing' : cfg.missingStatus
    }

    return {
      name: cfg.name,
      value,
      isSet,
      status,
      description: isSet ? value! : cfg.missingDesc
    }
  })
})

const securityScore = computed(() => {
  const setHeadersCount = securityAssessments.value.filter(h => h.isSet).length
  const totalHeadersCount = securityAssessments.value.length
  return {
    score: setHeadersCount,
    total: totalHeadersCount,
    percentage: Math.round((setHeadersCount / totalHeadersCount) * 100)
  }
})

// Sort all headers alphabetically by key
const sortedHeaders = computed(() => {
  return Object.entries(props.headers).sort((a, b) => a[0].localeCompare(b[0]))
})
</script>

<template>
  <div class="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
    <!-- Header -->
    <button
      id="headers-panel-toggle"
      type="button"
      class="w-full flex items-center justify-between px-5 py-4 text-left border-b border-zinc-900 hover:bg-zinc-900/20 transition-colors"
      @click="toggleOpen"
    >
      <div class="flex items-center gap-3">
        <div class="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400">
          <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-semibold text-zinc-200 tracking-tight">HTTP Headers</h2>
          <p class="text-xs text-zinc-500">Inspection of metadata headers and security profile</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <!-- Security score -->
        <span
          id="headers-security-score"
          class="text-xs px-2 py-0.5 rounded-full border bg-zinc-900 border-zinc-800 text-zinc-400 font-mono"
        >
          Security: {{ securityScore.score }}/{{ securityScore.total }}
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
      id="headers-panel-content"
      class="p-0"
    >
      <!-- Tabs Selector -->
      <div class="flex border-b border-zinc-900 px-5 bg-zinc-950/40">
        <button
          id="headers-tab-security"
          type="button"
          class="px-4 py-3 text-xs font-semibold border-b-2 -mb-[1px] transition-all"
          :class="activeTab === 'security' ? 'text-zinc-100 border-zinc-400' : 'text-zinc-500 border-transparent hover:text-zinc-300'"
          @click="activeTab = 'security'"
        >
          Security Audit
        </button>
        <button
          id="headers-tab-all"
          type="button"
          class="px-4 py-3 text-xs font-semibold border-b-2 -mb-[1px] transition-all"
          :class="activeTab === 'all' ? 'text-zinc-100 border-zinc-400' : 'text-zinc-500 border-transparent hover:text-zinc-300'"
          @click="activeTab = 'all'"
        >
          All Headers ({{ sortedHeaders.length }})
        </button>
      </div>

      <!-- Tab Content: Security -->
      <div v-show="activeTab === 'security'" class="divide-y divide-zinc-900 p-5 space-y-4 divide-none">
        <div class="flex items-center justify-between bg-zinc-900/10 border border-zinc-900 rounded-lg p-3 text-xs text-zinc-400">
          <div>
            <span class="font-semibold text-zinc-300">Security Score: </span>
            <span>Based on recommendation checklists from OWASP and Google.</span>
          </div>
          <div class="font-mono text-zinc-200 font-semibold bg-zinc-900 px-2 py-1 border border-zinc-800 rounded">
            {{ securityScore.percentage }}% Compliant
          </div>
        </div>

        <div class="space-y-3 mt-4">
          <div
            v-for="header in securityAssessments"
            :key="header.name"
            class="flex flex-col md:flex-row md:items-start justify-between p-3.5 bg-zinc-900/20 border border-zinc-900/60 hover:border-zinc-800 rounded-xl transition-all gap-3"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold font-mono text-zinc-200 select-all">{{ header.name }}</span>
                <span
                  v-if="header.isSet"
                  class="inline-flex px-1.5 py-0.25 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded"
                >
                  configured
                </span>
                <span
                  v-else-if="header.status === 'warning'"
                  class="inline-flex px-1.5 py-0.25 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded"
                >
                  not set
                </span>
                <span
                  v-else
                  class="inline-flex px-1.5 py-0.25 text-[10px] bg-zinc-900 text-zinc-500 border border-zinc-800 rounded"
                >
                  optional
                </span>
              </div>
              <p class="text-xs text-zinc-400 font-mono break-all leading-relaxed whitespace-pre-wrap select-all">
                {{ header.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: All Headers -->
      <div v-show="activeTab === 'all'" class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr class="bg-zinc-900/30 border-b border-zinc-900">
              <th class="px-5 py-3 font-semibold text-zinc-400 w-1/3">Header Key</th>
              <th class="px-5 py-3 font-semibold text-zinc-400 w-2/3">Header Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-900">
            <tr
              v-for="[key, value] in sortedHeaders"
              :key="key"
              class="hover:bg-zinc-900/10 transition-colors"
            >
              <td class="px-5 py-3.5 text-zinc-400 font-semibold break-all select-all">{{ key }}</td>
              <td class="px-5 py-3.5 text-zinc-200 break-all select-all leading-normal">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
