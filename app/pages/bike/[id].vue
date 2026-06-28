<template>
  <v-container class="bike-detail">
    <v-btn
      variant="text"
      color="grey"
      prepend-icon="mdi-arrow-left"
      to="/"
      class="mb-4"
    >
      Назад к списку
    </v-btn>
    
    <v-row v-if="loading" justify="center" align="center" class="bike-detail__loading">
      <v-col cols="auto" class="text-center">
        <v-progress-circular indeterminate color="primary" size="48" width="4" />
        <p class="text-body-1 text-grey mt-4">Загрузка мотоцикла...</p>
      </v-col>
    </v-row>
    
    <template v-else-if="bike">
      <!-- Блок с фото и информацией -->
      <v-row>
        <!-- Фото слева -->
        <v-col cols="12" md="6">
          <v-img
            :src="bike.image"
            :alt="bike.name"
            class="bike-detail__image"
            cover
            aspect-ratio="4/3"
            rounded="lg"
          >
            <template v-slot:placeholder>
              <v-skeleton-loader type="image" />
            </template>
          </v-img>
        </v-col>
        
        <!-- Информация справа -->
        <v-col cols="12" md="6" class="mt-4 mt-md-0">
          <div class="bike-detail__header">
            <h1 class="text-h3 font-weight-bold text-grey-darken-3">{{ bike.name }}</h1>
            <v-chip color="primary" variant="tonal" size="large" class="mt-2">
              <v-icon icon="mdi-message-text" size="18" class="mr-1" />
              {{ bike.commentsCount || 0 }} комментариев
            </v-chip>
          </div>
          
          <v-card class="bike-detail__details mt-4" variant="outlined" rounded="lg">
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-numeric" color="grey-darken-1" />
                </template>
                <v-list-item-title>
                  <span class="text-grey-darken-1">ID:</span>
                  <span class="font-weight-medium ml-2">{{ bike.id }}</span>
                </v-list-item-title>
              </v-list-item>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-calendar" color="grey-darken-1" />
                </template>
                <v-list-item-title>
                  <span class="text-grey-darken-1">Дата добавления:</span>
                  <span class="font-weight-medium ml-2">{{ formatDate(bike.createdAt) }}</span>
                </v-list-item-title>
              </v-list-item>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-link" color="grey-darken-1" />
                </template>
                <v-list-item-title>
                  <a
                    :href="bike.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary text-decoration-none font-weight-medium"
                  >
                    Перейти на сайт аренды
                    <v-icon icon="mdi-open-in-new" size="16" class="ml-1" />
                  </a>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Комментарии под основным блоком -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-divider class="mb-6" />
          <CommentForm :bike-id="bike.id" @comment-added="refreshComments" />
          <CommentList ref="commentListRef" :bike-id="bike.id" />
        </v-col>
      </v-row>
    </template>
    
    <v-row v-else class="bike-detail__not-found" justify="center" align="center">
      <v-col cols="auto" class="text-center">
        <v-icon icon="mdi-alert-circle" size="64" color="grey-lighten-2" />
        <h2 class="text-h5 text-grey-darken-3 mt-4">Мотоцикл не найден</h2>
        <p class="text-body-1 text-grey mt-1">Возможно, он был удален или перемещен</p>
        <v-btn
          to="/"
          color="primary"
          variant="elevated"
          prepend-icon="mdi-arrow-left"
          class="mt-3"
        >
          Вернуться на главную
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const route = useRoute()
const bike = ref(null)
const loading = ref(true)
const commentListRef = ref(null)

const fetchBike = async () => {
  loading.value = true
  try {
    const result = await $fetch(`/api/bikes/${route.params.id}`)
    if (result.success) {
      bike.value = result.data
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

onMounted(() => {
  fetchBike()
})
</script>

<style scoped>
.bike-detail {
  max-width: 1200px;
  padding: 24px;
}

.bike-detail__loading {
  min-height: 400px;
}

.bike-detail__image {
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.bike-detail__header {
  margin-bottom: 8px;
}

.bike-detail__details .v-list-item {
  border-bottom: 1px solid #e2e8f0;
}

.bike-detail__details .v-list-item:last-child {
  border-bottom: none;
}

.bike-detail__not-found {
  min-height: 400px;
}

@media (max-width: 768px) {
  .bike-detail {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .bike-detail {
    padding: 12px;
  }
}
</style>