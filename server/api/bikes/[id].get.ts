import Bike from '~~/server/models/Bike'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  console.log(`📡 API /api/bikes/bikes/${id} called`)
  
  try {
    const bike = await Bike.findOne({ id: parseInt(id) })
    
    if (!bike) {
      return {
        success: false,
        error: 'Bike not found'
      }
    }
    
    return {
      success: true,
      data: bike
    }
  } catch (error) {
    console.error('❌ Error fetching bike:', error)
    return {
      success: false,
      error: 'Failed to fetch bike'
    }
  }
})