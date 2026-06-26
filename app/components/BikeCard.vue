<template>
  <div class="bike-card">
    <NuxtLink :to="`/bike/${bike.id}`">
      <div class="bike-image">
        <img :src="bike.image" :alt="bike.name" loading="lazy" />
      </div>
      <div class="bike-info">
        <h3>{{ bike.name }}</h3>
        <div class="bike-meta">
          <span class="comments-count">💬 {{ bike.commentsCount || 0 }}</span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup>
defineProps({
  bike: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.bike-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.bike-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bike-card a {
  text-decoration: none;
  color: inherit;
  display: block;
}

.bike-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f0f0f0;
}

.bike-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bike-info {
  padding: 16px;
}

.bike-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.bike-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

.comments-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.date {
  font-size: 12px;
}

@media (max-width: 768px) {
  .bike-image {
    height: 160px;
  }
}
</style>