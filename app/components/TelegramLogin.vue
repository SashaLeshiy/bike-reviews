<template>
  <div class="telegram-login">
    <div class="telegram-login__bot">
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        class="telegram-login__bot-link"
        @click="openTelegramBot"
      >
        <v-btn
          color="primary"
          size="large"
          variant="elevated"
          prepend-icon="mdi-telegram"
          class="telegram-login__bot-btn"
          block
          :loading="botLoading"
          tag="span"
        >
          {{ botLoading ? 'Открываем Telegram...' : 'Войти через Telegram' }}
        </v-btn>
      </a>

      <p class="text-caption text-grey mt-2 text-center">
        Нажмите «Start» в боте для авторизации
      </p>

      <p v-if="authStatus === 'waiting'" class="text-caption text-primary mt-2 text-center">
        Ожидаем подтверждения в Telegram...
      </p>

      <p v-if="authStatus === 'success'" class="text-caption text-success mt-2 text-center">
        Успешная авторизация! Перенаправление...
      </p>
    </div>

    <v-card v-if="error" class="telegram-login__error" variant="tonal" color="error">
      <v-card-text class="d-flex flex-column align-center ga-2 pa-4">
        <v-icon icon="mdi-alert-circle" color="error" size="28" />
        <span class="text-body-2 text-error">{{ error }}</span>
        <v-btn size="small" color="primary" variant="text" @click="resetAuth">
          Попробовать снова
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'

const router = useRouter()
const config = useRuntimeConfig()

const error = ref<string | null>(null)
const botLoading = ref(false)
const authStatus = ref<'idle' | 'waiting' | 'success' | 'error'>('idle')
const authInterval = ref<ReturnType<typeof setInterval> | null>(null)
const pendingCode = ref<string | null>(null)
let attempts = 0

const botUsername = config.public.telegramBotUsername
const maxAttempts = 60

const generateCode = (): string => {
  return crypto.randomUUID?.() ??
    Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
}

const stopAuthListener = () => {
  if (authInterval.value) {
    clearInterval(authInterval.value)
    authInterval.value = null
  }
}

const handleAuthSuccess = (user: {
  id: string
  username: string
  firstName: string
  lastName: string
  photoUrl: string
}) => {
  stopAuthListener()
  pendingCode.value = null
  authStatus.value = 'success'
  botLoading.value = false

  const authUser = useState<typeof user | null>('user', () => null)
  authUser.value = user

  if (process.client) {
    localStorage.setItem('user_data', JSON.stringify(user))
  }

  setTimeout(() => {
    router.push('/')
  }, 500)
}

const checkAuth = async (code: string) => {
  try {
    const result = await $fetch('/api/auth/telegram/check', {
      method: 'POST',
      body: { code },
      credentials: 'include'
    })

    if (result.success && 'user' in result && result.user) {
      handleAuthSuccess(result.user)
      return { success: true as const, user: result.user }
    }
  } catch {
    // Ожидаем, пока пользователь подтвердит вход в боте
  }

  return { success: false as const }
}

const pollAuth = async () => {
  if (!pendingCode.value || authStatus.value !== 'waiting') return

  attempts++

  await checkAuth(pendingCode.value)

  if (attempts >= maxAttempts && authStatus.value === 'waiting') {
    stopAuthListener()
    pendingCode.value = null
    authStatus.value = 'error'
    botLoading.value = false
    error.value = 'Время ожидания истекло. Попробуйте снова.'
  }
}

const startAuthListener = (code: string) => {
  pendingCode.value = code
  attempts = 0
  stopAuthListener()
  authInterval.value = setInterval(pollAuth, 2000)
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible' && pendingCode.value && authStatus.value === 'waiting') {
    pollAuth()
  }
}

const openTelegramBot = (event: MouseEvent) => {
  if (authStatus.value === 'waiting') {
    event.preventDefault()
    return
  }

  const code = generateCode()
  const botLink = `https://t.me/${botUsername}?start=${code}`
  const anchor = event.currentTarget as HTMLAnchorElement

  anchor.href = botLink
  botLoading.value = true
  error.value = null
  authStatus.value = 'waiting'
  startAuthListener(code)
}

const resetAuth = () => {
  stopAuthListener()
  pendingCode.value = null
  attempts = 0
  error.value = null
  botLoading.value = false
  authStatus.value = 'idle'
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  stopAuthListener()
})
</script>

<style scoped>
.telegram-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.telegram-login__bot {
  width: 100%;
  max-width: 320px;
}

.telegram-login__bot-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.telegram-login__bot-btn {
  text-transform: none !important;
  font-weight: 500;
  background: #0088cc !important;
  pointer-events: none;
}

.telegram-login__bot-link:hover .telegram-login__bot-btn {
  background: #006699 !important;
}

.telegram-login__error {
  width: 100%;
  max-width: 320px;
  margin-top: 16px;
  border: 1px solid #ef4444 !important;
}
</style>
