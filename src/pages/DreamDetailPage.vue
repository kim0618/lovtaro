<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead, SITE_URL, canonicalUrl } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import { getDream, DREAM_CATEGORIES } from '../data/dreams/index.js'

const route = useRoute()
const router = useRouter()

const dream = computed(() => getDream(route.params.slug))
const categoryLabel = computed(() =>
  DREAM_CATEGORIES.find(c => c.key === dream.value?.category)?.label ?? ''
)

useHead({
  title: () => dream.value ? `${dream.value.title} | Lovtaro` : '꿈해몽 사전 | Lovtaro',
  description: () => dream.value?.description ?? '',
  ogImage: () => dream.value?.ogImage ?? `${SITE_URL}/og-image.png`,
  jsonLd: () => {
    if (!dream.value) return null
    const base = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: dream.value.title,
      description: dream.value.description,
      url: canonicalUrl(`/dream/${dream.value.slug}`),
      datePublished: dream.value.createdAt,
      dateModified: dream.value.updatedAt,
      author: { '@type': 'Organization', name: 'Lovtaro', url: canonicalUrl('/') },
      publisher: { '@type': 'Organization', name: 'Lovtaro', url: canonicalUrl('/') },
      inLanguage: 'ko',
    }
    if (dream.value.ogImage) base.image = dream.value.ogImage
    return base
  },
})
</script>

<template>
  <AppShell>
    <template v-if="dream">
      <PageContainer>
        <div class="dream-detail">
          <!-- breadcrumb -->
          <nav class="dream-detail__breadcrumb" aria-label="breadcrumb">
            <span class="dream-detail__bc-item" @click="router.push('/')">홈</span>
            <span class="dream-detail__bc-sep">›</span>
            <span class="dream-detail__bc-item" @click="router.push('/dream/')">꿈해몽 사전</span>
            <span class="dream-detail__bc-sep">›</span>
            <span class="dream-detail__bc-current">{{ dream.title }}</span>
          </nav>

          <!-- header -->
          <header class="dream-detail__header">
            <div class="dream-detail__meta">
              <span class="dream-detail__category">{{ categoryLabel }}</span>
              <time class="dream-detail__date">{{ dream.updatedAt || dream.createdAt }}</time>
            </div>
            <h1 class="dream-detail__title">{{ dream.title }}</h1>
            <p class="dream-detail__desc">{{ dream.description }}</p>
          </header>

          <!-- summary (한 줄 핵심) -->
          <div v-if="dream.summary" class="dream-detail__summary">
            <p class="dream-detail__summary-text">{{ dream.summary }}</p>
          </div>

          <!-- divider -->
          <div class="dream-detail__divider"></div>

          <!-- sections -->
          <div class="dream-detail__body">
            <section
              v-for="(section, i) in dream.sections"
              :key="i"
              class="dream-detail__section"
            >
              <h2 v-if="section.heading" class="dream-detail__section-heading">{{ section.heading }}</h2>
              <div class="dream-detail__section-content" v-html="section.content"></div>
            </section>
          </div>

          <!-- FAQ -->
          <div v-if="dream.faq && dream.faq.length" class="dream-detail__faq">
            <h2 class="dream-detail__faq-title">자주 묻는 질문</h2>
            <dl class="dream-detail__faq-list">
              <div
                v-for="(item, i) in dream.faq"
                :key="i"
                class="dream-detail__faq-item"
              >
                <dt class="dream-detail__faq-q">{{ item.question }}</dt>
                <dd class="dream-detail__faq-a">{{ item.answer }}</dd>
              </div>
            </dl>
          </div>

          <!-- related readings CTA -->
          <div v-if="dream.relatedReadings && dream.relatedReadings.length" class="dream-detail__cta">
            <p class="dream-detail__cta-label">이 꿈, 타로로 마음을 비춰볼까요</p>
            <div class="dream-detail__cta-list">
              <a
                v-for="reading in dream.relatedReadings"
                :key="reading.path"
                class="dream-detail__cta-btn"
                @click.prevent="router.push(reading.path)"
                :href="reading.path"
              >{{ reading.label }}</a>
            </div>
          </div>

          <!-- related cards -->
          <div v-if="dream.relatedCards && dream.relatedCards.length" class="dream-detail__related">
            <p class="dream-detail__related-label">관련 카드</p>
            <div class="dream-detail__related-list">
              <a
                v-for="card in dream.relatedCards"
                :key="card.id"
                class="dream-detail__related-card"
                @click.prevent="router.push(`/cards/${card.id}/`)"
                :href="`/cards/${card.id}/`"
              >{{ card.name }}</a>
            </div>
          </div>

          <!-- related dreams -->
          <div v-if="dream.relatedDreams && dream.relatedDreams.length" class="dream-detail__related">
            <p class="dream-detail__related-label">관련 꿈</p>
            <div class="dream-detail__related-list">
              <a
                v-for="d in dream.relatedDreams"
                :key="d.slug"
                class="dream-detail__related-card"
                @click.prevent="router.push(`/dream/${d.slug}/`)"
                :href="`/dream/${d.slug}/`"
              >{{ d.label }}</a>
            </div>
          </div>

          <!-- back -->
          <button class="dream-detail__back" @click="router.push('/dream/')">← 꿈해몽 목록</button>
        </div>
      </PageContainer>
    </template>

    <!-- 404 -->
    <template v-else>
      <PageContainer>
        <div class="dream-detail dream-detail--404">
          <p class="dream-detail__404-msg">찾을 수 없는 꿈해몽입니다.</p>
          <button class="dream-detail__back" @click="router.push('/dream/')">← 꿈해몽 목록</button>
        </div>
      </PageContainer>
    </template>
  </AppShell>
