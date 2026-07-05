<template>
  <div class="comment-list">
    <div class="d-flex align-center ga-2 mb-4">
      <h3 class="text-h6 font-weight-bold">Комментарии</h3>
      <v-chip variant="outlined" size="small">
        {{ comments.length }}
      </v-chip>
    </div>
    
    <div v-if="loading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" size="32" />
    </div>
    
    <div v-else-if="comments.length === 0" class="comment-list__empty">
      <v-icon icon="mdi-message-text-outline" size="48" color="grey-lighten-1" />
      <p class="text-body-1 text-grey mt-2">Пока нет комментариев</p>
      <p class="text-caption text-grey-lighten-1">Будьте первым, кто оставит комментарий!</p>
    </div>
    
    <v-list v-else class="comment-list__items" bg-color="transparent" lines="two">
      <v-list-item
        v-for="comment in comments"
        :key="comment._id"
        class="comment-list__item"
      >
        <template v-slot:prepend>
          <v-avatar size="36" color="primary" variant="tonal">
            <span class="text-primary font-weight-bold">
              {{ getInitials(comment.user?.firstName || 'Пользователь') }}
            </span>
          </v-avatar>
        </template>
        
        <v-list-item-title class="comment-list__title">
          <span class="font-weight-medium">
            {{ comment.user?.firstName || 'Пользователь' }}
          </span>
          <span v-if="comment.user?.username" class="text-caption text-grey ml-1">
            @{{ comment.user.username }}
          </span>
          <span class="text-caption text-grey-lighten-1 ml-2">
            {{ formatDate(comment.createdAt) }}
          </span>
        </v-list-item-title>
        
        <v-list-item-subtitle class="comment-list__text text-body-2 text-medium-emphasis">
          {{ comment.content }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
const props = defineProps({
  bikeId: {
    type: [Number, String],
    required: true
  }
})

const comments = ref([])
const loading = ref(true)

const fetchComments = async () => {
  loading.value = true
  try {
    const result = await $fetch(`/api/comments/${props.bikeId}`)
    if (result.success) {
      comments.value = result.data || []
    }
  } catch (error) {
    console.error('Failed to fetch comments:', error)
  } finally {
    loading.value = false
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

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name[0].toUpperCase()
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
  margin-top: 16px;
}

.comment-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--color-bg-elevated);
  border-radius: 12px;
  border: 1px dashed var(--color-border-dashed);
}

.comment-list__items {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.comment-list__item {
  border-bottom: 1px solid var(--color-border);
  padding: 12px 16px !important;
}

.comment-list__item:last-child {
  border-bottom: none;
}

.comment-list__item:hover {
  background: var(--color-surface-hover);
}

.comment-list__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.comment-list__text {
  margin-top: 4px;
  line-height: 1.5;
  word-break: break-word;
  padding-right: 8px;
}

@media (max-width: 480px) {
  .comment-list__item {
    padding: 10px 12px !important;
  }
}
</style>