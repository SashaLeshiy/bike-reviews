import jwt from 'jsonwebtoken'
import Comment from '~~/server/models/Comment'
import Bike from '~~/server/models/Bike'
import { parseCookies } from 'h3'

export default defineEventHandler(async (event) => {
  // Разрешаем только POST
  if (event.method !== 'POST') {
    return {
      success: false,
      error: 'Method not allowed'
    }
  }

  try {
    // 1. Получаем токен из cookie (НЕ из заголовка!)
    const cookies = parseCookies(event)
    const token = cookies.auth_token

    if (!token) {
      return {
        success: false,
        error: 'Unauthorized - No token found'
      }
    }

    // 2. Верифицируем токен
    const config = useRuntimeConfig()
    let decoded: any
    
    try {
      decoded = jwt.verify(token, config.jwtSecret)
    } catch (error) {
      return {
        success: false,
        error: 'Unauthorized - Invalid token'
      }
    }

    // 3. Получаем данные комментария
    const body = await readBody(event)
    const { bikeId, content } = body

    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: 'Comment content is required'
      }
    }

    // 4. Создаем комментарий
    const comment = new Comment({
      bikeId: parseInt(bikeId),
      userId: decoded.userId,
      user: {
        username: decoded.username || '',
        firstName: decoded.firstName || '',
        lastName: decoded.lastName || ''
      },
      content: content.trim()
    })

    await comment.save()

    // 5. Обновляем счетчик комментариев
    await Bike.findOneAndUpdate(
      { id: parseInt(bikeId) },
      { $inc: { commentsCount: 1 } }
    )

    return {
      success: true,
      data: comment
    }
  } catch (error) {
    console.error('❌ Error posting comment:', error)
    return {
      success: false,
      error: 'Failed to post comment: ' + error.message
    }
  }
})