import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '~~/server/models/User'
import { setCookie, getResponseHeader } from 'h3'

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    return { success: false, error: 'Method not allowed' }
  }

  try {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    console.log('📥 Telegram auth data received:', {
      id: body.id,
      username: body.username,
      firstName: body.first_name
    })
    
    const {
      id,
      first_name,
      last_name,
      username,
      photo_url,
      auth_date,
      hash,
      is_test
    } = body

    const isTestUser = is_test === true && process.env.NODE_ENV === 'development'
    if (!isTestUser) {
      const secret = crypto
        .createHash('sha256')
        .update(config.telegramBotToken)
        .digest()

      const checkString = Object.keys(body)
        .filter(key => key !== 'hash' && key !== 'is_test')
        .sort()
        .map(key => `${key}=${body[key]}`)
        .join('\n')

      const hmac = crypto
        .createHmac('sha256', secret)
        .update(checkString)
        .digest('hex')

      if (hmac !== hash) {
        console.error('❌ Invalid hash!')
        return {
          success: false,
          error: 'Invalid authentication data'
        }
      }

      const authDate = parseInt(auth_date)
      const now = Math.floor(Date.now() / 1000)
      if (now - authDate > 86400) {
        return {
          success: false,
          error: 'Authentication data expired'
        }
      }
    } else {
      console.log('🧪 Test login mode enabled')
    }

    let user = await User.findOne({ telegramId: id.toString() })
    
    if (user) {
      user.username = username || user.username
      user.firstName = first_name || user.firstName
      user.lastName = last_name || user.lastName
      user.photoUrl = photo_url || user.photoUrl
      user.lastLogin = new Date()
      await user.save()
      console.log(`✅ User updated: ${user.firstName}`)
    } else {
      user = new User({
        telegramId: id.toString(),
        username: username || 'test_user',
        firstName: first_name || 'Тестовый',
        lastName: last_name || 'Пользователь',
        photoUrl: photo_url || '',
        authDate: new Date(),
        lastLogin: new Date()
      })
      await user.save()
      console.log(`✅ New user created: ${user.firstName}`)
    }

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
    console.log('🔐 JWT token created:', token.substring(0, 20) + '...')

    // ✅ Устанавливаем cookie с явными параметрами
    const cookieOptions = {
      httpOnly: true,
      secure: config.cookieSecure || false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    }
    
    console.log('🍪 Setting cookie with options:', cookieOptions)
    
    setCookie(event, 'auth_token', token, cookieOptions)

    const setCookieHeader = getResponseHeader(event, 'set-cookie')
    console.log('✅ Set-Cookie header:', setCookieHeader)

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
    console.error('❌ Auth error:', error)
    return {
      success: false,
      error: 'Authentication failed: ' + error.message
    }
  }
})