import { defineEventHandler, getQuery, createError, setHeaders } from 'h3'

export default defineEventHandler(async (event) => {
  // Set CORS headers
  setHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })

  // Handle preflight OPTIONS request
  const method = event.node.req.method
  if (method === 'OPTIONS') {
    event.node.res.statusCode = 204
    return null
  }

  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing URL parameter',
    })
  }

  // Validate URL protocol and block localhost/private networks
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL must use http or https protocol',
      })
    }
    const hostname = parsedUrl.hostname.toLowerCase()
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.')
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Inspection of localhost and private IPs is not allowed',
      })
    }
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message || 'Invalid URL format',
    })
  }

  let status = 200
  let headers: Record<string, string> = {}
  let headError: string | null = null
  let usedGet = false
  let getResponse: Response | null = null

  // 1. Try HEAD request
  try {
    const headResponse = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CDN-Inspector/1.0',
      },
    })
    status = headResponse.status
    headers = Object.fromEntries(headResponse.headers.entries())
  } catch (err: any) {
    headError = err.message
  }

  // 2. Fall back to GET if HEAD failed or if Content-Length is missing
  const hasContentLength = headers['content-length'] !== undefined
  const headFailed = headError || status >= 400

  if (!hasContentLength || headFailed) {
    try {
      usedGet = true
      getResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CDN-Inspector/1.0',
        },
      })
      status = getResponse.status
      headers = Object.fromEntries(getResponse.headers.entries())
    } catch (err: any) {
      throw createError({
        statusCode: 502,
        statusMessage: `Failed to fetch target URL: ${err.message || 'Network error'}`,
      })
    }
  }

  const contentType = headers['content-type'] || ''
  const contentLength = headers['content-length'] || null
  const lastModified = headers['last-modified'] || null
  const etag = headers['etag'] || null

  let preview: string | null = null

  // 3. For preview of text/JSON files, fetch the first 5KB
  const isText = contentType.includes('text') || 
                 contentType.includes('json') || 
                 contentType.includes('javascript') || 
                 contentType.includes('xml') || 
                 contentType.includes('svg')

  if (isText) {
    try {
      let text = ''
      if (usedGet && getResponse) {
        // Read body from the existing GET response
        text = await getResponse.text()
      } else {
        const getRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CDN-Inspector/1.0',
          }
        })
        text = await getRes.text()
      }
      preview = text.slice(0, 5000)
    } catch (err) {
      // Silent catch for preview fetch errors, fallback to null preview
    }
  }

  return {
    status,
    headers,
    contentType,
    contentLength,
    lastModified,
    etag,
    preview,
  }
})
