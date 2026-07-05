import jwt from 'jsonwebtoken'
import User from '~~/server/models/User'
import { deleteAuthCode, getAuthCodeData } from '~~/server/utils/telegramAuth'
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

    const authEntry = await getAuthCodeData(code)

    if (!authEntry) {
      return { success: false, pending: true }
    }

    const { key, data: authData } = authEntry

    const redis = await getRedisClient()
    const ttl = await redis.ttl(key)
    if (ttl < 0) {
      await deleteAuthCode(code)
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

    await deleteAuthCode(code)

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