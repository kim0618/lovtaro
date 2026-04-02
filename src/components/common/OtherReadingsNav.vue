<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  current: {
    type: String,
    default: '',
  },
})

const router = useRouter()

const ALL_READINGS = [
  { id: 'love',    label: '러브 타로',     desc: '두 사람의 마음과 관계의 방향',          to: '/reading/love' },
  { id: 'mind',    label: '상대방 속마음', desc: '그 사람의 마음이 어디에 머무는지',      to: '/reading/mind' },
  { id: 'reunion', label: '재회 가능성',   desc: '다시 만날 수 있는 흐름인지',           to: '/reading/reunion' },
  { id: 'contact', label: '연락 올까',     desc: '연락의 기류가 흐르고 있는지',          to: '/reading/contact' },
  { id: '3cards',  label: '3장 리딩',      desc: '과거, 현재, 미래 흐름 전체 보기',     to: '/reading/3cards' },
  { id: 'today',   label: '오늘의 카드',   desc: '오늘 하루 에너지를 한 장으로',          to: '/today' },
]

const items = ALL_READINGS.filter(r => r.id !== props.current)
</script>

<template>
  <div class="other-readings-nav">
    <p class="other-readings-nav__label">다른 리딩 살펴보기</p>
    <div class="other-readings-nav__list">
      <button
        v-for="item in items"
        :key="item.id"
        class="other-readings-nav__item"
        @click="router.push(item.to)"
      >
        <span class="other-readings-nav__item-label">{{ item.label }}</span>
        <span class="other-readings-nav__item-desc">{{ item.desc }}</span>
        <span class="other-readings-nav__item-arrow" aria-hidden="true">&#8594;</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.other-readings-nav {
  padding: 0 var(--lt-space-md);
}

.other-readings-nav__label {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.08em;
  margin-bottom: var(--lt-space-lg);
  text-align: center;
  opacity: 0.6;
}

.other-readings-nav__list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--lt-border-soft);
}

.other-readings-nav__item {
  display: flex;
  align-items: center;
  gap: var(--lt-space-sm);
  background: none;
  border: none;
  border-bottom: 1px solid var(--lt-border-soft);
  padding: var(--lt-space-md) 0;
  text-align: left;
  width: 100%;
  transition: opacity var(--lt-transition);
}

.other-readings-nav__item:hover {
  opacity: 0.7;
}

.other-readings-nav__item-label {
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--lt-text);
  white-space: nowrap;
  min-width: 90px;
}

.other-readings-nav__item-desc {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.other-readings-nav__item-arrow {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  flex-shrink: 0;
  transition: transform var(--lt-transition), color var(--lt-transition);
}

.other-readings-nav__item:hover .other-readings-nav__item-arrow {
  transform: translateX(2px);
  color: var(--lt-accent-2);
}
</style>
