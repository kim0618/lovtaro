<script setup>
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'

useHead({
  title: 'Lovtaro | 무료 연애 타로 - 감정의 흐름을 읽는 타로',
  description: '무료 연애 타로 리딩. 상대방 속마음, 재회 가능성, 연락 올까 타로, 러브타로 스프레드까지. 관계의 결을 깊고 조용하게 해석하는 프리미엄 타로, Lovtaro.',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Lovtaro',
    alternateName: '러브타로',
    url: 'https://lovtaro.kr',
    description: '무료 연애 타로 리딩. 상대방 속마음, 재회 가능성, 연락 올까 타로, 러브타로 스프레드까지.',
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    inLanguage: 'ko',
  },
})
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import HeroSection from '../components/home/HeroSection.vue'
import TarotMenuGrid from '../components/home/TarotMenuGrid.vue'
import TodayCardBanner from '../components/home/TodayCardBanner.vue'
import ThreeCardPromo from '../components/home/ThreeCardPromo.vue'
import LoveSpreadPromo from '../components/home/LoveSpreadPromo.vue'
import TrustNoticeBlock from '../components/home/TrustNoticeBlock.vue'
import BottomNavSection from '../components/home/BottomNavSection.vue'

const scenarioItems = [
  {
    title: '상대방 속마음 타로',
    description: '그 사람의 마음이 어디에 머물고 있는지 읽어봅니다.',
    to: '/reading/mind',
    tag: '인기',
    featured: true,
  },
  {
    title: 'Yes/No 타로',
    description: '지금 궁금한 것에 대해 카드가 답을 건넵니다.',
    to: '/reading/yesno',
    tag: 'NEW',
    featured: true,
  },
  {
    title: '재회 가능성 타로',
    description: '다시 만날 수 있는 흐름인지 조용히 살펴봅니다.',
    to: '/reading/reunion',
    tag: '',
    featured: false,
  },
  {
    title: '연락 올까 타로',
    description: '연락의 기류가 흐르고 있는지 카드로 비춰봅니다.',
    to: '/reading/contact',
    tag: '',
    featured: false,
  },
]
</script>

<template>
  <AppShell>
    <PageContainer>
      <HeroSection />

      <SectionBlock spacing="md">
        <p class="section-label">상황별 리딩</p>
        <TarotMenuGrid :items="scenarioItems" />
      </SectionBlock>

      <SectionBlock spacing="md">
        <p class="section-label">스프레드 리딩</p>
        <LoveSpreadPromo />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <ThreeCardPromo />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <TodayCardBanner />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <TrustNoticeBlock />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <BottomNavSection />
      </SectionBlock>
    </PageContainer>
  </AppShell>
</template>

<style scoped>
.section-label {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0 var(--lt-space-md);
  margin-bottom: var(--lt-space-md);
  opacity: 0.8;
}

</style>
