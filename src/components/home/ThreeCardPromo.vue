<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const positions = ['과거', '현재', '미래']
</script>

<template>
  <div class="three-card-promo">
    <div class="three-card-promo__cards">
      <div
        v-for="pos in positions"
        :key="pos"
        class="three-card-promo__slot"
      >
        <div class="three-card-promo__card-back">
          <svg class="three-card-promo__card-art" viewBox="0 0 120 198" fill="none">
            <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="1"/>
            <rect x="9" y="9" width="102" height="180" rx="4" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.5"/>
            <path d="M13 21 Q13 13 21 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <path d="M107 21 Q107 13 99 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <path d="M13 177 Q13 185 21 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <path d="M107 177 Q107 185 99 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <circle cx="40" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="42.5" cy="30.5" r="4" fill="#0A1020"/>
            <circle cx="60" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
            <circle cx="80" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="77.5" cy="30.5" r="4" fill="#0A1020"/>
            <line x1="60" y1="40" x2="60" y2="68" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
            <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>
            <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.6" fill="none"/>
            <circle cx="60" cy="99" r="18" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="0.5" fill="none"/>
            <path d="M40 99 C48 85 54 81 60 81 C66 81 72 85 80 99 C72 113 66 117 60 117 C54 117 48 113 40 99Z" stroke="#C8A96E" stroke-opacity="0.6" stroke-width="0.8" fill="none"/>
            <circle cx="60" cy="99" r="8" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.6" fill="none"/>
            <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.6"/>
            <line x1="60" y1="130" x2="60" y2="158" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
            <circle cx="40" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="37.5" cy="167.5" r="4" fill="#0A1020"/>
            <circle cx="60" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
            <circle cx="80" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="82.5" cy="167.5" r="4" fill="#0A1020"/>
          </svg>
        </div>
        <span class="three-card-promo__pos">{{ pos }}</span>
      </div>
    </div>
    <div class="three-card-promo__copy">
      <h3 class="three-card-promo__title">3장 리딩</h3>
      <p class="three-card-promo__desc">과거, 현재, 미래 - 세 장의 흐름으로 관계를 깊이 살펴봅니다.</p>
      <button class="three-card-promo__btn" @click="router.push('/reading/3cards')">
        시작하기
      </button>
    </div>
  </div>
</template>

<style scoped>
.three-card-promo {
  margin: 0 var(--lt-space-md);
  padding: var(--lt-space-xl) var(--lt-space-lg);
  background: var(--lt-panel);
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-lg);
}

.three-card-promo__cards {
  display: flex;
  justify-content: center;
  gap: var(--lt-space-md);
}

.three-card-promo__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-xs);
}

.three-card-promo__card-back {
  width: 52px;
  height: 80px;
  background: linear-gradient(170deg, #101A31 0%, #060A14 100%);
  border-radius: var(--lt-radius-sm);
  border: 1px solid rgba(200, 169, 110, 0.22);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 10px rgba(200, 169, 110, 0.05);
  transition: border-color var(--lt-transition), box-shadow var(--lt-transition);
}

.three-card-promo:hover .three-card-promo__card-back {
  border-color: rgba(200, 169, 110, 0.4);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 18px rgba(200, 169, 110, 0.08);
}

.three-card-promo__card-art {
  width: 100%;
  height: 100%;
}

.three-card-promo__pos {
  font-size: 0.65rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.06em;
}

.three-card-promo__copy {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
  text-align: center;
}

.three-card-promo__title {
  font-family: var(--lt-font-sans);
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--lt-text-strong);
}

.three-card-promo__desc {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  line-height: 1.65;
}

.three-card-promo__btn {
  align-self: center;
  padding: 10px var(--lt-space-xl);
  border: 1px solid var(--lt-line-soft);
  color: var(--lt-text-sub);
  border-radius: var(--lt-radius-sm);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  background: rgba(13, 21, 40, 0.5);
  transition: border-color var(--lt-transition), color var(--lt-transition), box-shadow var(--lt-transition);
}

.three-card-promo__btn:hover {
  border-color: var(--lt-accent-2);
  color: var(--lt-accent-2);
  box-shadow: 0 0 16px rgba(77, 163, 255, 0.1);
}
</style>
