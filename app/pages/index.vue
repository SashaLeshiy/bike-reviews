<template>
  <v-container class="home-page">
    <v-card class="home-page__header" flat>
      <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-4">
        <div class="d-flex align-center ga-2">
          <span class="text-h4 font-weight-bold">MOTO REVIEWS</span>
          <v-chip size="small" variant="outlined">
            {{ searchQuery ? `${filteredBikes.length} из ${bikes.length}` : `${bikes.length}` }} шт.
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

    <v-row v-if="!loading && bikes.length > 0">
      <v-col cols="12">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          placeholder="Поиск по названию..."
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          class="home-page__search"
        />
      </v-col>
    </v-row>

    <v-row v-if="!loading && bikes.length > 0">
      <v-col cols="12">
        <RecentCommentsCarousel />
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

    <v-row v-else-if="filteredBikes.length === 0" class="home-page__empty" justify="center" align="center">
      <v-col cols="auto" class="text-center">
        <v-icon icon="mdi-magnify-close" size="64" color="grey" />
        <p class="text-h6 text-medium-emphasis mt-4">Ничего не найдено по запросу «{{ searchQuery }}»</p>
      </v-col>
    </v-row>
    
    <v-row v-else>
      <v-col
        v-for="bike in filteredBikes"
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
const bikes = ref([])
const loading = ref(true)
const searchQuery = ref('')

const filteredBikes = computed(() => {
  const query = (searchQuery.value ?? '').trim().toLowerCase()
  if (!query) return bikes.value
  return bikes.value.filter((bike) =>
    bike.name?.toLowerCase().includes(query)
  )
})

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
  position: sticky;
  top: 12px;
  z-index: 20;
  margin-bottom: 12px;
  padding: 2px 8px;
  border: 1px solid rgba(255, 255, 255, 0.09) !important;
  border-radius: 20px !important;
  /* Полупрозрачная подложка под стекло (тёмная тема) */
  background: rgba(24, 27, 35, 0.55) !important;
  /* Сам эффект «жидкого стекла»: размытие + повышение насыщенности фона */
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
  transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

/* Мягкий блик сверху — усиливает ощущение стекла */
.home-page__header::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0) 60%
  );
  pointer-events: none;
}

/* Fallback: если браузер не умеет backdrop-filter — делаем фон плотнее */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .home-page__header {
    background: rgba(24, 27, 35, 0.92) !important;
  }
}

.home-page__search {
  max-width: 480px;
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