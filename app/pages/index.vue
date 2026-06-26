<template>
  <div class="home-page">
    <header class="header">
      <div class="header-left">
        <h1>🏍️ Мотоциклы</h1>
        <span class="bike-count">({{ bikes.length }} шт.)</span>
      </div>
      
      <div class="header-right">
        <div v-if="isAuthenticated && user" class="user-info">
          <img 
            v-if="user.photoUrl" 
            :src="user.photoUrl" 
            :alt="user.firstName"
            class="user-avatar"
          />
          <div class="user-details">
            <span class="user-name">{{ user.firstName }}</span>
            <span class="user-username" v-if="user.username">@{{ user.username }}</span>
          </div>
          <button @click="handleLogout" class="logout-btn" title="Выйти">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17 7l5 5-5 5M3 12h15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <NuxtLink v-else to="/login" class="login-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
            <path d="M8 16l4-4-4-4M14 8l4 4-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Войти
        </NuxtLink>
      </div>
    </header>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка мотоциклов...</p>
    </div>
    
    <div v-else-if="bikes.length === 0" class="empty">
      <p>😕 Мотоциклы не найдены</p>
    </div>
    
    <div v-else class="bikes-grid">
      <BikeCard 
        v-for="bike in bikes" 
        :key="bike.id" 
        :bike="bike" 
      />
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'

const { isAuthenticated, user, logout } = useAuth()
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.header-left h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.bike-count {
  color: #999;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px 6px 6px;
  background: #f8f9fa;
  border-radius: 50px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.user-username {
  font-size: 12px;
  color: #999;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #fee;
  border-color: #dc3545;
  color: #dc3545;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #0088cc;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 500;
  transition: background 0.2s;
}

.login-btn:hover {
  background: #006699;
}

.bikes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.loading, .empty {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0088cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-left {
    justify-content: center;
  }
  
  .header-right {
    justify-content: center;
  }
}
</style>