</template>

<style scoped>
.dream-detail {
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-2xl);
  max-width: 480px;
  margin: 0 auto;
}

/* breadcrumb */
.dream-detail__breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  opacity: 0.6;
  margin-bottom: var(--lt-space-lg);
  flex-wrap: wrap;
}

.dream-detail__bc-item {
  cursor: pointer;
  transition: opacity var(--lt-transition);
}

.dream-detail__bc-item:hover {
  opacity: 0.4;
}

.dream-detail__bc-sep {
  opacity: 0.4;
}

/* header */
.dream-detail__header {
  margin-bottom: var(--lt-space-lg);
}

.dream-detail__meta {
  display: flex;
  align-items: center;
  gap: var(--lt-space-sm);
  margin-bottom: var(--lt-space-sm);
}

.dream-detail__category {
  font-size: 0.68rem;
  color: var(--lt-accent-2);
  opacity: 0.8;
  letter-spacing: 0.03em;
}

.dream-detail__date {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  opacity: 0.5;
}

.dream-detail__title {
  font-family: var(--lt-font-sans);
  font-size: 1.25rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.02em;
  line-height: 1.45;
  margin: 0 0 var(--lt-space-sm);
}

.dream-detail__desc {
  font-size: 0.8rem;
  color: var(--lt-text-sub);
  line-height: 1.75;
  letter-spacing: 0.02em;
  margin: 0;
}

/* summary (한 줄 핵심) */
.dream-detail__summary {
  margin-top: var(--lt-space-md);
  padding: var(--lt-space-md);
  border-radius: var(--lt-radius-md);
  border: 1px solid rgba(77, 163, 255, 0.18);
  background: var(--lt-primary-light);
}

.dream-detail__summary-text {
  font-size: 0.82rem;
  color: var(--lt-text-sub);
  line-height: 1.7;
  letter-spacing: 0.01em;
  margin: 0;
}

/* divider */
.dream-detail__divider {
  height: 1px;
  background: var(--lt-border-soft);
  margin: var(--lt-space-lg) 0;
}

/* body sections */
.dream-detail__body {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-lg);
  margin-bottom: var(--lt-space-xl);
}

