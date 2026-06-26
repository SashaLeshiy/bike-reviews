export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const loading = useState<boolean>('authLoading', () => true)

  const loginWithTelegram = async (telegramData: any) => {
    loading.value = true
    console.log('telegram data', telegramData)
    try {
      console.log('🔐 Attempting login with Telegram...')
      
      // Отправляем запрос - токен автоматически сохранится в cookie
      const result = await $fetch('/api/auth/telegram', {
        method: 'POST',
        body: telegramData
      })
      
      console.log('📦 Auth response:', result)
      
      if (result.success) {
        user.value = result.user
        if (process.client) {
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
    } finally {
      loading.value = false
    }
  }

  // Функция выхода
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      user.value = null
      
      if (process.client) {
        localStorage.removeItem('user_data')
      }
      
      console.log('👋 Logged out')
      
      navigateTo('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fetchCurrentUser = async () => {
    loading.value = true
    
    try {
      if (process.client) {
        const savedUser = localStorage.getItem('user_data')
        if (savedUser) {
          try {
            user.value = JSON.parse(savedUser)
          } catch (e) {
            console.log(e)
          }
        }
      }

      const result = await $fetch('/api/auth/me', {
        method: 'GET'
      })
      
      if (result.success) {
        user.value = result.user
        if (process.client) {
          localStorage.setItem('user_data', JSON.stringify(result.user))
        }
      } else {
        user.value = null
        if (process.client) {
          localStorage.removeItem('user_data')
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const restoreSession = async () => {
    if (process.client) {
      try {
        const savedUser = localStorage.getItem('user_data')
        if (savedUser) {
          user.value = JSON.parse(savedUser)
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
      }
    }
    
    await fetchCurrentUser()
  }

  if (process.client) {
    restoreSession()
  }

  return {
    user: readonly(user),
    isAuthenticated,
    loading: readonly(loading),
    loginWithTelegram,
    logout,
    fetchCurrentUser,
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