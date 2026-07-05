import { getRedisClient } from '~~/server/utils/redis'

const AUTH_KEY_PREFIX = 'telegram:auth:'
const AUTH_TTL_SECONDS = 120

export const getAuthRedisKey = (code: string) => `${AUTH_KEY_PREFIX}${code}`

export const addAuthCode = async (code: string, telegramId: string, userData: {
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}) => {
  const redis = await getRedisClient()
  const key = getAuthRedisKey(code)

  const data = {
    telegramId,
    firstName: userData.first_name || '',
    lastName: userData.last_name || '',
    username: userData.username || '',
    photoUrl: userData.photo_url || ''
  }

  await redis.setEx(key, AUTH_TTL_SECONDS, JSON.stringify(data))
  console.log(`✅ Auth code saved to Redis: ${code}`)
}

export const getAuthCodeData = async (code: string) => {
  const redis = await getRedisClient()
  const key = getAuthRedisKey(code)
  const authDataRaw = await redis.get(key)

  if (!authDataRaw) {
    return null
  }

  return {
    key,
    data: JSON.parse(authDataRaw) as {
      telegramId: string
      firstName: string
      lastName: string
      username: string
      photoUrl: string
    }
  }
}

export const deleteAuthCode = async (code: string) => {
  const redis = await getRedisClient()
  await redis.del(getAuthRedisKey(code))
}
