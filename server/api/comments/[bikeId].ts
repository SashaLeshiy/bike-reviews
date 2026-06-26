import Comment from '~~/server/models/Comment'

export default defineEventHandler(async (event) => {
  const bikeId = getRouterParam(event, 'bikeId')
  
  if (event.method === 'GET') {
    try {
      const comments = await Comment.find({ 
        bikeId: parseInt(bikeId) 
      })
      .sort({ createdAt: -1 })
      .lean()
      
      return {
        success: true,
        data: comments
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      return {
        success: false,
        error: 'Failed to fetch comments'
      }
    }
  }
  
  return {
    success: false,
    error: 'Method not allowed'
  }
})