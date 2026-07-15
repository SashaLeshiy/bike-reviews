<template>
  <section v-if="comments.length > 0" class="recent-comments">
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="d-flex align-center ga-2">
        <h2 class="text-h6 font-weight-bold">Последние отзывы</h2>
        <v-chip variant="outlined" size="small">
          {{ comments.length }}
        </v-chip>
      </div>

      <div v-if="showNav" class="recent-comments__nav d-none d-sm-flex ga-1">
        <v-btn
          icon="mdi-chevron-left"
          variant="text"
          size="small"
          :disabled="!canScrollLeft"
          @click="scroll(-1)"
        />
        <v-btn
          icon="mdi-chevron-right"
          variant="text"
          size="small"
          :disabled="!canScrollRight"
          @click="scroll(1)"
        />
      </div>
    </div>

    <div
      ref="trackRef"
      class="recent-comments__track"
      @scroll="updateScrollState"
    >
      <article
        v-for="comment in comments"
        :key="comment._id"
        class="recent-comments__card"
        tabindex="0"
        role="link"
        @click="goToComment(comment)"
        @keydown.enter="goToComment(comment)"
      >
        <h3 class="recent-comments__bike-name text-body-2 font-weight-bold">
          {{ comment.bikeName }}
        </h3>
        <p class="recent-comments__text text-body-2 text-medium-emphasis">
          {{ comment.content }}
        </p>
        <div class="recent-comments__meta text-caption text-grey">
          <span>{{ comment.user?.firstName || 'Пользователь' }}</span>
          <span class="recent-comments__dot">·</span>
          <span>{{ formatDate(comment.createdAt) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
const comments = ref([])
const trackRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const showNav = computed(() => comments.value.length > 1)

const fetchRecentComments = async () => {
  try {
    const result = await $fetch('/api/comments/recent', {
      query: { limit: 10 }
    })
    if (result.success) {
      comments.value = result.data || []
    }
  } catch (error) {
    console.error('Failed to fetch recent comments:', error)
  } finally {
    nextTick(updateScrollState)
  }
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const goToComment = (comment) => {
  navigateTo(`/bike/${comment.bikeId}#comment-${comment._id}`)
}

const updateScrollState = () => {
  const track = trackRef.value
  if (!track) return

  canScrollLeft.value = track.scrollLeft > 4
  canScrollRight.value = track.scrollLeft + track.clientWidth < track.scrollWidth - 4
}

const scroll = (direction) => {
  const track = trackRef.value
  if (!track) return

  const card = track.querySelector('.recent-comments__card')
  const gap = 12
  const step = (card?.offsetWidth || 280) + gap

  track.scrollBy({
    left: direction * step,
    behavior: 'smooth'
  })
}

onMounted(() => {
  fetchRecentComments()
  window.addEventListener('resize', updateScrollState)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollState)
})
</script>

<style scoped>
.recent-comments {
  margin-bottom: 8px;
}

.recent-comments__track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: 4px;
  padding: 4px 2px 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.recent-comments__track::-webkit-scrollbar {
  height: 6px;
}

.recent-comments__track::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.recent-comments__card {
  flex: 0 0 min(280px, 78vw);
  scroll-snap-align: start;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-elevated);
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.recent-comments__card:hover,
.recent-comments__card:focus-visible {
  border-color: var(--color-border-dashed);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  outline: none;
}

.recent-comments__bike-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
  margin-bottom: 6px;
}

.recent-comments__text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.45;
  min-height: calc(1.45em * 2);
  margin-bottom: 8px;
}

.recent-comments__meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.recent-comments__dot {
  opacity: 0.6;
}
</style>
