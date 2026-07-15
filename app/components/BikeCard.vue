<template>
  <v-card class="bike-card" @click="goTo(`/bike/${bike.id}`)">
    <div class="bike-card__image-wrapper">
      <v-img
        :src="proxyImageUrl"
        :alt="bike.name"
        class="bike-card__image"
        cover
        position="center"
      >
        <template v-slot:placeholder>
          <v-skeleton-loader type="image" />
        </template>
        
        <!-- Добавьте обработку ошибок -->
        <template v-slot:error>
          <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
            <v-icon icon="mdi-image-off" size="48" color="grey" />
          </div>
        </template>
      </v-img>
    </div>
    
    <v-card-text class="bike-card__content">
      <h3 class="bike-card__title text-body-1 font-weight-bold">
        {{ bike.name }}
      </h3>
      
      <div class="bike-card__footer d-flex align-center justify-space-between mt-2">
        <span class="d-flex align-center ga-1 text-medium-emphasis text-caption">
          <v-icon icon="mdi-message-text" size="16" />
          {{ bike.commentsCount || 0 }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  bike: {
    type: Object,
    required: true
  }
})

const proxyImageUrl = computed(() => {
  if (!props.bike.image) return ''
  // Проверяем, нужно ли проксировать (если это внешний URL)
  if (props.bike.image.startsWith('http')) {
    return `/api/images/proxy-image?url=${encodeURIComponent(props.bike.image)}`
  }
  return props.bike.image
})

const goTo = (path) => {
  navigateTo(path)
}
</script>

<style scoped>
.bike-card {
  border: 1px solid var(--color-border);
  border-radius: 16px !important;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-surface) !important;
}

.bike-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  border-color: var(--color-border-dashed);
}

.bike-card__image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 75%;
  overflow: hidden;
  background: var(--color-image-placeholder);
  flex-shrink: 0;
}

.bike-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.bike-card__image :deep(.v-img__img) {
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
  border-top: 1px solid var(--color-border);
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