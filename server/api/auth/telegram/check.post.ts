import jwt from 'jsonwebtoken'
import User from '~~/server/models/User'
import { getRedisClient } from '~~/server/utils/redis'

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    return { success: false, error: 'Method not allowed' }
  }

  try {
    const body = await readBody(event)
    const { code } = body

    if (!code) {
      return { success: false, error: 'Code is required' }
    }

    // Получаем Redis клиент
    const redis = await getRedisClient()
    const key = `telegram:auth:${code}`
    
    // Получаем данные из Redis
    const authDataRaw = await redis.get(key)
    
    if (!authDataRaw) {
      return { success: false, error: 'Invalid or expired code' }
    }

    const authData = JSON.parse(authDataRaw)

    // Проверяем TTL (Redis автоматически удалит просроченные ключи)
    // Дополнительная проверка на всякий случай
    const ttl = await redis.ttl(key)
    if (ttl < 0) {
      // Ключ уже удален или не имеет TTL
      await redis.del(key)
      return { success: false, error: 'Code expired' }
    }

    // Ищем пользователя
    let user = await User.findOne({ telegramId: authData.telegramId })
    
    if (user) {
      user.firstName = authData.firstName || user.firstName
      user.lastName = authData.lastName || user.lastName
      user.username = authData.username || user.username
      user.photoUrl = authData.photoUrl || user.photoUrl
      user.lastLogin = new Date()
      await user.save()
    } else {
      user = new User({
        telegramId: authData.telegramId,
        firstName: authData.firstName || 'Пользователь',
        lastName: authData.lastName || '',
        username: authData.username || '',
        photoUrl: authData.photoUrl || '',
        lastLogin: new Date()
      })
      await user.save()
    }

    // Удаляем использованный код из Redis
    await redis.del(key)

    // Создаем JWT токен
    const config = useRuntimeConfig()
    const token = jwt.sign(
      {
        userId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    )

    // Устанавливаем cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: config.cookieSecure || false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return {
      success: true,
      user: {
        id: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl
      }
    }
  } catch (error) {
    console.error('❌ Check auth error:', error)
    return {
      success: false,
      error: 'Failed to check auth: ' + error.message
    }
  }
})

// ✅ Функция для добавления кода (вызывается из polling бота)
export const addAuthCode = async (code: string, telegramId: string, userData: any) => {
  try {
    const redis = await getRedisClient()
    const key = `telegram:auth:${code}`
    
    const data = {
      telegramId,
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      username: userData.username || '',
      photoUrl: userData.photo_url || ''
    }
    
    // Сохраняем в Redis с TTL 120 секунд
    await redis.setEx(key, 120, JSON.stringify(data))
    
    console.log(`✅ Auth code saved to Redis: ${code}`)
  } catch (error) {
    console.error('❌ Failed to save auth code to Redis:', error)
    throw error
  }
}