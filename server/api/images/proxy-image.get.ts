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

  // Максимальный размер изображения (10 МБ)
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024
  // Таймаут запроса
  const FETCH_TIMEOUT_MS = 10000
  // Максимальное число редиректов, которые мы проверяем вручную
  const MAX_REDIRECTS = 3

  // Проверка одного URL: протокол, домен, приватные адреса.
  // Возвращает распарсенный URL либо бросает ошибку.
  const validateUrl = (rawUrl: string): URL => {
    let parsedUrl: URL

    try {
      parsedUrl = new URL(rawUrl)
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

    return parsedUrl
  }

  let parsedUrl = validateUrl(url)

  try {
    // Следуем редиректам вручную, проверяя каждый переход по белому списку,
    // чтобы разрешённый домен не мог перенаправить нас на внутренний адрес (SSRF).
    let currentUrl = parsedUrl.href
    let response: Response | null = null

    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      response = await fetch(currentUrl, {
        redirect: 'manual',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          'Referer': parsedUrl.origin,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      })

      // 3xx — редирект: проверяем Location и продолжаем
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (!location) break

        if (i === MAX_REDIRECTS) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Too many redirects'
          })
        }

        // Резолвим относительный Location и валидируем заново
        const nextUrl = new URL(location, currentUrl).href
        parsedUrl = validateUrl(nextUrl)
        currentUrl = parsedUrl.href
        continue
      }

      break
    }

    if (!response || !response.ok) {
      throw createError({
        statusCode: response?.status || 502,
        statusMessage: `Failed to fetch image: ${response?.statusText || 'no response'}`
      })
    }

    // Проверяем, что это действительно изображение
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      throw createError({
        statusCode: 415,
        statusMessage: 'Resource is not an image'
      })
    }

    // Проверяем заявленный размер до чтения тела
    const contentLength = Number(response.headers.get('content-length') || 0)
    if (contentLength > MAX_IMAGE_BYTES) {
      throw createError({
        statusCode: 413,
        statusMessage: 'Image is too large'
      })
    }

    const buffer = await response.arrayBuffer()

    // Проверяем фактический размер (Content-Length может отсутствовать или врать)
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      throw createError({
        statusCode: 413,
        statusMessage: 'Image is too large'
      })
    }

    const cacheControl = response.headers.get('cache-control') || 'public, max-age=86400'

    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'ETag': `"img-${Buffer.from(url).toString('base64').slice(0, 32)}"`
    })

    return Buffer.from(buffer)
  } catch (error: any) {
    // Пробрасываем уже сформированные HTTP-ошибки как есть
    if (error?.statusCode) {
      throw error
    }
    console.error('Image proxy error:', error.message, 'URL:', url)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to proxy image'
    })
  }
})