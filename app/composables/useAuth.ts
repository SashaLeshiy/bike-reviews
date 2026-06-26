export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const token = useState<string | null>('token', () => null)
  
  const isAuthenticated = computed(() => !!user.value)

  // Функция входа через Telegram
  const loginWithTelegram = async (telegramData: any) => {
    try {
      console.log('🔐 Attempting login with Telegram...')
      
      const result = await $fetch('/api/auth/telegram', {
        method: 'POST',
        body: telegramData
      })
      
      console.log('📦 Auth response:', result)
      
      if (result.success) {
        user.value = result.user
        token.value = result.token
        
        if (process.client) {
          localStorage.setItem('auth_token', result.token)
          localStorage.setItem('user_data', JSON.stringify(result.user))
        }
        
        console.log(`✅ Logged in as: ${result.user.firstName}`)
        return { success: true }
      } else {
        console.error('❌ Auth failed:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      return { success: false, error: error.message }
    }
  }

  // Функция выхода
  const logout = () => {
    user.value = null
    token.value = null
    
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
    
    console.log('👋 Logged out')
  }

  // Получение заголовка для авторизации
  const getAuthHeader = () => {
    const currentToken = token.value || (process.client ? localStorage.getItem('auth_token') : null)
    return currentToken ? `Bearer ${currentToken}` : null
  }

  // Восстановление сессии при загрузке
  const restoreSession = () => {
    if (process.client) {
      try {
        const savedToken = localStorage.getItem('auth_token')
        const savedUser = localStorage.getItem('user_data')
        
        if (savedToken && savedUser) {
          token.value = savedToken
          user.value = JSON.parse(savedUser)
          console.log(`🔄 Session restored for: ${user.value?.firstName}`)
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
      }
    }
  }

  // Автоматически восстанавливаем сессию
  if (process.client) {
    restoreSession()
  }

  // Возвращаем все функции и состояния
  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    loginWithTelegram,
    logout,
    getAuthHeader,
    restoreSession
  }
}

// Типы
interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  photoUrl: string
}