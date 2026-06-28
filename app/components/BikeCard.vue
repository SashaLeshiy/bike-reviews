<template>
  <v-card class="bike-card" @click="goTo(`/bike/${bike.id}`)">
    <div class="bike-card__image-wrapper">
      <v-img
        :src="bike.image"
        :alt="bike.name"
        class="bike-card__image"
        cover
        position="center"
      >
        <template v-slot:placeholder>
          <v-skeleton-loader type="image" />
        </template>
      </v-img>
    </div>
    
    <v-card-text class="bike-card__content">
      <h3 class="bike-card__title text-body-1 font-weight-bold text-grey-darken-3">
        {{ bike.name }}
      </h3>
      
      <div class="bike-card__footer d-flex align-center justify-space-between mt-2">
        <span class="d-flex align-center ga-1 text-grey-darken-1 text-caption">
          <v-icon icon="mdi-message-text" size="16" />
          {{ bike.commentsCount || 0 }}
        </span>
        <span class="text-grey-lighten-1 text-caption">
          {{ formatDate(bike.createdAt) }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  bike: {
    type: Object,
    required: true
  }
})

const goTo = (path) => {
  navigateTo(path)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
.bike-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px !important;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.bike-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.bike-card__image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* 4:3 Aspect Ratio */
  overflow: hidden;
  background: #f1f5f9;
  flex-shrink: 0;
}

.bike-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.bike-card__image :deep(.v-img__img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.bike-card:hover .bike-card__image :deep(.v-img__img) {
  transform: scale(1.05);
}

.bike-card__content {
  padding: 14px 16px !important;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bike-card__title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.bike-card__footer {
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .bike-card__content {
    padding: 12px 14px !important;
  }
}

@media (max-width: 480px) {
  .bike-card__content {
    padding: 10px 12px !important;
  }
}
</style>