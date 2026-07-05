import { createClient } from 'redis'

let client: ReturnType<typeof createClient> | null = null
let isConnected = false

export const getRedisClient = async () => {
  if (client && isConnected) {
    return client
  }

  const config = useRuntimeConfig()
  
  const redisUrl = config.redisUrl || 'redis://localhost:6379'
  const redisPassword = config.redisPassword || ''
  
  client = createClient({
    url: redisUrl,
    password: redisPassword || undefined,
    socket: {
      reconnectStrategy: (retries: number) => {
        // Максимум 5 попыток переподключения
        if (retries > 5) {
          console.error('❌ Redis connection failed after 5 retries')
          return new Error('Redis connection failed')
        }
        // Экспоненциальная задержка: 100ms, 200ms, 400ms, 800ms, 1600ms
        return Math.min(retries * 100, 3000)
      }
    }
  })

  // Обработчики событий
  client.on('error', (err) => {
    console.error('❌ Redis error:', err)
    isConnected = false
  })

  client.on('connect', () => {
    console.log('🔌 Redis connecting...')
  })

  client.on('ready', () => {
    console.log('✅ Redis connected successfully')
    isConnected = true
  })

  client.on('end', () => {
    console.log('🔌 Redis disconnected')
    isConnected = false
  })

  // Подключаемся
  await client.connect()
  
  return client
}

// Функция для проверки подключения
export const isRedisAvailable = (): boolean => {
  return isConnected && client !== null
}

// Функция для закрытия соединения
export const closeRedis = async () => {
  if (client) {
    await client.quit()
    client = null
    isConnected = false
  }
}