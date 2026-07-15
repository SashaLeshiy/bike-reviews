export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL parameter is required'
    })
  }

  // Список разрешенных доменов
  const ALLOWED_DOMAINS = [
    'rentalbikes.ru',
    'www.rentalbikes.ru',
  ]

  let parsedUrl: URL
  
  // Проверяем и парсим URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid URL format'
    })
  }

  // 1. Проверка протокола (только HTTPS)
  if (parsedUrl.protocol !== 'https:') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only HTTPS protocol is allowed'
    })
  }

  // 2. Проверка домена по белому списку
  const isAllowed = ALLOWED_DOMAINS.some(domain => 
    parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
  )

  if (!isAllowed) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Domain not allowed'
    })
  }

  // 3. Блокировка localhost и внутренних IP
  const blockedHosts = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '[::1]',
    '0',
  ]

  if (blockedHosts.includes(parsedUrl.hostname)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied'
    })
  }

  // 4. Блокировка приватных IP диапазонов
  const privateIPRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.|127\.|0\.)/
  if (privateIPRegex.test(parsedUrl.hostname)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied'
    })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Referer': parsedUrl.origin,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch image: ${response.statusText}`
      })
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const cacheControl = response.headers.get('cache-control') || 'public, max-age=86400'

    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'ETag': `"img-${Buffer.from(url).toString('base64').slice(0, 32)}"`
    })

    return Buffer.from(buffer)
  } catch (error: any) {
    console.error('Image proxy error:', error.message, 'URL:', url)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to proxy image'
    })
  }
})