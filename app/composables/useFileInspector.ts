import { ref, computed } from 'vue'
import type { InspectResult, FileMetadata } from '../types/types'

export function useFileInspector() {
  const url = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<InspectResult | null>(null)

  const inspectUrl = async (targetUrl: string) => {
    if (!targetUrl) {
      error.value = 'Please enter a URL'
      return
    }

    if (!/^https?:\/\//i.test(targetUrl)) {
      error.value = 'URL must start with http:// or https://'
      return
    }

    loading.value = true
    error.value = null
    result.value = null
    url.value = targetUrl

    try {
      const apiEndpoint = `/api/inspect?url=${encodeURIComponent(targetUrl)}`
      const response = await fetch(apiEndpoint)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP Error ${response.status}`)
      }

      result.value = data as InspectResult
    } catch (err: any) {
      error.value = err.message || 'An unexpected network error occurred'
    } finally {
      loading.value = false
    }
  }

  // Format size helper (KB/MB)
  const formatBytes = (bytesStr: string | null): string => {
    if (!bytesStr) return 'Unknown Size'
    const bytes = parseInt(bytesStr, 10)
    if (isNaN(bytes)) return 'Unknown Size'
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Parse filename from URL helper
  const getFilename = (urlStr: string): string => {
    try {
      const parsed = new URL(urlStr)
      const pathname = parsed.pathname
      const parts = pathname.split('/')
      const lastPart = parts[parts.length - 1]
      return lastPart || parsed.hostname
    } catch {
      return 'Unknown File'
    }
  }

  const metadata = computed<FileMetadata | null>(() => {
    if (!result.value) return null

    const statusCode = result.value.status
    const isSuccess = statusCode >= 200 && statusCode < 300
    
    const statusTextMap: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      206: 'Partial Content',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    }

    return {
      name: getFilename(url.value),
      sizeFormatted: formatBytes(result.value.contentLength),
      mimeType: result.value.contentType.split(';')[0] || 'Unknown',
      lastModifiedFormatted: result.value.lastModified 
        ? new Date(result.value.lastModified).toLocaleString() 
        : 'Not Specified',
      statusCode,
      statusText: statusTextMap[statusCode] || 'Unknown Status',
      isSuccess,
    }
  })

  return {
    url,
    loading,
    error,
    result,
    inspectUrl,
    metadata,
  }
}
