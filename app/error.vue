<template>
  <v-app>
    <v-main>
      <v-container class="error-page" fluid>
        <v-row justify="center" align="center" class="error-page__row">
          <v-col cols="12" sm="8" md="6" lg="5">
            <v-card class="error-page__card" elevation="12" rounded="lg">
              <v-card-text class="pa-6 text-center">
                <div class="error-page__code">
                  {{ statusCode }}
                </div>

                <v-icon
                  :icon="isNotFound ? 'mdi-motorbike-off' : 'mdi-alert-circle-outline'"
                  size="72"
                  color="grey-lighten-1"
                  class="error-page__icon"
                />

                <h1 class="text-h4 font-weight-bold mt-2">
                  {{ title }}
                </h1>

                <p class="text-body-1 text-medium-emphasis mt-2">
                  {{ description }}
                </p>

                <v-btn
                  color="primary"
                  variant="elevated"
                  prepend-icon="mdi-arrow-left"
                  size="large"
                  class="mt-6"
                  @click="goHome"
                >
                  Вернуться на главную
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
})

const statusCode = computed(() => props.error?.statusCode || 500)

const isNotFound = computed(() => statusCode.value === 404)

const title = computed(() => {
  if (isNotFound.value) return 'Страница не найдена'
  if (statusCode.value === 403) return 'Доступ запрещён'
  return 'Что-то пошло не так'
})

const description = computed(() => {
  if (isNotFound.value) {
    return 'Похоже, вы свернули не туда. Такой страницы не существует или она была удалена.'
  }
  if (statusCode.value === 403) {
    return 'У вас нет прав для просмотра этой страницы.'
  }
  return 'Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.'
})

const goHome = () => clearError({ redirect: '/' })
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-elevated) 100%);
}

.error-page__row {
  min-height: 100vh;
}

.error-page__card {
  border: 1px solid var(--color-border);
}

.error-page__code {
  font-size: 6rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 8px;
}

.error-page__icon {
  opacity: 0.9;
}

@media (max-width: 480px) {
  .error-page {
    padding: 16px;
  }

  .error-page__code {
    font-size: 4.5rem;
  }
}
</style>
