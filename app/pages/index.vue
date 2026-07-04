<template>
  <v-container class="home-page">
    <v-row>
      <v-col cols="12">
        <v-card class="home-page__header" flat>
          <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div class="d-flex align-center ga-2">
              <span class="text-h4 font-weight-bold">BIKES REVIEWS</span>
              <v-chip size="small" variant="outlined">
                {{ bikes.length }} шт.
                {{ user }} - имя
              </v-chip>
            </div>
            
            <div>
              <template v-if="isAuthenticated && user">
                <v-menu location="bottom end" transition="scale-transition">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="text" class="home-page__user-btn">
                      <v-avatar size="32" class="mr-2">
                        <!-- <v-img v-if="user.photoUrl" :src="user.photoUrl" :alt="user.firstName" /> -->
                        <v-icon icon="mdi-account" />
                      </v-avatar>
                      <span class="text-body-2 font-weight-medium">{{ user.firstName }}</span>
                      <v-icon icon="mdi-chevron-down" size="18" />
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item prepend-icon="mdi-account" title="Профиль" to="/profile" />
                    <v-divider />
                    <v-list-item prepend-icon="mdi-logout" title="Выйти" @click="handleLogout" />
                  </v-list>
                </v-menu>
              </template>
              
              <v-btn v-else to="/login" color="primary" prepend-icon="mdi-login" variant="elevated">
                Войти
              </v-btn>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row v-if="loading" class="home-page__loading" justify="center" align="center">
      <v-col cols="auto" class="text-center">
        <v-progress-circular indeterminate color="primary" size="48" width="4" />
        <p class="text-body-1 text-grey mt-4">Загрузка мотоциклов...</p>
      </v-col>
    </v-row>
    
    <v-row v-else-if="bikes.length === 0" class="home-page__empty" justify="center" align="center">
      <v-col cols="auto" class="text-center">
        <v-icon icon="mdi-motorbike-off" size="64" color="grey" />
        <p class="text-h6 text-medium-emphasis mt-4">Мотоциклы не найдены</p>
      </v-col>
    </v-row>
    
    <v-row v-else>
      <v-col
        v-for="bike in bikes"
        :key="bike.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <BikeCard :bike="bike" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'

const { isAuthenticated, user, logout } = useAuth()
console.log('user', user.value)
console.log('isAuthenticated', isAuthenticated.value)
const bikes = ref([])
const loading = ref(true)

const fetchBikes = async () => {
  loading.value = true
  try {
    const result = await $fetch('/api/bikes/bikes')
    if (result.success) {
      bikes.value = result.data || []
    }
  } catch (error) {
    console.error('Failed to fetch bikes:', error)
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  if (confirm('Вы уверены, что хотите выйти?')) {
    await logout()
  }
}

onMounted(() => {
  fetchBikes()
})
</script>

<style scoped>
.home-page {
  padding: 24px;
  max-width: 1366px;
}

.home-page__header {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
}

.home-page__user-btn {
  text-transform: none !important;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 50px !important;
  border: 1px solid var(--color-border) !important;
}

.home-page__user-btn:hover {
  background: var(--color-surface-hover) !important;
}

.home-page__loading,
.home-page__empty {
  min-height: 400px;
  padding: 40px 0;
}

@media (max-width: 768px) {
  .home-page {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: 12px;
  }
}
</style>