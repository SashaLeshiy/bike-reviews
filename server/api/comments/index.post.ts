import jwt from 'jsonwebtoken'
import sanitizeHtml from 'sanitize-html'
import Comment from '~~/server/models/Comment'
import Bike from '~~/server/models/Bike'
import { parseCookies } from 'h3'

const sanitizeOptions = {
  allowedTags: [], // Запрещаем все теги
  allowedAttributes: {}, // Запрещаем все атрибуты
  disallowedTagsMode: 'escape', // Экранируем теги вместо удаления
  textFilter: (text: string) => {
    // Дополнительная очистка текста
    return text
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }
}

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

    const sanitizedContent = sanitizeHtml(content.trim(), sanitizeOptions)

    if (!sanitizedContent || sanitizedContent.length < 3) {
      return {
        success: false,
        error: 'Comment content is required'
      }
    }

    if (sanitizedContent.length > 1000) {
      return { 
        success: false, 
        error: 'Comment is too long (max 1000 characters)' 
      }
    }

    // 4. Создаем комментарий
    const comment = new Comment({
      bikeId: bikeId,
      userId: decoded.userId,
      user: {
        username: decoded.username || '',
        firstName: decoded.firstName || '',
        lastName: decoded.lastName || ''
      },
      content: sanitizedContent
    })

    await comment.save()

    // 5. Обновляем счетчик комментариев
    await Bike.findOneAndUpdate(
      { id: bikeId },
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