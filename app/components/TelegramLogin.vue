<template>
  <div class="telegram-login-wrapper">
    <div id="telegram-login-container"></div>
    
    <div v-if="!isWidgetSupported" class="mobile-login">
      <p>Для входа нажмите кнопку ниже</p>
      <a 
        :href="telegramAuthUrl" 
        target="_blank" 
        rel="noopener noreferrer"
        class="telegram-btn"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="white" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.1-.2-.11-.06-.27-.04-.39-.02-.16.03-2.64 1.68-2.64 1.68l-2.91-1.96c-.33-.22-.7-.47-.01-.95.78-.53 3.15-1.99 3.15-1.99l.01-.01c.57-.38 1.31-.53 2.02-.43.85.12 1.54.59 1.92 1.41.38.82.42 1.77.19 2.67z"/>
        </svg>
        Войти через Telegram
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { onMounted, ref, computed } from 'vue'

const { loginWithTelegram } = useAuth()
const router = useRouter()
const config = useRuntimeConfig()
const isWidgetSupported = ref(true)

// URL для прямой авторизации (мобильные устройства)
const telegramAuthUrl = computed(() => {
  const botUsername = config.public.telegramBotUsername
  const redirectUrl = encodeURIComponent(window.location.origin + '/api/auth/telegram')
  return `https://t.me/${botUsername}?startauth=${redirectUrl}`
})

// Обработчик успешной авторизации
const handleTelegramAuth = async (user: any) => {
  try {
    console.log('📱 Telegram login widget response:', user)
    
    const result = await loginWithTelegram(user)
    
    if (result.success) {
      router.push('/')
    } else {
      alert('Не удалось войти: ' + (result.error || 'Неизвестная ошибка'))
    }
  } catch (error) {
    console.error('Login error:', error)
    alert('Произошла ошибка при входе')
  }
}

// Инициализация виджета Telegram
const initTelegramWidget = () => {
  try {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return
    
    // Проверяем наличие Telegram виджета
    const container = document.getElementById('telegram-login-container')
    if (!container) {
      console.warn('Telegram login container not found')
      return
    }

    // Проверяем, не загружен ли уже виджет
    if (container.hasChildNodes()) {
      console.log('Telegram widget already loaded')
      return
    }

    // Создаем скрипт для виджета
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', config.public.telegramBotUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    
    // Добавляем обработчик глобально
    ;(window as any).onTelegramAuth = handleTelegramAuth
    
    // Добавляем скрипт в контейнер
    container.appendChild(script)
    
    console.log('✅ Telegram widget initialized')
  } catch (error) {
    console.error('Failed to initialize Telegram widget:', error)
    isWidgetSupported.value = false
  }
}

onMounted(() => {
  setTimeout(initTelegramWidget, 100)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    delete (window as any).onTelegramAuth
  }
})
</script>

<style scoped>
.telegram-login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

#telegram-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-login {
  text-align: center;
  padding: 20px;
}

.mobile-login p {
  margin-bottom: 16px;
  color: #666;
}

.telegram-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: #0088cc;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.3s;
}

.telegram-btn:hover {
  background: #006699;
}

.telegram-btn svg {
  flex-shrink: 0;
}

@media (max-width: 480px) {
  #telegram-login-container {
    transform: scale(0.9);
  }
}
</style>