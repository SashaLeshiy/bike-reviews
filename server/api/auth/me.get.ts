import jwt from 'jsonwebtoken'
import User from '~~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    const cookies = parseCookies(event)
    const token = cookies.auth_token

    if (!token) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

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

    const user = await User.findOne({ telegramId: decoded.userId })
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

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
    console.error('❌ Error getting user:', error)
    return {
      success: false,
      error: 'Failed to get user'
    }
  }
})