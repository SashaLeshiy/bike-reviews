import Comment from '~~/server/models/Comment'
import Bike from '~~/server/models/Bike'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  if (event.method === 'POST') {
    const body = await readBody(event)
    
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      return { success: false, error: 'Unauthorized' }
    }
    
    try {
      const token = authHeader.replace('Bearer ', '')
      const decoded = jwt.verify(token, config.jwtSecret)
      
      const { bikeId, content } = body
      
      if (!content || content.trim().length === 0) {
        return { success: false, error: 'Comment content is required' }
      }
      
      const comment = new Comment({
        bikeId: parseInt(bikeId),
        userId: decoded.userId,
        user: {
          username: decoded.username,
          firstName: decoded.firstName || '',
          lastName: decoded.lastName || ''
        },
        content: content.trim()
      })
      
      await comment.save()
      
      // Обновляем счетчик комментариев
      await Bike.findOneAndUpdate(
        { id: parseInt(bikeId) },
        { $inc: { commentsCount: 1 } }
      )
      
      return {
        success: true,
        data: comment
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      return {
        success: false,
        error: 'Failed to post comment'
      }
    }
  }
  
  return {
    success: false,
    error: 'Method not allowed'
  }
})