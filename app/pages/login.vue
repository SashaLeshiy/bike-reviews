<template>
  <v-container class="login-page" fluid>
    <v-row justify="center" align="center" class="login-page__row">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="login-page__card" elevation="12" rounded="lg">
          <v-card-text class="pa-6">
            <div class="text-center mb-6">
              <h1 class="text-h4 font-weight-bold">Добро пожаловать</h1>
              <p class="text-body-1 text-medium-emphasis mt-1">Войдите через Telegram, чтобы оставлять комментарии</p>
            </div>
            
            <div class="d-flex justify-center pa-4">
              <TelegramLogin />
            </div>
            
            <v-divider class="my-4" />
            
            <v-list class="login-page__info" bg-color="surface-variant" rounded="lg">
              <v-list-item prepend-icon="mdi-shield-check" color="primary">
                <v-list-item-title>Безопасная авторизация</v-list-item-title>
              </v-list-item>
              <v-list-item prepend-icon="mdi-lock" color="primary">
                <v-list-item-title>Ваши данные защищены</v-list-item-title>
              </v-list-item>
              <v-list-item prepend-icon="mdi-message-text" color="primary">
                <v-list-item-title>Оставляйте комментарии</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
          
          <v-card-actions class="pa-4">
            <v-spacer />
            <NuxtLink to="/" class="text-decoration-none">
              <v-btn variant="text" color="grey" prepend-icon="mdi-arrow-left">
                Вернуться на главную
              </v-btn>
            </NuxtLink>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

import { useAuth } from '~/composables/useAuth'

const { loginWithTelegram } = useAuth()
const router = useRouter()
const loading = ref(false)

const isDev = process.env.NODE_ENV === 'development'

const testLogin = async () => {
  loading.value = true
  
  const testUser = {
    id: 123456789,
    first_name: 'Тестовый',
    last_name: 'Пользователь',
    username: 'test_user',
    photo_url: '',
    auth_date: Math.floor(Date.now() / 1000).toString(),
    is_test: true
  }
  
  try {
    const result = await loginWithTelegram(testUser)
    if (result.success) {
      router.push('/')
    } else {
      alert('Ошибка входа: ' + (result.error || 'Неизвестная ошибка'))
    }
  } catch (error) {
    console.error('Test login error:', error)
    alert('Произошла ошибка при входе')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-elevated) 100%);
}

.login-page__row {
  min-height: calc(100vh - 64px);
}

.login-page__card {
  border: 1px solid var(--color-border);
}

.login-page__info {
  border: 1px solid var(--color-border);
}

.login-page__info .v-list-item {
  border-bottom: 1px solid var(--color-border);
}

.login-page__info .v-list-item:last-child {
  border-bottom: none;
}

@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }
}
</style>