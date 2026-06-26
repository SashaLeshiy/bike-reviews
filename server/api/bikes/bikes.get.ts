import Bike from '~~/server/models/Bike'

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    try {
      console.log('📡 API /api/bikes called (GET)')
      
      const bikes = await Bike.find()
        .sort({ id: 1 })
        .lean()
      
      console.log(`📊 Found ${bikes.length} bikes`)
      
      return {
        success: true,
        data: bikes
      }
    } catch (error) {
      console.error('❌ Error fetching bikes:', error)
      return {
        success: false,
        error: 'Failed to fetch bikes'
      }
    }
  }
  
  // Если метод не поддерживается
  return {
    success: false,
    error: 'Method not allowed'
  }
})