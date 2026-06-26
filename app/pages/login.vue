<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>👋 Добро пожаловать!</h1>
        <p>Войдите через Telegram, чтобы оставлять комментарии</p>
      </div>
      
      <div class="login-content">
        <TelegramLogin />
        
        <div class="login-info">
          <div class="info-item">
            <span class="icon">✅</span>
            <span>Безопасная авторизация</span>
          </div>
          <div class="info-item">
            <span class="icon">🔒</span>
            <span>Ваши данные защищены</span>
          </div>
          <div class="info-item">
            <span class="icon">💬</span>
            <span>Оставляйте комментарии</span>
          </div>
        </div>
      </div>

      <div class="auth-section test-auth">
        <h3>Тестовый вход (только для разработки)</h3>
        <button @click="testLogin" class="test-btn">
          🧪 Войти как тестовый пользователь
        </button>
      </div>
      
      <div class="login-footer">
        <NuxtLink to="/" class="back-link">
          ← Вернуться на главную
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

import { useAuth } from '~/composables/useAuth'

const { loginWithTelegram } = useAuth()
const router = useRouter()

const testLogin = async () => {
  const testUser = {
    id: 123456789,
    first_name: 'Тестовый',
    last_name: 'Пользователь',
    username: 'test_user',
    photo_url: '',
    auth_date: Math.floor(Date.now() / 1000).toString(),
    is_test: true
  }
  
  const result = await loginWithTelegram(testUser)
  if (result.success) {
    router.push('/')
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  max-width: 480px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #333;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.login-content {
  margin-bottom: 24px;
}

.login-info {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: #555;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid #e9ecef;
}

.info-item .icon {
  font-size: 20px;
  width: 30px;
  text-align: center;
}

.login-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.back-link {
  color: #6c757d;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #4a90d9;
}

@media (max-width: 480px) {
  .login-container {
    padding: 24px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
</style>