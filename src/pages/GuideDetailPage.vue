<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead, SITE_URL, canonicalUrl } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import { getGuide, GUIDE_CATEGORIES } from '../data/guides/index.js'

const route = useRoute()
const router = useRouter()

const guide = computed(() => getGuide(route.params.slug))
const categoryLabel = computed(() =>
  GUIDE_CATEGORIES.find(c => c.key === guide.value?.category)?.label ?? ''
)

useHead({
  title: () => guide.value ? `${guide.value.title} | Lovtaro` : '가이드 | Lovtaro',
  description: () => guide.value?.description ?? '',
  ogImage: () => guide.value?.ogImage ?? `${SITE_URL}/og-image.png`,
  jsonLd: () => {
    if (!guide.value) return null
    const base = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.value.title,
      description: guide.value.description,
      url: canonicalUrl(`/guide/${guide.value.slug}`),
      datePublished: guide.value.createdAt,
      dateModified: guide.value.updatedAt,
      author: { '@type': 'Organization', name: 'Lovtaro', url: canonicalUrl('/') },
      publisher: { '@type': 'Organization', name: 'Lovtaro', url: canonicalUrl('/') },
      inLanguage: 'ko',
    }
    if (guide.value.ogImage) base.image = guide.value.ogImage
    return base
  },
})
</script>

<template>
  <AppShell>
    <template v-if="guide">
      <PageContainer>
        <div class="guide-detail">
          <!-- breadcrumb -->
          <nav class="guide-detail__breadcrumb" aria-label="breadcrumb">
            <span class="guide-detail__bc-item" @click="router.push('/')">홈</span>
            <span class="guide-detail__bc-sep">›</span>
            <span class="guide-detail__bc-item" @click="router.push('/guide/')">가이드</span>
            <span class="guide-detail__bc-sep">›</span>
            <span class="guide-detail__bc-current">{{ guide.title }}</span>
          </nav>

          <!-- header -->
          <header class="guide-detail__header">
            <div class="guide-detail__meta">
              <span class="guide-detail__category">{{ categoryLabel }}</span>
              <time class="guide-detail__date">{{ guide.updatedAt || guide.createdAt }}</time>
            </div>
            <h1 class="guide-detail__title">{{ guide.title }}</h1>
            <p class="guide-detail__desc">{{ guide.description }}</p>
          </header>

          <!-- divider -->
          <div class="guide-detail__divider"></div>

          <!-- sections -->
          <div class="guide-detail__body">
            <section
              v-for="(section, i) in guide.sections"
              :key="i"
              class="guide-detail__section"
            >
              <h2 v-if="section.heading" class="guide-detail__section-heading">{{ section.heading }}</h2>
              <div class="guide-detail__section-content" v-html="section.content"></div>
            </section>
          </div>

          <!-- FAQ -->
          <div v-if="guide.faq && guide.faq.length" class="guide-detail__faq">
            <h2 class="guide-detail__faq-title">자주 묻는 질문</h2>
            <dl class="guide-detail__faq-list">
              <div
                v-for="(item, i) in guide.faq"
                :key="i"
                class="guide-detail__faq-item"
              >
                <dt class="guide-detail__faq-q">{{ item.question }}</dt>
                <dd class="guide-detail__faq-a">{{ item.answer }}</dd>
              </div>
            </dl>
          </div>

          <!-- related readings CTA -->
          <div v-if="guide.relatedReadings && guide.relatedReadings.length" class="guide-detail__cta">
            <p class="guide-detail__cta-label">관련 리딩 해보기</p>
            <div class="guide-detail__cta-list">
              <a
                v-for="reading in guide.relatedReadings"
                :key="reading.path"
                class="guide-detail__cta-btn"
                @click.prevent="router.push(reading.path)"
                href="#"
              >{{ reading.label }}</a>
            </div>
          </div>

          <!-- related cards -->
          <div v-if="guide.relatedCards && guide.relatedCards.length" class="guide-detail__related">
            <p class="guide-detail__related-label">관련 카드</p>
            <div class="guide-detail__related-list">
              <a
                v-for="card in guide.relatedCards"
                :key="card.id"
                class="guide-detail__related-card"
                @click.prevent="router.push(`/cards/${card.id}/`)"
                href="#"
              >{{ card.name }}</a>
            </div>
          </div>

          <!-- back -->
          <button class="guide-detail__back" @click="router.push('/guide/')">← 가이드 목록</button>
        </div>
      </PageContainer>
    </template>

    <!-- 404 -->
    <template v-else>
      <PageContainer>
        <div class="guide-detail guide-detail--404">
          <p class="guide-detail__404-msg">찾을 수 없는 가이드입니다.</p>
          <button class="guide-detail__back" @click="router.push('/guide/')">← 가이드 목록</button>
        </div>
      </PageContainer>
    </template>
  </AppShell>
</template>

<style scoped>
.guide-detail {
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-2xl);
  max-width: 480px;
  margin: 0 auto;
}

