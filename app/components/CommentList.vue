<template>
  <div class="comment-list">
    <h3>Комментарии ({{ comments.length }})</h3>
    
    <div v-if="loading" class="loading">
      Загрузка комментариев...
    </div>
    
    <div v-else-if="comments.length === 0" class="empty">
      Пока нет комментариев. Будьте первым!
    </div>
    
    <div v-else class="comments">
      <div v-for="comment in comments" :key="comment._id" class="comment">
        <div class="comment-header">
          <strong>{{ comment.user?.firstName || 'Пользователь' }}</strong>
          <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
        </div>
        <p>{{ comment.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  bikeId: {
    type: Number,
    required: true
  }
})

const comments = ref([])
const loading = ref(true)

const fetchComments = async () => {
  try {
    const { data } = await $fetch(`/api/comments/${props.bikeId}`)
    console.log('data', data)
    if (data.length > 0) {
      comments.value = data
    }
  } catch (error) {
    console.error('Failed to fetch comments:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchComments()
})

defineExpose({
  fetchComments
})
</script>

<style scoped>
.comment-list {
  margin-top: 32px;
}

.comment-list h3 {
  margin-bottom: 20px;
  color: #333;
}

.comments {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #4a90d9;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.comment-header strong {
  color: #333;
}

.comment-date {
  color: #999;
  font-size: 12px;
}

.comment p {
  margin: 0;
  color: #555;
  line-height: 1.5;
}

.loading, .empty {
  text-align: center;
  padding: 32px 0;
  color: #999;
}
</style>