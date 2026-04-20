<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import { getAllGuides, GUIDE_CATEGORIES } from '../data/guides/index.js'

useHead({
  title: '연애 타로 가이드 - 카드 해석부터 상황별 리딩까지 | Lovtaro',
  description: '연애 타로 카드 해석 가이드. 메이저 아르카나 연애 의미, 상황별 타로 읽는 법, 재회·썸·이별 타로 조합까지. Lovtaro 연애 타로 가이드.',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '연애 타로 가이드',
    description: '연애 타로 카드 해석 가이드 모음',
    url: 'https://lovtaro.kr/guide/',
    inLanguage: 'ko',
  },
})

const activeCategory = ref('all')
const allGuides = getAllGuides()
const tabs = [{ key: 'all', label: '전체' }, ...GUIDE_CATEGORIES]
const filtered = computed(() =>
  activeCategory.value === 'all' ? allGuides : allGuides.filter(g => g.category === activeCategory.value)
)

const router = useRouter()
</script>

<template>
  <AppShell>
    <PageContainer>
      <div class="guide-index">
        <div class="guide-index__header">
          <h1 class="guide-index__title">연애 타로 가이드</h1>
          <p class="guide-index__desc">카드 해석부터 상황별 리딩까지</p>
        </div>

        <div class="guide-index__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="guide-index__tab"
            :class="{ 'guide-index__tab--active': activeCategory === tab.key }"
            @click="activeCategory = tab.key"
          >{{ tab.label }}</button>
        </div>

        <div v-if="filtered.length === 0" class="guide-index__empty">
          <p>곧 가이드 글이 추가됩니다.</p>
        </div>

        <ul v-else class="guide-index__list">
          <li
            v-for="guide in filtered"
            :key="guide.slug"
            class="guide-index__item"
            @click="router.push(`/guide/${guide.slug}`)"
          >
            <div class="guide-index__item-meta">
              <span class="guide-index__item-category">
                {{ GUIDE_CATEGORIES.find(c => c.key === guide.category)?.label }}
              </span>
              <time class="guide-index__item-date">{{ guide.createdAt }}</time>
            </div>
            <h2 class="guide-index__item-title">{{ guide.title }}</h2>
            <p class="guide-index__item-desc">{{ guide.description }}</p>
          </li>
        </ul>
      </div>
    </PageContainer>
  </AppShell>
</template>

<style scoped>
.guide-index {
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-2xl);
  max-width: 480px;
  margin: 0 auto;
}

.guide-index__header {
  text-align: center;
  margin-bottom: var(--lt-space-xl);
}

.guide-index__title {
  font-family: var(--lt-font-sans);
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
  margin-bottom: var(--lt-space-xs);
}

.guide-index__desc {
  font-size: 0.75rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.03em;
  opacity: 0.7;
  margin: 0;
}

.guide-index__tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: var(--lt-space-lg);
}

.guide-index__tab {
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

.guide-index__tab--active {
  border-color: rgba(77, 163, 255, 0.35);
  color: var(--lt-accent-2);
  background: var(--lt-primary-light);
}

.guide-index__tab:not(.guide-index__tab--active):hover {
  border-color: var(--lt-border);
  color: var(--lt-text-sub);
}

.guide-index__empty {
  text-align: center;
  padding: var(--lt-space-2xl) 0;
  color: var(--lt-text-muted);
  font-size: 0.78rem;
  opacity: 0.6;
}

.guide-index__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.guide-index__item {
  padding: var(--lt-space-md) 0;
  border-bottom: 1px solid var(--lt-border-soft);
  cursor: pointer;
  transition: opacity var(--lt-transition);
}

.guide-index__item:last-child {
  border-bottom: none;
}

.guide-index__item:hover {
  opacity: 0.75;
}

.guide-index__item-meta {
  display: flex;
  align-items: center;
  gap: var(--lt-space-sm);
  margin-bottom: 6px;
}

.guide-index__item-category {
  font-size: 0.68rem;
  color: var(--lt-accent-2);
  opacity: 0.8;
  letter-spacing: 0.03em;
}

.guide-index__item-date {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  opacity: 0.5;
}

.guide-index__item-title {
  font-family: var(--lt-font-sans);
  font-size: 0.92rem;
  font-weight: 400;
  color: var(--lt-text-strong);
  margin: 0 0 5px;
  line-height: 1.45;
  letter-spacing: 0.01em;
}

.guide-index__item-desc {
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
