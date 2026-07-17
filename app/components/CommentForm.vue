<template>
  <div v-if="isAuthenticated" class="comment-form">
    <v-card class="comment-form__card" variant="outlined" rounded="lg">
      <v-card-text>
        <v-textarea
          v-model="content"
          placeholder="Напишите комментарий..."
          rows="3"
          maxlength="1000"
          required
          variant="outlined"
          density="comfortable"
          hide-details
          counter="1000"
          class="comment-form__textarea"
        />
      </v-card-text>
      
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn
          type="submit"
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="loading || !content.trim()"
          prepend-icon="mdi-send"
          @click="submitComment"
        >
          {{ loading ? 'Отправка...' : 'Отправить комментарий' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
  
  <v-card v-else class="comment-form__prompt" variant="tonal" rounded="lg">
    <v-card-text class="pa-4 text-center">
      <v-icon icon="mdi-lock" size="32" color="grey-lighten-1" />
      <p class="text-body-1 text-grey mt-2">Авторизуйтесь через Telegram, чтобы оставить комментарий</p>
      <v-btn
        to="/login"
        color="primary"
        variant="elevated"
        prepend-icon="mdi-login"
        class="mt-2"
        rounded="xl"
      >
        Войти
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  bikeId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['comment-added'])

const { isAuthenticated } = useAuth()
const content = ref('')
const loading = ref(false)

const submitComment = async () => {
  if (!content.value.trim()) return
  
  loading.value = true
  
  try {
    const result = await $fetch('/api/comments', {
      method: 'POST',
      body: {
        bikeId: props.bikeId.toString(),
        content: content.value.trim()
      },
      credentials: 'include'
    })
    
    if (result.success) {
      content.value = ''
      emit('comment-added')
    } else {
      alert('Не удалось отправить комментарий: ' + (result.error || 'Неизвестная ошибка'))
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
  margin-top: 16px;
}

.comment-form__card {
  border: 1px solid var(--color-border) !important;
}

.comment-form__textarea :deep(.v-field) {
  border-radius: 8px !important;
}

.comment-form__textarea :deep(.v-field__input) {
  font-size: 14px;
}

.comment-form__prompt {
  margin-top: 16px;
  border: 1px solid var(--color-border) !important;
  background: var(--color-bg-elevated) !important;
}

.comment-form__prompt .v-card-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>