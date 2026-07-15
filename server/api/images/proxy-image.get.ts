export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL parameter is required'
    })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Referer': new URL(url).origin,
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