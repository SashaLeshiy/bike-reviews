import Comment from '~~/server/models/Comment'
import Bike from '~~/server/models/Bike'

export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') {
    return {
      success: false,
      error: 'Method not allowed'
    }
  }

  try {
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 20)

    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    if (comments.length === 0) {
      return {
        success: true,
        data: []
      }
    }

    const bikeIds = [...new Set(comments.map((comment) => comment.bikeId))]
    const bikes = await Bike.find({ id: { $in: bikeIds } })
      .select('id name')
      .lean()

    const bikeNames = Object.fromEntries(
      bikes.map((bike) => [bike.id, bike.name])
    )

    return {
      success: true,
      data: comments.map((comment) => ({
        _id: comment._id,
        bikeId: comment.bikeId,
        content: comment.content,
        user: comment.user,
        createdAt: comment.createdAt,
        bikeName: bikeNames[comment.bikeId] || 'Мотоцикл'
      }))
    }
  } catch (error) {
    console.error('Error fetching recent comments:', error)
    return {
      success: false,
      error: 'Failed to fetch recent comments'
    }
  }
})
