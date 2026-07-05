<template>
  <div class="telegram-login">
    <div v-if="isWidgetSupported" id="telegram-login-container" class="telegram-login__widget"></div>
    
    <div v-if="isLoading" class="d-flex flex-column align-center ga-2 pa-4">
      <v-progress-circular indeterminate color="primary" size="32" />
      <span class="text-caption text-grey">Загрузка виджета...</span>
    </div>
    
    <v-card v-if="error" class="telegram-login__error" variant="tonal" color="error">
      <v-card-text class="d-flex flex-column align-center ga-2 pa-4">
        <v-icon icon="mdi-alert-circle" color="error" size="28" />
        <span class="text-body-2 text-error">{{ error }}</span>
        <v-btn size="small" color="primary" variant="text" @click="retryInit">
          Попробовать снова
        </v-btn>
      </v-card-text>
    </v-card>
    
    <div v-if="!isWidgetSupported && !isLoading && !error" class="telegram-login__mobile">
      <div class="d-flex flex-column align-center ga-3 pa-4">
        <v-icon icon="mdi-cellphone" size="40" color="grey-lighten-1" />
        <p class="text-body-2 text-grey text-center">Для входа нажмите кнопку ниже</p>
        <v-btn
          :href="telegramAuthUrl"
          target="_blank"
          rel="noopener noreferrer"
          color="primary"
          variant="elevated"
          prepend-icon="mdi-telegram"
          size="large"
          class="telegram-login__mobile-btn"
        >
          Войти через Telegram
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { onMounted, ref, computed, onUnmounted } from 'vue'

const { loginWithTelegram } = useAuth()
const router = useRouter()
const config = useRuntimeConfig()

const isWidgetSupported = ref(true)
const isLoading = ref(true)
const error = ref<string | null>(null)

const telegramAuthUrl = computed(() => {
  const botUsername = config.public.telegramBotUsername
  const redirectUrl = encodeURIComponent(window.location.origin + '/api/auth/telegram')
  return `https://t.me/${botUsername}?startauth=${redirectUrl}`
})

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
    script.setAttribute('data-telegram-login', config.public.telegramBotUsername)
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

.telegram-login__error {
  width: 100%;
  max-width: 320px;
  border: 1px solid #ef4444 !important;
}

.telegram-login__mobile {
  width: 100%;
  max-width: 320px;
}

.telegram-login__mobile-btn {
  width: 100%;
  text-transform: none !important;
}

@media (max-width: 480px) {
  .telegram-login__widget {
    transform: scale(0.95);
  }
}
</style>