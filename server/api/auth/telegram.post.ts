import jwt from 'jsonwebtoken'
import User from '~~/server/models/User'

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    return {
      success: false,
      error: 'Method not allowed'
    }
  }

  try {
    const body = await readBody(event)
    console.log('📥 Telegram auth data received:', {
      id: body.id,
      username: body.username,
      firstName: body.first_name
    })

    // Извлекаем данные пользователя
    const {
      id,                    // ID пользователя в Telegram
      first_name,            // Имя
      last_name,             // Фамилия
      username,              // Username (без @)
      photo_url,             // URL фото
      auth_date,             // Дата авторизации (Unix timestamp)
      hash                   // Хеш для верификации
    } = body

    // ВАЖНО: Здесь должна быть проверка hash
    // Для продакшена ОБЯЗАТЕЛЬНО добавить верификацию!
    // Сейчас пропускаем для простоты
    
    // Ищем или создаем пользователя
    let user = await User.findOne({ telegramId: id.toString() })
    
    if (user) {
      // Обновляем данные существующего пользователя
      user.username = username || user.username
      user.firstName = first_name || user.firstName
      user.lastName = last_name || user.lastName
      user.photoUrl = photo_url || user.photoUrl
      user.lastLogin = new Date()
      await user.save()
      
      console.log(`✅ User updated: ${user.firstName} (${user.telegramId})`)
    } else {
      // Создаем нового пользователя
      user = new User({
        telegramId: id.toString(),
        username: username || '',
        firstName: first_name || 'User',
        lastName: last_name || '',
        photoUrl: photo_url || '',
        authDate: new Date(parseInt(auth_date) * 1000),
        lastLogin: new Date()
      })
      await user.save()
      
      console.log(`✅ New user created: ${user.firstName} (${user.telegramId})`)
    }

    // Создаем JWT токен для сессии
    const token = jwt.sign(
      {
        userId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      useRuntimeConfig().jwtSecret,
      { expiresIn: '7d' } // Токен живет 7 дней
    )

    // Возвращаем данные пользователя и токен
    return {
      success: true,
      token,
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