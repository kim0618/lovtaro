<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const positions = ['나의 마음', '상대의 에너지', '관계의 방향']
</script>

<template>
  <div class="love-spread-promo">
    <div class="love-spread-promo__cards">
      <div
        v-for="pos in positions"
        :key="pos"
        class="love-spread-promo__slot"
      >
        <div class="love-spread-promo__card-back">
          <svg class="love-spread-promo__card-art" viewBox="0 0 120 198" fill="none">
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
        <span class="love-spread-promo__pos">{{ pos }}</span>
      </div>
    </div>
    <div class="love-spread-promo__copy">
      <p class="love-spread-promo__tag">LOVE TAROT</p>
      <h3 class="love-spread-promo__title">러브 타로</h3>
      <p class="love-spread-promo__desc">나의 마음, 상대의 에너지, 관계의 방향 - 사랑의 흐름을 세 장으로 읽어봅니다.</p>
      <button class="love-spread-promo__btn" @click="router.push('/reading/love')">
        시작하기
      </button>
    </div>
  </div>
</template>

<style scoped>
.love-spread-promo {
  margin: 0 var(--lt-space-md);
  padding: var(--lt-space-xl) var(--lt-space-lg);
  background: linear-gradient(170deg, rgba(16, 26, 49, 0.9) 0%, rgba(10, 16, 32, 0.95) 100%);
  border: 1px solid rgba(77, 163, 255, 0.12);
  border-radius: var(--lt-radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-lg);
  position: relative;
  overflow: hidden;
}

/* Subtle ambient glow */
.love-spread-promo::before {
  content: '';
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  height: 200px;
  background: radial-gradient(ellipse, rgba(77, 163, 255, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.love-spread-promo__cards {
  display: flex;
  justify-content: center;
  gap: var(--lt-space-md);
  position: relative;
}

.love-spread-promo__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-xs);
}

.love-spread-promo__card-back {
  width: 52px;
  height: 80px;
  background: linear-gradient(170deg, #101A31 0%, #060A14 100%);
  border-radius: var(--lt-radius-sm);
  border: 1px solid rgba(200, 169, 110, 0.25);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 12px rgba(200, 169, 110, 0.06);
  transition: border-color var(--lt-transition), box-shadow var(--lt-transition);
}

.love-spread-promo:hover .love-spread-promo__card-back {
  border-color: rgba(200, 169, 110, 0.45);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(200, 169, 110, 0.1);
}

.love-spread-promo__card-art {
  width: 100%;
  height: 100%;
}

.love-spread-promo__pos {
  font-size: 0.6rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.04em;
}

.love-spread-promo__copy {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
  text-align: center;
}

.love-spread-promo__tag {
  font-size: 0.55rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.2em;
  opacity: 0.6;
}

.love-spread-promo__title {
  font-family: var(--lt-font-sans);
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--lt-text-strong);
}

.love-spread-promo__desc {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  line-height: 1.65;
}

.love-spread-promo__btn {
  align-self: center;
  padding: 10px var(--lt-space-xl);
  background: var(--lt-btn-primary-bg);
  color: #F4F8FF;
  border-radius: var(--lt-radius-sm);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  box-shadow: 0 4px 20px rgba(45, 108, 223, 0.15);
  transition:
    background var(--lt-transition),
    box-shadow var(--lt-transition),
    transform var(--lt-transition);
}

.love-spread-promo__btn:hover {
  background: var(--lt-btn-primary-hover);
  box-shadow: 0 6px 28px rgba(45, 108, 223, 0.25);
  transform: translateY(-1px);
}

.love-spread-promo__btn:active {
  transform: scale(0.97) translateY(0);
}
</style>
