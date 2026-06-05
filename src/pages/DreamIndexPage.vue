<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHead, SITE_URL } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import { getAllDreams, DREAM_CATEGORIES } from '../data/dreams/index.js'

useHead({
  title: '꿈해몽 사전 - 연애 관점으로 풀어보는 꿈 해석 | Lovtaro',
  description: '전 애인 꿈, 좋아하는 사람 꿈, 키스하는 꿈까지. 연애 관점으로 풀어보는 꿈해몽 사전. 전통 해몽 위에 마음의 신호를 더해 읽는 Lovtaro 꿈해몽.',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '꿈해몽 사전',
    description: '연애 관점으로 풀어보는 꿈 해석 모음',
    url: `${SITE_URL}/dream/`,
    inLanguage: 'ko',
  },
})

const activeCategory = ref('all')
const allDreams = getAllDreams()
const tabs = [{ key: 'all', label: '전체' }, ...DREAM_CATEGORIES]
const filtered = computed(() =>
  activeCategory.value === 'all' ? allDreams : allDreams.filter(d => d.category === activeCategory.value)
)

const router = useRouter()
</script>

<template>
  <AppShell>
    <PageContainer>
      <div class="dream-index">
        <div class="dream-index__header">
          <h1 class="dream-index__title">꿈해몽 사전</h1>
          <p class="dream-index__desc">연애 관점으로 풀어보는 꿈 해석</p>
        </div>

        <p class="dream-index__intro">
          꿈은 일어날 일을 예고하기보다 지금 내 마음을 비추는 거울에 가까워요. 러브타로 꿈해몽 사전은 전통적인 해석 위에 연애와 관계의 신호를 더해, 전 애인 꿈부터 좋아하는 사람 꿈, 키스하는 꿈까지 마음의 결을 함께 읽어드려요. 단정이 아닌 가능성의 언어로 풀어요.
        </p>

        <div class="dream-index__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="dream-index__tab"
            :class="{ 'dream-index__tab--active': activeCategory === tab.key }"
            @click="activeCategory = tab.key"
          >{{ tab.label }}</button>
        </div>

        <div v-if="filtered.length === 0" class="dream-index__empty">
          <p>곧 꿈해몽 글이 추가됩니다.</p>
        </div>

        <ul v-else class="dream-index__list">
          <li
            v-for="dream in filtered"
            :key="dream.slug"
            class="dream-index__item"
            @click="router.push(`/dream/${dream.slug}/`)"
          >
            <div class="dream-index__item-meta">
              <span class="dream-index__item-category">
                {{ DREAM_CATEGORIES.find(c => c.key === dream.category)?.label }}
              </span>
              <time class="dream-index__item-date">{{ dream.createdAt }}</time>
            </div>
            <h2 class="dream-index__item-title">{{ dream.title }}</h2>
            <p class="dream-index__item-desc">{{ dream.description }}</p>
          </li>
        </ul>
      </div>
    </PageContainer>
  </AppShell>
</template>

<style scoped>
.dream-index {
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-2xl);
  max-width: 480px;
  margin: 0 auto;
}

.dream-index__header {
  text-align: center;
  margin-bottom: var(--lt-space-xl);
}

.dream-index__title {
  font-family: var(--lt-font-sans);
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
  margin-bottom: var(--lt-space-xs);
}

.dream-index__desc {
  font-size: 0.75rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.03em;
  opacity: 0.7;
  margin: 0;
}

.dream-index__intro {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  letter-spacing: 0.01em;
  margin: 0 0 var(--lt-space-lg);
}

.dream-index__tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: var(--lt-space-lg);
}

.dream-index__tab {
  padding: 5px 12px;
  border-radius: var(--lt-radius-full);
  border: 1px solid var(--lt-border-soft);
  background: transparent;
  color: var(--lt-text-muted);
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: var(--lt-transition);
}

.dream-index__tab--active {
  border-color: rgba(77, 163, 255, 0.35);
  color: var(--lt-accent-2);
  background: var(--lt-primary-light);
}

.dream-index__tab:not(.dream-index__tab--active):hover {
  border-color: var(--lt-border);
  color: var(--lt-text-sub);
}

.dream-index__empty {
  text-align: center;
  padding: var(--lt-space-2xl) 0;
  color: var(--lt-text-muted);
  font-size: 0.78rem;
  opacity: 0.6;
}

.dream-index__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.dream-index__item {
  padding: var(--lt-space-md) 0;
  border-bottom: 1px solid var(--lt-border-soft);
  cursor: pointer;
  transition: opacity var(--lt-transition);
}

.dream-index__item:last-child {
  border-bottom: none;
}

.dream-index__item:hover {
  opacity: 0.75;
}

.dream-index__item-meta {
  display: flex;
  align-items: center;
  gap: var(--lt-space-sm);
  margin-bottom: 6px;
}

.dream-index__item-category {
  font-size: 0.68rem;
  color: var(--lt-accent-2);
  opacity: 0.8;
  letter-spacing: 0.03em;
}

.dream-index__item-date {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  opacity: 0.5;
}

.dream-index__item-title {
  font-family: var(--lt-font-sans);
  font-size: 0.92rem;
  font-weight: 400;
  color: var(--lt-text-strong);
  margin: 0 0 5px;
  line-height: 1.45;
  letter-spacing: 0.01em;
}

.dream-index__item-desc {
  font-size: 0.75rem;
  color: var(--lt-text-muted);
  margin: 0;
  line-height: 1.65;
  letter-spacing: 0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
