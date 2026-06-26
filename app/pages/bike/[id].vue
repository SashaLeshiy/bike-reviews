<template>
  <div class="bike-detail">
    <div class="back-link">
      <NuxtLink to="/">← Назад к списку</NuxtLink>
    </div>
    
    <div v-if="loading" class="loading">
      Загрузка мотоцикла...
    </div>
    
    <div v-else-if="bike" class="bike-content">
      <div class="bike-image">
        <img :src="bike.image" :alt="bike.name" />
      </div>
      
      <div class="bike-info">
        <h1>{{ bike.name }}</h1>
        
        <div class="bike-details">
          <p><strong>Комментариев:</strong> {{ bike.commentsCount || 0 }}</p>
        </div>
        
        <CommentForm 
          :bike-id="bike.id" 
          @comment-added="refreshComments" 
        />
        
        <CommentList ref="commentListRef" :bike-id="bike.id" />
      </div>
    </div>
    
    <div v-else class="not-found">
      <h2>Мотоцикл не найден</h2>
      <NuxtLink to="/">Вернуться на главную</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const bike = ref(null)
const loading = ref(true)
const commentListRef = ref(null)

const fetchBike = async () => {
  try {
    const { data } = await $fetch(`/api/bikes/${route.params.id}`)
    console.log('data', data)
    if (data.id) {
      bike.value = data
    }
  } catch (error) {
    console.error('Failed to fetch bike:', error)
  } finally {
    loading.value = false
  }
}

const refreshComments = () => {
  if (commentListRef.value) {
    commentListRef.value.fetchComments()
  }
}

onMounted(() => {
  fetchBike()
})
</script>

<style scoped>
.bike-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.back-link {
  margin-bottom: 24px;
}

.back-link a {
  color: #4a90d9;
  text-decoration: none;
}

.back-link a:hover {
  text-decoration: underline;
}

.loading, .not-found {
  text-align: center;
  padding: 60px 0;
}

.not-found h2 {
  color: #333;
  margin-bottom: 16px;
}

.not-found a {
  color: #4a90d9;
  text-decoration: none;
}

.bike-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.bike-image {
  border-radius: 12px;
  overflow: hidden;
  background: #f0f0f0;
}

.bike-image img {
  width: 100%;
  height: auto;
  display: block;
}

.bike-info h1 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 28px;
  color: #333;
}

.bike-details {
  margin-bottom: 24px;
}

.bike-details p {
  margin: 8px 0;
  color: #555;
}

.bike-links {
  margin-top: 16px;
}

.bike-links a {
  display: inline-block;
  padding: 10px 20px;
  background: #4a90d9;
  color: white;
  text-decoration: none;
  border-radius: 8px;
}

.bike-links a:hover {
  background: #357abd;
}

@media (max-width: 768px) {
  .bike-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .bike-info h1 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .bike-detail {
    padding: 12px;
  }
}
</style>