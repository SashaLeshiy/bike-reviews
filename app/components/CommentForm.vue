<template>
  <div v-if="isAuthenticated" class="comment-form">
    <form @submit.prevent="submitComment">
      <div class="form-group">
        <textarea
          v-model="content"
          placeholder="Напишите комментарий..."
          rows="3"
          maxlength="1000"
          required
        />
        <div class="character-count">{{ content.length }}/1000</div>
      </div>
      
      <button type="submit" :disabled="loading || !content.trim()">
        {{ loading ? 'Отправка...' : 'Отправить комментарий' }}
      </button>
    </form>
  </div>
  
  <div v-else class="login-prompt">
    <p>Авторизуйтесь через Telegram, чтобы оставить комментарий</p>
    <NuxtLink to="/login" class="login-link">Войти</NuxtLink>
  </div>
</template>

<script setup>
const props = defineProps({
  bikeId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['comment-added'])

const { isAuthenticated, getAuthHeader } = useAuth()
const content = ref('')
const loading = ref(false)

const submitComment = async () => {
  if (!content.value.trim()) return
  
  loading.value = true
  
  try {
    const authHeader = getAuthHeader()
    
    const result = await $fetch('/api/comments', {
      method: 'POST',
      body: {
        bikeId: props.bikeId,
        content: content.value.trim()
      },
      headers: {
        'Authorization': authHeader
      }
    })
    
    if (result.success) {
      content.value = ''
      emit('comment-added')
    } else {
      alert('Не удалось отправить комментарий')
    }
  } catch (error) {
    console.error('Failed to post comment:', error)
    alert('Произошла ошибка при отправке комментария')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.comment-form {
  margin-top: 24px;
}

.form-group {
  position: relative;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #4a90d9;
}

.character-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

button {
  margin-top: 12px;
  padding: 12px 24px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #357abd;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-prompt {
  margin-top: 24px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.login-prompt p {
  margin: 0 0 12px 0;
  color: #666;
}

.login-link {
  display: inline-block;
  padding: 10px 24px;
  background: #4a90d9;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
}

.login-link:hover {
  background: #357abd;
}
</style>