.dream-detail__section-heading {
  font-family: var(--lt-font-sans);
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--lt-text);
  letter-spacing: 0.03em;
  margin: 0 0 var(--lt-space-sm);
  padding-bottom: var(--lt-space-xs);
  border-bottom: 1px solid var(--lt-border-soft);
}

.dream-detail__section-content {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.85;
  letter-spacing: 0.02em;
}

.dream-detail__section-content :deep(p) {
  margin: 0 0 var(--lt-space-sm);
}

.dream-detail__section-content :deep(p:last-child) {
  margin: 0;
}

.dream-detail__section-content :deep(ul),
.dream-detail__section-content :deep(ol) {
  list-style: none;
  padding: 0;
  margin: var(--lt-space-sm) 0;
}

.dream-detail__section-content :deep(li) {
  padding-left: var(--lt-space-md);
  position: relative;
  margin-bottom: 4px;
}

.dream-detail__section-content :deep(li)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--lt-accent-2);
  opacity: 0.4;
}

.dream-detail__section-content :deep(strong) {
  color: var(--lt-text);
  font-weight: 400;
}

/* FAQ */
.dream-detail__faq {
  margin-bottom: var(--lt-space-xl);
}

.dream-detail__faq-title {
  font-family: var(--lt-font-sans);
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--lt-text);
  letter-spacing: 0.03em;
  margin: 0 0 var(--lt-space-sm);
  padding-bottom: var(--lt-space-xs);
  border-bottom: 1px solid var(--lt-border-soft);
}

.dream-detail__faq-list {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-md);
  margin: var(--lt-space-md) 0 0;
}

.dream-detail__faq-item {
  padding-left: var(--lt-space-md);
  border-left: 1px solid rgba(77, 163, 255, 0.2);
}

.dream-detail__faq-q {
  font-size: 0.82rem;
  font-weight: 400;
  color: var(--lt-text);
  margin: 0 0 5px;
  letter-spacing: 0.02em;
  line-height: 1.5;
}

.dream-detail__faq-a {
  font-size: 0.76rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  margin: 0;
  letter-spacing: 0.01em;
}

/* CTA */
.dream-detail__cta {
  margin-bottom: var(--lt-space-lg);
}

.dream-detail__cta-label,
.dream-detail__related-label {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.04em;
  opacity: 0.6;
  margin: 0 0 var(--lt-space-sm);
}

.dream-detail__cta-list,
.dream-detail__related-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dream-detail__cta-btn {
  padding: 6px 14px;
  border-radius: var(--lt-radius-full);
  border: 1px solid rgba(77, 163, 255, 0.3);
  color: var(--lt-accent-2);
  background: var(--lt-primary-light);
  font-size: 0.78rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  text-decoration: none;
  transition: var(--lt-transition);
}

.dream-detail__cta-btn:hover {
  border-color: var(--lt-accent-2);
  background: rgba(77, 163, 255, 0.15);
}

/* related cards */
.dream-detail__related {
  margin-bottom: var(--lt-space-xl);
}

.dream-detail__related-card {
  padding: 4px 11px;
  border-radius: var(--lt-radius-full);
  border: 1px solid var(--lt-border-soft);
  color: var(--lt-text-muted);
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  text-decoration: none;
  transition: var(--lt-transition);
}

.dream-detail__related-card:hover {
  border-color: rgba(77, 163, 255, 0.3);
  color: var(--lt-accent-2);
}

/* back */
.dream-detail__back {
  background: transparent;
  border: none;
  color: var(--lt-text-muted);
  font-size: 0.75rem;
  letter-spacing: 0.03em;
  cursor: pointer;
  padding: 0;
  opacity: 0.55;
  transition: opacity var(--lt-transition);
}

.dream-detail__back:hover {
  opacity: 0.9;
}

/* 404 */
.dream-detail--404 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-lg);
  padding-top: var(--lt-space-2xl);
}

.dream-detail__404-msg {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  opacity: 0.6;
  margin: 0;
}
</style>