/* breadcrumb */
.guide-detail__breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  opacity: 0.6;
  margin-bottom: var(--lt-space-lg);
  flex-wrap: wrap;
}

.guide-detail__bc-item {
  cursor: pointer;
  transition: opacity var(--lt-transition);
}

.guide-detail__bc-item:hover {
  opacity: 0.4;
}

.guide-detail__bc-sep {
  opacity: 0.4;
}

/* header */
.guide-detail__header {
  margin-bottom: var(--lt-space-lg);
}

.guide-detail__meta {
  display: flex;
  align-items: center;
  gap: var(--lt-space-sm);
  margin-bottom: var(--lt-space-sm);
}

.guide-detail__category {
  font-size: 0.68rem;
  color: var(--lt-accent-2);
  opacity: 0.8;
  letter-spacing: 0.03em;
}

.guide-detail__date {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  opacity: 0.5;
}

.guide-detail__title {
  font-family: var(--lt-font-sans);
  font-size: 1.25rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.02em;
  line-height: 1.45;
  margin: 0 0 var(--lt-space-sm);
}

.guide-detail__desc {
  font-size: 0.8rem;
  color: var(--lt-text-sub);
  line-height: 1.75;
  letter-spacing: 0.02em;
  margin: 0;
}

/* divider */
.guide-detail__divider {
  height: 1px;
  background: var(--lt-border-soft);
  margin: var(--lt-space-lg) 0;
}

/* body sections */
.guide-detail__body {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-lg);
  margin-bottom: var(--lt-space-xl);
}

.guide-detail__section-heading {
  font-family: var(--lt-font-sans);
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--lt-text);
  letter-spacing: 0.03em;
  margin: 0 0 var(--lt-space-sm);
  padding-bottom: var(--lt-space-xs);
  border-bottom: 1px solid var(--lt-border-soft);
}

.guide-detail__section-content {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.85;
  letter-spacing: 0.02em;
}

.guide-detail__section-content :deep(p) {
  margin: 0 0 var(--lt-space-sm);
}

.guide-detail__section-content :deep(p:last-child) {
  margin: 0;
}

.guide-detail__section-content :deep(ul),
.guide-detail__section-content :deep(ol) {
  list-style: none;
  padding: 0;
  margin: var(--lt-space-sm) 0;
}

.guide-detail__section-content :deep(li) {
  padding-left: var(--lt-space-md);
  position: relative;
  margin-bottom: 4px;
}

.guide-detail__section-content :deep(li)::before {
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

.guide-detail__section-content :deep(strong) {
  color: var(--lt-text);
  font-weight: 400;
}

/* FAQ */
.guide-detail__faq {
  margin-bottom: var(--lt-space-xl);
}

.guide-detail__faq-title {
  font-family: var(--lt-font-sans);
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--lt-text);
  letter-spacing: 0.03em;
  margin: 0 0 var(--lt-space-sm);
  padding-bottom: var(--lt-space-xs);
  border-bottom: 1px solid var(--lt-border-soft);
}

.guide-detail__faq-list {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-md);
  margin: var(--lt-space-md) 0 0;
}

.guide-detail__faq-item {
  padding-left: var(--lt-space-md);
  border-left: 1px solid rgba(77, 163, 255, 0.2);
}

.guide-detail__faq-q {
  font-size: 0.82rem;
  font-weight: 400;
  color: var(--lt-text);
  margin: 0 0 5px;
  letter-spacing: 0.02em;
  line-height: 1.5;
}

.guide-detail__faq-a {
  font-size: 0.76rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  margin: 0;
  letter-spacing: 0.01em;
}

/* CTA */
.guide-detail__cta {
  margin-bottom: var(--lt-space-lg);
}

.guide-detail__cta-label,
.guide-detail__related-label {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.04em;
  opacity: 0.6;
  margin: 0 0 var(--lt-space-sm);
}

.guide-detail__cta-list,
.guide-detail__related-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.guide-detail__cta-btn {
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

.guide-detail__cta-btn:hover {
  border-color: var(--lt-accent-2);
  background: rgba(77, 163, 255, 0.15);
}

/* related cards */
.guide-detail__related {
  margin-bottom: var(--lt-space-xl);
}

.guide-detail__related-card {
  padding: 4px 11px;
  border-radius: var(--lt-radius-full);
  border: 1px solid var(--lt-border-soft);
  color: var(--lt-text-muted);
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  text-decoration: none;
  transition: var(--lt-transition);
}

.guide-detail__related-card:hover {
  border-color: rgba(77, 163, 255, 0.3);
  color: var(--lt-accent-2);
}

/* back */
.guide-detail__back {
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

.guide-detail__back:hover {
  opacity: 0.9;
}

/* 404 */
.guide-detail--404 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-lg);
  padding-top: var(--lt-space-2xl);
}

.guide-detail__404-msg {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  opacity: 0.6;
  margin: 0;
}
</style>
