<script setup>
import { RouterLink } from 'vue-router'
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import ReadingIntroHeader from '../components/reading/ReadingIntroHeader.vue'
import { TESTS } from '../data/tests/index.js'

useHead({
  title: '연애 심리테스트 - 나를 닮은 연애 타로 유형 찾기 | Lovtaro',
  description: '질문에 답하고 나를 닮은 연애 타로 유형을 찾아보세요. 연애 스타일, 연애 성향을 알아보는 무료 연애 심리테스트 모음, Lovtaro.',
})
</script>

<template>
  <AppShell>
    <PageContainer>
      <ReadingIntroHeader
        title="연애 심리테스트"
        subtitle="질문에 답하면, 나를 닮은 타로 카드가 연애 성향을 풀어드려요"
      />
    </PageContainer>

    <SectionBlock spacing="md">
      <ul class="test-hub">
        <li v-for="test in TESTS" :key="test.slug">
          <RouterLink class="test-hub__card" :to="`/test/${test.slug}/`">
            <span class="test-hub__body">
              <span class="test-hub__title">{{ test.title }}</span>
              <span class="test-hub__subtitle">{{ test.subtitle }}</span>
            </span>
            <span class="test-hub__arrow" aria-hidden="true">&#8594;</span>
          </RouterLink>
        </li>
      </ul>
    </SectionBlock>
  </AppShell>
</template>

<style scoped>
.test-hub {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 var(--lt-space-md);
}

.test-hub__card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--lt-space-md);
  padding: var(--lt-space-md) var(--lt-space-lg);
  border-radius: var(--lt-radius-lg);
  border: 1px solid rgba(77, 163, 255, 0.22);
  border-left: 2px solid rgba(77, 163, 255, 0.2);
  background: linear-gradient(170deg, rgba(20, 33, 55, 0.5) 0%, rgba(16, 22, 41, 0.55) 100%);
  text-decoration: none;
  transition:
    border-color 250ms ease,
    border-left-color 250ms ease,
    background 250ms ease,
    box-shadow 250ms ease,
    transform 180ms ease;
}

.test-hub__card:hover {
  border-color: rgba(77, 163, 255, 0.45);
  border-left-color: var(--lt-accent-2);
  background: linear-gradient(170deg, rgba(27, 43, 72, 0.72) 0%, rgba(18, 27, 49, 0.72) 100%);
  box-shadow: 0 8px 30px rgba(77, 163, 255, 0.16), inset 0 0 26px rgba(77, 163, 255, 0.05);
  transform: translateY(-3px);
}

.test-hub__card:active {
  transform: translateY(-1px) scale(0.985);
  box-shadow: 0 3px 14px rgba(77, 163, 255, 0.12);
}

.test-hub__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.test-hub__title {
  font-family: var(--lt-font-sans);
  font-size: 1.02rem;
  font-weight: 600;
  color: var(--lt-text-strong);
}

.test-hub__subtitle {
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--lt-text-muted);
}

.test-hub__arrow {
  flex-shrink: 0;
  font-size: 1.15rem;
  color: rgba(143, 211, 255, 0.95);
  transition: transform var(--lt-transition);
}

.test-hub__card:hover .test-hub__arrow {
  transform: translateX(6px);
  color: #BFE3FF;
}
</style>
