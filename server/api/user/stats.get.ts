import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import Comment from '~~/server/models/Comment'

export default defineEventHandler(async (event) => {
  try {
    // Получаем токен из cookie
    const cookies = parseCookies(event)
    const token = cookies.auth_token

    if (!token) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    // Верифицируем токен
    const config = useRuntimeConfig()
    let decoded: any
    
    try {
      decoded = jwt.verify(token, config.jwtSecret)
    } catch (error) {
      return {
        success: false,
        error: 'Invalid token'
      }
    }

    // Получаем количество комментариев пользователя
    const commentsCount = await Comment.countDocuments({ 
      userId: decoded.userId 
    })

    // Получаем дату регистрации пользователя
    const User = mongoose.model('User')
    const user = await User.findOne({ telegramId: decoded.userId })
    
    const createdAt = user?.createdAt || new Date()
    const now = new Date()
    const days = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

    return {
      success: true,
      data: {
        comments: commentsCount,
        bikes: 0, // Можно добавить логику подсчета просмотренных мотоциклов
        days: days || 1
      }
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      success: false,
      error: 'Failed to fetch user stats'
    }
  }
})