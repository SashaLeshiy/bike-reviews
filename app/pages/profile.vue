<template>
  <v-container class="profile-page">
    <v-btn
      variant="text"
      color="grey"
      prepend-icon="mdi-arrow-left"
      to="/"
      class="mb-4"
    >
      Назад к списку
    </v-btn>
    
    <v-row v-if="loading" justify="center" align="center" class="profile-page__loading">
      <v-col cols="auto" class="text-center">
        <v-progress-circular indeterminate color="primary" size="48" width="4" />
        <p class="text-body-1 text-grey mt-4">Загрузка профиля...</p>
      </v-col>
    </v-row>
    
    <template v-else-if="user">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="profile-page__card" elevation="2" rounded="lg">
            <!-- Шапка профиля -->
            <v-card-item class="profile-page__header">
              <template v-slot:prepend>
                <v-avatar size="80" color="primary" variant="tonal">
                  <v-img
                    v-if="user.photoUrl"
                    :src="user.photoUrl"
                    :alt="user.firstName"
                  />
                  <span v-else class="text-h3 font-weight-bold text-primary">
                    {{ getInitials(user.firstName) }}
                  </span>
                </v-avatar>
              </template>
              
              <v-card-title class="text-h5 font-weight-bold text-grey-darken-3">
                {{ user.firstName }} {{ user.lastName }}
              </v-card-title>
              
              <v-card-subtitle v-if="user.username" class="text-caption text-grey">
                @{{ user.username }}
              </v-card-subtitle>
            </v-card-item>
            
            <v-divider />
            
            <!-- Информация о пользователе -->
            <v-card-text class="pa-4">
              <v-list class="profile-page__info" bg-color="transparent">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-account" color="grey-darken-1" />
                  </template>
                  <v-list-item-title>
                    <span class="text-grey-darken-1">Имя пользователя:</span>
                    <span class="font-weight-medium ml-2">{{ user.firstName }}</span>
                  </v-list-item-title>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-account-details" color="grey-darken-1" />
                  </template>
                  <v-list-item-title>
                    <span class="text-grey-darken-1">Фамилия:</span>
                    <span class="font-weight-medium ml-2">{{ user.lastName || 'Не указана' }}</span>
                  </v-list-item-title>
                </v-list-item>
                
                <v-list-item v-if="user.username">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-at" color="grey-darken-1" />
                  </template>
                  <v-list-item-title>
                    <span class="text-grey-darken-1">Telegram:</span>
                    <span class="font-weight-medium ml-2">@{{ user.username }}</span>
                  </v-list-item-title>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-identifier" color="grey-darken-1" />
                  </template>
                  <v-list-item-title>
                    <span class="text-grey-darken-1">ID пользователя:</span>
                    <span class="font-weight-medium ml-2">{{ user.id }}</span>
                  </v-list-item-title>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-calendar" color="grey-darken-1" />
                  </template>
                  <v-list-item-title>
                    <span class="text-grey-darken-1">Дата регистрации:</span>
                    <span class="font-weight-medium ml-2">{{ formatDate(user.createdAt) }}</span>
                  </v-list-item-title>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-clock" color="grey-darken-1" />
                  </template>
                  <v-list-item-title>
                    <span class="text-grey-darken-1">Последний вход:</span>
                    <span class="font-weight-medium ml-2">{{ formatDate(user.lastLogin) }}</span>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
            
            <v-divider />
            
            <!-- Действия -->
            <v-card-actions class="pa-4">
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-pencil"
                @click="editProfile"
              >
                Редактировать профиль
              </v-btn>
              <v-spacer />
              <v-btn
                color="error"
                variant="tonal"
                prepend-icon="mdi-logout"
                @click="handleLogout"
              >
                Выйти
              </v-btn>
            </v-card-actions>
          </v-card>
          
          <!-- Статистика пользователя -->
          <v-card class="profile-page__stats mt-4" variant="outlined" rounded="lg">
            <v-card-text>
              <v-row>
                <v-col cols="4" class="text-center">
                  <div class="text-h4 font-weight-bold text-primary">
                    {{ userStats.comments }}
                  </div>
                  <div class="text-caption text-grey">Комментариев</div>
                </v-col>
                
                <v-col cols="4" class="text-center">
                  <div class="text-h4 font-weight-bold text-primary">
                    {{ userStats.bikes }}
                  </div>
                  <div class="text-caption text-grey">Просмотрено мотоциклов</div>
                </v-col>
                
                <v-col cols="4" class="text-center">
                  <div class="text-h4 font-weight-bold text-primary">
                    {{ userStats.days }}
                  </div>
                  <div class="text-caption text-grey">Дней с регистрации</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
    
    <v-row v-else class="profile-page__not-found" justify="center" align="center">
      <v-col cols="auto" class="text-center">
        <v-icon icon="mdi-account-off" size="64" color="grey-lighten-2" />
        <h2 class="text-h5 text-grey-darken-3 mt-4">Пользователь не найден</h2>
        <p class="text-body-1 text-grey mt-1">Возможно, вы не авторизованы</p>
        <v-btn
          to="/login"
          color="primary"
          variant="elevated"
          prepend-icon="mdi-login"
          class="mt-3"
        >
          Войти
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'
import { navigateTo } from '#app'

const { user, logout } = useAuth()
const loading = ref(true)
const userStats = ref({
  comments: 0,
  bikes: 0,
  days: 0
})

const fetchUserStats = async () => {
  try {
    // Получаем количество комментариев пользователя
    const result = await $fetch('/api/user/stats', {
      credentials: 'include'
    })
    if (result.success) {
      userStats.value = result.data
    }
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    // Если API еще нет, используем заглушку
    if (user.value) {
      const createdAt = new Date(user.value.createdAt || Date.now())
      const now = new Date()
      const days = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      userStats.value = {
        comments: 0,
        bikes: 0,
        days: days || 1
      }
    }
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  if (confirm('Вы уверены, что хотите выйти?')) {
    await logout()
    navigateTo('/')
  }
}

const editProfile = () => {
  // Показываем сообщение, что функция в разработке
  alert('Функция редактирования профиля будет доступна в ближайшее время')
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getInitials = (name) => {
  if (!name) return '?'
  return name[0].toUpperCase()
}

onMounted(() => {
  fetchUserStats()
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  padding: 24px;
}

.profile-page__loading {
  min-height: 400px;
}

.profile-page__card {
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.profile-page__header {
  padding: 24px 24px 16px !important;
}

.profile-page__info .v-list-item {
  border-bottom: 1px solid #e2e8f0;
}

.profile-page__info .v-list-item:last-child {
  border-bottom: none;
}

.profile-page__stats {
  border: 1px solid #e2e8f0 !important;
}

.profile-page__not-found {
  min-height: 400px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 12px;
  }
  
  .profile-page__header {
    padding: 16px !important;
  }
}
</style>