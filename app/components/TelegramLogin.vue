<template>
  <div class="telegram-login">
    <!-- Виджет (если поддерживается) -->
    <div v-if="isWidgetSupported" id="telegram-login-container" class="telegram-login__widget"></div>
    
    <!-- Кнопка входа через бота -->
    <div v-else class="telegram-login__bot">
      <v-btn
        color="primary"
        size="large"
        variant="elevated"
        prepend-icon="mdi-telegram"
        class="telegram-login__bot-btn"
        block
        :loading="botLoading"
        @click="openTelegramBot"
      >
        {{ botLoading ? 'Открываем Telegram...' : 'Войти через Telegram' }}
      </v-btn>
      
      <p class="text-caption text-grey mt-2 text-center">
        Нажмите "Войти" в боте для авторизации
      </p>
      
      <p v-if="authStatus === 'waiting'" class="text-caption text-primary mt-2 text-center">
        ⏳ Ожидаем подтверждения в Telegram...
      </p>
      
      <p v-if="authStatus === 'success'" class="text-caption text-success mt-2 text-center">
        ✅ Успешная авторизация! Перенаправление...
      </p>
    </div>
    
    <!-- Состояние загрузки виджета -->
    <div v-if="isLoading" class="d-flex flex-column align-center ga-2 pa-4">
      <v-progress-circular indeterminate color="primary" size="32" />
      <span class="text-caption text-grey">Загрузка виджета...</span>
    </div>
    
    <!-- Ошибка -->
    <v-card v-if="error" class="telegram-login__error" variant="tonal" color="error">
      <v-card-text class="d-flex flex-column align-center ga-2 pa-4">
        <v-icon icon="mdi-alert-circle" color="error" size="28" />
        <span class="text-body-2 text-error">{{ error }}</span>
        <v-btn size="small" color="primary" variant="text" @click="retryInit">
          Попробовать снова
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { onMounted, ref, onUnmounted } from 'vue'

const { loginWithTelegram } = useAuth()
const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

const isWidgetSupported = ref(true)
const isLoading = ref(true)
const error = ref<string | null>(null)
const botLoading = ref(false)
const authStatus = ref<'idle' | 'waiting' | 'success' | 'error'>('idle')
const authInterval = ref<NodeJS.Timeout | null>(null)

const botUsername = config.public.telegramBotUsername

// Генерация уникального кода
const generateCode = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
}

// Открываем бота
const openTelegramBot = () => {
  botLoading.value = true
  error.value = null
  authStatus.value = 'waiting'
  
  try {
    const code = generateCode()
    
    // Просто ссылка на бота — браузер сам решит, как открыть
    const botLink = `https://t.me/${botUsername}?start=${code}`
    
    // Открываем в новой вкладке
    window.open(botLink, '_blank')
    
    // Запускаем проверку авторизации
    startAuthListener(code)
    
  } catch (err) {
    console.error('Failed to open Telegram:', err)
    error.value = 'Не удалось открыть Telegram. Попробуйте установить приложение.'
    authStatus.value = 'error'
    botLoading.value = false
  }
}

// Слушаем авторизацию через сервер
const startAuthListener = (code: string) => {
  let attempts = 0
  const maxAttempts = 60 // 60 * 2 = 120 секунд
  
  if (authInterval.value) {
    clearInterval(authInterval.value)
  }
  
  authInterval.value = setInterval(async () => {
    attempts++
    
    try {
      const result = await $fetch('/api/auth/telegram/check', {
        method: 'POST',
        body: { code },
        credentials: 'include'
      })
      
      if (result.success) {
        clearInterval(authInterval.value!)
        authInterval.value = null
        authStatus.value = 'success'
        botLoading.value = false
        
        const { user } = useAuth()
        user.value = result.user
        
        if (process.client) {
          localStorage.setItem('user_data', JSON.stringify(result.user))
        }
        
        setTimeout(() => {
          router.push('/')
        }, 500)
        
        return
      }
    } catch (error) {
      // Ошибка проверки - игнорируем
    }
    
    if (attempts >= maxAttempts) {
      clearInterval(authInterval.value!)
      authInterval.value = null
      authStatus.value = 'error'
      botLoading.value = false
      error.value = 'Время ожидания истекло. Попробуйте снова.'
    }
  }, 2000)
}

// Проверка параметров в URL
const checkUrlParams = () => {
  const query = route.query
  
  if (query.auth === 'success') {
    authStatus.value = 'success'
    const { fetchCurrentUser } = useAuth()
    fetchCurrentUser().then(() => {
      router.push('/')
    })
    return true
  }
  
  return false
}

// Обработчик для виджета Telegram
const handleTelegramAuth = async (user: any) => {
  isLoading.value = true
  error.value = null
  
  try {
    const result = await loginWithTelegram(user)
    
    if (result.success) {
      router.push('/')
    } else {
      error.value = result.error || 'Не удалось войти в систему'
      isWidgetSupported.value = false
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Произошла ошибка при входе'
    isWidgetSupported.value = false
  } finally {
    isLoading.value = false
  }
}

// Инициализация виджета Telegram
const initTelegramWidget = () => {
  if (typeof window === 'undefined') {
    isLoading.value = false
    return
  }
  
  try {
    isLoading.value = true
    error.value = null
    
    const container = document.getElementById('telegram-login-container')
    if (!container) {
      console.warn('Telegram login container not found')
      isWidgetSupported.value = false
      isLoading.value = false
      return
    }

    if (container.hasChildNodes()) {
      isLoading.value = false
      return
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '12')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    
    ;(window as any).onTelegramAuth = handleTelegramAuth
    
    container.appendChild(script)
    
    isWidgetSupported.value = true
    isLoading.value = false
    
  } catch (err) {
    console.error('Failed to initialize Telegram widget:', err)
    error.value = 'Не удалось загрузить виджет Telegram'
    isWidgetSupported.value = false
    isLoading.value = false
  }
}

const retryInit = () => {
  const container = document.getElementById('telegram-login-container')
  if (container) {
    container.innerHTML = ''
  }
  isWidgetSupported.value = true
  error.value = null
  initTelegramWidget()
}

// Проверка поддержки виджета
const checkWidgetSupport = () => {
  setTimeout(() => {
    const container = document.getElementById('telegram-login-container')
    if (container && !container.hasChildNodes() && !error.value) {
      isWidgetSupported.value = false
      isLoading.value = false
    }
  }, 3000)
}

onMounted(() => {
  const hasAuthParam = checkUrlParams()
  
  if (!hasAuthParam) {
    setTimeout(initTelegramWidget, 100)
    checkWidgetSupport()
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    delete (window as any).onTelegramAuth
  }
  
  if (authInterval.value) {
    clearInterval(authInterval.value)
    authInterval.value = null
  }
})
</script>

<style scoped>
.telegram-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.telegram-login__widget {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60px;
  width: 100%;
}

.telegram-login__bot {
  width: 100%;
  max-width: 320px;
}

.telegram-login__bot-btn {
  text-transform: none !important;
  font-weight: 500;
  background: #0088cc !important;
}

.telegram-login__bot-btn:hover {
  background: #006699 !important;
}

.telegram-login__error {
  width: 100%;
  max-width: 320px;
  border: 1px solid #ef4444 !important;
}

@media (max-width: 480px) {
  .telegram-login__widget {
    transform: scale(0.95);
  }
}
</style>